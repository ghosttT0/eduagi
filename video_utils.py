# video_utils.py - 视频处理工具模块
import cv2
import random
import requests
from PIL import Image
import os
import io
import base64
import streamlit as st
from urllib.parse import urlparse, quote, unquote
import validators
import threading
import time

def safe_video_capture_with_timeout(video_url, timeout_seconds=15):
    """
    安全的视频捕获函数，带超时控制

    :param video_url: 视频URL或路径
    :param timeout_seconds: 超时时间（秒）
    :return: (success, cap) 元组
    """
    result = {'cap': None, 'success': False}

    def capture_video():
        try:
            # URL预处理
            processed_url = video_url
            if validators.url(video_url):
                decoded_url = unquote(video_url)
                if '://' in decoded_url:
                    protocol_domain, path = decoded_url.split('://', 1)
                    if '/' in path:
                        domain, file_path = path.split('/', 1)
                        encoded_path = '/'.join(quote(part, safe='') for part in file_path.split('/'))
                        processed_url = f"{protocol_domain}://{domain}/{encoded_path}"

            cap = cv2.VideoCapture(processed_url)
            cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, timeout_seconds * 1000)
            cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, 5000)  # 5秒读取超时

            if cap.isOpened():
                result['cap'] = cap
                result['success'] = True
            else:
                if cap:
                    cap.release()

        except Exception as e:
            print(f"❌ 视频捕获异常: {e}")
            if result['cap']:
                result['cap'].release()
                result['cap'] = None

    # 使用线程执行，避免阻塞
    thread = threading.Thread(target=capture_video)
    thread.daemon = True
    thread.start()
    thread.join(timeout=timeout_seconds)

    if thread.is_alive():
        print(f"⚠️ 视频捕获超时 ({timeout_seconds}秒)")
        if result['cap']:
            result['cap'].release()
        return False, None

    return result['success'], result['cap']

def get_random_video_thumbnail(video_path, max_size=(400, 225)):
    """
    为一个本地视频文件生成一个随机帧的缩略图。
    如果失败或路径是URL，则返回None。
    
    :param video_path: 视频文件路径
    :param max_size: 缩略图最大尺寸 (width, height)
    :return: PIL Image对象或None
    """
    # 检查路径是否为本地文件且存在
    if not os.path.exists(video_path):
        return None

    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None

        # 获取视频总帧数
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            return None

        # 随机选择一帧 (选择中间部分以避免片头片尾)
        start_frame = int(total_frames * 0.1)
        end_frame = int(total_frames * 0.9)
        random_frame_number = random.randint(start_frame, end_frame)
        
        # 设置读取位置
        cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame_number)
        
        success, frame = cap.read()
        cap.release()

        if success:
            # 将OpenCV的BGR格式图像转换为Pillow的RGB格式
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            thumbnail = Image.fromarray(rgb_frame)
            
            # 调整图片大小
            thumbnail.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            return thumbnail
        else:
            return None
    except Exception as e:
        print(f"为视频 {video_path} 生成缩略图时出错: {e}")
        return None

