# views/user_management_view.py (Corrected for new User model)
import streamlit as st
import pandas as pd
from database import SessionLocal, User, Class
from auth import get_password_hash


def render():
    """Renders the User Management page"""

    st.subheader("用户管理中心")

    # --- Bulk import users from Excel ---
    with st.expander("通过Excel批量导入用户"):
        uploaded_file = st.file_uploader("上传包含 'account_id', 'display_name', 'password', 'role' 列的Excel文件",
                                         type=['xlsx'])
        if uploaded_file is not None:
            try:
                df = pd.read_excel(uploaded_file)
                db = SessionLocal()
                for index, row in df.iterrows():
                    hashed_password = get_password_hash(row['password'])
                    new_user = User(
                        account_id=row['account_id'],
                        display_name=row['display_name'],
                        role=row['role'],
                        hashed_password=hashed_password
                    )
                    db.add(new_user)
                db.commit()
                st.success("批量导入用户成功！")
                st.rerun()
            except Exception as e:
                st.error(f"导入失败: {e}")
            finally:
                db.close()

    # --- Manually add a single user ---
    with st.form("add_user_form"):
        st.markdown("##### 添加新用户")
        col1, col2, col3 = st.columns(3)
        with col1:
            new_account_id = st.text_input("登录账号 (学号/工号)")
            new_display_name = st.text_input("显示名称 (姓名)")
        with col2:
            new_password = st.text_input("初始密码", type="password")
            new_role = st.selectbox("角色", ["教师", "学生", "管理员"])
        with col3:
            # 获取所有班级用于选择
            db_temp = SessionLocal()
            try:
                all_classes = db_temp.query(Class).all()
                class_options = ["无班级"] + [f"{c.name} (ID: {c.id})" for c in all_classes]
                selected_class = st.selectbox("分配班级", class_options)

                # 解析选中的班级ID
                if selected_class != "无班级":
                    class_id = int(selected_class.split("ID: ")[1].split(")")[0])
                else:
                    class_id = None
            finally:
                db_temp.close()

        add_submitted = st.form_submit_button("添加用户")

        if add_submitted and new_account_id and new_display_name and new_password:
            db = SessionLocal()
            try:
                hashed_password = get_password_hash(new_password)
                user_to_add = User(
                    account_id=new_account_id,
                    display_name=new_display_name,
                    role=new_role,
                    hashed_password=hashed_password,
                    class_id=class_id
                )
                db.add(user_to_add)
                db.commit()
                st.success(f"用户 {new_display_name} 添加成功！")
                st.rerun()
            except Exception as e:
                st.error(f"添加失败，可能是账号已存在: {e}")
            finally:
                db.close()

    # --- Display and delete existing users ---
    st.markdown("---")
    st.markdown("##### 现有用户列表")

    db = SessionLocal()
    try:
        # 获取所有用户和班级信息
        all_users = db.query(User).all()
        all_classes = {c.id: c.name for c in db.query(Class).all()}

        # 构建用户数据，包含班级信息
        user_data = {
            "ID": [u.id for u in all_users],
            "登录账号": [u.account_id for u in all_users],
            "显示名称": [u.display_name for u in all_users],
            "角色": [u.role for u in all_users],
            "班级": [all_classes.get(u.class_id, "未分配") if u.class_id else "未分配" for u in all_users],
            "删除": [u.id for u in all_users]
        }
        df_users = pd.DataFrame(user_data)

        edited_df = st.data_editor(
            df_users,
            column_config={
                "删除": st.column_config.CheckboxColumn("选择删除", default=False)
            },
            disabled=["ID", "登录账号", "显示名称", "角色", "班级"],
            hide_index=True,
            key="user_delete_editor"
        )

        users_to_delete = edited_df[edited_df["删除"] == True]["ID"].tolist()
        if users_to_delete:
            if st.button("确认删除选中的用户", type="primary"):
                for user_id in users_to_delete:
                    user = db.query(User).filter(User.id == user_id).first()
                    if user and user.account_id == "admin":
                        st.warning("不能删除默认管理员账号！")
                        continue
                    if user:
                        db.delete(user)
                db.commit()
                st.success("删除成功！")
                st.rerun()
    finally:
        db.close()

    # --- 班级管理模块 ---
    st.markdown("---")
    st.markdown("##### 班级管理")

    # 添加新班级
    with st.form("add_class_form"):
        st.markdown("###### 添加新班级")
        col1, col2 = st.columns(2)
        with col1:
            new_class_name = st.text_input("班级名称", placeholder="例如：计算机科学2班")
        with col2:
            new_class_desc = st.text_input("班级描述", placeholder="例如：计算机科学与技术专业2班")

        add_class_submitted = st.form_submit_button("添加班级")

        if add_class_submitted and new_class_name:
            db = SessionLocal()
            try:
                new_class = Class(name=new_class_name, description=new_class_desc)
                db.add(new_class)
                db.commit()
                st.success(f"班级 {new_class_name} 添加成功！")
                st.rerun()
            except Exception as e:
                st.error(f"添加班级失败: {e}")
            finally:
                db.close()

    # 显示现有班级
    db = SessionLocal()
    try:
        all_classes = db.query(Class).all()
        if all_classes:
            st.markdown("###### 现有班级列表")
            class_data = {
                "班级ID": [c.id for c in all_classes],
                "班级名称": [c.name for c in all_classes],
                "班级描述": [c.description or "无描述" for c in all_classes],
                "学生数量": [db.query(User).filter(User.class_id == c.id, User.role == "学生").count() for c in all_classes],
                "教师数量": [db.query(User).filter(User.class_id == c.id, User.role == "教师").count() for c in all_classes],
                "创建时间": [c.created_at.strftime("%Y-%m-%d") if c.created_at else "时间未知" for c in all_classes]
            }
            df_classes = pd.DataFrame(class_data)
            st.dataframe(df_classes, use_container_width=True, hide_index=True)
        else:
            st.info("暂无班级信息")
    finally:
        db.close()