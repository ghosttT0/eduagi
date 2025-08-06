import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Radio,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Alert,
  Divider
} from 'antd'
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  TrophyOutlined,
  BookOutlined,
  CodeOutlined
} from '@ant-design/icons'
import { studentAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface PracticeQuestion {
  question: string
  question_type: 'mcq' | 'saq' | 'code'
  options?: string[]
  correct_answer?: string
  topic: string
}

interface PracticeFeedback {
  feedback: string
  score: number
}

const PracticePage: React.FC = () => {
  const [form] = Form.useForm()
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [practiceStats, setPracticeStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    averageScore: 0
  })

  const handleGenerateQuestion = async (values: any) => {
    setGenerating(true)
    setCurrentQuestion(null)
    setUserAnswer('')
    setFeedback(null)
    
    try {
      const response = await studentAPI.generatePracticeQuestion(values)
      setCurrentQuestion(response.data)
      setPracticeStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1
      }))
    } catch (error) {
      console.error('生成练习题失败:', error)
      message.error('生成练习题失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) {
      message.warning('请先回答问题')
      return
    }

    setSubmitting(true)
    try {
      const response = await studentAPI.submitPracticeAnswer(
        { answer: userAnswer },
        currentQuestion
      )
      setFeedback(response.data)
      
      // 更新统计数据
      const isCorrect = response.data.score >= 7
      setPracticeStats(prev => ({
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        totalQuestions: prev.totalQuestions,
        averageScore: ((prev.averageScore * (prev.totalQuestions - 1)) + response.data.score) / prev.totalQuestions
      }))
    } catch (error) {
      console.error('提交答案失败:', error)
      message.error('提交答案失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    setCurrentQuestion(null)
    setUserAnswer('')
    setFeedback(null)
    form.submit()
  }

  const questionTypes = [
    { value: 'mcq', label: '选择题', icon: <CheckCircleOutlined /> },
    { value: 'saq', label: '简答题', icon: <BookOutlined /> },
    { value: 'code', label: '编程题', icon: <CodeOutlined /> }
  ]

  const difficultyLevels = [
    { value: 'easy', label: '简单', color: 'green' },
    { value: 'medium', label: '中等', color: 'orange' },
    { value: 'hard', label: '困难', color: 'red' }
  ]

  const topics = [
    'Python基础语法', 'Python数据类型', '函数与模块', '面向对象编程',
    '文件操作', '异常处理', '正则表达式', '网络编程',
    '数据结构', '算法基础', '机器学习', 'Web开发'
  ]

  const accuracyRate = practiceStats.totalQuestions > 0 
    ? (practiceStats.correctAnswers / practiceStats.totalQuestions) * 100 
    : 0

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="练习题数"
              value={practiceStats.totalQuestions}
              prefix={<BookOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="正确题数"
              value={practiceStats.correctAnswers}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="正确率"
              value={accuracyRate}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均分"
              value={practiceStats.averageScore}
              precision={1}
              suffix="/10"
              prefix={<BulbOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 左侧：练习配置 */}
        <Col xs={24} lg={8}>
          <Card>
            <Title level={3}>
              <PlayCircleOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />
              自主练习
            </Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerateQuestion}
              initialValues={{
                question_type: 'mcq',
                difficulty: 'medium'
              }}
            >
              <Form.Item
                name="topic"
                label="练习主题"
                rules={[{ required: true, message: '请选择练习主题' }]}
              >
                <Select placeholder="选择要练习的主题">
                  {topics.map(topic => (
                    <Option key={topic} value={topic}>{topic}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="question_type"
                label="题目类型"
                rules={[{ required: true, message: '请选择题目类型' }]}
              >
                <Select>
                  {questionTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="difficulty"
                label="难度等级"
                rules={[{ required: true, message: '请选择难度等级' }]}
              >
                <Select>
                  {difficultyLevels.map(level => (
                    <Option key={level.value} value={level.value}>
                      <Tag color={level.color}>{level.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={generating}
                  block
                  size="large"
                >
                  {generating ? '正在生成题目...' : '生成练习题'}
                </Button>
              </Form.Item>
            </Form>

            {/* 正确率进度条 */}
            {practiceStats.totalQuestions > 0 && (
              <div style={{ marginTop: 24 }}>
                <Text strong>学习进度</Text>
                <Progress 
                  percent={accuracyRate} 
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '50%': '#faad14',
                    '100%': '#52c41a',
                  }}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                />
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：练习题目 */}
        <Col xs={24} lg={16}>
          <Card>
            <Title level={3}>练习题目</Title>
            
            {!currentQuestion && !generating && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">请在左侧配置练习参数，生成练习题</Text>
                </div>
              </div>
            )}

            {generating && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <BulbOutlined style={{ fontSize: 48, color: '#8b5cf6' }} />
                <div style={{ marginTop: 16 }}>
                  <Text>AI正在为您生成个性化练习题...</Text>
                </div>
              </div>
            )}

            {currentQuestion && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Tag color="blue">{currentQuestion.topic}</Tag>
                    <Tag color="purple">
                      {questionTypes.find(t => t.value === currentQuestion.question_type)?.label}
                    </Tag>
                  </Space>
                </div>

                <Paragraph>
                  <Text strong style={{ fontSize: 16 }}>
                    {currentQuestion.question}
                  </Text>
                </Paragraph>

                {/* 选择题选项 */}
                {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                  <Radio.Group 
                    value={userAnswer} 
                    onChange={(e) => setUserAnswer(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {currentQuestion.options.map((option, index) => (
                        <Radio key={index} value={option} style={{ padding: 8 }}>
                          {String.fromCharCode(65 + index)}. {option}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}

                {/* 简答题和编程题输入框 */}
                {(currentQuestion.question_type === 'saq' || currentQuestion.question_type === 'code') && (
                  <TextArea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={
                      currentQuestion.question_type === 'code' 
                        ? '请输入您的代码...' 
                        : '请输入您的答案...'
                    }
                    rows={currentQuestion.question_type === 'code' ? 8 : 4}
                    style={{ fontFamily: currentQuestion.question_type === 'code' ? 'monospace' : 'inherit' }}
                  />
                )}

                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button 
                      type="primary" 
                      onClick={handleSubmitAnswer}
                      loading={submitting}
                      disabled={!userAnswer.trim() || !!feedback}
                    >
                      提交答案
                    </Button>
                    {feedback && (
                      <Button onClick={handleNextQuestion}>
                        下一题
                      </Button>
                    )}
                  </Space>
                </div>

                {/* 反馈结果 */}
                {feedback && (
                  <div style={{ marginTop: 24 }}>
                    <Divider />
                    <Alert
                      message={
                        <div>
                          <Space>
                            <Text strong>评分: {feedback.score}/10</Text>
                            {feedback.score >= 7 ? (
                              <Tag color="success" icon={<CheckCircleOutlined />}>正确</Tag>
                            ) : (
                              <Tag color="error" icon={<CloseCircleOutlined />}>需要改进</Tag>
                            )}
                          </Space>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <Text>{feedback.feedback}</Text>
                        </div>
                      }
                      type={feedback.score >= 7 ? 'success' : 'warning'}
                      showIcon
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PracticePage