def get_video_thumbnail_from_url(video_url, frame_time=10):
    """
    为网络视频生成缩略图（智能版本）

    对于网络视频，由于OpenCV的网络流处理存在超时和兼容性问题，
    我们采用更安全的策略：直接生成带有视频信息的默认缩略图

    :param video_url: 视频URL
    :param frame_time: 提取帧的时间点（秒，此参数在网络视频中被忽略）
    :return: PIL Image对象或None
    """
    print(f"🔍 为网络视频生成缩略图: {video_url}")

    try:
        # 对于网络视频，我们不使用OpenCV，而是生成智能默认缩略图
        if validators.url(video_url):
            # 获取视频基本信息（仅通过HTTP头）
            try:
                response = requests.head(video_url, timeout=10)
                if response.status_code == 200:
                    # 从URL提取视频标题
                    from urllib.parse import unquote
                    video_name = unquote(video_url.split('/')[-1])
                    if '.' in video_name:
                        video_name = video_name.rsplit('.', 1)[0]

                    # 获取文件大小
                    content_length = response.headers.get("Content-Length")
                    if content_length:
                        size_mb = int(content_length) / (1024 * 1024)
                        size_text = f"{size_mb:.1f} MB"
                    else:
                        size_text = "未知大小"

                    # 生成包含视频信息的缩略图
                    thumbnail = create_default_thumbnail(
                        title=video_name,
                        subtitle=f"网络视频 • {size_text}",
                        size=(400, 225)
                    )

                    print(f"✅ 成功生成网络视频缩略图: {thumbnail.size}")
                    return thumbnail
                else:
                    print(f"❌ 视频URL不可访问: HTTP {response.status_code}")
                    return None

            except requests.RequestException as e:
                print(f"❌ 网络请求失败: {e}")
                return None
        else:
            # 对于本地文件，仍然尝试使用OpenCV
            print(f"🔍 本地视频文件，尝试使用OpenCV: {video_url}")
            return get_local_video_thumbnail(video_url, frame_time)

    except Exception as e:
        print(f"❌ 生成缩略图时出错: {e}")
        return None

def get_local_video_thumbnail(video_path, frame_time=10):
    """
    为本地视频文件生成缩略图

    :param video_path: 本地视频文件路径
    :param frame_time: 提取帧的时间点（秒）
    :return: PIL Image对象或None
    """
    try:
        if not os.path.exists(video_path):
            print(f"❌ 本地文件不存在: {video_path}")
            return None

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"❌ 无法打开本地视频: {video_path}")
            return None

        try:
            # 获取视频基本信息
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)

            if total_frames > 0 and fps > 0:
                # 选择一个安全的帧位置
                target_frame = min(int(fps * frame_time), total_frames - 1)
                cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
            else:
                # 按时间设置
                cap.set(cv2.CAP_PROP_POS_MSEC, frame_time * 1000)

            success, frame = cap.read()

            if success and frame is not None and frame.size > 0:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                thumbnail = Image.fromarray(rgb_frame)
                thumbnail.thumbnail((400, 225), Image.Resampling.LANCZOS)
                print(f"✅ 成功生成本地视频缩略图: {thumbnail.size}")
                return thumbnail
            else:
                print(f"❌ 读取本地视频帧失败")
                return None

        finally:
            cap.release()

    except Exception as e:
        print(f"❌ 处理本地视频时出错: {e}")
        return None

