import React, { useState } from 'react'
import { Card, Row, Col, Button, Input, Select, Modal, Form, message, Tabs, Typography, Space, Alert } from 'antd'
import { PlusOutlined, FileTextOutlined, BulbOutlined, BookOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

const TeacherDashboardPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'plan' | 'exam' | 'mindmap'>('plan')
  const [form] = Form.useForm()

  const showModal = (type: 'plan' | 'exam' | 'mindmap') => {
    setModalType(type)
    setModalVisible(true)
    form.resetFields()
  }

  const handleCreate = async (values: any) => {
    try {
      message.success('功能开发中，敬请期待！')
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败，请重试')
    }
  }

  const renderTeachingPlans = () => (
    <Card title="教学计划" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('plan')}>
        生成教学计划
      </Button>
    }>
      <Alert
        message="功能开发中"
        description="教学计划生成功能正在开发中，将支持AI智能生成教学计划、课程大纲等功能。"
        type="info"
        showIcon
      />
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
      <Alert
        message="功能开发中"
        description="思维导图生成功能正在开发中，将支持AI智能生成知识结构图、概念关系图等。"
        type="info"
        showIcon
      />
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
              <Form.Item name="topic" label="教学主题" rules={[{ required: true }]}>
                <Input placeholder="请输入教学主题" />
              </Form.Item>
              <Form.Item name="course_name" label="课程名称" rules={[{ required: true }]}>
                <Input placeholder="请输入课程名称" />
              </Form.Item>
              <Form.Item name="requirements" label="特殊要求">
                <TextArea rows={4} placeholder="请输入特殊要求（可选）" />
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
              <Form.Item name="topic" label="思维导图主题" rules={[{ required: true }]}>
                <Input placeholder="请输入思维导图主题" />
              </Form.Item>
              <Form.Item name="requirements" label="特殊要求">
                <TextArea rows={4} placeholder="请输入特殊要求（可选）" />
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