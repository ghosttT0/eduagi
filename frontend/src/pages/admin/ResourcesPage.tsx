import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Tooltip,
  Upload,
  Progress,
  Tabs,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileOutlined,
  VideoOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

interface Resource {
  id: number
  name: string
  type: 'video' | 'document' | 'image' | 'audio' | 'other'
  size: string
  uploadDate: string
  uploader: string
  downloads: number
  category: string
  status: 'active' | 'archived'
}

interface VideoAnalysis {
  id: number
  videoName: string
  duration: string
  keyPoints: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  engagement: number
  topics: string[]
  summary: string
}

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [videoAnalyses, setVideoAnalyses] = useState<VideoAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<VideoAnalysis | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')

  // 模拟资源数据
  const mockResources: Resource[] = [
    {
      id: 1,
      name: 'Python基础教程.mp4',
      type: 'video',
      size: '256.8 MB',
      uploadDate: '2024-08-01',
      uploader: '张教授',
      downloads: 156,
      category: '编程教学',
      status: 'active'
    },
    {
      id: 2,
      name: '数据结构课件.pdf',
      type: 'document',
      size: '12.3 MB',
      uploadDate: '2024-08-02',
      uploader: '李老师',
      downloads: 89,
      category: '课程资料',
      status: 'active'
    },
    {
      id: 3,
      name: 'Web开发实战.mp4',
      type: 'video',
      size: '445.2 MB',
      uploadDate: '2024-08-03',
      uploader: '王教授',
      downloads: 234,
      category: '前端开发',
      status: 'active'
    },
    {
      id: 4,
      name: '算法分析图表.png',
      type: 'image',
      size: '2.1 MB',
      uploadDate: '2024-08-04',
      uploader: '刘老师',
      downloads: 67,
      category: '教学图表',
      status: 'active'
    },
    {
      id: 5,
      name: '机器学习讲座.mp4',
      type: 'video',
      size: '678.9 MB',
      uploadDate: '2024-08-05',
      uploader: '陈教授',
      downloads: 312,
      category: 'AI教学',
      status: 'active'
    }
  ]

  // 模拟视频分析数据
  const mockVideoAnalyses: VideoAnalysis[] = [
    {
      id: 1,
      videoName: 'Python基础教程.mp4',
      duration: '45:32',
      keyPoints: ['变量定义', '函数使用', '循环结构', '条件判断', '异常处理'],
      sentiment: 'positive',
      engagement: 85,
      topics: ['Python语法', '编程基础', '代码实践'],
      summary: '这是一个全面的Python基础教程，涵盖了Python编程的核心概念和实践技巧。'
    },
    {
      id: 2,
      videoName: 'Web开发实战.mp4',
      duration: '62:18',
      keyPoints: ['HTML结构', 'CSS样式', 'JavaScript交互', 'React框架', '项目部署'],
      sentiment: 'positive',
      engagement: 92,
      topics: ['前端开发', 'React', 'Web技术'],
      summary: '深入讲解现代Web开发技术栈，从基础到高级应用的完整实战教程。'
    },
    {
      id: 3,
      videoName: '机器学习讲座.mp4',
      duration: '78:45',
      keyPoints: ['监督学习', '无监督学习', '神经网络', '深度学习', '模型评估'],
      sentiment: 'positive',
      engagement: 88,
      topics: ['机器学习', '人工智能', '数据科学'],
      summary: '机器学习的系统性介绍，包含理论基础和实际应用案例分析。'
    }
  ]

  useEffect(() => {
    loadResources()
    loadVideoAnalyses()
  }, [])

  const loadResources = async () => {
    setLoading(true)
    try {
      // 这里应该调用真实的API
      // const response = await resourceAPI.getAll()
      // setResources(response.data)
      
      // 使用模拟数据
      setTimeout(() => {
        setResources(mockResources)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('加载资源失败:', error)
      setResources(mockResources)
      setLoading(false)
    }
  }

  const loadVideoAnalyses = async () => {
    try {
      // 这里应该调用真实的API
      // const response = await videoAPI.getAnalyses()
      // setVideoAnalyses(response.data)
      
      // 使用模拟数据
      setVideoAnalyses(mockVideoAnalyses)
    } catch (error) {
      console.error('加载视频分析失败:', error)
      setVideoAnalyses(mockVideoAnalyses)
    }
  }

  const handleAdd = () => {
    setEditingResource(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    form.setFieldsValue(resource)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      // await resourceAPI.delete(id)
      setResources(resources.filter(r => r.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingResource) {
        // await resourceAPI.update(editingResource.id, values)
        setResources(resources.map(r => 
          r.id === editingResource.id ? { ...r, ...values } : r
        ))
        message.success('更新成功')
      } else {
        // const response = await resourceAPI.create(values)
        const newResource = {
          id: Date.now(),
          ...values,
          uploadDate: new Date().toISOString().split('T')[0],
          uploader: '当前用户',
          downloads: 0,
          status: 'active' as const
        }
        setResources([...resources, newResource])
        message.success('添加成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoOutlined style={{ color: '#ff4d4f' }} />
      case 'image': return <FileImageOutlined style={{ color: '#52c41a' }} />
      case 'document': return <FilePdfOutlined style={{ color: '#1890ff' }} />
      default: return <FileOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'red'
      case 'image': return 'green'
      case 'document': return 'blue'
      case 'audio': return 'orange'
      default: return 'default'
    }
  }

  const showAnalysis = (analysis: VideoAnalysis) => {
    setSelectedAnalysis(analysis)
    setAnalysisModalVisible(true)
  }

  const resourceColumns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Resource) => (
        <Space>
          {getFileIcon(record.type)}
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {type === 'video' ? '视频' : 
           type === 'document' ? '文档' : 
           type === 'image' ? '图片' : 
           type === 'audio' ? '音频' : '其他'}
        </Tag>
      ),
      filters: [
        { text: '视频', value: 'video' },
        { text: '文档', value: 'document' },
        { text: '图片', value: 'image' },
        { text: '音频', value: 'audio' },
        { text: '其他', value: 'other' },
      ],
      onFilter: (value: any, record: Resource) => record.type === value,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      sorter: (a: Resource, b: Resource) => {
        const getBytes = (size: string) => {
          const num = parseFloat(size)
          if (size.includes('GB')) return num * 1024 * 1024 * 1024
          if (size.includes('MB')) return num * 1024 * 1024
          if (size.includes('KB')) return num * 1024
          return num
        }
        return getBytes(a.size) - getBytes(b.size)
      },
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
    },
    {
      title: '下载次数',
      dataIndex: 'downloads',
      key: 'downloads',
      sorter: (a: Resource, b: Resource) => a.downloads - b.downloads,
      render: (downloads: number) => (
        <Text type="secondary">{downloads} 次</Text>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      sorter: (a: Resource, b: Resource) => 
        new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: Resource) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              size="small"
            />
          </Tooltip>
          {record.type === 'video' && (
            <Tooltip title="AI分析">
              <Button
                type="link"
                icon={<BarChartOutlined />}
                size="small"
                onClick={() => {
                  const analysis = mockVideoAnalyses.find(a => 
                    a.videoName === record.name
                  )
                  if (analysis) {
                    showAnalysis(analysis)
                  } else {
                    message.info('该视频暂无分析数据')
                  }
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个资源吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 过滤资源数据
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         resource.uploader.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = selectedType === '' || resource.type === selectedType
    return matchesSearch && matchesType
  })

  // 统计数据
  const totalResources = resources.length
  const totalSize = resources.reduce((sum, r) => {
    const size = parseFloat(r.size)
    if (r.size.includes('GB')) return sum + size * 1024
    if (r.size.includes('MB')) return sum + size
    return sum + size / 1024
  }, 0)
  const totalDownloads = resources.reduce((sum, r) => sum + r.downloads, 0)
  const videoCount = resources.filter(r => r.type === 'video').length

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>资源管理</Title>
        
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总资源数"
                value={totalResources}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总大小"
                value={totalSize.toFixed(1)}
                suffix="MB"
                prefix={<UploadOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总下载量"
                value={totalDownloads}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="视频资源"
                value={videoCount}
                prefix={<VideoOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="resources">
          <TabPane tab="资源列表" key="resources">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索资源名称或上传者"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
                <Select
                  placeholder="筛选类型"
                  value={selectedType}
                  onChange={setSelectedType}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="video">视频</Option>
                  <Option value="document">文档</Option>
                  <Option value="image">图片</Option>
                  <Option value="audio">音频</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Space>
              <Space>
                <Upload>
                  <Button icon={<UploadOutlined />}>上传资源</Button>
                </Upload>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  添加资源
                </Button>
              </Space>
            </div>

            <Table
              columns={resourceColumns}
              dataSource={filteredResources}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredResources.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </TabPane>

          <TabPane tab="视频分析" key="analysis">
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={videoAnalyses}
              renderItem={(analysis) => (
                <List.Item>
                  <Card
                    title={
                      <Space>
                        <PlayCircleOutlined style={{ color: '#1890ff' }} />
                        {analysis.videoName}
                        <Tag color="blue">{analysis.duration}</Tag>
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => showAnalysis(analysis)}
                      >
                        查看详情
                      </Button>
                    }
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic
                          title="参与度"
                          value={analysis.engagement}
                          suffix="%"
                          valueStyle={{ 
                            color: analysis.engagement > 80 ? '#3f8600' : 
                                   analysis.engagement > 60 ? '#faad14' : '#cf1322' 
                          }}
                        />
                      </Col>
                      <Col span={8}>
                        <div>
                          <Text type="secondary">情感倾向</Text>
                          <br />
                          <Tag color={
                            analysis.sentiment === 'positive' ? 'green' :
                            analysis.sentiment === 'neutral' ? 'blue' : 'red'
                          }>
                            {analysis.sentiment === 'positive' ? '积极' :
                             analysis.sentiment === 'neutral' ? '中性' : '消极'}
                          </Tag>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div>
                          <Text type="secondary">关键主题</Text>
                          <br />
                          <Text>{analysis.topics.slice(0, 2).join(', ')}</Text>
                          {analysis.topics.length > 2 && <Text type="secondary">...</Text>}
                        </div>
                      </Col>
                    </Row>
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary">摘要：</Text>
                      <Text>{analysis.summary}</Text>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* 添加/编辑资源模态框 */}
      <Modal
        title={editingResource ? '编辑资源' : '添加资源'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="资源名称"
            rules={[{ required: true, message: '请输入资源名称' }]}
          >
            <Input placeholder="请输入资源名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="资源类型"
            rules={[{ required: true, message: '请选择资源类型' }]}
          >
            <Select placeholder="请选择资源类型">
              <Option value="video">视频</Option>
              <Option value="document">文档</Option>
              <Option value="image">图片</Option>
              <Option value="audio">音频</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="请输入分类" />
          </Form.Item>

          <Form.Item
            name="size"
            label="文件大小"
            rules={[{ required: true, message: '请输入文件大小' }]}
          >
            <Input placeholder="例如: 256.8 MB" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingResource ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 视频分析详情模态框 */}
      <Modal
        title={`视频分析 - ${selectedAnalysis?.videoName}`}
        open={analysisModalVisible}
        onCancel={() => setAnalysisModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAnalysisModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedAnalysis && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="视频时长"
                    value={selectedAnalysis.duration}
                    prefix={<PlayCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="参与度"
                    value={selectedAnalysis.engagement}
                    suffix="%"
                    valueStyle={{ 
                      color: selectedAnalysis.engagement > 80 ? '#3f8600' : 
                             selectedAnalysis.engagement > 60 ? '#faad14' : '#cf1322' 
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div>
                    <Text type="secondary">情感倾向</Text>
                    <br />
                    <Tag 
                      color={
                        selectedAnalysis.sentiment === 'positive' ? 'green' :
                        selectedAnalysis.sentiment === 'neutral' ? 'blue' : 'red'
                      }
                      style={{ fontSize: '14px', padding: '4px 8px' }}
                    >
                      {selectedAnalysis.sentiment === 'positive' ? '积极' :
                       selectedAnalysis.sentiment === 'neutral' ? '中性' : '消极'}
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="关键知识点" style={{ marginBottom: 16 }}>
              <Space wrap>
                {selectedAnalysis.keyPoints.map((point, index) => (
                  <Tag key={index} color="blue">{point}</Tag>
                ))}
              </Space>
            </Card>

            <Card title="主要主题" style={{ marginBottom: 16 }}>
              <Space wrap>
                {selectedAnalysis.topics.map((topic, index) => (
                  <Tag key={index} color="purple">{topic}</Tag>
                ))}
              </Space>
            </Card>

            <Card title="内容摘要">
              <Text>{selectedAnalysis.summary}</Text>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ResourcesPage
