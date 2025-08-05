from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import asyncio
from datetime import datetime

from database import get_db, User, VideoAnalysis
from api.auth import get_current_user
from utilstongyi import analyze_video_with_tongyi, get_video_info

# 创建路由器
videos_router = APIRouter()

# Pydantic模型
class VideoAnalysisRequest(BaseModel):
    video_url: str

class VideoAnalysisResponse(BaseModel):
    id: int
    video_url: str
    analysis_result: str
    analyzed_at: datetime
    status: str

    class Config:
        from_attributes = True

class VideoInfoResponse(BaseModel):
    url: str
    domain: Optional[str] = None
    status: Optional[int] = None
    type: Optional[str] = None
    length: Optional[str] = None
    accessible: bool
    error: Optional[str] = None

@videos_router.post("/analyze", response_model=VideoAnalysisResponse)
async def analyze_video(
    request: VideoAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """分析视频内容"""
    try:
        # 检查视频URL是否已分析过
        existing_analysis = db.query(VideoAnalysis).filter(
            VideoAnalysis.video_url == request.video_url
        ).first()
        
        if existing_analysis:
            return VideoAnalysisResponse(
                id=existing_analysis.id,
                video_url=existing_analysis.video_url,
                analysis_result=existing_analysis.analysis_result,
                analyzed_at=existing_analysis.analyzed_at,
                status=existing_analysis.status
            )
        
        # 创建分析记录
        analysis_record = VideoAnalysis(
            video_url=request.video_url,
            analysis_result="分析中...",
            analyzed_by=current_user.id,
            status="processing"
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        
        # 在后台执行分析
        background_tasks.add_task(
            perform_video_analysis,
            analysis_record.id,
            request.video_url,
            current_user.id,
            db
        )
        
        return VideoAnalysisResponse(
            id=analysis_record.id,
            video_url=analysis_record.video_url,
            analysis_result=analysis_record.analysis_result,
            analyzed_at=analysis_record.analyzed_at,
            status=analysis_record.status
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

async def perform_video_analysis(
    analysis_id: int,
    video_url: str,
    user_id: int,
    db: Session
):
    """后台执行视频分析"""
    try:
        # 执行分析
        result = analyze_video_with_tongyi(video_url)
        
        # 更新分析结果
        analysis_record = db.query(VideoAnalysis).filter(
            VideoAnalysis.id == analysis_id
        ).first()
        
        if analysis_record:
            analysis_record.analysis_result = result
            analysis_record.status = "completed"
            db.commit()
            
    except Exception as e:
        # 更新错误状态
        analysis_record = db.query(VideoAnalysis).filter(
            VideoAnalysis.id == analysis_id
        ).first()
        
        if analysis_record:
            analysis_record.analysis_result = f"分析失败: {str(e)}"
            analysis_record.status = "failed"
            db.commit()

@videos_router.get("/info")
async def get_video_information(video_url: str):
    """获取视频信息"""
    try:
        info = get_video_info(video_url)
        return VideoInfoResponse(**info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取视频信息失败: {str(e)}")

@videos_router.get("/history", response_model=List[VideoAnalysisResponse])
async def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """获取分析历史"""
    analyses = db.query(VideoAnalysis).filter(
        VideoAnalysis.analyzed_by == current_user.id
    ).order_by(VideoAnalysis.analyzed_at.desc()).offset(offset).limit(limit).all()
    
    return [
        VideoAnalysisResponse(
            id=analysis.id,
            video_url=analysis.video_url,
            analysis_result=analysis.analysis_result,
            analyzed_at=analysis.analyzed_at,
            status=analysis.status
        )
        for analysis in analyses
    ]

@videos_router.get("/{analysis_id}", response_model=VideoAnalysisResponse)
async def get_analysis_result(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定分析结果"""
    analysis = db.query(VideoAnalysis).filter(
        VideoAnalysis.id == analysis_id,
        VideoAnalysis.analyzed_by == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    
    return VideoAnalysisResponse(
        id=analysis.id,
        video_url=analysis.video_url,
        analysis_result=analysis.analysis_result,
        analyzed_at=analysis.analyzed_at,
        status=analysis.status
    )

@videos_router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除分析记录"""
    analysis = db.query(VideoAnalysis).filter(
        VideoAnalysis.id == analysis_id,
        VideoAnalysis.analyzed_by == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    
    db.delete(analysis)
    db.commit()
    
    return {"message": "删除成功"} 