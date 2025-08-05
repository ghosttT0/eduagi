# views/video_library_view.py (视频墙版本)
import streamlit as st
from database import SessionLocal, VideoResource, User
from utilstongyi import analyze_video_with_tongyi, analyze_video_with_tongyi_stream
from video_utils import (
    get_random_video_thumbnail,
    get_video_thumbnail_from_url,
    create_default_thumbnail,
    get_video_info_simple,
    image_to_base64
)
import validators
import random


def render():
    st.title("🎬 视频学习中心")
    st.info("🎯 点击视频封面，即可展开播放器进行学习。AI随机生成封面，每次刷新都有惊喜！")
    st.markdown("---")

    # 创建标签页
    tab1, tab2, tab3 = st.tabs(["🎬 视频墙", "📋 列表视图", "🔍 搜索视频"])

    # --- Tab 1: 视频墙 ---
    with tab1:
        render_video_wall()

    # --- Tab 2: 列表视图 ---
    with tab2:
        render_video_list()

    # --- Tab 3: 搜索功能 ---
    with tab3:
        render_video_search()


def render_video_wall():
    """渲染视频墙界面"""
    st.subheader("🎬 视频墙")

    # 布局选择
    col_layout, col_refresh = st.columns([3, 1])
    with col_layout:
        cols_per_row = st.selectbox(
            "每行显示视频数量",
            [2, 3, 4, 5],
            index=2,  # 默认4个
            help="选择每行显示的视频数量"
        )
    with col_refresh:
        if st.button("🔄 刷新封面", help="重新生成随机封面"):
            st.rerun()

    db = SessionLocal()
    try:
        # 查询所有已发布的视频
        all_videos = db.query(VideoResource, User.display_name).join(
            User, User.id == VideoResource.teacher_id
        ).filter(
            VideoResource.status == "已发布"
        ).order_by(VideoResource.timestamp.desc()).all()

        if not all_videos:
            st.warning("🎭 目前平台还没有任何已发布的教学视频。")
            st.info("💡 提示：老师们可以在教师工作台上传和发布视频。")
            return

        st.success(f"📊 共找到 {len(all_videos)} 个精彩视频")

        # 将视频列表按每行数量进行分组
        rows_of_videos = [all_videos[i:i + cols_per_row] for i in range(0, len(all_videos), cols_per_row)]

        # 遍历每一行
        for row_index, row in enumerate(rows_of_videos):
            # 为每一行创建列
            cols = st.columns(cols_per_row)

            # 遍历该行的每个视频和对应的列
            for col_index, (video, teacher_name) in enumerate(row):
                with cols[col_index]:
                    render_video_card(video, teacher_name, f"{row_index}_{col_index}")
    finally:
        db.close()


def render_video_card(video, teacher_name, unique_key):
    """渲染单个视频卡片"""
    with st.container(border=True):
        # --- 生成并显示封面 ---
        thumbnail = None
        is_url = validators.url(video.path)

        # 尝试生成缩略图
        if not is_url:  # 本地文件
            thumbnail = get_random_video_thumbnail(video.path)
        else:  # URL链接
            # 对于URL，可以尝试获取缩略图（可能失败）
            thumbnail = get_video_thumbnail_from_url(video.path)

        # 如果没有成功生成缩略图，使用默认封面
        if thumbnail is None:
            thumbnail = create_default_thumbnail(video.title)

        # 显示缩略图
        if thumbnail:
            st.image(thumbnail, use_container_width=True)

        # --- 视频信息 ---
        st.markdown(f"**🎬 {video.title}**")
        st.caption(f"👨‍🏫 {teacher_name}")
        st.caption(f"📅 {video.timestamp.strftime('%m-%d %H:%M')}")

        # --- 交互按钮 ---
        col_play, col_ai = st.columns(2)

        with col_play:
            if st.button("▶️ 播放", key=f"play_{unique_key}_{video.id}", use_container_width=True):
                st.session_state[f"show_player_{video.id}"] = True

        with col_ai:
            if st.button("🤖 AI", key=f"ai_{unique_key}_{video.id}", use_container_width=True):
                st.session_state[f"show_ai_{video.id}"] = True

        # --- 展开的播放器 ---
        if st.session_state.get(f"show_player_{video.id}", False):
            with st.expander("📺 视频播放器", expanded=True):
                if video.description:
                    st.write(f"**简介:** {video.description}")

                try:
                    st.video(video.path)
                except Exception as e:
                    st.error(f"❌ 视频加载失败: {e}")
                    st.info(f"🔗 视频链接: {video.path}")

                # 视频信息
                video_info = get_video_info_simple(video.path)
                if video_info["accessible"]:
                    info_cols = st.columns(4)
                    with info_cols[0]:
                        st.metric("时长", video_info["duration"])
                    with info_cols[1]:
                        st.metric("分辨率", video_info["resolution"])
                    with info_cols[2]:
                        st.metric("帧率", video_info["fps"])
                    with info_cols[3]:
                        st.metric("大小", video_info["size"])

                if st.button("❌ 关闭播放器", key=f"close_player_{video.id}"):
                    st.session_state[f"show_player_{video.id}"] = False
                    st.rerun()

        # --- 展开的AI分析 ---
        if st.session_state.get(f"show_ai_{video.id}", False):
            with st.expander("🤖 AI智能分析", expanded=True):
                if f"ai_result_{video.id}" not in st.session_state:
                    st.info("🔄 AI正在深度分析视频内容...")

                    # 创建流式输出容器
                    analysis_container = st.empty()

                    try:
                        # 使用流式分析
                        final_result = ""
                        for partial_result in analyze_video_with_tongyi_stream(video.path):
                            final_result = partial_result
                            with analysis_container.container():
                                st.markdown(partial_result)

                        # 保存最终结果到session state
                        st.session_state[f"ai_result_{video.id}"] = final_result
                        st.success("✅ AI分析完成！")

                    except Exception as e:
                        error_msg = f"❌ AI分析失败: {e}"
                        st.session_state[f"ai_result_{video.id}"] = error_msg
                        with analysis_container.container():
                            st.error(error_msg)
                else:
                    # 显示已缓存的AI分析结果
                    st.markdown(st.session_state[f"ai_result_{video.id}"])

                if st.button("❌ 关闭AI分析", key=f"close_ai_{video.id}"):
                    st.session_state[f"show_ai_{video.id}"] = False
                    st.rerun()


