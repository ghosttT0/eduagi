import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  List,
  Typography,
  Space,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Avatar
} from 'antd'
import {
  PlusOutlined,
  ShareAltOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  NodeIndexOutlined,
  GlobalOutlined,
  LockOutlined
} from '@ant-design/icons'
import { teacherAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

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

interface MindMapCreate {
  title: string
  topic: string
  description?: string
  is_public: boolean
}

const MindMapPage: React.FC = () => {
  const [mindmaps, setMindmaps] = useState<MindMap[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedMindmap, setSelectedMindmap] = useState<MindMap | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchMindmaps()
  }, [])

  const fetchMindmaps = async () => {
    setLoading(true)
    try {
      const response = await teacherAPI.getMindMaps()
      setMindmaps(response.data)
    } catch (error) {
      console.error('获取思维导图失败:', error)
      message.error('获取思维导图失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: MindMapCreate) => {
    setCreating(true)
    try {
      await teacherAPI.createMindMap(values)
      message.success('思维导图创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchMindmaps()
    } catch (error) {
      console.error('创建思维导图失败:', error)
      message.error('创建思维导图失败')
    } finally {
      setCreating(false)
    }
  }

  const handleView = (mindmap: MindMap) => {
    setSelectedMindmap(mindmap)
    setViewModalVisible(true)
  }

  const parseMindmapData = (data: string) => {
    try {
      return JSON.parse(data)
    } catch {
      return { nodes: [], edges: [] }
    }
  }

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总思维导图"
              value={mindmaps.length}
              prefix={<NodeIndexOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="公开分享"
              value={mindmaps.filter(m => m.is_public).length}
              prefix={<GlobalOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="私有导图"
              value={mindmaps.filter(m => !m.is_public).length}
              prefix={<LockOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>AI知识图谱</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            创建思维导图
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={mindmaps}
          renderItem={(mindmap) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleView(mindmap)}
                >
                  查看
                </Button>,
                <Button
                  type="link"
                  icon={<ShareAltOutlined />}
                  disabled={!mindmap.is_public}
                >
                  分享
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                    icon={<NodeIndexOutlined />}
                  />
                }
                title={
                  <div>
                    <Text strong>{mindmap.title}</Text>
                    <Space style={{ marginLeft: 8 }}>
                      <Tag color="blue">{mindmap.topic}</Tag>
                      {mindmap.is_public ? (
                        <Tag color="green" icon={<GlobalOutlined />}>公开</Tag>
                      ) : (
                        <Tag color="orange" icon={<LockOutlined />}>私有</Tag>
                      )}
                    </Space>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">
                      {mindmap.description || '暂无描述'}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      创建时间: {new Date(mindmap.created_at).toLocaleString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无思维导图' }}
        />
      </Card>

      {/* 创建思维导图模态框 */}
      <Modal
        title="创建AI知识图谱"
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
            name="title"
            label="导图标题"
            rules={[{ required: true, message: '请输入导图标题' }]}
          >
            <Input placeholder="如：Python面向对象编程知识图谱" />
          </Form.Item>

          <Form.Item
            name="topic"
            label="主题关键词"
            rules={[{ required: true, message: '请输入主题关键词' }]}
          >
            <Input placeholder="如：面向对象编程、类、继承、多态" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述信息"
          >
            <TextArea 
              rows={3}
              placeholder="简要描述这个思维导图的内容和用途"
            />
          </Form.Item>

          <Form.Item
            name="is_public"
            label="是否公开分享"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              checkedChildren="公开" 
              unCheckedChildren="私有"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={creating}>
                生成思维导图
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看思维导图详情模态框 */}
      <Modal
        title="思维导图详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedMindmap && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>标题：</Text>{selectedMindmap.title}
              </Col>
              <Col span={12}>
                <Text strong>主题：</Text>{selectedMindmap.topic}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>状态：</Text>
                {selectedMindmap.is_public ? (
                  <Tag color="green" icon={<GlobalOutlined />}>公开</Tag>
                ) : (
                  <Tag color="orange" icon={<LockOutlined />}>私有</Tag>
                )}
              </Col>
              <Col span={12}>
                <Text strong>创建时间：</Text>
                {new Date(selectedMindmap.created_at).toLocaleString()}
              </Col>
            </Row>
            {selectedMindmap.description && (
              <Paragraph>
                <Text strong>描述：</Text>
                <br />
                {selectedMindmap.description}
              </Paragraph>
            )}
            <Paragraph>
              <Text strong>思维导图数据：</Text>
              <br />
              <div style={{ 
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 8,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                <pre>{JSON.stringify(parseMindmapData(selectedMindmap.data), null, 2)}</pre>
              </div>
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MindMapPage
