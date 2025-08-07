#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试视频处理修复效果
"""

import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from video_utils import (
    get_video_thumbnail_from_url,
    get_video_info_simple,
    safe_video_capture_with_timeout
)

def test_video_processing():
    """测试视频处理功能"""
    
    print("🚀 开始测试视频处理修复效果...")
    
    # 测试URL（包含空格字符的URL）
    test_urls = [
        "https://eduagi.site/10.5%20singal.mp4",  # 原始问题URL
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",  # 测试URL
        "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"  # 另一个测试URL
    ]
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n{'='*60}")
        print(f"🎬 测试视频 {i}: {url}")
        print(f"{'='*60}")
        
        # 1. 测试安全视频捕获
        print("\n1️⃣ 测试安全视频捕获...")
        success, cap = safe_video_capture_with_timeout(url, timeout_seconds=10)
        if success and cap:
            print("✅ 视频捕获成功")
            cap.release()
        else:
            print("❌ 视频捕获失败")
        
        # 2. 测试获取视频信息
        print("\n2️⃣ 测试获取视频信息...")
        info = get_video_info_simple(url)
        print(f"📊 视频信息:")
        for key, value in info.items():
            print(f"   {key}: {value}")
        
        # 3. 测试获取缩略图
        print("\n3️⃣ 测试获取缩略图...")
        thumbnail = get_video_thumbnail_from_url(url, frame_time=5)
        if thumbnail:
            print(f"✅ 缩略图生成成功: {thumbnail.size}")
            # 保存缩略图
            thumbnail_path = f"test_thumbnail_{i}.jpg"
            thumbnail.save(thumbnail_path)
            print(f"💾 缩略图已保存: {thumbnail_path}")
        else:
            print("❌ 缩略图生成失败")
        
        print(f"\n{'='*60}")
    
    print("\n🎉 视频处理测试完成！")

if __name__ == "__main__":
    test_video_processing()
