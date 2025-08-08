import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Alert,
  Divider,
  Tabs,
  Checkbox,
  Row,
  Col
} from 'antd'
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  BulbOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { studentAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

interface PracticeQuestion {
  question_text: string
  standard_answer: string
  topic: string
}

interface PracticeFeedback {
  feedback: string
  score?: number
}

const PracticePage: React.FC = () => {
  const [form] = Form.useForm()
  const [practiceQuestion, setPracticeQuestion] = useState<PracticeQuestion | null>(null)
  const [practiceFeedback, setPracticeFeedback] = useState<PracticeFeedback | null>(null)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [rawAIResponse, setRawAIResponse] = useState('')

  const handleGenerateQuestion = async (values: any) => {
    const { topic } = values
    if (!topic?.trim()) {
      message.warning('请输入知识点')
      return
    }

    setGenerating(true)
    setPracticeQuestion(null)
    setPracticeFeedback(null)
    setRawAIResponse('')

    try {
      message.loading({ content: `正在为"${topic}"生成练习题...`, key: 'generating' })

      const response = await studentAPI.generatePracticeQuestion(topic)

      // 保存原始AI响应用于调试
      setRawAIResponse(JSON.stringify(response.data, null, 2))

      const questionData = response.data
      // 确保添加topic信息
      questionData.topic = topic

      setPracticeQuestion(questionData)
      message.success({ content: '✅ 练习题生成成功！', key: 'generating' })

    } catch (error) {
      console.error('生成练习题失败:', error)
      message.error({ content: '生成练习题失败', key: 'generating' })

      // 创建默认练习题
      const defaultQuestion: PracticeQuestion = {
        question_text: `请详细解释${topic}的核心概念、原理和应用场景。`,
        standard_answer: `${topic}是一个重要的概念。请从定义、原理、特点、应用场景等方面进行详细阐述。`,
        topic: topic
      }
      setPracticeQuestion(defaultQuestion)
      message.warning('⚠️ AI生成异常，已创建默认练习题，您可以继续练习。')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmitAnswer = async (values: any) => {
    const { student_answer } = values
    if (!practiceQuestion || !student_answer?.trim()) {
      message.warning('请先回答问题')
      return
    }

    setSubmitting(true)
    try {
      message.loading({ content: 'AI正在分析您的答案并生成反馈...', key: 'submitting' })

      const response = await studentAPI.submitPracticeAnswer({
        student_answer: student_answer,
        question_text: practiceQuestion.question_text,
        standard_answer: practiceQuestion.standard_answer,
        topic: practiceQuestion.topic
      })

      setPracticeFeedback(response.data)
      message.success({ content: '反馈生成完成！', key: 'submitting' })

    } catch (error) {
      console.error('提交答案失败:', error)
      message.error({ content: '生成反馈时出错', key: 'submitting' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    setPracticeQuestion(null)
    setPracticeFeedback(null)
    setRawAIResponse('')
    form.resetFields()
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        AI靶向练习
      </Title>
      <Paragraph type="secondary">
        针对特定知识点进行强化练习，AI会为您生成相关题目并提供智能反馈
      </Paragraph>

      <Tabs defaultActiveKey="practice" type="card">
        <TabPane tab="📝 自主生成靶向练习与反馈" key="practice">
          {/* 如果当前没有正在进行的练习，则让用户输入知识点 */}
          {!practiceQuestion ? (
            <Card title="开始练习" extra={<SearchOutlined />}>
              <Alert
                message="请输入一个知识点，AI会为你生成一道相关的练习题。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerateQuestion}
              >
                <Form.Item
                  name="topic"
                  label="你想练习的知识点"
                  rules={[{ required: true, message: '请输入知识点' }]}
                >
                  <Input
                    placeholder="例如：卷积神经网络、梯度消失问题"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlayCircleOutlined />}
                    loading={generating}
                    size="large"
                  >
                    开始练习
                  </Button>
                </Form.Item>
              </Form>

              {/* 调试模式 */}
              <Checkbox
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              >
                🔍 显示AI原始回复（调试模式）
              </Checkbox>

              {debugMode && rawAIResponse && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>AI原始回复：</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    fontSize: 12,
                    overflow: 'auto'
                  }}>
                    {rawAIResponse}
                  </pre>
                </div>
              )}
            </Card>
          ) : (
            /* 如果已经生成了题目，则进入作答和反馈环节 */
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 显示练习题 */}
              <Card 
                title={`练习题 - ${practiceQuestion.topic}`} 
                extra={<BookOutlined />}
              >
                <Alert
                  message="练习题："
                  description={practiceQuestion.question_text}
                  type="info"
                  showIcon
                />
              </Card>

              {/* 答题区域 */}
              {!practiceFeedback && (
                <Card title="请在此处作答" extra={<EditOutlined />}>
                  <Form layout="vertical" onFinish={handleSubmitAnswer}>
                    <Form.Item
                      name="student_answer"
                      rules={[{ required: true, message: '请输入您的答案' }]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="请在此处输入您的答案..."
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<CheckCircleOutlined />}
                        loading={submitting}
                        size="large"
                      >
                        提交答案获取反馈
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              {/* 显示AI的反馈 */}
              {practiceFeedback && (
                <>
                  <Divider />
                  <Card 
                    title="智能导师反馈" 
                    extra={<BulbOutlined style={{ color: '#52c41a' }} />}
                  >
                    <Alert
                      message="AI反馈"
                      description={
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {practiceFeedback.feedback}
                        </div>
                      }
                      type="success"
                      showIcon
                    />

                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleNextQuestion}
                        size="large"
                      >
                        进行下一题
                      </Button>
                    </div>
                  </Card>
                </>
              )}

              {/* 题目预览（调试模式） */}
              {debugMode && (
                <Card title="题目预览（调试）" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>题目:</Text>
                      <p>{practiceQuestion.question_text.substring(0, 100)}...</p>
                    </Col>
                    <Col span={12}>
                      <Text strong>答案:</Text>
                      <p>{practiceQuestion.standard_answer.substring(0, 100)}...</p>
                    </Col>
                  </Row>
                </Card>
              )}
            </Space>
          )}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default PracticePage