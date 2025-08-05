# app.py (最终美化与功能版)
import streamlit as st
from database import SessionLocal, User, Class, init_db
from pages import teacher, student, admin, analytics, manage,resource,exam,clouds,video,pptgen,notes
from auth import get_password_hash, authenticate_user
from streamlit_option_menu import option_menu
# --- 页面配置 ---
st.set_page_config(
    page_title="EduAGI 智能教学体",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- 数据库初始化与默认用户创建 ---
init_db()

# --- 自定义CSS样式 ---
hide_pages_nav = """
<style>
    [data-testid="stSidebarNav"] [data-testid="stSidebarNavItems"] {
        max-height: 0;
        overflow: hidden;
    }
</style>
"""
st.markdown(hide_pages_nav, unsafe_allow_html=True)
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    [data-testid="stSidebar"] {
        background-color: #1a1a2e;
    }
    [data-testid="stSidebarNav"] div.stButton {
        width: 100%;
    }
    [data-testid="stSidebarNav"] div.stButton > button {
        display: inline-block;
        padding: 16px 28px;
        font-size: 16px;
        font-weight: bold;
        color: white;
        background-color: transparent;
        border: solid 4px transparent;
        border-image: linear-gradient(to top right, orangered, yellow);
        border-image-slice: 1;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }
    [data-testid="stSidebarNav"] div.stButton > button:hover {
        color: white;
        background-image: linear-gradient(to top right, orangered, yellow);
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        transform: translateY(-3px);
    }
    [data-testid="stSidebarNav"] div.stButton > button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    [data-testid="stSidebarNav"] div.stButton > button:not(.st-emotion-cache-1632r2b) {
        opacity: 0.7;
    }
    [data-testid="stSidebarNav"] div.stButton > button.st-emotion-cache-1632r2b {
        opacity: 1.0;
        box-shadow: 0 8px 16px rgba(252, 165, 34, 0.4);
    }
</style>
""", unsafe_allow_html=True)

# --- 真实登录页面函数 ---
@st.cache_resource
def setup_initial_users():
    """创建包含账号和显示名称的默认用户，并设置班级"""
    db = SessionLocal()
    try:
        # 检查是否需要创建初始数据
        if db.query(User).count() == 0:
            print("正在创建初始班级和用户...")

            # 创建班级
            class1 = Class(name="计算机科学1班", description="计算机科学与技术专业1班")
            class2 = Class(name="软件工程1班", description="软件工程专业1班")
            db.add_all([class1, class2])
            db.flush()  # 获取班级ID

            # 创建用户并分配班级
            users_to_add = [
                User(account_id="admin", display_name="管理员", role="管理员",
                     hashed_password=get_password_hash("admin123"), class_id=None),
                User(account_id="T001", display_name="张老师", role="教师",
                     hashed_password=get_password_hash("teacher123"), class_id=class1.id),
                User(account_id="T002", display_name="李老师", role="教师",
                     hashed_password=get_password_hash("teacher123"), class_id=class2.id),
                User(account_id="S001", display_name="李同学", role="学生",
                     hashed_password=get_password_hash("student123"), class_id=class1.id),
                User(account_id="S002", display_name="王同学", role="学生",
                     hashed_password=get_password_hash("student123"), class_id=class1.id),
                User(account_id="S003", display_name="赵同学", role="学生",
                     hashed_password=get_password_hash("student123"), class_id=class2.id)
            ]
            db.add_all(users_to_add)
            db.commit()
            print("默认班级和用户创建成功！")
            print("- 管理员账号: admin / admin123")
            print("- 计算机科学1班教师: T001 / teacher123")
            print("- 软件工程1班教师: T002 / teacher123")
            print("- 计算机科学1班学生: S001, S002 / student123")
            print("- 软件工程1班学生: S003 / student123")
    finally:
        db.close()


def login_page():
    """登录页面，使用“账号”进行登录"""
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        with st.container(border=True):
            st.title("🤖 欢迎登录 EduAGI")
            st.markdown("---")

            with st.form("login_form"):
                # --- 核心修改：从用户名改为账号 ---
                account_id = st.text_input("账号", placeholder="请输入学号/工号/管理员账号")
                password = st.text_input("密码", type="password")
                submitted = st.form_submit_button("登 录")

                if submitted:
                    if not account_id or not password:
                        st.error("请输入账号和密码！")
                    else:
                        db = SessionLocal()
                        try:
                            # 使用新的认证函数
                            user = authenticate_user(db, account_id, password)
                            if user:
                                st.session_state["logged_in"] = True
                                st.session_state["user_id"] = user.id
                                st.session_state["account_id"] = user.account_id
                                st.session_state["display_name"] = user.display_name  # 存储显示名称
                                st.session_state["user_role"] = user.role

                                # ... (设置默认页面的逻辑不变) ...
                                st.rerun()
                            else:
                                st.error("账号或密码不正确")
                        finally:
                            db.close()


# --- 主应用导航与渲染 ---
def main_app():
    # --- 统一定义所有页面 ---
    page_definitions = {
        "工作台": {"view": teacher, "icon": "chalkboard-user", "role": ["教师"]},
        "课件生成": {"view": pptgen, "icon": "presentation-chart-bar", "role": ["教师"]},
        "学情分析": {"view": analytics, "icon": "chart-line", "role": ["教师"]},
        "我的学习": {"view": student, "icon": "book-open-reader", "role": ["学生"]},
        "我的笔记": {"view": notes, "icon": "sticky-note", "role": ["学生"]},
        "我的考试": {"view": exam, "icon": "file-pen", "role": ["学生"]},
        "知识图谱": {"view": clouds, "icon": "brain", "role": ["学生"]},
        "数据看板": {"view": admin, "icon": "chart-pie", "role": ["管理员"]},
        "用户管理": {"view": manage, "icon": "users-cog", "role": ["管理员"]},
        "资源管理中心": {"view": resource, "icon": "folder-open", "role": ["管理员"]},
        "视频中心": {"view": video, "icon": "fa-solid fa-video","role": ["学生"]},
    }

    with st.sidebar:
        st.title(f"你好, {st.session_state['display_name']}!")
        st.caption(f"账号: {st.session_state['account_id']} | 角色: {st.session_state['user_role']}")

        # 根据当前用户角色，筛选出他能看到的页面
        current_role = st.session_state.get("user_role")
        user_pages = {name: info for name, info in page_definitions.items() if current_role in info["role"]}

        # 从会话状态中获取当前选中的页面，如果不存在则设置一个默认值
        if "current_page" not in st.session_state or st.session_state.current_page not in user_pages:
            st.session_state.current_page = list(user_pages.keys())[0]

        # 使用 option_menu 创建导航
        selected_page = option_menu(
            menu_title="功能导航",
            options=list(user_pages.keys()),
            icons=[info["icon"] for info in user_pages.values()],
            menu_icon="cast",
            default_index=list(user_pages.keys()).index(st.session_state.current_page),
            orientation="vertical",
            styles={
                "container": {"padding": "5px !important", "background-color": "#1a1a2e"},
                "icon": {"color": "orange", "font-size": "25px"},
                "nav-link": {"font-size": "18px", "text-align": "left", "margin": "0px", "--hover-color": "#2a2a4e"},
                "nav-link-selected": {"background-color": "#61aeff"},
            }
        )

        # 如果用户的选择变了，更新会话状态并刷新
        if st.session_state.current_page != selected_page:
            st.session_state.current_page = selected_page
            st.rerun()

        st.container(height=150, border=False)
        st.divider()
        if st.button("退出登录", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

    # --- 根据当前页面状态，渲染对应的视图 ---
    page_to_render_info = user_pages.get(st.session_state.current_page)
    if page_to_render_info:
        page_to_render_info["view"].render()
    else:
        st.error("页面加载失败或您无权访问。")


# --- 程序总入口 ---
if __name__ == "__main__":
    setup_initial_users()
    if st.session_state.get("logged_in", False):
        main_app()
    else:
        login_page()