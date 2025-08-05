# qiniu_utils.py
import os
import traceback
import time
from qiniu import Auth, put_data, put_file
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()

# 从环境变量加载您的七牛云配置信息
access_key = os.getenv("QINIU_ACCESS_KEY")
secret_key = os.getenv("QINIU_SECRET_KEY")
bucket_name = os.getenv("QINIU_BUCKET_NAME")
domain = os.getenv("QINIU_DOMAIN")

# 调试信息
print(f"七牛云配置检查:")
print(f"- Access Key: {'已配置' if access_key else '未配置'}")
print(f"- Secret Key: {'已配置' if secret_key else '未配置'}")
print(f"- Bucket Name: {bucket_name}")
print(f"- Domain: {domain}")

# 构建鉴权对象
if access_key and secret_key:
    q = Auth(access_key, secret_key)
else:
    q = None
    print("警告：七牛云认证对象创建失败，请检查配置")


def upload_to_qiniu(file_data, file_name, max_retries=3):
    """
    将文件数据上传到七牛云，并返回可公开访问的URL。
    支持重试机制和大文件处理。

    :param file_data: 文件的二进制数据 (例如 uploaded_file.getvalue())
    :param file_name: 希望在七牛云上保存的文件名
    :param max_retries: 最大重试次数
    :return: 成功则返回完整的URL，失败则返回None
    """
    for attempt in range(max_retries):
        try:
            print(f"开始上传文件: {file_name} (尝试 {attempt + 1}/{max_retries})")

            # 检查配置是否齐全
            if not all([access_key, secret_key, bucket_name, domain]):
                missing_configs = []
                if not access_key: missing_configs.append("QINIU_ACCESS_KEY")
                if not secret_key: missing_configs.append("QINIU_SECRET_KEY")
                if not bucket_name: missing_configs.append("QINIU_BUCKET_NAME")
                if not domain: missing_configs.append("QINIU_DOMAIN")

                error_msg = f"错误：七牛云配置不完整，缺少: {', '.join(missing_configs)}"
                print(error_msg)
                return None

            # 检查认证对象
            if q is None:
                print("错误：七牛云认证对象未初始化")
                return None

            # 检查文件数据
            if not file_data:
                print("错误：文件数据为空")
                return None

            file_size_mb = len(file_data) / (1024 * 1024)
            print(f"文件大小: {len(file_data)} bytes ({file_size_mb:.2f} MB)")

            # 生成上传 Token，有效期为4小时（14400秒）
            print("正在生成上传token...")
            token = q.upload_token(bucket_name, file_name, 14400)
            print("Token生成成功")

            # 根据文件大小选择上传方式
            if file_size_mb > 10:  # 大于10MB使用分片上传
                print("文件较大，使用分片上传...")
                # 创建临时文件
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    temp_file.write(file_data)
                    temp_file_path = temp_file.name

                try:
                    # 使用文件上传（支持分片）
                    ret, info = put_file(token, file_name, temp_file_path)
                finally:
                    # 清理临时文件
                    os.unlink(temp_file_path)
            else:
                print("使用直接上传...")
                # 小文件直接上传
                ret, info = put_data(token, file_name, file_data)

            print(f"上传响应信息: {info}")
            if ret:
                print(f"上传返回数据: {ret}")

            # 检查上传是否成功
            if info and info.status_code == 200:
                # 确保domain以/结尾
                clean_domain = domain.rstrip('/')
                # 拼接完整的、可公开访问的URL
                url = f"{clean_domain}/{file_name}"
                print(f"文件 '{file_name}' 成功上传到七牛云，URL: {url}")
                return url
            else:
                error_msg = f"上传失败 - 状态码: {info.status_code if info else 'None'}"
                if info and hasattr(info, 'text_body'):
                    error_msg += f", 错误信息: {info.text_body}"
                print(error_msg)

                # 如果不是最后一次尝试，等待后重试
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 递增等待时间
                    print(f"等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                    continue
                else:
                    return None

        except Exception as e:
            print(f"上传过程中发生异常: {str(e)}")
            print(f"异常详情: {traceback.format_exc()}")

            # 如果不是最后一次尝试，等待后重试
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2
                print(f"等待 {wait_time} 秒后重试...")
                time.sleep(wait_time)
                continue
            else:
                return None

    return None