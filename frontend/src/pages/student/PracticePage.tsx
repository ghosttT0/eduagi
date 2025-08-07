import React, { useState, useEffect } from 'react'
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
  Progress,
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
  TOPIC_INPUT = 'topic_input',    // 输入知识点阶段
  QUESTION_DISPLAY = 'question_display',  // 显示题目阶段
  ANSWER_INPUT = 'answer_input',   // 输入答案阶段
  FEEDBACK_DISPLAY = 'feedback_display'   // 显示反馈阶段
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

  // 核心状态：严格的"一题一清"状态管理
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

  // 步骤配置
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

  // 阶段1：生成练习题
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

      // 严格的状态转换：只有成功生成题目才能进入下一阶段
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

      // 失败时创建默认题目，但仍然进入下一阶段
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

  // 阶段2：确认开始答题
  const handleStartAnswering = () => {
    setPracticeState(prev => ({
      ...prev,
      stage: PracticeStage.ANSWER_INPUT
    }))
    message.info('请在下方输入您的答案')
  }

  // 阶段3：提交答案获取反馈
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

      // 严格的状态转换：只有成功获取反馈才能进入反馈阶段
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

  // 阶段4：开始下一题（重置到初始状态）
  const handleNextQuestion = () => {
    setPracticeState({
      stage: PracticeStage.TOPIC_INPUT,
      topic: '',
      question: null,
      studentAnswer: '',
      feedback: null,
      questionCount: practiceState.questionCount
    })

    // 重置表单
    topicForm.resetFields()
    answerForm.resetFields()
    setRawAIResponse('')

    message.success('已准备下一题练习')
  }

  // 渲染不同阶段的内容
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
            {/* 显示题目（只读） */}
            <Card 
              title={`练习题 #${practiceState.questionCount} - ${practiceState.topic}`} 
              size="small"
            >
              <Text type="secondary">
                {practiceState.question?.question_text}
              </Text>
            </Card>

            {/* 答题区域 */}
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
            {/* 题目回顾 */}
            <Card title="题目回顾" size="small">
              <Text strong>{practiceState.question?.question_text}</Text>
            </Card>

            {/* 我的答案 */}
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

            {/* AI反馈 */}
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

      {/* 进度指示器 */}
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

      {/* 主要内容区域 */}
      {renderStageContent()}

      {/* 调试信息 */}
      {debugMode && rawAIResponse && (
        <Card title="调试信息" size="small" style={{ marginTop: 24 }}>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 12, 
            borderRadius: 4,
            fontSize: 12,
            overflow: 'auto',
            maxHeight: 300
          }}>
            {rawAIResponse}
          </pre>
        </Card>
      )}
    </div>
  )
}

export default PracticePage

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
