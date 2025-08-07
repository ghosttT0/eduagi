import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Calendar,
  Badge,
  Modal,
  List,
  Typography,
  Space,
  Tag,
  message,
  Spin,
  Divider,
  Progress,
  Tooltip,
  Alert,
} from 'antd'
import {
  CalendarOutlined,
  RobotOutlined,
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TargetOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  FileWordOutlined,
} from '@ant-design/icons'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './StudyPlanPage.css'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

// 配置日历本地化
const localizer = momentLocalizer(moment)

interface StudyEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'study' | 'exam' | 'assignment' | 'review'
  subject: string
  description?: string
  completed?: boolean
}

interface StudyPlan {
  id: string
  title: string
  description: string
  subject: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // 天数
  goals: string[]
  schedule: StudyEvent[]
  createdAt: Date
  progress: number
}

const StudyPlanPage: React.FC = () => {
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [aiPlanModalVisible, setAiPlanModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [form] = Form.useForm()
  const [aiForm] = Form.useForm()

  // 模拟数据
  useEffect(() => {
    const mockEvents: StudyEvent[] = [
      {
        id: '1',
        title: '高等数学复习',
        start: new Date(2024, 11, 20, 9, 0),
        end: new Date(2024, 11, 20, 11, 0),
        type: 'study',
        subject: '数学',
        description: '复习微积分基础知识',
        completed: true
      },
      {
        id: '2',
        title: 'Python编程练习',
        start: new Date(2024, 11, 21, 14, 0),
        end: new Date(2024, 11, 21, 16, 0),
        type: 'study',
        subject: '编程',
        description: '完成数据结构练习题'
      },
      {
        id: '3',
        title: '期末考试',
        start: new Date(2024, 11, 25, 9, 0),
        end: new Date(2024, 11, 25, 11, 0),
        type: 'exam',
        subject: '数学',
        description: '高等数学期末考试'
      }
    ]

    const mockPlans: StudyPlan[] = [
      {
        id: '1',
        title: 'Python编程入门30天计划',
        description: '从零基础到能够独立完成简单项目',
        subject: '编程',
        difficulty: 'beginner',
        duration: 30,
        goals: ['掌握Python基础语法', '理解面向对象编程', '完成3个小项目'],
        schedule: mockEvents.filter(e => e.subject === '编程'),
        createdAt: new Date(),
        progress: 45
      }
    ]

    setEvents(mockEvents)
    setStudyPlans(mockPlans)
  }, [])

  // 事件样式
  const eventStyleGetter = (event: StudyEvent) => {
    let backgroundColor = '#3174ad'
    
    switch (event.type) {
      case 'study':
        backgroundColor = '#52c41a'
        break
      case 'exam':
        backgroundColor = '#ff4d4f'
        break
      case 'assignment':
        backgroundColor = '#faad14'
        break
      case 'review':
        backgroundColor = '#722ed1'
        break
    }

    if (event.completed) {
      backgroundColor = '#d9d9d9'
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.completed ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  // 添加/编辑事件
  const handleEventSubmit = (values: any) => {
    const newEvent: StudyEvent = {
      id: selectedEvent?.id || Date.now().toString(),
      title: values.title,
      start: values.timeRange[0].toDate(),
      end: values.timeRange[1].toDate(),
      type: values.type,
      subject: values.subject,
      description: values.description,
      completed: false
    }

    if (selectedEvent) {
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? newEvent : e))
    } else {
      setEvents(prev => [...prev, newEvent])
    }

    setModalVisible(false)
    setSelectedEvent(null)
    form.resetFields()
    message.success(selectedEvent ? '事件已更新' : '事件已添加')
  }

  // AI生成学习计划
  const handleAiPlanGenerate = async (values: any) => {
    setAiGenerating(true)
    
    try {
      // 模拟AI生成
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const aiPlan: StudyPlan = {
        id: Date.now().toString(),
        title: `${values.subject} - ${values.goal}学习计划`,
        description: `基于AI分析生成的个性化${values.subject}学习计划`,
        subject: values.subject,
        difficulty: values.level,
        duration: values.duration,
        goals: [
          `掌握${values.subject}核心概念`,
          `完成实践项目`,
          `通过相关考试`,
          `达到${values.goal}水平`
        ],
        schedule: generateAISchedule(values),
        createdAt: new Date(),
        progress: 0
      }

      setStudyPlans(prev => [...prev, aiPlan])
      setEvents(prev => [...prev, ...aiPlan.schedule])
      
      setAiPlanModalVisible(false)
      aiForm.resetFields()
      message.success('AI学习计划生成成功！')
      
    } catch (error) {
      message.error('生成失败，请重试')
    } finally {
      setAiGenerating(false)
    }
  }

  // 生成AI计划的日程安排
  const generateAISchedule = (values: any): StudyEvent[] => {
    const schedule: StudyEvent[] = []
    const startDate = moment()
    const duration = values.duration
    
    for (let i = 0; i < duration; i += 2) {
      const date = startDate.clone().add(i, 'days')
      schedule.push({
        id: `ai-${Date.now()}-${i}`,
        title: `${values.subject}学习 - 第${Math.floor(i/2) + 1}课`,
        start: date.hour(9).minute(0).toDate(),
        end: date.hour(11).minute(0).toDate(),
        type: 'study',
        subject: values.subject,
        description: `AI推荐的${values.subject}学习内容`
      })
    }
    
    return schedule
  }

  // 导出Word文档
  const exportToWord = (plan: StudyPlan) => {
    // 模拟导出功能
    message.success('学习计划Word文档已生成并下载！')
  }

  return (
    <div className="study-plan-page">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CalendarOutlined style={{ marginRight: 8, color: '#7B68EE' }} />
          📅 智能学习计划
        </Title>
        <Paragraph>
          使用AI助手制定个性化学习计划，智能安排学习时间，提高学习效率
        </Paragraph>
      </div>

      {/* 快捷操作栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<RobotOutlined />}
            onClick={() => setAiPlanModalVisible(true)}
            style={{ background: 'linear-gradient(135deg, #7B68EE 0%, #9F7AEA 100%)', border: 'none' }}
          >
            AI生成学习计划
          </Button>
          <Button 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedEvent(null)
              setModalVisible(true)
            }}
          >
            添加学习事件
          </Button>
          <Button icon={<CalendarOutlined />}>
            导入课程表
          </Button>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧 - 日历视图 */}
        <Col span={16}>
          <Card title="📅 学习日历" style={{ height: 600 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => {
                setSelectedEvent(event as StudyEvent)
                form.setFieldsValue({
                  title: event.title,
                  timeRange: [moment(event.start), moment(event.end)],
                  type: event.type,
                  subject: event.subject,
                  description: event.description
                })
                setModalVisible(true)
              }}
              onSelectSlot={(slotInfo) => {
                setSelectedEvent(null)
                form.setFieldsValue({
                  timeRange: [moment(slotInfo.start), moment(slotInfo.end)]
                })
                setModalVisible(true)
              }}
              selectable
              messages={{
                next: "下一个",
                previous: "上一个",
                today: "今天",
                month: "月",
                week: "周",
                day: "日"
              }}
            />
          </Card>
        </Col>

        {/* 右侧 - 学习计划列表 */}
        <Col span={8}>
          <Card title="📚 我的学习计划" style={{ height: 600, overflow: 'auto' }}>
            <List
              dataSource={studyPlans}
              renderItem={(plan) => (
                <List.Item>
                  <Card 
                    size="small" 
                    style={{ width: '100%', marginBottom: 16 }}
                    actions={[
                      <Tooltip title="导出Word">
                        <Button 
                          type="text" 
                          icon={<FileWordOutlined />}
                          onClick={() => exportToWord(plan)}
                        />
                      </Tooltip>,
                      <Tooltip title="编辑">
                        <Button type="text" icon={<EditOutlined />} />
                      </Tooltip>,
                      <Tooltip title="删除">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Tooltip>
                    ]}
                  >
                    <div>
                      <Text strong>{plan.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {plan.description}
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="blue">{plan.subject}</Tag>
                        <Tag color={
                          plan.difficulty === 'beginner' ? 'green' :
                          plan.difficulty === 'intermediate' ? 'orange' : 'red'
                        }>
                          {plan.difficulty === 'beginner' ? '初级' :
                           plan.difficulty === 'intermediate' ? '中级' : '高级'}
                        </Tag>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: 12 }}>进度: </Text>
                        <Progress 
                          percent={plan.progress} 
                          size="small" 
                          style={{ width: 100, display: 'inline-block' }}
                        />
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 添加/编辑事件Modal */}
      <Modal
        title={selectedEvent ? "编辑学习事件" : "添加学习事件"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setSelectedEvent(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEventSubmit}
        >
          <Form.Item
            label="事件标题"
            name="title"
            rules={[{ required: true, message: '请输入事件标题' }]}
          >
            <Input placeholder="例如：高等数学复习" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="事件类型"
                name="type"
                rules={[{ required: true, message: '请选择事件类型' }]}
              >
                <Select placeholder="选择类型">
                  <Select.Option value="study">📚 学习</Select.Option>
                  <Select.Option value="exam">📝 考试</Select.Option>
                  <Select.Option value="assignment">📋 作业</Select.Option>
                  <Select.Option value="review">🔄 复习</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="学科"
                name="subject"
                rules={[{ required: true, message: '请输入学科' }]}
              >
                <Input placeholder="例如：数学" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="时间安排"
            name="timeRange"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="事件描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="详细描述学习内容或目标..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedEvent ? '更新事件' : '添加事件'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                setSelectedEvent(null)
                form.resetFields()
              }}>
                取消
              </Button>
              {selectedEvent && (
                <Button
                  danger
                  onClick={() => {
                    setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
                    setModalVisible(false)
                    setSelectedEvent(null)
                    message.success('事件已删除')
                  }}
                >
                  删除事件
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI生成学习计划Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ color: '#7B68EE' }} />
            <span>🤖 AI智能学习计划生成</span>
          </div>
        }
        open={aiPlanModalVisible}
        onCancel={() => {
          setAiPlanModalVisible(false)
          aiForm.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Alert
          message="AI学习计划助手"
          description="基于您的学习目标和时间安排，AI将为您生成个性化的学习计划，并可导出为Word文档。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={aiForm}
          layout="vertical"
          onFinish={handleAiPlanGenerate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="学习科目"
                name="subject"
                rules={[{ required: true, message: '请输入学习科目' }]}
              >
                <Input placeholder="例如：Python编程、高等数学" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="学习目标"
                name="goal"
                rules={[{ required: true, message: '请输入学习目标' }]}
              >
                <Select placeholder="选择学习目标">
                  <Select.Option value="入门">入门掌握</Select.Option>
                  <Select.Option value="进阶">进阶提升</Select.Option>
                  <Select.Option value="精通">精通应用</Select.Option>
                  <Select.Option value="考试">考试准备</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="当前水平"
                name="level"
                rules={[{ required: true, message: '请选择当前水平' }]}
              >
                <Select placeholder="选择当前水平">
                  <Select.Option value="beginner">初学者</Select.Option>
                  <Select.Option value="intermediate">有一定基础</Select.Option>
                  <Select.Option value="advanced">较为熟练</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="计划时长"
                name="duration"
                rules={[{ required: true, message: '请选择计划时长' }]}
              >
                <Select placeholder="选择时长">
                  <Select.Option value={7}>1周</Select.Option>
                  <Select.Option value={14}>2周</Select.Option>
                  <Select.Option value={30}>1个月</Select.Option>
                  <Select.Option value={60}>2个月</Select.Option>
                  <Select.Option value={90}>3个月</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="学习偏好"
            name="preferences"
          >
            <Select mode="multiple" placeholder="选择学习偏好（可多选）">
              <Select.Option value="theory">理论学习</Select.Option>
              <Select.Option value="practice">实践练习</Select.Option>
              <Select.Option value="project">项目实战</Select.Option>
              <Select.Option value="video">视频教程</Select.Option>
              <Select.Option value="reading">阅读材料</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="每日可用时间"
            name="dailyTime"
          >
            <Select placeholder="选择每日学习时间">
              <Select.Option value={1}>1小时</Select.Option>
              <Select.Option value={2}>2小时</Select.Option>
              <Select.Option value={3}>3小时</Select.Option>
              <Select.Option value={4}>4小时以上</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="特殊要求"
            name="requirements"
          >
            <TextArea
              rows={3}
              placeholder="请描述您的特殊学习需求或目标..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={aiGenerating}
                icon={<RobotOutlined />}
                style={{ background: 'linear-gradient(135deg, #7B68EE 0%, #9F7AEA 100%)', border: 'none' }}
              >
                {aiGenerating ? 'AI正在生成中...' : '生成学习计划'}
              </Button>
              <Button onClick={() => {
                setAiPlanModalVisible(false)
                aiForm.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {aiGenerating && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>AI正在分析您的需求，生成个性化学习计划...</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StudyPlanPage