def render_video_list():
    """渲染传统列表视图"""
    st.subheader("📋 列表视图")
    st.info("传统的列表视图，适合快速浏览视频信息")

    db = SessionLocal()
    try:
        # 查询所有已发布的视频，并关联教师姓名
        all_videos = db.query(
            VideoResource.id, VideoResource.title,
            VideoResource.description, VideoResource.path,
            VideoResource.timestamp, VideoResource.status,
            User.display_name
        ).join(User, User.id == VideoResource.teacher_id).filter(
            VideoResource.status == "已发布"
        ).order_by(VideoResource.timestamp.desc()).all()

        if not all_videos:
            st.warning("目前平台还没有任何已发布的教学视频。")
            return

        st.success(f"📊 共找到 {len(all_videos)} 个教学视频")

        for video in all_videos:
            with st.container(border=True):
                # 视频标题和信息
                col_title, col_info = st.columns([3, 1])

                with col_title:
                    st.subheader(video.title)
                    st.caption(f"👨‍🏫 由 {video.display_name} 老师上传 | 📅 {video.timestamp.strftime('%Y-%m-%d %H:%M')}")

                with col_info:
                    st.metric("状态", video.status, delta=None)

                # 视频描述
                if video.description:
                    with st.expander("📝 视频简介", expanded=False):
                        st.write(video.description)

                # 视频播放器
                try:
                    st.video(video.path)
                except Exception as e:
                    st.error(f"❌ 视频加载失败: {e}")
                    st.info(f"🔗 视频链接: {video.path}")

                # 操作按钮
                col_ai, col_info_btn = st.columns(2)

                with col_ai:
                    if st.button("🤖 AI智能分析", key=f"list_ai_analyze_{video.id}"):
                        try:
                            with st.expander("📋 AI生成的视频大纲", expanded=True):
                                st.info("🔄 AI正在深度分析视频内容，请稍候...")

                                # 创建流式输出容器
                                analysis_container = st.empty()

                                # 流式显示分析结果
                                for partial_result in analyze_video_with_tongyi_stream(video.path):
                                    with analysis_container.container():
                                        st.markdown(partial_result)

                                st.success("✅ AI分析完成！")

                        except Exception as e:
                            st.error(f"❌ AI分析失败: {e}")
                            with st.expander("🔍 错误详情"):
                                st.code(str(e))

                with col_info_btn:
                    if st.button("ℹ️ 视频信息", key=f"list_video_info_{video.id}"):
                        with st.spinner("🔍 获取视频信息..."):
                            try:
                                video_info = get_video_info_simple(video.path)
                                with st.expander("📊 视频详细信息", expanded=True):
                                    st.json(video_info)
                            except Exception as e:
                                st.error(f"❌ 获取视频信息失败: {e}")

                st.markdown("---")
    finally:
        db.close()


