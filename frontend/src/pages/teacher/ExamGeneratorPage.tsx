import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
  Statistic,
  Spin,
  Collapse,
  Tag
} from 'antd'
import {
  FileTextOutlined,
  QuestionCircleOutlined,
  CodeOutlined,
  EditOutlined,
  DownloadOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { teacherAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Panel } = Collapse

interface ExamGenerateRequest {
  course_name: string
  chapter: string
  topic?: string
  num_mcq: number
  num_saq: number
  num_code: number
}

interface GeneratedExam {
  mcq_questions: Array<{
    question: string
    options: string[]
    correct_answer: string
    explanation: string
  }>
  saq_questions: Array<{
    question: string
    answer: string
    points: number
  }>
  code_questions: Array<{
    question: string
    starter_code: string
    expected_output: string
    test_cases: string[]
  }>
}

const ExamGeneratorPage: React.FC = () => {
  const [form] = Form.useForm()
  const [generating, setGenerating] = useState(false)
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null)

  const handleGenerate = async (values: ExamGenerateRequest) => {
    setGenerating(true)
    try {
      const response = await teacherAPI.generateExam(values)
      setGeneratedExam(response.data.exam_data)
      message.success('试卷生成成功')
    } catch (error) {
      console.error('生成试卷失败:', error)
      message.error('生成试卷失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedExam) return
    
    // 生成试卷文本
    let examText = '智能生成试卷\n\n'
    
    if (generatedExam.mcq_questions.length > 0) {
      examText += '一、选择题\n'
      generatedExam.mcq_questions.forEach((q, index) => {
        examText += `${index + 1}. ${q.question}\n`
        q.options.forEach((option, i) => {
          examText += `   ${String.fromCharCode(65 + i)}. ${option}\n`
        })
        examText += '\n'
      })
    }
    
    if (generatedExam.saq_questions.length > 0) {
      examText += '二、简答题\n'
      generatedExam.saq_questions.forEach((q, index) => {
        examText += `${index + 1}. ${q.question} (${q.points}分)\n\n`
      })
    }
    
    if (generatedExam.code_questions.length > 0) {
      examText += '三、编程题\n'
      generatedExam.code_questions.forEach((q, index) => {
        examText += `${index + 1}. ${q.question}\n`
        examText += `起始代码：\n${q.starter_code}\n`
        examText += `期望输出：${q.expected_output}\n\n`
      })
    }
    
    // 下载文件
    const blob = new Blob([examText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `智能生成试卷_${new Date().toLocaleDateString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalQuestions = generatedExam ? 
    generatedExam.mcq_questions.length + 
    generatedExam.saq_questions.length + 
    generatedExam.code_questions.length : 0

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 左侧：试卷生成表单 */}
        <Col xs={24} lg={10}>
          <Card>
            <Title level={3}>
              <BulbOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />
              智能出题系统
            </Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                num_mcq: 5,
                num_saq: 3,
                num_code: 1
              }}
            >
              <Form.Item
                name="course_name"
                label="课程名称"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="如：Python编程基础" />
              </Form.Item>

              <Form.Item
                name="chapter"
                label="章节内容"
                rules={[{ required: true, message: '请输入章节内容' }]}
              >
                <Input placeholder="如：第三章 函数与模块" />
              </Form.Item>

              <Form.Item
                name="topic"
                label="具体主题"
              >
                <TextArea 
                  rows={2}
                  placeholder="如：函数定义、参数传递、返回值、模块导入（可选）"
                />
              </Form.Item>

              <Divider>题目数量配置</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="num_mcq"
                    label="选择题"
                  >
                    <InputNumber 
                      min={0} 
                      max={20} 
                      style={{ width: '100%' }}
                      addonAfter="题"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="num_saq"
                    label="简答题"
                  >
                    <InputNumber 
                      min={0} 
                      max={10} 
                      style={{ width: '100%' }}
                      addonAfter="题"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="num_code"
                    label="编程题"
                  >
                    <InputNumber 
                      min={0} 
                      max={5} 
                      style={{ width: '100%' }}
                      addonAfter="题"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={generating}
                  block
                  size="large"
                >
                  {generating ? '正在生成试卷...' : '生成智能试卷'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧：生成结果 */}
        <Col xs={24} lg={14}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3}>生成结果</Title>
              {generatedExam && (
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  下载试卷
                </Button>
              )}
            </div>

            {generating && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>AI正在智能生成试卷，请稍候...</Text>
                </div>
              </div>
            )}

            {generatedExam && (
              <>
                {/* 统计信息 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Statistic
                      title="总题数"
                      value={totalQuestions}
                      prefix={<FileTextOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="选择题"
                      value={generatedExam.mcq_questions.length}
                      prefix={<QuestionCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="简答题"
                      value={generatedExam.saq_questions.length}
                      prefix={<EditOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="编程题"
                      value={generatedExam.code_questions.length}
                      prefix={<CodeOutlined />}
                    />
                  </Col>
                </Row>

                {/* 题目详情 */}
                <Collapse defaultActiveKey={['mcq']}>
                  {generatedExam.mcq_questions.length > 0 && (
                    <Panel header={`选择题 (${generatedExam.mcq_questions.length}题)`} key="mcq">
                      {generatedExam.mcq_questions.map((q, index) => (
                        <Card key={index} size="small" style={{ marginBottom: 16 }}>
                          <Paragraph>
                            <Text strong>{index + 1}. {q.question}</Text>
                          </Paragraph>
                          {q.options.map((option, i) => (
                            <div key={i} style={{ marginLeft: 16 }}>
                              <Text>{String.fromCharCode(65 + i)}. {option}</Text>
                            </div>
                          ))}
                          <div style={{ marginTop: 8 }}>
                            <Tag color="green">答案: {q.correct_answer}</Tag>
                          </div>
                          <Paragraph style={{ marginTop: 8 }}>
                            <Text type="secondary">解析: {q.explanation}</Text>
                          </Paragraph>
                        </Card>
                      ))}
                    </Panel>
                  )}

                  {generatedExam.saq_questions.length > 0 && (
                    <Panel header={`简答题 (${generatedExam.saq_questions.length}题)`} key="saq">
                      {generatedExam.saq_questions.map((q, index) => (
                        <Card key={index} size="small" style={{ marginBottom: 16 }}>
                          <Paragraph>
                            <Text strong>{index + 1}. {q.question}</Text>
                            <Tag color="blue" style={{ marginLeft: 8 }}>{q.points}分</Tag>
                          </Paragraph>
                          <Paragraph>
                            <Text strong>参考答案:</Text>
                            <br />
                            <Text>{q.answer}</Text>
                          </Paragraph>
                        </Card>
                      ))}
                    </Panel>
                  )}

                  {generatedExam.code_questions.length > 0 && (
                    <Panel header={`编程题 (${generatedExam.code_questions.length}题)`} key="code">
                      {generatedExam.code_questions.map((q, index) => (
                        <Card key={index} size="small" style={{ marginBottom: 16 }}>
                          <Paragraph>
                            <Text strong>{index + 1}. {q.question}</Text>
                          </Paragraph>
                          <Paragraph>
                            <Text strong>起始代码:</Text>
                            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                              {q.starter_code}
                            </pre>
                          </Paragraph>
                          <Paragraph>
                            <Text strong>期望输出:</Text> {q.expected_output}
                          </Paragraph>
                        </Card>
                      ))}
                    </Panel>
                  )}
                </Collapse>
              </>
            )}

            {!generatedExam && !generating && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">请填写左侧表单，生成智能试卷</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ExamGeneratorPage
