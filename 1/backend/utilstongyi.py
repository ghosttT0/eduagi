# tongyi_utils.py (v3.0 修复版 - 基于testtongyi.py的成功实现)
import os
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

# 加载.env环境变量
load_dotenv()

# 通义API配置
TONGYI_API_ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1"
TONGYI_API_KEY = os.getenv("TONGYI_API_KEY")


def analyze_video_with_tongyi_stream(video_url: str):
    """
    调用通义千问 qwen-vl-plus 模型分析视频内容，返回流式生成器。
    用于Streamlit的流式输出显示。
    """
    if not TONGYI_API_KEY:
        yield (
            "### ⚠️ 请配置 API 密钥\n\n"
            "未在 `.env` 文件中找到 `TONGYI_API_KEY`。请添加：\n\n"
            "```env\nTONGYI_API_KEY=你的密钥\n```"
        )
        return

    try:
        print(f"开始分析视频: {video_url}")

        # 预检查视频URL
        if not video_url or not video_url.startswith(('http://', 'https://')):
            yield (
                "## ❌ 视频URL格式错误\n\n"
                f"**提供的URL**: {video_url}\n\n"
                "### 要求\n"
                "- URL必须以 http:// 或 https:// 开头\n"
                "- URL必须指向有效的视频文件\n"
                "- 建议使用MP4格式\n"
            )
            return

        # 初始化OpenAI客户端
        client = OpenAI(
            api_key=TONGYI_API_KEY,
            base_url=TONGYI_API_ENDPOINT
        )

        # 调用流式API
        stream = client.chat.completions.create(
            model="qwen-vl-plus",
            messages=[
                {
                    "role": "system",
                    "content": "你是一位专业的教育内容分析师，擅长分析教学视频并生成详细的学习指导报告。请按照以下结构分析视频：\n\n## 📹 视频内容分析报告\n### 🎯 核心主题\n### 📋 内容大纲\n### 🔑 关键知识点\n### 📚 学习建议\n### 🎓 教学评价"
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "请详细分析这个教学视频的内容，生成结构化的学习指导报告："},
                        {"type": "video_url", "video_url": video_url}
                    ]
                }
            ],
            temperature=0.5,
            stream=True  # 启用流式输出
        )

        # 流式返回内容
        full_content = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_content += content
                yield full_content

        print("✅ 流式视频分析完成")

    except Exception as e:
        error_str = str(e)
        print(f"❌ 流式视频分析异常: {error_str}")

        # 特殊错误处理
        if "too long" in error_str.lower():
            yield (
                "## ⏱️ 视频时长超限\n\n"
                f"**视频链接**: {video_url}\n"
                f"**错误信息**: 视频文件过长，超出了API处理限制\n\n"
                "### 解决方案\n"
                "1. **视频剪辑**：将视频分割成较短的片段（建议每段5-10分钟）\n"
                "2. **关键片段**：选择视频中最重要的部分进行分析\n"
                "3. **压缩处理**：降低视频分辨率和码率\n\n"
                "### 建议的视频规格\n"
                "- **时长**：5-15分钟为最佳\n"
                "- **格式**：MP4格式\n"
                "- **分辨率**：720p或1080p\n"
                "- **文件大小**：小于100MB"
            )
        elif "download" in error_str.lower() or "access" in error_str.lower():
            yield (
                "## 🌐 视频访问失败\n\n"
                f"**视频链接**: {video_url}\n"
                f"**错误信息**: API无法下载或访问视频文件\n\n"
                "### 可能原因\n"
                "1. **网络限制**：视频URL可能有访问限制\n"
                "2. **域名问题**：某些域名可能被API服务商限制\n"
                "3. **文件权限**：视频文件可能需要特殊权限访问\n\n"
                "### 解决方案\n"
                "1. **检查URL**：确保视频链接可以在浏览器中直接访问\n"
                "2. **更换域名**：尝试使用七牛云的CDN域名\n"
                "3. **公开权限**：确保视频文件设置为公开访问\n"
                "4. **联系管理员**：检查七牛云存储桶的访问设置"
            )
        else:
            yield (
                "## ❌ 视频分析异常\n\n"
                f"**错误详情**:\n```\n{error_str}\n```\n\n"
                f"**视频链接**: {video_url}\n"
                f"**分析时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                "### 常见问题排查：\n"
                "1. **网络连接**：确保网络稳定，可以访问外网\n"
                "2. **API配置**：检查`.env`文件中的`TONGYI_API_KEY`是否正确\n"
                "3. **视频链接**：确认视频URL可以直接访问\n"
                "4. **视频格式**：建议使用MP4格式，避免特殊编码\n"
                "5. **文件大小**：避免过大的视频文件（建议<100MB）\n"
                "6. **视频时长**：控制在15分钟以内\n\n"
                "### 技术支持\n"
                "如果问题持续存在，请联系技术支持并提供上述错误信息。"
            )