def create_default_thumbnail(title, subtitle=None, size=(400, 225)):
    """
    创建一个默认的视频缩略图

    :param title: 视频标题
    :param subtitle: 副标题（可选）
    :param size: 图片尺寸
    :return: PIL Image对象
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # 创建一个渐变背景
        img = Image.new('RGB', size, color='#1f2937')
        draw = ImageDraw.Draw(img)
        
        # 绘制渐变背景
        for i in range(size[1]):
            alpha = i / size[1]
            color = (
                int(31 + (59 - 31) * alpha),   # R: 1f -> 3b
                int(41 + (82 - 41) * alpha),   # G: 29 -> 52
                int(55 + (135 - 55) * alpha)   # B: 37 -> 87
            )
            draw.line([(0, i), (size[0], i)], fill=color)
        
        # 添加播放按钮图标
        center_x, center_y = size[0] // 2, size[1] // 2
        play_size = 40
        
        # 绘制圆形背景
        draw.ellipse([
            center_x - play_size, center_y - play_size,
            center_x + play_size, center_y + play_size
        ], fill=(255, 255, 255, 200), outline=(255, 255, 255), width=2)
        
        # 绘制播放三角形
        triangle = [
            (center_x - 15, center_y - 20),
            (center_x - 15, center_y + 20),
            (center_x + 20, center_y)
        ]
        draw.polygon(triangle, fill='#1f2937')
        
        # 添加标题文字
        try:
            # 尝试使用系统字体
            font_title = ImageFont.truetype("arial.ttf", 16)
            font_subtitle = ImageFont.truetype("arial.ttf", 12)
        except:
            # 如果没有找到字体，使用默认字体
            font_title = ImageFont.load_default()
            font_subtitle = ImageFont.load_default()

        # 处理标题长度
        if len(title) > 30:
            title = title[:27] + "..."

        # 计算主标题位置
        bbox = draw.textbbox((0, 0), title, font=font_title)
        text_width = bbox[2] - bbox[0]
        text_x = (size[0] - text_width) // 2

        if subtitle:
            # 如果有副标题，主标题位置上移
            text_y = size[1] - 55
        else:
            text_y = size[1] - 40

        # 绘制主标题阴影和文字
        draw.text((text_x + 1, text_y + 1), title, font=font_title, fill='black')
        draw.text((text_x, text_y), title, font=font_title, fill='white')

        # 绘制副标题（如果有）
        if subtitle:
            if len(subtitle) > 35:
                subtitle = subtitle[:32] + "..."

            bbox_sub = draw.textbbox((0, 0), subtitle, font=font_subtitle)
            sub_width = bbox_sub[2] - bbox_sub[0]
            sub_x = (size[0] - sub_width) // 2
            sub_y = size[1] - 25

            # 绘制副标题阴影和文字
            draw.text((sub_x + 1, sub_y + 1), subtitle, font=font_subtitle, fill='black')
            draw.text((sub_x, sub_y), subtitle, font=font_subtitle, fill='#d1d5db')
        
        return img
        
    except Exception as e:
        print(f"创建默认缩略图时出错: {e}")
        # 如果出错，返回一个简单的纯色图片
        img = Image.new('RGB', size, color='#374151')
        return img

def get_video_info_simple(video_path_or_url):
    """
    获取视频的基本信息（改进版）

    :param video_path_or_url: 视频路径或URL
    :return: 包含视频信息的字典
    """
    info = {
        "duration": "未知",
        "fps": "未知",
        "resolution": "未知",
        "size": "未知",
        "accessible": False
    }

    try:
        if validators.url(video_path_or_url):
            # 对于URL，先检查可访问性
            try:
                response = requests.head(video_path_or_url, timeout=15)
                info["accessible"] = response.status_code == 200

                # 获取文件大小
                content_length = response.headers.get("Content-Length")
                if content_length:
                    size_mb = int(content_length) / (1024 * 1024)
                    info["size"] = f"{size_mb:.1f} MB"
                else:
                    info["size"] = "未知"

                # 对于网络视频，我们不尝试获取详细信息以避免超时问题
                # 只保留基本的可访问性和大小信息
                if info["accessible"]:
                    print(f"✅ 网络视频可访问，跳过详细信息获取以避免超时")

            except requests.RequestException as e:
                print(f"❌ 网络请求失败: {e}")
                info["accessible"] = False

        else:
            # 对于本地文件
            if os.path.exists(video_path_or_url):
                info["accessible"] = True
                info["size"] = f"{os.path.getsize(video_path_or_url) / (1024*1024):.1f} MB"

                # 尝试获取视频信息
                cap = cv2.VideoCapture(video_path_or_url)
                if cap.isOpened():
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

                    if fps > 0:
                        duration_seconds = frame_count / fps
                        minutes = int(duration_seconds // 60)
                        seconds = int(duration_seconds % 60)
                        info["duration"] = f"{minutes}:{seconds:02d}"
                        info["fps"] = f"{fps:.1f}"
                        info["resolution"] = f"{width}x{height}"

                    cap.release()

    except Exception as e:
        print(f"❌ 获取视频信息时出错: {e}")

    return info

def image_to_base64(image):
    """
    将PIL Image转换为base64字符串，用于在Streamlit中显示
    
    :param image: PIL Image对象
    :return: base64字符串
    """
    try:
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"转换图片为base64时出错: {e}")
        return None
