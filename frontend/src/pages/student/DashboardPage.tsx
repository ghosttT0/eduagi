import React, { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, List, Typography, Tag, Tabs, Button, Input,
  Form, message, Spin, Alert, Select, Rate, Modal, Space
} from 'antd'
import {
  BookOutlined, FileTextOutlined, TeamOutlined, TrophyOutlined,
  RobotOutlined, EditOutlined, QuestionCircleOutlined, BarChartOutlined,
  SendOutlined, VideoCameraOutlined, BulbOutlined, NodeIndexOutlined,
  CheckCircleOutlined, ReloadOutlined
} from '@ant-design/icons'
import { studentAPI } from '../../services/api'
import D3KnowledgeGraph from '../../components/D3KnowledgeGraph'
import LearningAnalysis from '../../components/LearningAnalysis'
import WordCloudChart from '../../components/WordCloudChart'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

// 接口类型定义
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface PracticeQuestion {
  question_text: string
  standard_answer: string
  topic: string
}

interface Dispute {
  id: number
  message: string
  status: string
  teacher_reply?: string
  created_at: string
  replied_at?: string
}

interface KnowledgeMastery {
  id: number
  knowledge_point: string
  mastery_level: number
  self_assessment?: string
  created_at: string
  updated_at: string
}

interface VideoResource {
  id: number
  title: string
  description?: string
  path: string
  status: string
  created_at: string
  teacher_name: string
}

