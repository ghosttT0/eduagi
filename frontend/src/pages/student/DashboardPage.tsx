import React, { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, List, Typography, Tag, Tabs, Button, Input,
  Form, message, Spin, Alert, Select, Rate, Modal, Space
} from 'antd'
import {
  BookOutlined, FileTextOutlined, TeamOutlined, TrophyOutlined,
  RobotOutlined, EditOutlined, QuestionCircleOutlined, BarChartOutlined,
  SendOutlined, VideoCameraOutlined, BulbOutlined
} from '@ant-design/icons'
import axios from 'axios'

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
      const response = await axios.get('/api/student/chat/history')
      const history = response.data.map((item: any) => [
        { role: 'user', content: item.question, timestamp: item.timestamp },
        { role: 'assistant', content: item.answer, timestamp: item.timestamp }
      ]).flat()
      setChatMessages(history)
    } catch (error) {
      message.error('获取聊天历史失败')
    }
  }

  const fetchDisputes = async () => {
    setDisputesLoading(true)
    try {
      const response = await axios.get('/api/student/disputes')
      setDisputes(response.data)
    } catch (error) {
      message.error('获取疑问列表失败')
    } finally {
      setDisputesLoading(false)
    }
  }

  const fetchKnowledgeMastery = async () => {
    setMasteryLoading(true)
    try {
      const response = await axios.get('/api/student/knowledge-mastery')
      setKnowledgeMastery(response.data)
    } catch (error) {
      message.error('获取知识掌握情况失败')
    } finally {
      setMasteryLoading(false)
    }
  }

  const fetchVideos = async () => {
    setVideosLoading(true)
    try {
      const response = await axios.get('/api/student/videos')
      setVideos(response.data)
    } catch (error) {
      message.error('获取视频资源失败')
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
      const response = await axios.post('/api/student/chat', {
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
      message.error('AI回复失败，请重试')
    } finally {
      setChatLoading(false)
    }
  }

  // 生成练习题
  const generatePracticeQuestion = async (topic: string) => {
    setPracticeLoading(true)
    try {
      const response = await axios.post('/api/student/practice/generate', { topic })
      setCurrentQuestion(response.data)
      setFeedback('')
    } catch (error) {
      message.error('生成练习题失败')
    } finally {
      setPracticeLoading(false)
    }
  }

  // 提交练习答案
  const submitPracticeAnswer = async (values: any) => {
    if (!currentQuestion) return

    setLoading(true)
    try {
      const response = await axios.post('/api/student/practice/submit', {
        student_answer: values.answer
      }, {
        data: currentQuestion
      })

      setFeedback(response.data.feedback)
    } catch (error) {
      message.error('提交答案失败')
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
                      await axios.delete('/api/student/chat/history')
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
                  <Card title="AI反馈" style={{ background: '#f6ffed' }}>
                    <Paragraph>{feedback}</Paragraph>
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
                    await axios.post('/api/student/disputes', { message: values.message })
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
                    await axios.post('/api/student/knowledge-mastery', values)
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
      </Tabs>
    </div>
  )
}

export default StudentDashboardPage