def analyze_video_with_tongyi(video_url: str) -> str:
    """
    调用通义千问 qwen-vl-plus 模型分析视频内容，并返回结构化Markdown文本。
    基于testtongyi.py的成功实现方式。
    """
    if not TONGYI_API_KEY:
        return (
            "### ⚠️ 请配置 API 密钥\n\n"
            "未在 `.env` 文件中找到 `TONGYI_API_KEY`。请添加：\n\n"
            "```env\nTONGYI_API_KEY=你的密钥\n```"
        )

    try:
        print(f"开始分析视频: {video_url}")

        # 预检查视频URL
        if not video_url or not video_url.startswith(('http://', 'https://')):
            return (
                "## ❌ 视频URL格式错误\n\n"
                f"**提供的URL**: {video_url}\n\n"
                "### 要求\n"
                "- URL必须以 http:// 或 https:// 开头\n"
                "- URL必须指向有效的视频文件\n"
                "- 建议使用MP4格式\n"
            )

        # 初始化OpenAI客户端（使用通义千问的兼容接口）
        client = OpenAI(
            api_key=TONGYI_API_KEY,
            base_url=TONGYI_API_ENDPOINT
        )

        # 调用API（使用与testtongyi.py相同的简化方式）
        response = client.chat.completions.create(
            model="qwen-vl-plus",
            messages=[
                {
                    "role": "system",
                    "content": "你是一位专业的教育内容分析师，擅长分析教学视频并生成详细的学习指导报告。请按照以下结构分析视频：\n\n## 📹 视频内容分析报告\n### 🎯 核心主题\n### 📋 内容大纲\n### 🔑 关键知识点\n### 📚 学习建议\n### 🎓 教学评价"
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "请详细分析这个教学视频的内容，生成结构化的学习指导报告："},
                        {"type": "video_url", "video_url": video_url}
                    ]
                }
            ],
            temperature=0.5,
        )

        # 检查响应
        if hasattr(response.choices[0].message, 'content') and response.choices[0].message.content:
            result = response.choices[0].message.content.strip()
            print("✅ 视频分析成功完成")
            return result
        else:
            print("❌ API响应格式异常")
            return (
                "## 📹 视频分析失败\n\n"
                f"- 视频链接: {video_url}\n"
                f"- 分析时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                "### 可能原因\n"
                "1. 视频格式不支持（建议使用MP4格式）\n"
                "2. 视频链接无法访问（检查网络连接）\n"
                "3. 视频内容过长或无效\n"
                "4. API响应格式异常\n\n"
                "### 解决建议\n"
                "- 确保视频链接可以公网访问\n"
                "- 使用标准的MP4格式\n"
                "- 控制视频时长在1-60分钟内\n"
                "- 检查网络连接稳定性"
            )

    except Exception as e:
        error_str = str(e)
        print(f"❌ 视频分析异常: {error_str}")

        # 特殊错误处理
        if "too long" in error_str.lower():
            return (
                "## ⏱️ 视频时长超限\n\n"
                f"**视频链接**: {video_url}\n"
                f"**错误信息**: 视频文件过长，超出了API处理限制\n\n"
                "### 解决方案\n"
                "1. **视频剪辑**：将视频分割成较短的片段（建议每段5-10分钟）\n"
                "2. **关键片段**：选择视频中最重要的部分进行分析\n"
                "3. **压缩处理**：降低视频分辨率和码率\n\n"
                "### 建议的视频规格\n"
                "- **时长**：5-15分钟为最佳\n"
                "- **格式**：MP4格式\n"
                "- **分辨率**：720p或1080p\n"
                "- **文件大小**：小于100MB"
            )
        elif "download" in error_str.lower() or "access" in error_str.lower():
            return (
                "## 🌐 视频访问失败\n\n"
                f"**视频链接**: {video_url}\n"
                f"**错误信息**: API无法下载或访问视频文件\n\n"
                "### 可能原因\n"
                "1. **网络限制**：视频URL可能有访问限制\n"
                "2. **域名问题**：某些域名可能被API服务商限制\n"
                "3. **文件权限**：视频文件可能需要特殊权限访问\n\n"
                "### 解决方案\n"
                "1. **检查URL**：确保视频链接可以在浏览器中直接访问\n"
                "2. **更换域名**：尝试使用七牛云的CDN域名\n"
                "3. **公开权限**：确保视频文件设置为公开访问\n"
                "4. **联系管理员**：检查七牛云存储桶的访问设置"
            )
        else:
            return (
                "## ❌ 视频分析异常\n\n"
                f"**错误详情**:\n```\n{error_str}\n```\n\n"
                f"**视频链接**: {video_url}\n"
                f"**分析时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                "### 常见问题排查：\n"
                "1. **网络连接**：确保网络稳定，可以访问外网\n"
                "2. **API配置**：检查`.env`文件中的`TONGYI_API_KEY`是否正确\n"
                "3. **视频链接**：确认视频URL可以直接访问\n"
                "4. **视频格式**：建议使用MP4格式，避免特殊编码\n"
                "5. **文件大小**：避免过大的视频文件（建议<100MB）\n"
                "6. **视频时长**：控制在15分钟以内\n\n"
                "### 技术支持\n"
                "如果问题持续存在，请联系技术支持并提供上述错误信息。"
            )


def get_video_info(video_url: str) -> dict:
    """
    基于 HEAD 请求检查视频是否可访问 + 服务器信息
    """
    import requests
    from urllib.parse import urlparse

    try:
        parsed = urlparse(video_url)
        response = requests.head(video_url, timeout=10)

        return {
            "url": video_url,
            "domain": parsed.netloc,
            "status": response.status_code,
            "type": response.headers.get("Content-Type", "未知"),
            "length": response.headers.get("Content-Length", "未知"),
            "accessible": response.status_code == 200
        }
    except Exception as e:
        return {
            "url": video_url,
            "error": str(e),
            "accessible": False
        } 