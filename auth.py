# auth.py (更新验证逻辑)
from passlib.context import CryptContext
from database import SessionLocal, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db, account_id, password):
    """根据账号(account_id)来验证用户"""
    # --- 核心修改 ---
    user = db.query(User).filter(User.account_id == account_id).first()
    # --- 修改结束 ---
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user