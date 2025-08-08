# 🚀 快速配置AI API密钥

## 问题确认

测试结果显示：**您的系统确实没有配置真实的AI API密钥**，这就是为什么AI功能显得"弱智"的原因。

## 立即解决方案

### 1. 获取DeepSeek API密钥（推荐）

1. 访问：https://platform.deepseek.com/
2. 注册/登录账号
3. 进入API管理页面
4. 创建新的API密钥
5. 复制密钥（格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`）

### 2. 配置环境变量

在`backend`目录下创建`.env`文件：

```bash
# 复制以下内容到 backend/.env 文件

# 数据库配置
DATABASE_URL=sqlite:///./data/teaching.db

# JWT配置
SECRET_KEY=your-secret-key-here-change-this-in-production

# AI API配置 - 替换为您的真实密钥
DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here
QWEN_API_KEY=your-actual-qwen-api-key-here

# 七牛云配置（可选）
QINIU_ACCESS_KEY=your-qiniu-access-key
QINIU_SECRET_KEY=your-qiniu-secret-key
QINIU_BUCKET_NAME=your-bucket-name
QINIU_DOMAIN=your-domain.com
```

### 3. 验证配置

运行测试脚本验证配置：

```bash
python test_api_config.py
```

### 4. 重启应用

```bash
# 停止当前服务
# 重新启动
python backend/main.py
```

## 预期改进效果

配置真实API密钥后，您将看到：

### 🤖 智能聊天
- **之前**：固定模板回复
- **之后**：自然、个性化的对话

### 📝 题目生成
- **之前**：简单、重复的题目
- **之后**：多样化、有深度的题目

### ✅ 答案批改
- **之前**：基础评分
- **之后**：详细反馈和学习建议

### 📚 教学功能
- **之前**：基础模板
- **之后**：专业的教学设计和知识图谱

## 成本估算

- **DeepSeek API**：约$0.01-0.05/次对话
- **通义千问API**：约¥0.01-0.05/次对话
- **典型使用场景**：每月$10-50（取决于使用频率）

## 安全提醒

⚠️ **重要**：不要将API密钥提交到Git仓库
- 确保`.env`文件在`.gitignore`中
- 使用环境变量而不是硬编码

## 故障排除

如果配置后仍有问题：

1. **检查密钥格式**：DeepSeek密钥应以`sk-`开头
2. **验证网络连接**：确保能访问API服务
3. **检查账户余额**：确保API账户有足够余额
4. **查看错误日志**：检查控制台输出

---

配置完成后，您的AI教学助手将展现出真正的智能能力！🎉 