import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Modal, Form, message, Tabs, Typography, Space, List, Spin, Empty, Alert } from 'antd'
import { PlusOutlined, FileTextOutlined, BulbOutlined, BookOutlined, EyeOutlined, DownloadOutlined, ApiOutlined } from '@ant-design/icons'
import { teacherAPI } from '../../services/api'

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

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

const TeacherDashboardPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'plan' | 'exam' | 'mindmap'>('plan')
  const [form] = Form.useForm()
  const [creating, setCreating] = useState(false)
  
  // 数据状态
  const [teachingPlans, setTeachingPlans] = useState<TeachingPlan[]>([])
  const [mindMaps, setMindMaps] = useState<MindMap[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [mindMapsLoading, setMindMapsLoading] = useState(false)
  const [testingAI, setTestingAI] = useState(false)

  // 加载数据
  useEffect(() => {
    loadTeachingPlans()
    loadMindMaps()
  }, [])

  const loadTeachingPlans = async () => {
    setPlansLoading(true)
    try {
      const response = await teacherAPI.getTeachingPlans()
      setTeachingPlans(response.data)
    } catch (error) {
      console.error('加载教学计划失败:', error)
      message.error('加载教学计划失败')
    } finally {
      setPlansLoading(false)
    }
  }

  const loadMindMaps = async () => {
    setMindMapsLoading(true)
    try {
      const response = await teacherAPI.getMindMaps()
      setMindMaps(response.data)
    } catch (error) {
      console.error('加载思维导图失败:', error)
      message.error('加载思维导图失败')
    } finally {
      setMindMapsLoading(false)
    }
  }

  const showModal = (type: 'plan' | 'exam' | 'mindmap') => {
    setModalType(type)
    setModalVisible(true)
    form.resetFields()
  }

  const handleCreate = async (values: any) => {
    setCreating(true)
    try {
      if (modalType === 'plan') {
        await teacherAPI.createTeachingPlan({
          course_name: values.course_name,
          chapter: values.chapter || values.topic,
          topic: values.topic,
          class_hours: values.class_hours || 2,
          teaching_time: values.teaching_time || 90
        })
        message.success('教学计划生成成功！')
        loadTeachingPlans() // 重新加载数据
      } else if (modalType === 'exam') {
        await teacherAPI.generateExam({
          exam_scope: values.scope,
          num_mcq: values.num_mcq || 5,
          num_saq: values.num_saq || 3,
          num_code: values.num_code || 1
        })
        message.success('试卷生成成功！')
      } else if (modalType === 'mindmap') {
        await teacherAPI.createMindMap({
          title: values.title || values.topic,
          topic: values.topic,
          description: values.requirements,
          is_public: false
        })
        message.success('思维导图生成成功！')
        loadMindMaps() // 重新加载数据
      }
      
      setModalVisible(false)
      form.resetFields()
    } catch (error: any) {
      console.error('创建失败:', error)
      message.error(error.response?.data?.detail || '操作失败，请重试')
    } finally {
      setCreating(false)
    }
  }

  const renderTeachingPlans = () => (
    <Card title="教学计划" extra={
      <Space>
        <Button icon={<ApiOutlined />} loading={testingAI} onClick={async () => {
          try {
            setTestingAI(true)
            const res = await teacherAPI.aiDiagnostics()
            const data = res.data
            if (data.ok) {
              if (data.using_mock) {
                message.warning(`AI连接已降级为模拟模式（model=${data.model}）`)
              } else {
                message.success(`AI连接正常（model=${data.model}）`)
              }
            } else {
              message.error('AI诊断失败：' + (data.error || '未知错误'))
            }
          } catch (e: any) {
            message.error('AI诊断请求失败')
          } finally {
            setTestingAI(false)
          }
        }}>
          测试AI连接
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('plan')}>
          生成教学计划
        </Button>
      </Space>
    }>
      <Spin spinning={plansLoading}>
        {teachingPlans.length === 0 ? (
          <Empty description="暂无教学计划，点击上方按钮生成" />
        ) : (
          <List
            dataSource={teachingPlans}
            renderItem={(plan) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" icon={<EyeOutlined />}>
                    查看详情
                  </Button>,
                  <Button key="export" type="link" icon={<DownloadOutlined />} onClick={async () => {
                    try {
                      const res = await teacherAPI.exportTeachingPlan(plan.id)
                      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `教案_${plan.id}.docx`
                      document.body.appendChild(a)
                      a.click()
                      a.remove()
                      window.URL.revokeObjectURL(url)
                    } catch (e: any) {
                      message.error('导出失败，请重试')
                    }
                  }}>
                    导出教案
                  </Button>
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
    <Card title="思维导图" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('mindmap')}>
        生成思维导图
      </Button>
    }>
      <Spin spinning={mindMapsLoading}>
        {mindMaps.length === 0 ? (
          <Empty description="暂无思维导图，点击上方按钮生成" />
        ) : (
          <List
            dataSource={mindMaps}
            renderItem={(mindMap) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" icon={<EyeOutlined />}>
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={mindMap.title}
                  description={`主题: ${mindMap.topic} | 创建时间: ${new Date(mindMap.created_at).toLocaleString()}`}
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
        default: return ''
      }
    }

    const getFormItems = () => {
      switch (modalType) {
        case 'plan':
          return (
            <>
              <Form.Item name="course_name" label="课程名称" rules={[{ required: true }]}>
                <Input placeholder="请输入课程名称" />
              </Form.Item>
              <Form.Item name="chapter" label="章节名称" rules={[{ required: true }]}>
                <Input placeholder="请输入章节名称" />
              </Form.Item>
              <Form.Item name="topic" label="教学主题">
                <Input placeholder="请输入教学主题（可选）" />
              </Form.Item>
              <Form.Item name="class_hours" label="课时数">
                <Select defaultValue={2}>
                  <Select.Option value={1}>1课时</Select.Option>
                  <Select.Option value={2}>2课时</Select.Option>
                  <Select.Option value={3}>3课时</Select.Option>
                  <Select.Option value={4}>4课时</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="teaching_time" label="教学时间（分钟）">
                <Select defaultValue={90}>
                  <Select.Option value={45}>45分钟</Select.Option>
                  <Select.Option value={90}>90分钟</Select.Option>
                  <Select.Option value={120}>120分钟</Select.Option>
                </Select>
              </Form.Item>
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
              <Form.Item name="title" label="思维导图标题" rules={[{ required: true }]}>
                <Input placeholder="请输入思维导图标题" />
              </Form.Item>
              <Form.Item name="topic" label="主题内容" rules={[{ required: true }]}>
                <Input placeholder="请输入主题内容" />
              </Form.Item>
              <Form.Item name="description" label="描述信息">
                <TextArea rows={4} placeholder="请输入描述信息（可选）" />
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
              <Button type="primary" htmlType="submit" loading={creating}>
                开始生成
              </Button>
              <Button onClick={() => setModalVisible(false)} disabled={creating}>
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
        <TabPane tab={<span><FileTextOutlined />教学计划</span>} key="plans">
          {renderTeachingPlans()}
        </TabPane>
        <TabPane tab={<span><BookOutlined />试卷管理</span>} key="exams">
          {renderExams()}
        </TabPane>
        <TabPane tab={<span><BulbOutlined />思维导图</span>} key="mindmaps">
          {renderMindMaps()}
        </TabPane>
      </Tabs>

      {renderModal()}
    </div>
  )
}

export default TeacherDashboardPage 
