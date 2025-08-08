import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Alert,
  Divider,
  Steps,
  Tag
} from 'antd'
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  BulbOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { studentAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 练习状态枚举
enum PracticeStage {
  TOPIC_INPUT = 'topic_input',
  QUESTION_DISPLAY = 'question_display',
  ANSWER_INPUT = 'answer_input',
  FEEDBACK_DISPLAY = 'feedback_display'
}

interface PracticeQuestion {
  question_text: string
  standard_answer: string
  topic: string
}

interface PracticeFeedback {
  feedback: string
  score?: number
}

interface PracticeState {
  stage: PracticeStage
  topic: string
  question: PracticeQuestion | null
  studentAnswer: string
  feedback: PracticeFeedback | null
  questionCount: number
}

const PracticePage: React.FC = () => {
  const [topicForm] = Form.useForm()
  const [answerForm] = Form.useForm()

  const [practiceState, setPracticeState] = useState<PracticeState>({
    stage: PracticeStage.TOPIC_INPUT,
    topic: '',
    question: null,
    studentAnswer: '',
    feedback: null,
    questionCount: 0
  })

  const [loading, setLoading] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [rawAIResponse, setRawAIResponse] = useState('')

  const steps = [
    { title: '输入知识点', description: '选择要练习的主题' },
    { title: '练习题目', description: 'AI生成相关题目' },
    { title: '作答提交', description: '输入您的答案' },
    { title: '获得反馈', description: 'AI提供详细反馈' }
  ]

  const getCurrentStepIndex = () => {
    switch (practiceState.stage) {
      case PracticeStage.TOPIC_INPUT: return 0
      case PracticeStage.QUESTION_DISPLAY: return 1
      case PracticeStage.ANSWER_INPUT: return 2
      case PracticeStage.FEEDBACK_DISPLAY: return 3
      default: return 0
    }
  }

  const handleGenerateQuestion = async (values: { topic: string }) => {
    const { topic } = values
    if (!topic?.trim()) {
      message.warning('请输入知识点')
      return
    }

    setLoading(true)
    try {
      message.loading({ content: `正在为"${topic}"生成练习题...`, key: 'generating' })

      const response = await studentAPI.generatePracticeQuestion(topic)

      if (debugMode) {
        setRawAIResponse(JSON.stringify(response.data, null, 2))
      }

      const questionData = response.data
      questionData.topic = topic

      setPracticeState(prev => ({
        ...prev,
        stage: PracticeStage.QUESTION_DISPLAY,
        topic: topic,
        question: questionData,
        questionCount: prev.questionCount + 1
      }))

      message.success({ content: '✅ 练习题生成成功！请仔细阅读题目', key: 'generating' })

    } catch (error) {
      console.error('生成练习题失败:', error)
      message.error({ content: '生成练习题失败，请重试', key: 'generating' })

      const defaultQuestion: PracticeQuestion = {
        question_text: `请详细解释${topic}的核心概念、原理和应用场景。`,
        standard_answer: `${topic}是一个重要的概念。请从定义、原理、特点、应用场景等方面进行详细阐述。`,
        topic: topic
      }

      setPracticeState(prev => ({
        ...prev,
        stage: PracticeStage.QUESTION_DISPLAY,
        topic: topic,
        question: defaultQuestion,
        questionCount: prev.questionCount + 1
      }))

      message.warning('⚠️ AI生成异常，已创建默认练习题，您可以继续练习。')
    } finally {
      setLoading(false)
    }
  }

  const handleStartAnswering = () => {
    setPracticeState(prev => ({
      ...prev,
      stage: PracticeStage.ANSWER_INPUT
    }))
    message.info('请在下方输入您的答案')
  }

  const handleSubmitAnswer = async (values: { student_answer: string }) => {
    const { student_answer } = values
    if (!practiceState.question || !student_answer?.trim()) {
      message.warning('请先输入您的答案')
      return
    }

    setLoading(true)
    try {
      message.loading({ content: 'AI正在分析您的答案并生成反馈...', key: 'submitting' })

      const response = await studentAPI.submitPracticeAnswer({
        student_answer: student_answer,
        question_text: practiceState.question.question_text,
        standard_answer: practiceState.question.standard_answer,
        topic: practiceState.question.topic
      })

      setPracticeState(prev => ({
        ...prev,
        stage: PracticeStage.FEEDBACK_DISPLAY,
        studentAnswer: student_answer,
        feedback: response.data
      }))

      message.success({ content: '反馈生成完成！', key: 'submitting' })

    } catch (error) {
      console.error('提交答案失败:', error)
      message.error({ content: '生成反馈时出错，请重试', key: 'submitting' })
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = () => {
    setPracticeState({
      stage: PracticeStage.TOPIC_INPUT,
      topic: '',
      question: null,
      studentAnswer: '',
      feedback: null,
      questionCount: practiceState.questionCount
    })

    topicForm.resetFields()
    answerForm.resetFields()
    setRawAIResponse('')

    message.success('已准备下一题练习')
  }

  const renderStageContent = () => {
    switch (practiceState.stage) {
      case PracticeStage.TOPIC_INPUT:
        return (
          <Card title="开始新的练习" extra={<SearchOutlined />}>
            <Alert
              message="请输入一个知识点，AI会为你生成一道相关的练习题。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={topicForm}
              layout="vertical"
              onFinish={handleGenerateQuestion}
            >
              <Form.Item
                name="topic"
                label="你想练习的知识点"
                rules={[{ required: true, message: '请输入知识点' }]}
              >
                <Input
                  placeholder="例如：深度学习、神经网络、机器学习算法"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlayCircleOutlined />}
                  loading={loading}
                  size="large"
                  block
                >
                  开始练习
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )

      case PracticeStage.QUESTION_DISPLAY:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card 
              title={`练习题 #${practiceState.questionCount} - ${practiceState.topic}`} 
              extra={<BookOutlined />}
            >
              <Alert
                message="练习题目："
                description={
                  <div style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.6', 
                    marginTop: '12px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    {practiceState.question?.question_text}
                  </div>
                }
                type="info"
                showIcon
              />

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleStartAnswering}
                  size="large"
                >
                  开始作答
                </Button>
              </div>
            </Card>
          </Space>
        )

      case PracticeStage.ANSWER_INPUT:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card 
              title={`练习题 #${practiceState.questionCount} - ${practiceState.topic}`} 
              size="small"
            >
              <Text type="secondary">
                {practiceState.question?.question_text}
              </Text>
            </Card>

            <Card title="请在此处作答" extra={<EditOutlined />}>
              <Form 
                form={answerForm}
                layout="vertical" 
                onFinish={handleSubmitAnswer}
              >
                <Form.Item
                  name="student_answer"
                  rules={[{ required: true, message: '请输入您的答案' }]}
                >
                  <TextArea
                    rows={8}
                    placeholder="请在此处输入您的详细答案..."
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleOutlined />}
                    loading={loading}
                    size="large"
                    block
                  >
                    提交答案获取反馈
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        )

      case PracticeStage.FEEDBACK_DISPLAY:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="题目回顾" size="small">
              <Text strong>{practiceState.question?.question_text}</Text>
            </Card>

            <Card title="我的答案" size="small">
              <div style={{ 
                backgroundColor: '#f6f8fa', 
                padding: '12px', 
                borderRadius: '6px',
                whiteSpace: 'pre-wrap' 
              }}>
                {practiceState.studentAnswer}
              </div>
            </Card>

            <Card 
              title="智能导师反馈" 
              extra={<BulbOutlined style={{ color: '#52c41a' }} />}
            >
              <Alert
                message="AI详细反馈"
                description={
                  <div style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>
                    {practiceState.feedback?.feedback}
                  </div>
                }
                type="success"
                showIcon
              />

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleNextQuestion}
                  size="large"
                >
                  进行下一题
                </Button>
              </div>
            </Card>
          </Space>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>
        <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        AI靶向练习
      </Title>
      <Paragraph type="secondary">
        针对特定知识点进行强化练习，AI会为您生成相关题目并提供智能反馈
      </Paragraph>

      <Card style={{ marginBottom: 24 }}>
        <Steps 
          current={getCurrentStepIndex()} 
          items={steps}
          size="small"
        />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Tag color="blue">已完成练习: {practiceState.questionCount} 题</Tag>
          {practiceState.stage !== PracticeStage.TOPIC_INPUT && (
            <Tag color="green">当前题目: {practiceState.topic}</Tag>
          )}
        </div>
      </Card>

      {renderStageContent()}

      {debugMode && rawAIResponse && (
        <Card title="调试信息" style={{ marginTop: 24 }}>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 12, 
            borderRadius: 4,
            fontSize: 12,
            overflow: 'auto'
          }}>
            {rawAIResponse}
          </pre>
        </Card>
      )}
    </div>
  )
}

export default PracticePage