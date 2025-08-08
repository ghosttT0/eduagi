#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
七牛云诊断工具 - 专门用于排查上传问题
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def check_environment():
    """检查环境配置"""
    print("=== 环境检查 ===")
    
    # 检查Python版本
    print(f"Python版本: {sys.version}")
    
    # 检查必要的包
    required_packages = ['qiniu', 'requests', 'dotenv']
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} 已安装")
        except ImportError:
            print(f"❌ {package} 未安装")
    
    print()

def check_qiniu_config():
    """检查七牛云配置"""
    print("=== 七牛云配置检查 ===")
    
    load_dotenv()
    
    access_key = os.getenv("QINIU_ACCESS_KEY")
    secret_key = os.getenv("QINIU_SECRET_KEY")
    bucket_name = os.getenv("QINIU_BUCKET_NAME")
    domain = os.getenv("QINIU_DOMAIN")
    
    print(f"Access Key: {'✓ 已配置' if access_key else '❌ 未配置'}")
    print(f"Secret Key: {'✓ 已配置' if secret_key else '❌ 未配置'}")
    print(f"Bucket Name: {bucket_name or '❌ 未配置'}")
    print(f"Domain: {domain or '❌ 未配置'}")
    
    if access_key:
        print(f"Access Key 长度: {len(access_key)} 字符")
    if secret_key:
        print(f"Secret Key 长度: {len(secret_key)} 字符")
    
    print()
    return all([access_key, secret_key, bucket_name, domain])

def check_network():
    """检查网络连接"""
    print("=== 网络连接检查 ===")
    
    test_urls = [
        "https://www.baidu.com",
        "https://upload.qiniup.com",
        "https://up.qiniup.com",
        "https://upload-z0.qiniup.com",
        "https://upload-z1.qiniup.com",
        "https://upload-z2.qiniup.com"
    ]
    
    for url in test_urls:
        try:
            start_time = time.time()
            response = requests.get(url, timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            print(f"✓ {url} - 状态码: {response.status_code}, 响应时间: {response_time:.0f}ms")
            
        except requests.exceptions.Timeout:
            print(f"⏰ {url} - 连接超时")
        except requests.exceptions.ConnectionError:
            print(f"❌ {url} - 连接失败")
        except Exception as e:
            print(f"❌ {url} - 错误: {str(e)}")
    
    print()

def test_qiniu_auth():
    """测试七牛云认证"""
    print("=== 七牛云认证测试 ===")
    
    try:
        from qiniu import Auth, BucketManager
        
        load_dotenv()
        access_key = os.getenv("QINIU_ACCESS_KEY")
        secret_key = os.getenv("QINIU_SECRET_KEY")
        bucket_name = os.getenv("QINIU_BUCKET_NAME")
        
        if not all([access_key, secret_key, bucket_name]):
            print("❌ 配置不完整，无法测试认证")
            return False
        
        # 创建认证对象
        q = Auth(access_key, secret_key)
        print("✓ 认证对象创建成功")
        
        # 测试生成token
        token = q.upload_token(bucket_name, "test", 3600)
        print("✓ 上传token生成成功")
        
        # 测试存储空间管理
        bucket_manager = BucketManager(q)
        ret, info = bucket_manager.stat(bucket_name, "nonexistent_file")
        
        if info.status_code == 612:
            print("✓ 存储空间访问正常（文件不存在是正常的）")
        elif info.status_code == 200:
            print("✓ 存储空间访问正常")
        else:
            print(f"⚠️ 存储空间响应异常: 状态码 {info.status_code}")
            if hasattr(info, 'text_body'):
                print(f"   错误信息: {info.text_body}")
        
        return True
        
    except Exception as e:
        print(f"❌ 认证测试失败: {str(e)}")
        return False

def test_upload_performance():
    """测试上传性能"""
    print("=== 上传性能测试 ===")
    
    try:
        from uil.qiniu_utils import upload_to_qiniu
        
        # 测试不同大小的文件
        test_sizes = [
            (1024, "1KB"),
            (1024 * 100, "100KB"),
            (1024 * 1024, "1MB"),
            (1024 * 1024 * 5, "5MB")
        ]
        
        for size, size_name in test_sizes:
            print(f"\n测试 {size_name} 文件上传...")
            
            # 创建测试数据
            test_data = b"0" * size
            test_filename = f"perf_test_{size_name.lower()}.dat"
            
            start_time = time.time()
            result_url = upload_to_qiniu(test_data, test_filename)
            end_time = time.time()
            
            upload_time = end_time - start_time
            
            if result_url:
                speed_mbps = (size / (1024 * 1024)) / upload_time if upload_time > 0 else 0
                print(f"✓ {size_name} 上传成功 - 耗时: {upload_time:.2f}s, 速度: {speed_mbps:.2f}MB/s")
            else:
                print(f"❌ {size_name} 上传失败")
                break
        
    except Exception as e:
        print(f"❌ 性能测试失败: {str(e)}")

def main():
    """主函数"""
    print("🔧 七牛云诊断工具")
    print("=" * 50)
    
    # 1. 环境检查
    check_environment()
    
    # 2. 配置检查
    config_ok = check_qiniu_config()
    
    # 3. 网络检查
    check_network()
    
    # 4. 认证测试
    if config_ok:
        auth_ok = test_qiniu_auth()
        
        # 5. 性能测试
        if auth_ok:
            test_upload_performance()
    
    print("\n" + "=" * 50)
    print("📋 诊断完成")
    
    if config_ok:
        print("💡 建议:")
        print("1. 如果上传大文件失败，尝试压缩文件或分段上传")
        print("2. 检查网络稳定性，避免在网络高峰期上传")
        print("3. 确保七牛云存储空间有足够的剩余容量")
        print("4. 如果问题持续，联系七牛云技术支持")
    else:
        print("❌ 请先修复配置问题")

if __name__ == "__main__":
    main()
