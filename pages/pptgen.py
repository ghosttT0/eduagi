# pages/pptgen.py - AI课件生成器页面
import streamlit as st

def render():
    """渲染AI课件生成器页面"""
    st.title("🧠 AI课件生成器")
    st.markdown("---")
    
    # 页面介绍
    st.info("💡 **智能课件生成系统** - 基于开源大模型驱动的PPT自动生成工具")
    
    # 功能说明
    col1, col2, col3 = st.columns(3)
    
    # 嵌入AI课件生成器
    st.subheader("🎯 AI课件生成系统")
    st.write("以下为嵌入的 PPT 自动生成系统：")
    
    # 检查是否为本地开发环境
    import os
    is_local = os.getenv("STREAMLIT_ENV", "local") == "local"
    
    if is_local:
        # 本地开发环境 - 指向我们的演示页面
        iframe_url = "http://localhost:3000/"
        st.info("🔧 **演示模式**: 连接到本地PPT生成演示服务 (localhost:3000)")
    else:
        # 生产环境 - 您可以在这里替换为实际的部署地址
        iframe_url = "https://pptgen.yourdomain.com"  # 请替换为您的实际域名
        st.info("🌐 **生产模式**: 连接到线上PPT生成服务")
    
    # 添加连接状态检查
    with st.expander("🔍 连接状态检查", expanded=False):
        if st.button("🔄 检查服务状态"):
            try:
                import requests
                response = requests.get(iframe_url, timeout=5)
                if response.status_code == 200:
                    st.success(f"✅ 服务连接正常 - {iframe_url}")
                else:
                    st.warning(f"⚠️ 服务响应异常 - 状态码: {response.status_code}")
            except requests.exceptions.RequestException as e:
                st.error(f"❌ 无法连接到服务: {e}")
                st.info("💡 请确保PPT生成服务已启动并运行在指定端口")
    
    # 使用说明
    with st.expander("📖 使用说明", expanded=False):
        st.markdown("""
        ### 🎯 如何使用AI课件生成器
        
        1. **输入主题**: 在下方的生成器中输入您的课件主题
        2. **选择模板**: 选择适合的PPT模板风格
        3. **AI生成**: 点击生成按钮，AI将自动创建课件内容
        4. **编辑优化**: 可以进一步编辑和优化生成的内容
        5. **导出下载**: 完成后可导出为PPT文件
        
        ### ⚙️ 技术说明
        
        - **AI模型**: 基于开源大语言模型
        - **生成速度**: 通常1-3分钟完成
        - **支持格式**: PPTX、PDF等多种格式
        - **自定义**: 支持模板和样式自定义
        
        ### 💡 使用技巧
        
        - 主题描述越详细，生成效果越好
        - 可以指定目标受众和课程时长
        - 支持中英文混合内容生成
        - 建议先预览再导出
        """)
    
    # 嵌入iframe
    try:
        st.components.v1.iframe(
            src=iframe_url, 
            height=800, 
            scrolling=True,
            width=None  # 使用全宽
        )
    except Exception as e:
        st.error(f"❌ 加载AI课件生成器时出现错误: {e}")
        st.markdown("""
        ### 🔧 故障排除
        
        如果无法正常加载，请检查：
        
        1. **服务状态**: PPT生成服务是否正常运行
        2. **网络连接**: 确保网络连接正常
        3. **端口配置**: 检查端口3000是否被占用
        4. **防火墙**: 确保防火墙允许访问
        
        ### 📞 技术支持
        
        如需技术支持，请联系系统管理员。
        """)
    
    # 底部信息
    st.markdown("---")
    st.caption("🤖 AI课件生成器 - 让教学更智能，让创作更高效")
