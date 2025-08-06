import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  List,
  Typography,
  Space,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd'
import {
  PlusOutlined,
  BookOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { teacherAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

interface TeachingPlan {
  id: number
  teacher_id: number
  input_prompt: string
  output_content: string
  created_at: string
}

interface TeachingPlanCreate {
  course_name: string
  chapter: string
  topic?: string
  class_hours: number
  teaching_time: number
}

const TeachingPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<TeachingPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TeachingPlan | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTeachingPlans()
  }, [])

  const fetchTeachingPlans = async () => {
    setLoading(true)
    try {
      const response = await teacherAPI.getTeachingPlans()
      setPlans(response.data)
    } catch (error) {
      console.error('获取教学计划失败:', error)
      message.error('获取教学计划失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: TeachingPlanCreate) => {
    setCreating(true)
    try {
      await teacherAPI.createTeachingPlan(values)
      message.success('教学计划创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchTeachingPlans()
    } catch (error) {
      console.error('创建教学计划失败:', error)
      message.error('创建教学计划失败')
    } finally {
      setCreating(false)
    }
  }

  const handleView = (plan: TeachingPlan) => {
    setSelectedPlan(plan)
    setViewModalVisible(true)
  }

  const parseContent = (content: string) => {
    try {
      return JSON.parse(content)
    } catch {
      return { content }
    }
  }

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总教学计划"
              value={plans.length}
              prefix={<BookOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月新增"
              value={plans.filter(p => 
                new Date(p.created_at).getMonth() === new Date().getMonth()
              ).length}
              prefix={<PlusOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均课时"
              value={2.5}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>智能教学设计</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            创建教学计划
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={plans}
          renderItem={(plan) => {
            const parsedContent = parseContent(plan.output_content)
            return (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(plan)}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 8, 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BulbOutlined style={{ color: 'white', fontSize: 20 }} />
                    </div>
                  }
                  title={
                    <div>
                      <Text strong>{parsedContent.course_name || '教学计划'}</Text>
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {parsedContent.chapter || '未知章节'}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">
                        创建时间: {new Date(plan.created_at).toLocaleString()}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {plan.input_prompt.substring(0, 100)}...
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )
          }}
          locale={{ emptyText: '暂无教学计划' }}
        />
      </Card>

      {/* 创建教学计划模态框 */}
      <Modal
        title="创建智能教学计划"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
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
            <Input placeholder="如：第一章 Python环境搭建" />
          </Form.Item>

          <Form.Item
            name="topic"
            label="具体主题"
          >
            <Input placeholder="如：IDE选择与配置（可选）" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="class_hours"
                label="课时数"
                initialValue={2}
                rules={[{ required: true, message: '请输入课时数' }]}
              >
                <InputNumber min={1} max={8} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teaching_time"
                label="教学时长(分钟)"
                initialValue={90}
                rules={[{ required: true, message: '请输入教学时长' }]}
              >
                <InputNumber min={30} max={180} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={creating}>
                生成教学计划
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看教学计划详情模态框 */}
      <Modal
        title="教学计划详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedPlan && (
          <div>
            <Paragraph>
              <Text strong>创建时间：</Text>
              {new Date(selectedPlan.created_at).toLocaleString()}
            </Paragraph>
            <Paragraph>
              <Text strong>输入提示：</Text>
              <br />
              {selectedPlan.input_prompt}
            </Paragraph>
            <Paragraph>
              <Text strong>生成内容：</Text>
              <br />
              <div style={{ 
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 8,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedPlan.output_content}
              </div>
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TeachingPlanPage
