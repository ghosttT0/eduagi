import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Input,
  Button,
  List,
  Typography,
  Space,
  Avatar,
  Select,
  message,
  Spin,
  Empty,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  DeleteOutlined,
  HistoryOutlined,
  MessageOutlined,
  BulbOutlined,
  BookOutlined
} from '@ant-design/icons'
import { studentAPI } from '../../services/api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface ChatMessage {
  id?: number
  question: string
  answer?: string
  timestamp: string
  ai_mode: string
  isUser: boolean
}

const AIPartnerPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [aiMode, setAiMode] = useState('tutor')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await studentAPI.getChatHistory(20)
      const history = response.data.map((chat: any) => [
        {
          id: chat.id,
          question: chat.question,
          timestamp: chat.timestamp,
          ai_mode: chat.ai_mode,
          isUser: true
        },
        {
          id: chat.id,
          question: chat.answer,
          timestamp: chat.timestamp,
          ai_mode: chat.ai_mode,
          isUser: false
        }
      ]).flat()
      setMessages(history)
    } catch (error) {
      console.error('获取聊天历史失败:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      question: inputValue,
      timestamp: new Date().toISOString(),
      ai_mode: aiMode,
      isUser: true
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await studentAPI.chatWithAI({
        question: inputValue,
        ai_mode: aiMode
      })

      const aiMessage: ChatMessage = {
        question: response.data.answer,
        timestamp: response.data.timestamp,
        ai_mode: aiMode,
        isUser: false
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      message.error('发送消息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await studentAPI.clearChatHistory()
      setMessages([])
      message.success('聊天历史已清空')
    } catch (error) {
      console.error('清空历史失败:', error)
      message.error('清空历史失败')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const aiModeOptions = [
    { value: 'tutor', label: '导师模式', icon: <BookOutlined />, color: '#8b5cf6' },
    { value: 'friend', label: '伙伴模式', icon: <MessageOutlined />, color: '#52c41a' },
    { value: 'expert', label: '专家模式', icon: <BulbOutlined />, color: '#fa8c16' }
  ]

  const currentModeOption = aiModeOptions.find(option => option.value === aiMode)

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日对话"
              value={messages.filter(m => 
                new Date(m.timestamp).toDateString() === new Date().toDateString()
              ).length / 2}
              prefix={<MessageOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总对话数"
              value={Math.floor(messages.length / 2)}
              prefix={<HistoryOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="当前模式"
              value={currentModeOption?.label}
              prefix={React.cloneElement(currentModeOption?.icon || <RobotOutlined />, {
                style: { color: currentModeOption?.color || '#fa8c16' }
              })}
              valueStyle={{ color: currentModeOption?.color || '#fa8c16', fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>AI学习伙伴</Title>
          <Space>
            <Select
              value={aiMode}
              onChange={setAiMode}
              style={{ width: 120 }}
            >
              {aiModeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    {option.icon}
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
            <Tooltip title="清空聊天历史">
              <Button
                icon={<DeleteOutlined />}
                onClick={handleClearHistory}
                disabled={messages.length === 0}
              >
                清空历史
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* 聊天区域 */}
        <div style={{ 
          height: 500, 
          border: '1px solid #f0f0f0', 
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 消息列表 */}
          <div style={{ 
            flex: 1, 
            padding: 16, 
            overflowY: 'auto',
            background: '#fafafa'
          }}>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>加载聊天历史...</Text>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <Empty
                image={<RobotOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
                description="开始与AI学习伙伴对话吧！"
              />
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                      marginBottom: 16
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      maxWidth: '70%',
                      flexDirection: message.isUser ? 'row-reverse' : 'row'
                    }}>
                      <Avatar
                        style={{
                          backgroundColor: message.isUser ? '#8b5cf6' : currentModeOption?.color,
                          margin: message.isUser ? '0 0 0 8px' : '0 8px 0 0'
                        }}
                        icon={message.isUser ? <UserOutlined /> : <RobotOutlined />}
                      />
                      <div
                        style={{
                          background: message.isUser ? '#8b5cf6' : 'white',
                          color: message.isUser ? 'white' : '#333',
                          padding: '12px 16px',
                          borderRadius: 12,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          wordBreak: 'break-word'
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {message.question}
                        </div>
                        <div style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginTop: 4,
                          textAlign: message.isUser ? 'right' : 'left'
                        }}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        style={{ backgroundColor: currentModeOption?.color, marginRight: 8 }}
                        icon={<RobotOutlined />}
                      />
                      <div style={{
                        background: 'white',
                        padding: '12px 16px',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Spin size="small" />
                        <Text style={{ marginLeft: 8 }}>AI正在思考...</Text>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* 输入区域 */}
          <div style={{ 
            padding: 16, 
            borderTop: '1px solid #f0f0f0',
            background: 'white'
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`向AI${currentModeOption?.label}提问...`}
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                disabled={!inputValue.trim()}
              >
                发送
              </Button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              按 Enter 发送，Shift + Enter 换行
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AIPartnerPage
