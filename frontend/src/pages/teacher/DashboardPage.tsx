import React, { useState, useEffect } from 'react'
import {
  Card, Row, Col, Button, Input, Select, Modal, Form, message, Tabs, Typography,
  Space, Alert, List, Spin, Tag, Divider, Table, Upload, Progress
} from 'antd'
import {
  PlusOutlined, FileTextOutlined, BulbOutlined, BookOutlined,
  VideoCameraOutlined, QuestionCircleOutlined, DownloadOutlined,
  EyeOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons'
import axios from 'axios'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

// 接口类型定义
interface TeachingPlan {
  id: number
  teacher_id: number
  input_prompt: string
  output_content: string
  created_at: string
}

interface MindMap {
  id: number
  user_id: number
  title: string
  topic: string
  data: string
  description?: string
  is_public: boolean
  created_at: string
}

interface VideoResource {
  id: number
  teacher_id: number
  title: string
  description?: string
  path: string
  status: string
  created_at: string
}

interface StudentDispute {
  id: number
  student_id: number
  student_name: string
  class_id: number
  question_id?: number
  message: string
  status: string
  teacher_reply?: string
  created_at: string
  replied_at?: string
}

const TeacherDashboardPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'plan' | 'exam' | 'mindmap' | 'video'>('plan')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 数据状态
  const [teachingPlans, setTeachingPlans] = useState<TeachingPlan[]>([])
  const [mindMaps, setMindMaps] = useState<MindMap[]>([])
  const [videos, setVideos] = useState<VideoResource[]>([])
  const [disputes, setDisputes] = useState<StudentDispute[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [mindMapsLoading, setMindMapsLoading] = useState(false)
  const [videosLoading, setVideosLoading] = useState(false)
  const [disputesLoading, setDisputesLoading] = useState(false)

  // 获取数据的函数
  const fetchTeachingPlans = async () => {
    setPlansLoading(true)
    try {
      const response = await axios.get('/api/teacher/teaching-plans')
      setTeachingPlans(response.data)
    } catch (error) {
      message.error('获取教学计划失败')
    } finally {
      setPlansLoading(false)
    }
  }

  const fetchMindMaps = async () => {
    setMindMapsLoading(true)
    try {
      const response = await axios.get('/api/teacher/mindmaps')
      setMindMaps(response.data)
    } catch (error) {
      message.error('获取思维导图失败')
    } finally {
      setMindMapsLoading(false)
    }
  }

  const fetchVideos = async () => {
    setVideosLoading(true)
    try {
      const response = await axios.get('/api/teacher/videos')
      setVideos(response.data)
    } catch (error) {
      message.error('获取视频资源失败')
    } finally {
      setVideosLoading(false)
    }
  }

  const fetchDisputes = async () => {
    setDisputesLoading(true)
    try {
      const response = await axios.get('/api/teacher/disputes')
      setDisputes(response.data)
    } catch (error) {
      message.error('获取学生疑问失败')
    } finally {
      setDisputesLoading(false)
    }
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTeachingPlans()
    fetchMindMaps()
    fetchVideos()
    fetchDisputes()
  }, [])

  const showModal = (type: 'plan' | 'exam' | 'mindmap' | 'video') => {
    setModalType(type)
    setModalVisible(true)
    form.resetFields()
  }

  const handleCreate = async (values: any) => {
    setLoading(true)
    try {
      let response
      switch (modalType) {
        case 'plan':
          response = await axios.post('/api/teacher/teaching-plans', {
            course_name: values.course_name,
            chapter: values.chapter || '',
            topic: values.topic,
            class_hours: values.class_hours || 2,
            teaching_time: values.teaching_time || 90
          })
          message.success('教学计划生成成功！')
          fetchTeachingPlans()
          break

        case 'mindmap':
          response = await axios.post('/api/teacher/mindmaps', {
            title: values.title,
            topic: values.topic,
            description: values.description,
            is_public: values.is_public || false
          })
          message.success('思维导图生成成功！')
          fetchMindMaps()
          break

        case 'exam':
          response = await axios.post('/api/teacher/generate-exam', {
            exam_scope: values.scope,
            num_mcq: values.num_mcq || 5,
            num_saq: values.num_saq || 3,
            num_code: values.num_code || 1
          })
          message.success('试卷生成成功！')
          break

        case 'video':
          response = await axios.post('/api/teacher/videos', {
            title: values.title,
            description: values.description,
            path: values.path,
            status: values.status || '草稿'
          })
          message.success('视频资源添加成功！')
          fetchVideos()
          break

        default:
          message.error('未知操作类型')
          return
      }

      setModalVisible(false)
      form.resetFields()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const renderTeachingPlans = () => (
    <Card title="智能教学设计" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('plan')}>
        生成教学计划
      </Button>
    }>
      <Spin spinning={plansLoading}>
        {teachingPlans.length === 0 ? (
          <Alert
            message="暂无教学计划"
            description="点击上方按钮开始生成您的第一个AI教学计划。"
            type="info"
            showIcon
          />
        ) : (
          <List
            dataSource={teachingPlans}
            renderItem={(plan) => (
              <List.Item
                actions={[
                  <Button icon={<EyeOutlined />} size="small">查看</Button>,
                  <Button icon={<DownloadOutlined />} size="small">导出</Button>,
                  <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
                ]}
              >
                <List.Item.Meta
                  title={plan.input_prompt}
                  description={`创建时间: ${new Date(plan.created_at).toLocaleString()}`}
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )

  const renderExams = () => (
    <Card title="试卷管理" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('exam')}>
        生成试卷
      </Button>
    }>
      <Alert
        message="功能开发中"
        description="试卷生成功能正在开发中，将支持AI智能生成选择题、简答题、编程题等多种题型。"
        type="info"
        showIcon
      />
    </Card>
  )

  const renderMindMaps = () => (
    <Card title="AI知识图谱" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('mindmap')}>
        生成思维导图
      </Button>
    }>
      <Spin spinning={mindMapsLoading}>
        {mindMaps.length === 0 ? (
          <Alert
            message="暂无思维导图"
            description="点击上方按钮开始生成您的第一个AI知识图谱。"
            type="info"
            showIcon
          />
        ) : (
          <List
            dataSource={mindMaps}
            renderItem={(mindmap) => (
              <List.Item
                actions={[
                  <Button icon={<EyeOutlined />} size="small">查看</Button>,
                  <Button icon={<DownloadOutlined />} size="small">导出</Button>,
                  <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
                ]}
              >
                <List.Item.Meta
                  title={mindmap.title}
                  description={
                    <div>
                      <div>主题: {mindmap.topic}</div>
                      <div>创建时间: {new Date(mindmap.created_at).toLocaleString()}</div>
                      <Tag color={mindmap.is_public ? 'green' : 'blue'}>
                        {mindmap.is_public ? '公开' : '私有'}
                      </Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )

  // 添加视频管理渲染函数
  const renderVideos = () => (
    <Card title="视频管理" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('video')}>
        添加视频
      </Button>
    }>
      <Spin spinning={videosLoading}>
        {videos.length === 0 ? (
          <Alert
            message="暂无视频资源"
            description="点击上方按钮开始添加您的第一个教学视频。"
            type="info"
            showIcon
          />
        ) : (
          <List
            dataSource={videos}
            renderItem={(video) => (
              <List.Item
                actions={[
                  <Button icon={<EyeOutlined />} size="small">预览</Button>,
                  <Button icon={<BulbOutlined />} size="small">AI分析</Button>,
                  <Button icon={<EditOutlined />} size="small">编辑</Button>,
                  <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
                ]}
              >
                <List.Item.Meta
                  title={video.title}
                  description={
                    <div>
                      <div>{video.description}</div>
                      <div>创建时间: {new Date(video.created_at).toLocaleString()}</div>
                      <Tag color={video.status === '已发布' ? 'green' : 'orange'}>
                        {video.status}
                      </Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )

  // 添加学生疑问处理渲染函数
  const renderDisputes = () => (
    <Card title="学生疑问处理">
      <Spin spinning={disputesLoading}>
        {disputes.length === 0 ? (
          <Alert
            message="暂无学生疑问"
            description="当学生提交疑问时，会在这里显示。"
            type="info"
            showIcon
          />
        ) : (
          <List
            dataSource={disputes}
            renderItem={(dispute) => (
              <List.Item
                actions={[
                  dispute.status === '待处理' ? (
                    <Button type="primary" size="small">回复</Button>
                  ) : (
                    <Tag color="green">已回复</Tag>
                  )
                ]}
              >
                <List.Item.Meta
                  title={`来自 ${dispute.student_name} 的疑问`}
                  description={
                    <div>
                      <div><strong>疑问内容:</strong> {dispute.message}</div>
                      {dispute.teacher_reply && (
                        <div><strong>我的回复:</strong> {dispute.teacher_reply}</div>
                      )}
                      <div>提交时间: {new Date(dispute.created_at).toLocaleString()}</div>
                      <Tag color={dispute.status === '待处理' ? 'orange' : 'green'}>
                        {dispute.status}
                      </Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )

  const renderModal = () => {
    const getModalTitle = () => {
      switch (modalType) {
        case 'plan': return '生成教学计划'
        case 'exam': return '生成试卷'
        case 'mindmap': return '生成思维导图'
        case 'video': return '添加视频资源'
        default: return ''
      }
    }

    const getFormItems = () => {
      switch (modalType) {
        case 'plan':
          return (
            <>
              <Form.Item name="course_name" label="课程名称" rules={[{ required: true }]}>
                <Input placeholder="例如：《动手学深度学习》" />
              </Form.Item>
              <Form.Item name="chapter" label="所属章节">
                <Input placeholder="例如：第3章 线性神经网络" />
              </Form.Item>
              <Form.Item name="topic" label="核心教学主题">
                <TextArea rows={3} placeholder="例如：线性回归的从零开始实现。若留空，则为上方填写的章节生成整体教案。" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="class_hours" label="课时" initialValue={2}>
                    <Select>
                      <Select.Option value={1}>1课时</Select.Option>
                      <Select.Option value={2}>2课时</Select.Option>
                      <Select.Option value={3}>3课时</Select.Option>
                      <Select.Option value={4}>4课时</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="teaching_time" label="授课时间（分钟）" initialValue={90}>
                    <Select>
                      <Select.Option value={45}>45分钟</Select.Option>
                      <Select.Option value={90}>90分钟</Select.Option>
                      <Select.Option value={135}>135分钟</Select.Option>
                      <Select.Option value={180}>180分钟</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )
        case 'exam':
          return (
            <>
              <Form.Item name="title" label="试卷标题" rules={[{ required: true }]}>
                <Input placeholder="请输入试卷标题" />
              </Form.Item>
              <Form.Item name="scope" label="考试范围" rules={[{ required: true }]}>
                <Input placeholder="请输入考试范围" />
              </Form.Item>
              <Form.Item name="num_mcq" label="选择题数量">
                <Select defaultValue={3}>
                  <Select.Option value={1}>1题</Select.Option>
                  <Select.Option value={2}>2题</Select.Option>
                  <Select.Option value={3}>3题</Select.Option>
                  <Select.Option value={4}>4题</Select.Option>
                  <Select.Option value={5}>5题</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="num_saq" label="简答题数量">
                <Select defaultValue={2}>
                  <Select.Option value={1}>1题</Select.Option>
                  <Select.Option value={2}>2题</Select.Option>
                  <Select.Option value={3}>3题</Select.Option>
                  <Select.Option value={4}>4题</Select.Option>
                  <Select.Option value={5}>5题</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="num_code" label="编程题数量">
                <Select defaultValue={1}>
                  <Select.Option value={0}>0题</Select.Option>
                  <Select.Option value={1}>1题</Select.Option>
                  <Select.Option value={2}>2题</Select.Option>
                  <Select.Option value={3}>3题</Select.Option>
                </Select>
              </Form.Item>
            </>
          )
        case 'mindmap':
          return (
            <>
              <Form.Item name="title" label="图谱标题" rules={[{ required: true }]}>
                <Input placeholder="请输入思维导图标题" />
              </Form.Item>
              <Form.Item name="topic" label="图谱主题" rules={[{ required: true }]}>
                <Input placeholder="例如：深度学习中的卷积神经网络" />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <TextArea rows={3} placeholder="请输入图谱描述（可选）" />
              </Form.Item>
              <Form.Item name="is_public" label="是否公开" valuePropName="checked">
                <Select defaultValue={false}>
                  <Select.Option value={false}>私有</Select.Option>
                  <Select.Option value={true}>公开</Select.Option>
                </Select>
              </Form.Item>
            </>
          )
        case 'video':
          return (
            <>
              <Form.Item name="title" label="视频标题" rules={[{ required: true }]}>
                <Input placeholder="请输入视频标题" />
              </Form.Item>
              <Form.Item name="description" label="视频描述">
                <TextArea rows={3} placeholder="请输入视频描述（可选）" />
              </Form.Item>
              <Form.Item name="path" label="视频路径/链接" rules={[{ required: true }]}>
                <Input placeholder="请输入视频文件路径或外部链接" />
              </Form.Item>
              <Form.Item name="status" label="发布状态" initialValue="草稿">
                <Select>
                  <Select.Option value="草稿">草稿</Select.Option>
                  <Select.Option value="已发布">已发布</Select.Option>
                </Select>
              </Form.Item>
            </>
          )
        default:
          return null
      }
    }

    return (
      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          {getFormItems()}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                开始生成
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>教师工作台</Title>
      <Paragraph>
        欢迎使用 AI 智能教学助手！您可以在这里生成教学计划、试卷和思维导图。
      </Paragraph>

      <Tabs defaultActiveKey="plans" size="large">
        <TabPane tab={<span><FileTextOutlined />智能教学设计</span>} key="plans">
          {renderTeachingPlans()}
        </TabPane>
        <TabPane tab={<span><BulbOutlined />AI知识图谱</span>} key="mindmaps">
          {renderMindMaps()}
        </TabPane>
        <TabPane tab={<span><BookOutlined />智能出题</span>} key="exams">
          {renderExams()}
        </TabPane>
        <TabPane tab={<span><QuestionCircleOutlined />学生疑问</span>} key="disputes">
          {renderDisputes()}
        </TabPane>
        <TabPane tab={<span><VideoCameraOutlined />视频中心</span>} key="videos">
          {renderVideos()}
        </TabPane>
      </Tabs>

      {renderModal()}
    </div>
  )
}

export default TeacherDashboardPage 