def render_video_search():
    """渲染视频搜索功能"""
    st.subheader("🔍 视频搜索")

    # 搜索表单
    with st.form("video_search_form"):
        col_search, col_teacher = st.columns(2)

        with col_search:
            search_query = st.text_input(
                "搜索关键词",
                placeholder="输入视频标题或描述关键词...",
                help="支持模糊搜索"
            )

        with col_teacher:
            search_teacher = st.selectbox(
                "按教师筛选",
                ["全部教师"] + get_all_teachers(),
                index=0
            )

        search_submitted = st.form_submit_button("🔍 搜索", use_container_width=True)

    if search_submitted or search_query or search_teacher != "全部教师":
        db = SessionLocal()
        try:
            query = db.query(
                VideoResource.id, VideoResource.title,
                VideoResource.description, VideoResource.path,
                VideoResource.timestamp, VideoResource.status,
                User.display_name
            ).join(User, User.id == VideoResource.teacher_id).filter(
                VideoResource.status == "已发布"
            )

            # 添加搜索条件
            if search_query:
                query = query.filter(
                    (VideoResource.title.contains(search_query)) |
                    (VideoResource.description.contains(search_query))
                )

            if search_teacher != "全部教师":
                query = query.filter(User.display_name == search_teacher)

            search_results = query.order_by(VideoResource.timestamp.desc()).all()

            if search_results:
                st.success(f"🎯 找到 {len(search_results)} 个匹配的视频")

                # 显示搜索结果的视频墙
                cols_per_row = 3
                rows_of_videos = [search_results[i:i + cols_per_row] for i in range(0, len(search_results), cols_per_row)]

                for row_index, row in enumerate(rows_of_videos):
                    cols = st.columns(cols_per_row)

                    for col_index, video in enumerate(row):
                        with cols[col_index]:
                            with st.container(border=True):
                                st.subheader(video.title)
                                st.caption(f"👨‍🏫 {video.display_name}")
                                st.caption(f"📅 {video.timestamp.strftime('%Y-%m-%d')}")

                                if video.description:
                                    desc = video.description[:100] + "..." if len(video.description) > 100 else video.description
                                    st.write(desc)

                                if st.button("📺 观看", key=f"search_watch_{video.id}", use_container_width=True):
                                    st.session_state[f"search_show_player_{video.id}"] = True

                                # 展开播放器
                                if st.session_state.get(f"search_show_player_{video.id}", False):
                                    with st.expander("📺 视频播放器", expanded=True):
                                        try:
                                            st.video(video.path)
                                        except Exception as e:
                                            st.error(f"❌ 视频加载失败: {e}")

                                        if st.button("❌ 关闭", key=f"search_close_{video.id}"):
                                            st.session_state[f"search_show_player_{video.id}"] = False
                                            st.rerun()
            else:
                st.warning("🔍 没有找到匹配的视频")
                st.info("💡 尝试使用不同的关键词或选择其他教师")
        finally:
            db.close()


def get_all_teachers():
    """获取所有有视频的教师列表"""
    db = SessionLocal()
    try:
        teachers = db.query(User.display_name).join(
            VideoResource, User.id == VideoResource.teacher_id
        ).filter(VideoResource.status == "已发布").distinct().all()

        return [teacher.display_name for teacher in teachers]
    except:
        return []
    finally:
        db.close()

    with tab2:
        st.subheader("🔍 视频搜索")

        # 搜索功能
        search_query = st.text_input(
            "搜索视频",
            placeholder="输入关键词搜索视频标题或描述...",
            help="支持模糊搜索"
        )

        search_teacher = st.selectbox(
            "按教师筛选",
            ["全部教师"] + get_all_teachers(),
            index=0
        )

        if search_query or search_teacher != "全部教师":
            db = SessionLocal()
            try:
                query = db.query(
                    VideoResource.id, VideoResource.title,
                    VideoResource.description, VideoResource.path,
                    VideoResource.timestamp, VideoResource.status,
                    User.display_name
                ).join(User, User.id == VideoResource.teacher_id).filter(
                    VideoResource.status == "已发布"
                )

                # 添加搜索条件
                if search_query:
                    query = query.filter(
                        (VideoResource.title.contains(search_query)) |
                        (VideoResource.description.contains(search_query))
                    )

                if search_teacher != "全部教师":
                    query = query.filter(User.display_name == search_teacher)

                search_results = query.order_by(VideoResource.timestamp.desc()).all()

                if search_results:
                    st.success(f"🎯 找到 {len(search_results)} 个匹配的视频")

                    for video in search_results:
                        with st.container(border=True):
                            st.subheader(video.title)
                            st.caption(f"👨‍🏫 {video.display_name} | 📅 {video.timestamp.strftime('%Y-%m-%d')}")

                            if video.description:
                                st.write(video.description[:200] + "..." if len(video.description) > 200 else video.description)

                            if st.button("📺 观看视频", key=f"watch_{video.id}"):
                                st.video(video.path)
                else:
                    st.warning("🔍 没有找到匹配的视频")
            finally:
                db.close()


def get_all_teachers():
    """获取所有有视频的教师列表"""
    db = SessionLocal()
    try:
        teachers = db.query(User.display_name).join(
            VideoResource, User.id == VideoResource.teacher_id
        ).filter(VideoResource.status == "已发布").distinct().all()

        return [teacher.display_name for teacher in teachers]
    except:
        return []
    finally:
        db.close()