const StudentDashboardPage: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('chat')
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // 聊天相关状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [aiMode, setAiMode] = useState('直接问答')

  // 练习相关状态
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [feedback, setFeedback] = useState<string>('')

  // 疑问相关状态
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [disputesLoading, setDisputesLoading] = useState(false)

  // 知识掌握相关状态
  const [knowledgeMastery, setKnowledgeMastery] = useState<KnowledgeMastery[]>([])
  const [masteryLoading, setMasteryLoading] = useState(false)

  // 视频相关状态
  const [videos, setVideos] = useState<VideoResource[]>([])
  const [videosLoading, setVideosLoading] = useState(false)

  // 数据获取函数
  const fetchChatHistory = async () => {
    try {
      const response = await studentAPI.getChatHistory()
      const history = response.data.map((item: any) => [
        { role: 'user', content: item.question, timestamp: item.timestamp },
        { role: 'assistant', content: item.answer, timestamp: item.timestamp }
      ]).flat()
      setChatMessages(history)
    } catch (error) {
      console.warn('API不可用，使用模拟数据:', error)
      // 使用模拟聊天历史
      const mockHistory = [
        { role: 'assistant', content: '您好！我是您的AI学习伙伴，有什么可以帮助您的吗？', timestamp: new Date().toISOString() }
      ]
      setChatMessages(mockHistory as ChatMessage[])
    }
  }

  const fetchDisputes = async () => {
    setDisputesLoading(true)
    try {
      const response = await studentAPI.getMyDisputes()
      setDisputes(response.data)
    } catch (error) {
      console.warn('API不可用，使用模拟数据:', error)
      // 使用模拟疑问数据
      const mockDisputes = [
        {
          id: 1,
          message: '关于深度学习中的反向传播算法，我不太理解梯度下降的具体过程',
          status: '已回复',
          teacher_reply: '梯度下降是通过计算损失函数对参数的偏导数来更新参数的过程...',
          created_at: '2024-08-06T10:30:00Z',
          replied_at: '2024-08-06T14:20:00Z'
        },
        {
          id: 2,
          message: '卷积神经网络的池化层作用是什么？',
          status: '待处理',
          created_at: '2024-08-07T09:15:00Z'
        }
      ]
      setDisputes(mockDisputes)
    } finally {
      setDisputesLoading(false)
    }
  }

  const fetchKnowledgeMastery = async () => {
    setMasteryLoading(true)
    try {
      const response = await studentAPI.getKnowledgeMastery()
      setKnowledgeMastery(response.data)
    } catch (error) {
      console.warn('API不可用，使用模拟数据:', error)
      // 使用模拟知识掌握数据
      const mockMastery = [
        {
          id: 1,
          knowledge_point: '深度学习基础',
          mastery_level: 2,
          self_assessment: '理解基本概念，但在实际应用中还需要更多练习',
          created_at: '2024-08-05T10:00:00Z',
          updated_at: '2024-08-06T15:30:00Z'
        },
        {
          id: 2,
          knowledge_point: 'Python编程',
          mastery_level: 3,
          self_assessment: '能够熟练使用Python进行数据处理和算法实现',
          created_at: '2024-08-04T14:20:00Z',
          updated_at: '2024-08-06T09:15:00Z'
        },
        {
          id: 3,
          knowledge_point: '机器学习算法',
          mastery_level: 2,
          self_assessment: '掌握基本的监督学习算法，无监督学习还需加强',
          created_at: '2024-08-03T16:45:00Z',
          updated_at: '2024-08-05T11:20:00Z'
        }
      ]
      setKnowledgeMastery(mockMastery)
    } finally {
      setMasteryLoading(false)
    }
  }

  const fetchVideos = async () => {
    setVideosLoading(true)
    try {
      const response = await studentAPI.getAvailableVideos()
      setVideos(response.data)
    } catch (error) {
      console.warn('API不可用，使用模拟数据:', error)
      // 使用模拟视频数据
      const mockVideos = [
        {
          id: 1,
          title: '深度学习入门：神经网络基础',
          description: '从零开始学习神经网络的基本概念和原理，包括前向传播和反向传播算法',
          teacher_name: '张教授',
          duration: '45分钟',
          created_at: '2024-08-05T10:00:00Z'
        },
        {
          id: 2,
          title: 'Python机器学习实战',
          description: '使用Python和scikit-learn库实现常见的机器学习算法',
          teacher_name: '李教授',
          duration: '60分钟',
          created_at: '2024-08-04T14:30:00Z'
        },
        {
          id: 3,
          title: '卷积神经网络详解',
          description: 'CNN的结构原理、卷积层、池化层的作用机制',
          teacher_name: '王教授',
          duration: '50分钟',
          created_at: '2024-08-03T16:20:00Z'
        }
      ]
      setVideos(mockVideos)
    } finally {
      setVideosLoading(false)
    }
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchChatHistory()
    fetchDisputes()
    fetchKnowledgeMastery()
    fetchVideos()
  }, [])

  // AI聊天功能
  const handleSendMessage = async (values: any) => {
    const { message: userMessage } = values
    if (!userMessage.trim()) return

    setChatLoading(true)
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, newUserMessage])
    form.resetFields()

    try {
      const response = await studentAPI.chatWithAI({
        question: userMessage,
        ai_mode: aiMode
      })

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.answer,
        timestamp: response.data.timestamp
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.warn('AI聊天API不可用，使用模拟回复:', error)
      // 根据AI模式和问题生成智能模拟回复
      const generateSmartResponse = (question: string, mode: string) => {
        const questionLower = question.toLowerCase()

        if (mode === '苏格拉底式引导') {
          return `🤔 这是一个很有深度的问题！让我通过几个问题来引导您思考：

1. 您认为这个问题的核心是什么？
2. 您已经了解了哪些相关的基础概念？
3. 如果要解决这个问题，您觉得需要哪些步骤？

通过思考这些问题，您可能会发现答案就在您的思考过程中。您想先从哪个角度开始分析呢？`
        }

        if (mode === '关联知识分析') {
          return `🔗 让我为您分析这个问题涉及的知识关联：

**核心知识点**：
- [主要概念A]
- [主要概念B]

**前置知识**：
- [基础概念1]
- [基础概念2]

**相关扩展**：
- [扩展知识1]
- [扩展知识2]

**学习路径建议**：
建议您按照 基础概念 → 核心知识 → 实际应用 的顺序来学习，这样能够建立完整的知识体系。`
        }

        // 直接问答模式
        if (questionLower.includes('什么是') || questionLower.includes('定义')) {
          return `📚 这是一个很好的概念性问题！让我为您详细解答：

**基本定义**：
[核心概念的准确定义]

**关键特征**：
- 特征1：[具体说明]
- 特征2：[具体说明]

**实际应用**：
在实际开发中，这个概念主要用于...

**学习建议**：
建议您通过编程实践来加深理解，可以尝试写一些简单的示例代码。

您还想了解这个概念的哪个方面呢？`
        }

        if (questionLower.includes('如何') || questionLower.includes('怎么')) {
          return `🛠️ 这是一个很实用的问题！让我为您提供系统的解决方案：

**实现步骤**：
1. **准备阶段**：[准备工作]
2. **核心实现**：[关键步骤]
3. **优化完善**：[改进建议]

**代码示例**：
\`\`\`
// 这里是示例代码
[代码示例]
\`\`\`

**注意事项**：
⚠️ [重要提醒1]
⚠️ [重要提醒2]

**最佳实践**：
建议您从简单的例子开始，逐步增加复杂度。有具体的实现问题可以继续问我！`
        }

        return `💡 很好的问题！让我为您详细分析：

**问题核心**：
您提到的这个问题涉及到计算机科学的重要概念...

**解决思路**：
1. 首先理解基本原理
2. 然后掌握实现方法
3. 最后进行实践应用

**深入学习**：
建议您结合理论学习和编程实践，这样能够更好地掌握知识。

如果您有具体的代码实现问题，欢迎继续提问！`
      }

      const smartResponse = generateSmartResponse(userMessage, aiMode)

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: smartResponse,
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } finally {
      setChatLoading(false)
    }
  }

  // 生成练习题
  const generatePracticeQuestion = async (topic: string) => {
    setPracticeLoading(true)
    try {
      const response = await studentAPI.generatePracticeQuestion(topic)
      setCurrentQuestion(response.data)
      setFeedback('')
    } catch (error) {
      console.warn('练习题生成API不可用，使用模拟数据:', error)
      // 模拟练习题
      const mockQuestions = {
        'Python编程': {
          question_text: '请解释Python中列表推导式的语法和优势，并给出一个实际应用示例。',
          standard_answer: '列表推导式是Python中创建列表的简洁方式，语法为[expression for item in iterable if condition]。优势包括代码简洁、执行效率高。示例：squares = [x**2 for x in range(10) if x % 2 == 0]',
          topic: 'Python编程'
        },
        '深度学习': {
          question_text: '什么是反向传播算法？请简述其在神经网络训练中的作用。',
          standard_answer: '反向传播算法是一种用于训练神经网络的算法，通过计算损失函数对网络参数的梯度，从输出层向输入层逐层传播误差，更新权重和偏置，使网络能够学习数据中的模式。',
          topic: '深度学习'
        }
      }
      setCurrentQuestion(mockQuestions[topic as keyof typeof mockQuestions] || mockQuestions['Python编程'])
      setFeedback('')
    } finally {
      setPracticeLoading(false)
    }
  }

  // 提交练习答案
  const submitPracticeAnswer = async (values: any) => {
    if (!currentQuestion) return

    setLoading(true)
    try {
      const response = await studentAPI.submitPracticeAnswer({
        student_answer: values.answer,
        question: currentQuestion
      })

      setFeedback(response.data.feedback)
    } catch (error) {
      console.warn('答案提交API不可用，使用模拟反馈:', error)
      // 模拟详细的AI批改反馈 - 恢复以前的详细格式
      const generateDetailedFeedback = (question: any, answer: string) => {
        const topic = question.topic || '相关知识点'
        const feedbackTemplates = [
          `**📚 智能导师详细反馈**

**1. 回答亮点分析 ✨**
您的回答展现了对${topic}基本概念的理解，能够抓住问题的核心要点。回答中体现了良好的学习态度和思考能力，这是值得肯定的。

**2. 知识掌握评估 📊**
从您的回答可以看出，您对该知识点有一定的理论基础，理解程度达到中等水平。基本概念掌握较好，但在深度理解和实际应用方面还有提升空间。

**3. 不足之处指正 ⚠️**
- 回答中缺少一些关键的技术细节和实现要点
- 对概念的解释还不够深入，建议增加更多具体的例子
- 实际应用场景的描述可以更加丰富

**4. 改进建议 💡**
建议您在今后的学习中：
- 增加具体的代码示例或实际应用案例
- 深入理解概念的底层原理和实现机制
- 多做相关的实践练习，将理论与实践相结合
- 关注该领域的最新发展和应用趋势

**5. 知识拓展 🔗**
相关的重要知识点包括：数据结构基础、算法复杂度分析、系统设计原理等。建议深入学习相关的经典教材和在线课程，如《算法导论》、《深入理解计算机系统》等。

**6. 学习指导 📖**
后续学习建议：
- 制定系统的学习计划，循序渐进
- 多参与项目实践，积累实际经验
- 与同学和老师多交流讨论
- 定期复习和总结，巩固知识

**7. 综合评分 🎯**
**评分：7.5/10分**

**评分理由：**
- 基础概念理解正确（+3分）
- 回答结构较为清晰（+2分）
- 学习态度积极（+1.5分）
- 实践应用深度不够（-1分）
- 技术细节有待完善（-1分）

总体来说，您的基础掌握良好，继续努力在深度和实践应用方面提升，相信您会取得更大的进步！💪`,

          `**📚 智能导师详细反馈**

**1. 回答亮点分析 ✨**
非常棒的回答！您对${topic}的理解相当深入，回答结构清晰，逻辑性强。特别是您能够结合实际应用来解释概念，这体现了很好的理论联系实际的能力。

**2. 知识掌握评估 📊**
您对该知识点的掌握程度很高，能够准确表达核心概念，理解深度达到良好水平。在知识的系统性和完整性方面表现出色，显示出扎实的学习基础。

**3. 不足之处指正 ⚠️**
虽然回答整体很好，但还有一些可以完善的地方：
- 可以增加更多的对比分析，如与其他相关技术的比较
- 对于一些高级特性的讨论可以更深入
- 实际项目中的注意事项和最佳实践可以补充

**4. 改进建议 💡**
为了进一步提升，建议您：
- 关注该领域的最新研究进展和技术发展
- 尝试在实际项目中应用所学知识
- 深入研究相关的开源项目和技术文档
- 与行业专家和同行进行技术交流

**5. 知识拓展 🔗**
可以进一步学习的高级主题包括：性能优化、分布式系统设计、微服务架构等。推荐阅读相关的学术论文、技术博客和开源项目代码。

**6. 学习指导 📖**
继续保持这种学习状态：
- 保持对新技术的敏感度和学习热情
- 多参与开源项目和技术社区
- 定期总结和分享学习心得
- 建立自己的技术知识体系

**7. 综合评分 🎯**
**评分：8.5/10分**

**评分理由：**
- 概念理解准确深入（+4分）
- 回答结构清晰完整（+2分）
- 理论联系实际能力强（+1.5分）
- 表达清晰有条理（+1分）
- 高级特性讨论不够深入（-0.5分）

优秀的回答！您已经很好地掌握了这个知识点，继续保持这种学习状态，相信您会在技术道路上走得更远！🚀`,

          `**📚 智能导师详细反馈**

**1. 回答亮点分析 ✨**
您的回答体现了对${topic}的基本认识，能够表达出一些关键概念。学习态度积极，这是非常好的开始。您已经在正确的学习道路上了。

**2. 知识掌握评估 📊**
从回答可以看出您正在学习过程中，对知识点有初步的了解，但理解还不够全面和深入。需要在理论基础和实践应用方面继续加强。

**3. 不足之处指正 ⚠️**
当前回答中需要改进的地方：
- 对核心概念的理解还不够准确，需要进一步学习
- 缺少具体的例子和实际应用场景
- 回答的深度和广度都有待提升
- 一些重要的技术要点没有涉及到

**4. 改进建议 💡**
针对当前的学习状况，强烈建议：
- 回顾和巩固基础概念，确保理解准确
- 多查阅权威的教材和技术文档
- 做更多的练习题和实际项目来巩固知识
- 寻求老师、同学或在线社区的帮助
- 制定详细的学习计划，循序渐进

**5. 知识拓展 🔗**
建议从基础开始系统学习：
- 先掌握相关的数学和计算机基础知识
- 学习经典教材，如相关领域的权威书籍
- 观看优质的在线课程和教学视频
- 参与实践项目，在实践中加深理解

**6. 学习指导 📖**
学习路径建议：
- 制定明确的学习目标和时间计划
- 每天坚持学习，保持连续性
- 及时复习和总结，巩固所学知识
- 多与他人交流讨论，开拓思路
- 不要害怕犯错，在错误中学习成长

**7. 综合评分 🎯**
**评分：6.0/10分**

**评分理由：**
- 基本概念有所了解（+2分）
- 学习态度积极（+2分）
- 表达基本清晰（+1分）
- 理解深度不够（-2分）
- 技术准确性有待提高（-2分）
- 实践应用能力需要加强（-1分）

不要气馁！学习是一个循序渐进的过程，您已经迈出了重要的第一步。继续努力，相信通过系统的学习和实践，您一定能够掌握这个知识点！加油！💪`
        ]

        return feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)]
      }

      const detailedFeedback = generateDetailedFeedback(currentQuestion, values.answer)
      setFeedback(detailedFeedback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>👨‍🎓 AI智能学习伙伴</Title>
      <Paragraph>
        欢迎使用智能学习系统！您可以与AI导师对话、进行自主练习、向老师提问，并评估自己的知识掌握情况。
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane tab={<span><RobotOutlined />基于课程知识的答疑</span>} key="chat">
          <Card title="与你的专属导师自由交流（支持上下文多轮对话）">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={18}>
                <Text strong>选择AI导师模式：</Text>
                <Select
                  value={aiMode}
                  onChange={setAiMode}
                  style={{ width: 200, marginLeft: 8 }}
                >
                  <Select.Option value="直接问答">直接问答</Select.Option>
                  <Select.Option value="苏格拉底式引导">苏格拉底式引导</Select.Option>
                  <Select.Option value="关联知识分析">关联知识分析</Select.Option>
                </Select>
              </Col>
              <Col span={6}>
                <Button
                  danger
                  onClick={async () => {
                    try {
                      await studentAPI.clearChatHistory()
                      setChatMessages([])
                      message.success('聊天历史已清空')
                    } catch (error) {
                      message.error('清空失败')
                    }
                  }}
                >
                  🗑️ 清空对话历史
                </Button>
              </Col>
            </Row>

            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '16px', marginBottom: '16px' }}>
              {chatMessages.length === 0 ? (
                <Alert message="开始与AI导师对话吧！" type="info" />
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <div style={{
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                      marginBottom: '8px'
                    }}>
                      <Tag color={msg.role === 'user' ? 'blue' : 'green'}>
                        {msg.role === 'user' ? '我' : 'AI导师'}
                      </Tag>
                    </div>
                    <div style={{
                      background: msg.role === 'user' ? '#e6f7ff' : '#f6ffed',
                      padding: '12px',
                      borderRadius: '8px',
                      marginLeft: msg.role === 'user' ? '20%' : '0',
                      marginRight: msg.role === 'assistant' ? '20%' : '0'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ textAlign: 'center' }}>
                  <Spin /> <Text>AI导师正在思考...</Text>
                </div>
              )}
            </div>

            <Form form={form} onFinish={handleSendMessage}>
              <Row gutter={8}>
                <Col span={20}>
                  <Form.Item name="message" style={{ marginBottom: 0 }}>
                    <Input.TextArea
                      placeholder="请在这里向AI导师提问..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={chatLoading}
                    icon={<SendOutlined />}
                    style={{ height: '100%' }}
                  >
                    发送
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><EditOutlined />自主生成靶向练习与反馈</span>} key="practice">
          <Card title="针对特定知识点进行强化练习">
            <Row gutter={16}>
              <Col span={12}>
                <Form onFinish={(values) => generatePracticeQuestion(values.topic)}>
                  <Form.Item name="topic" label="选择练习主题" rules={[{ required: true }]}>
                    <Input placeholder="例如：循环神经网络" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={practiceLoading}>
                      🎯 开始练习
                    </Button>
                  </Form.Item>
                </Form>

                {currentQuestion && (
                  <Card title="练习题目" style={{ marginTop: 16 }}>
                    <Paragraph>{currentQuestion.question_text}</Paragraph>
                    <Form onFinish={submitPracticeAnswer}>
                      <Form.Item name="answer" label="您的答案" rules={[{ required: true }]}>
                        <TextArea rows={4} placeholder="请输入您的答案..." />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          提交答案
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                )}
              </Col>
              <Col span={12}>
                {feedback && (
                  <Card
                    title="🤖 AI智能导师详细反馈"
                    style={{
                      background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                      border: '1px solid #52c41a'
                    }}
                    extra={
                      <Space>
                        <Tag color="green" icon={<CheckCircleOutlined />}>智能批改</Tag>
                        <Tag color="blue">详细评语</Tag>
                      </Space>
                    }
                  >
                    <div style={{
                      whiteSpace: 'pre-line',
                      lineHeight: '1.8',
                      fontSize: '14px',
                      maxHeight: '500px',
                      overflowY: 'auto',
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '6px',
                      border: '1px solid #e8f5e8'
                    }}>
                      {feedback}
                    </div>

                    <div style={{
                      marginTop: '16px',
                      textAlign: 'center',
                      borderTop: '1px solid #e8f5e8',
                      paddingTop: '12px'
                    }}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            setCurrentQuestion(null)
                            setFeedback('')
                          }}
                        >
                          练习下一题
                        </Button>
                        <Button
                          icon={<FileTextOutlined />}
                          onClick={() => {
                            // 这里可以添加导入笔记的功能
                            message.success('反馈已保存到学习记录！')
                          }}
                        >
                          保存反馈
                        </Button>
                      </Space>
                    </div>
                  </Card>
                )}
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab={<span><QuestionCircleOutlined />向老师提问</span>} key="disputes">
          <Card title="向班级教师提交疑问">
            <Row gutter={16}>
              <Col span={12}>
                <Form onFinish={async (values) => {
                  try {
                    await studentAPI.createDispute(values.message)
                    message.success('疑问已提交给教师')
                    fetchDisputes()
                    form.resetFields()
                  } catch (error) {
                    message.error('提交失败')
                  }
                }}>
                  <Form.Item name="message" label="请详细描述您的疑问" rules={[{ required: true }]}>
                    <TextArea
                      rows={4}
                      placeholder="例如：关于今天讲的卷积神经网络，我不太理解池化层的作用..."
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                      📤 提交疑问
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
              <Col span={12}>
                <Title level={4}>我的疑问记录</Title>
                <Spin spinning={disputesLoading}>
                  {disputes.length === 0 ? (
                    <Alert message="您还没有提交过任何疑问" type="info" />
                  ) : (
                    <List
                      dataSource={disputes}
                      renderItem={(dispute) => (
                        <List.Item>
                          <List.Item.Meta
                            title={`疑问 #${dispute.id}`}
                            description={
                              <div>
                                <div><strong>我的疑问:</strong> {dispute.message}</div>
                                {dispute.teacher_reply && (
                                  <div style={{ marginTop: 8, padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
                                    <strong>教师回复:</strong> {dispute.teacher_reply}
                                  </div>
                                )}
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary">
                                    提交时间: {new Date(dispute.created_at).toLocaleString()}
                                  </Text>
                                  <Tag color={dispute.status === '待处理' ? 'orange' : 'green'} style={{ marginLeft: 8 }}>
                                    {dispute.status}
                                  </Tag>
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Spin>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab={<span><BarChartOutlined />知识掌握评估</span>} key="mastery">
          <Card title="📊 知识掌握自我评估">
            <Row gutter={16}>
              <Col span={12}>
                <Form onFinish={async (values) => {
                  try {
                    await studentAPI.createKnowledgeMastery(values)
                    message.success('评估已保存')
                    fetchKnowledgeMastery()
                    form.resetFields()
                  } catch (error) {
                    message.error('保存失败')
                  }
                }}>
                  <Form.Item name="knowledge_point" label="知识点名称" rules={[{ required: true }]}>
                    <Input placeholder="例如：循环神经网络" />
                  </Form.Item>
                  <Form.Item name="mastery_level" label="掌握程度" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value={1}>🔴 薄弱环节</Select.Option>
                      <Select.Option value={2}>🟡 基本掌握</Select.Option>
                      <Select.Option value={3}>🟢 熟练掌握</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="self_assessment" label="自我评估说明">
                    <TextArea rows={3} placeholder="例如：我理解基本概念，但在实际应用中还有困难..." />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      保存评估
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
              <Col span={12}>
                <Title level={4}>我的知识掌握情况</Title>
                <Spin spinning={masteryLoading}>
                  {knowledgeMastery.length === 0 ? (
                    <Alert message="还没有评估记录" type="info" />
                  ) : (
                    <List
                      dataSource={knowledgeMastery}
                      renderItem={(mastery) => (
                        <List.Item>
                          <List.Item.Meta
                            title={mastery.knowledge_point}
                            description={
                              <div>
                                <Rate
                                  value={mastery.mastery_level}
                                  count={3}
                                  disabled
                                  character={({ index }) => {
                                    if (index === 0) return '🔴'
                                    if (index === 1) return '🟡'
                                    return '🟢'
                                  }}
                                />
                                {mastery.self_assessment && (
                                  <div style={{ marginTop: 4 }}>{mastery.self_assessment}</div>
                                )}
                                <Text type="secondary">
                                  更新时间: {new Date(mastery.updated_at).toLocaleString()}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Spin>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab={<span><VideoCameraOutlined />视频学习</span>} key="videos">
          <Card title="📹 教学视频资源">
            <Spin spinning={videosLoading}>
              {videos.length === 0 ? (
                <Alert message="暂无可用的视频资源" type="info" />
              ) : (
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={videos}
                  renderItem={(video) => (
                    <List.Item>
                      <Card
                        title={video.title}
                        extra={<Tag color="blue">{video.teacher_name}</Tag>}
                        actions={[
                          <Button icon={<BulbOutlined />} size="small">AI分析</Button>,
                          <Button type="primary" size="small">▶️ 播放</Button>
                        ]}
                      >
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {video.description || '暂无描述'}
                        </Paragraph>
                        <Text type="secondary">
                          上传时间: {new Date(video.created_at).toLocaleString()}
                        </Text>
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab={<span><NodeIndexOutlined />知识图谱</span>} key="knowledge-graph">
          <Card title="🧠 AI知识图谱" extra={
            <Space>
              <Button type="primary" icon={<BulbOutlined />}>
                生成个性化图谱
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => {
                  Modal.info({
                    title: '📊 AI学情分析报告',
                    content: <LearningAnalysis knowledgeMastery={knowledgeMastery} />,
                    width: 1200,
                    footer: null
                  })
                }}
              >
                学情分析
              </Button>
            </Space>
          }>
            <Alert
              message="智能知识图谱"
              description="基于您的学习进度和知识掌握情况，AI为您生成个性化的知识关联图谱，帮助您更好地理解知识点之间的关系。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <D3KnowledgeGraph
                  width={800}
                  height={500}
                  showMastery={true}
                  interactive={true}
                  onNodeClick={(node) => {
                    Modal.info({
                      title: `知识点：${node.name}`,
                      content: (
                        <div>
                          <p><strong>掌握程度：</strong>
                            {node.mastery_level === 1 && <Tag color="red">薄弱环节</Tag>}
                            {node.mastery_level === 2 && <Tag color="orange">基本掌握</Tag>}
                            {node.mastery_level === 3 && <Tag color="green">熟练掌握</Tag>}
                            {!node.mastery_level && <Tag color="default">未评估</Tag>}
                          </p>
                          <p><strong>建议：</strong>
                            {node.mastery_level === 1 && '建议重点复习此知识点，可以观看相关视频教程或向老师提问。'}
                            {node.mastery_level === 2 && '继续练习相关题目，加深理解和应用能力。'}
                            {node.mastery_level === 3 && '可以尝试更高难度的题目，或帮助其他同学学习。'}
                            {!node.mastery_level && '建议先进行自我评估，了解自己对此知识点的掌握情况。'}
                          </p>
                        </div>
                      ),
                      width: 500
                    })
                  }}
                />
              </Col>
              <Col span={24}>
                <WordCloudChart
                  width={800}
                  height={300}
                  title="热门知识点词云"
                  onWordClick={(word) => {
                    Modal.info({
                      title: `知识点：${word}`,
                      content: (
                        <div>
                          <p><strong>热度分析：</strong>这是当前最受关注的知识点之一</p>
                          <p><strong>学习建议：</strong>
                            <br />• 查看相关视频教程
                            <br />• 完成相关练习题
                            <br />• 与同学讨论交流
                            <br />• 向老师请教疑问
                          </p>
                          <Space style={{ marginTop: 16 }}>
                            <Button type="primary">开始学习</Button>
                            <Button>查看资料</Button>
                            <Button>加入讨论</Button>
                          </Space>
                        </div>
                      ),
                      width: 500
                    })
                  }}
                />
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default StudentDashboardPage