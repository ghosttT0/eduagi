# AI API配置指南

## 问题诊断

您遇到的问题是：**AI服务没有配置真实的API密钥，导致系统一直在使用模拟回复**。

### 当前状态检查

从代码分析可以看出：

1. **AI服务配置位置**：`backend/services/ai_service.py`
2. **API密钥检查**：第198行 `if not AIConfig.DEEPSEEK_API_KEY:`
3. **回退机制**：当API密钥为空时，自动使用模拟回复

### 影响的功能

以下功能目前使用模拟回复，显得"弱智"：

- ✅ 智能聊天对话
- ✅ 题目生成
- ✅ 答案批改
- ✅ 教学计划生成
- ✅ 知识图谱生成
- ✅ 考试题目生成

## 解决方案

### 步骤1：获取API密钥

#### DeepSeek API（主要AI功能）
1. 访问：https://platform.deepseek.com/
2. 注册账号并登录
3. 进入API管理页面
4. 创建新的API密钥
5. 复制API密钥

#### 通义千问API（视频分析专用）
1. 访问：https://dashscope.aliyun.com/
2. 注册阿里云账号
3. 开通通义千问服务
4. 获取API密钥

### 步骤2：配置环境变量

#### 方法1：创建.env文件
在`backend`目录下创建`.env`文件：

```bash
# 数据库配置
DATABASE_URL=sqlite:///./data/teaching.db

# JWT配置
SECRET_KEY=your-secret-key-here-change-this-in-production

# AI API配置
DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here
QWEN_API_KEY=your-actual-qwen-api-key-here

# 七牛云配置（可选）
QINIU_ACCESS_KEY=your-qiniu-access-key
QINIU_SECRET_KEY=your-qiniu-secret-key
QINIU_BUCKET_NAME=your-bucket-name
QINIU_DOMAIN=your-domain.com
```

#### 方法2：设置系统环境变量

**Windows PowerShell:**
```powershell
$env:DEEPSEEK_API_KEY="sk-your-actual-deepseek-api-key-here"
$env:QWEN_API_KEY="your-actual-qwen-api-key-here"
```

**Linux/Mac:**
```bash
export DEEPSEEK_API_KEY="sk-your-actual-deepseek-api-key-here"
export QWEN_API_KEY="your-actual-qwen-api-key-here"
```

### 步骤3：验证配置

创建一个测试脚本验证API配置：

```python
# test_api.py
import os
import asyncio
from backend.services.ai_service import AIService

async def test_api():
    ai_service = AIService()
    
    # 测试简单对话
    response = await ai_service.call_deepseek_api("请简单介绍一下Python")
    print(f"模型: {response.model}")
    print(f"内容: {response.content[:100]}...")
    
    if "mock" in response.model.lower():
        print("❌ 仍在使用模拟回复")
    else:
        print("✅ 成功使用真实AI服务")
    
    await ai_service.close()

if __name__ == "__main__":
    asyncio.run(test_api())
```

### 步骤4：重启应用

配置完成后，重启后端服务：

```bash
# 停止当前服务
# 重新启动
python backend/main.py
```

## 预期效果

配置真实API密钥后，您将看到：

### 智能聊天
- 更自然、准确的回答
- 能够理解上下文
- 提供个性化的学习建议

### 题目生成
- 多样化、有深度的题目
- 符合教学目标的题目设计
- 详细的解题思路和答案

### 答案批改
- 智能化的评分标准
- 详细的反馈和建议
- 个性化的学习指导

### 教学功能
- 专业的教学计划设计
- 完整的知识图谱
- 针对性的考试题目

## 成本说明

### DeepSeek API定价
- 基础模型：约$0.002/1K tokens
- 高级模型：约$0.006/1K tokens
- 典型对话成本：$0.01-0.05/次

### 通义千问API定价
- 基础模型：约¥0.002/1K tokens
- 高级模型：约¥0.006/1K tokens

## 故障排除

### 常见问题

1. **API密钥无效**
   - 检查密钥格式是否正确
   - 确认密钥是否已激活
   - 验证账户余额

2. **网络连接问题**
   - 检查网络连接
   - 确认防火墙设置
   - 尝试使用代理

3. **配额限制**
   - 检查API使用配额
   - 确认账户余额
   - 考虑升级套餐

### 调试命令

```python
# 检查环境变量
import os
print(f"DEEPSEEK_API_KEY: {os.getenv('DEEPSEEK_API_KEY', '未设置')}")

# 测试API连接
import httpx
async def test_connection():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.deepseek.com/v1/models")
        print(f"状态码: {response.status_code}")
```

## 安全提醒

1. **不要提交API密钥到版本控制**
   - 确保.env文件在.gitignore中
   - 使用环境变量而不是硬编码

2. **定期轮换密钥**
   - 定期更新API密钥
   - 监控API使用情况

3. **设置使用限制**
   - 配置API使用配额
   - 监控异常使用模式

---

配置完成后，您的AI教学助手将展现出真正的智能能力，为学生提供高质量的学习体验！ 