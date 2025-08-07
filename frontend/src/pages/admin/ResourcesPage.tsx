import React, { useEffect, useState } from 'react'
import { qiniuService } from '../../services/qiniuService'
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
  FileTextOutlined,
  VideoCameraOutlined,
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
  qiniuKey?: string // 七牛云文件key
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
  const [videoUrlModalVisible, setVideoUrlModalVisible] = useState(false)
  const [videoUrlForm] = Form.useForm()
  const [videoAnalyzing, setVideoAnalyzing] = useState(false)

  // 模拟资源数据
  const mockResources: Resource[] = [
    {
      id: 1,
      name: '小学数学基础教学视频.mp4',
      type: 'video',
      size: '256.8 MB',
      uploadDate: '2024-08-01',
      uploader: '张老师',
      downloads: 156,
      category: '数学教学',
      status: 'active'
    },
    {
      id: 2,
      name: '语文阅读理解课件.pptx',
      type: 'ppt',
      size: '12.3 MB',
      uploadDate: '2024-08-02',
      uploader: '李老师',
      downloads: 89,
      category: '语文教学',
      status: 'active'
    },
    {
      id: 3,
      name: '英语口语练习教学视频.mp4',
      type: 'video',
      size: '445.2 MB',
      uploadDate: '2024-08-03',
      uploader: '王老师',
      downloads: 234,
      category: '英语教学',
      status: 'active'
    },
    {
      id: 4,
      name: '科学实验图解.png',
      type: 'image',
      size: '2.1 MB',
      uploadDate: '2024-08-04',
      uploader: '刘老师',
      downloads: 67,
      category: '科学教学',
      status: 'active'
    },
    {
      id: 5,
      name: '历史知识点总结.docx',
      type: 'word',
      size: '8.9 MB',
      uploadDate: '2024-08-05',
      uploader: '陈老师',
      downloads: 312,
      category: '历史教学',
      status: 'active'
    },
    {
      id: 6,
      name: '数学期末考试试卷.pdf',
      type: 'exam',
      size: '2.3 MB',
      uploadDate: '2024-08-06',
      uploader: '张老师',
      downloads: 198,
      category: '考试试卷',
      status: 'active'
    },
    {
      id: 7,
      name: '语文教学计划.docx',
      type: 'word',
      size: '5.8 MB',
      uploadDate: '2024-08-07',
      uploader: '李老师',
      downloads: 145,
      category: '教学计划',
      status: 'active'
    },
    {
      id: 8,
      name: '英语语法教学PPT.pptx',
      type: 'ppt',
      size: '18.4 MB',
      uploadDate: '2024-08-08',
      uploader: '王老师',
      downloads: 176,
      category: '英语教学',
      status: 'active'
    },
    {
      id: 9,
      name: '科学实验教学视频.mp4',
      type: 'video',
      size: '342.1 MB',
      uploadDate: '2024-08-09',
      uploader: '刘老师',
      downloads: 276,
      category: '科学教学',
      status: 'active'
    },
    {
      id: 10,
      name: '历史单元测试.pdf',
      type: 'exam',
      size: '1.9 MB',
      uploadDate: '2024-08-10',
      uploader: '陈老师',
      downloads: 187,
      category: '考试试卷',
      status: 'active'
    },
    {
      id: 11,
      name: '美术创作教学课件.pptx',
      type: 'ppt',
      size: '25.6 MB',
      uploadDate: '2024-08-11',
      uploader: '赵老师',
      downloads: 98,
      category: '美术教学',
      status: 'active'
    },
    {
      id: 12,
      name: '音乐欣赏教学计划.docx',
      type: 'word',
      size: '4.2 MB',
      uploadDate: '2024-08-12',
      uploader: '周老师',
      downloads: 76,
      category: '音乐教学',
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
      // 从七牛云获取文件列表
      const qiniuResponse = await qiniuService.listFiles()

      // 转换七牛云数据格式为本地格式
      const qiniuResources: Resource[] = qiniuResponse.items.map((file, index) => ({
        id: index + 1000, // 使用1000+的ID避免与模拟数据冲突
        name: qiniuService.getFileName(file.key),
        type: qiniuService.getFileType(file.key),
        size: qiniuService.formatFileSize(file.fsize),
        uploadDate: qiniuService.formatUploadTime(file.putTime),
        uploader: '系统管理员', // 七牛云无法获取上传者信息
        downloads: Math.floor(Math.random() * 500), // 模拟下载次数
        category: qiniuService.getFileDirectory(file.key) || '未分类',
        status: 'active' as const,
        qiniuKey: file.key // 保存七牛云key用于下载
      }))

      // 确保ID唯一性，给模拟数据重新分配ID
      const uniqueMockResources = mockResources.map((resource, index) => ({
        ...resource,
        id: index + 2000 // 使用2000+的ID确保唯一性
      }))

      // 合并七牛云数据和模拟数据
      setResources([...qiniuResources, ...uniqueMockResources])
      setLoading(false)
    } catch (error) {
      console.error('加载资源失败:', error)
      // 如果七牛云加载失败，使用模拟数据，确保ID唯一性
      const uniqueMockResources = mockResources.map((resource, index) => ({
        ...resource,
        id: index + 2000 // 使用2000+的ID确保唯一性
      }))
      setResources(uniqueMockResources)
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
      case 'video': return <VideoCameraOutlined style={{ color: '#ff4d4f' }} />
      case 'image': return <FileImageOutlined style={{ color: '#52c41a' }} />
      case 'document': return <FilePdfOutlined style={{ color: '#1890ff' }} />
      case 'ppt': return <FileOutlined style={{ color: '#ff7a00' }} />
      case 'word': return <FileWordOutlined style={{ color: '#1890ff' }} />
      case 'exam': return <FileTextOutlined style={{ color: '#722ed1' }} />
      case 'audio': return <FileOutlined style={{ color: '#faad14' }} />
      default: return <FileOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'red'
      case 'image': return 'green'
      case 'document': return 'blue'
      case 'ppt': return 'orange'
      case 'word': return 'blue'
      case 'exam': return 'purple'
      case 'audio': return 'gold'
      default: return 'default'
    }
  }

  const showAnalysis = (analysis: VideoAnalysis) => {
    setSelectedAnalysis(analysis)
    setAnalysisModalVisible(true)
  }

  // 处理视频URL上传和分析
  const handleVideoUrlSubmit = async (values: { url: string; title?: string }) => {
    setVideoAnalyzing(true)
    try {
      // 模拟视频分析过程
      message.loading('正在分析视频内容...', 3)

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 生成模拟分析结果
      const newAnalysis: VideoAnalysis = {
        id: Date.now(),
        videoName: values.title || '在线视频分析',
        duration: '42:15',
        keyPoints: [
          '视频内容概述与核心知识点',
          '实践操作演示与案例分析',
          '常见问题解答与注意事项',
          '总结回顾与学习建议'
        ],
        sentiment: 'positive' as const,
        engagement: Math.floor(Math.random() * 20) + 80, // 80-100
        topics: ['在线学习', '视频教学', '知识分享'],
        summary: `通过AI分析，该视频内容结构清晰，讲解详细，适合学习者观看。视频时长适中，知识点覆盖全面，是一个高质量的教学视频。`
      }

      // 添加到分析列表
      setVideoAnalyses(prev => [newAnalysis, ...prev])

      // 显示分析结果
      showAnalysis(newAnalysis)

      // 重置表单
      videoUrlForm.resetFields()
      setVideoUrlModalVisible(false)

      message.success('视频分析完成！')
    } catch (error) {
      message.error('视频分析失败，请重试')
    } finally {
      setVideoAnalyzing(false)
    }
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
           type === 'ppt' ? 'PPT课件' :
           type === 'word' ? 'Word文档' :
           type === 'exam' ? '试卷' :
           type === 'audio' ? '音频' : '其他'}
        </Tag>
      ),
      filters: [
        { text: '视频', value: 'video' },
        { text: '文档', value: 'document' },
        { text: '图片', value: 'image' },
        { text: 'PPT课件', value: 'ppt' },
        { text: 'Word文档', value: 'word' },
        { text: '试卷', value: 'exam' },
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
              onClick={() => {
                if (record.qiniuKey) {
                  const previewUrl = qiniuService.getPreviewUrl(record.qiniuKey)
                  window.open(previewUrl, '_blank')
                } else {
                  message.info('该文件暂不支持预览')
                }
              }}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => {
                if (record.qiniuKey) {
                  const downloadUrl = qiniuService.getDownloadUrl(record.qiniuKey)
                  const link = document.createElement('a')
                  link.href = downloadUrl
                  link.download = record.name
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                } else {
                  message.info('该文件暂不支持下载')
                }
              }}
            />
          </Tooltip>
          {record.type === 'video' && (
            <Tooltip title="AI分析">
              <Button
                type="link"
                icon={<BarChartOutlined />}
                size="small"
                onClick={async () => {
                  try {
                    let analysis = mockVideoAnalyses.find(a =>
                      a.videoName === record.name
                    )

                    // 如果没有找到分析数据且是七牛云文件，尝试生成分析
                    if (!analysis && record.qiniuKey) {
                      message.loading('正在分析视频内容...', 2)
                      analysis = await qiniuService.getVideoAnalysis(record.qiniuKey)
                    }

                    if (analysis) {
                      showAnalysis(analysis)
                    } else {
                      message.info('该视频暂无分析数据')
                    }
                  } catch (error) {
                    message.error('视频分析失败')
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

  // 按类型分组资源
  const resourcesByType = {
    video: filteredResources.filter(r => r.type === 'video'),
    ppt: filteredResources.filter(r => r.type === 'ppt'),
    word: filteredResources.filter(r => r.type === 'word'),
    exam: filteredResources.filter(r => r.type === 'exam'),
    document: filteredResources.filter(r => r.type === 'document'),
    image: filteredResources.filter(r => r.type === 'image'),
    audio: filteredResources.filter(r => r.type === 'audio'),
    other: filteredResources.filter(r => !['video', 'ppt', 'word', 'exam', 'document', 'image', 'audio'].includes(r.type))
  }

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
                prefix={<VideoCameraOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="resources">
          <TabPane tab="全部资源" key="resources">
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

          <TabPane tab="分类浏览" key="categories">
            <Row gutter={[16, 16]}>
              {Object.entries(resourcesByType).map(([type, typeResources]) => {
                if (typeResources.length === 0) return null

                const typeNames = {
                  video: '📹 教学视频',
                  ppt: '📊 PPT课件',
                  word: '📝 Word文档',
                  exam: '📋 试卷题库',
                  document: '📄 PDF文档',
                  image: '🖼️ 图片资源',
                  audio: '🎵 音频资源',
                  other: '📁 其他资源'
                }

                return (
                  <Col span={12} key={type}>
                    <Card
                      title={`${typeNames[type as keyof typeof typeNames]} (${typeResources.length})`}
                      size="small"
                      extra={
                        <Button
                          type="link"
                          size="small"
                          onClick={() => setSelectedType(type)}
                        >
                          查看全部
                        </Button>
                      }
                    >
                      <List
                        size="small"
                        dataSource={typeResources.slice(0, 3)}
                        renderItem={(resource) => (
                          <List.Item
                            actions={[
                              <Button type="link" size="small" icon={<EyeOutlined />} />,
                              <Button type="link" size="small" icon={<DownloadOutlined />} />
                            ]}
                          >
                            <List.Item.Meta
                              avatar={getFileIcon(resource.type)}
                              title={resource.name}
                              description={`${resource.size} | ${resource.uploader} | ${resource.downloads}次下载`}
                            />
                          </List.Item>
                        )}
                      />
                      {typeResources.length > 3 && (
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedType(type)
                              // 切换到全部资源标签页
                            }}
                          >
                            查看更多 ({typeResources.length - 3} 个)
                          </Button>
                        </div>
                      )}
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </TabPane>

          <TabPane tab="视频分析" key="analysis">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setVideoUrlModalVisible(true)}
                >
                  分析在线视频
                </Button>
                <Button icon={<UploadOutlined />}>
                  上传本地视频
                </Button>
              </Space>
            </div>

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

      {/* 视频URL上传分析Modal */}
      <Modal
        title="在线视频分析"
        open={videoUrlModalVisible}
        onCancel={() => {
          setVideoUrlModalVisible(false)
          videoUrlForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={videoUrlForm}
          layout="vertical"
          onFinish={handleVideoUrlSubmit}
        >
          <Form.Item
            label="视频URL"
            name="url"
            rules={[
              { required: true, message: '请输入视频URL' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input
              placeholder="请输入视频链接，支持YouTube、Bilibili、腾讯视频等"
              prefix="🔗"
            />
          </Form.Item>

          <Form.Item
            label="视频标题（可选）"
            name="title"
          >
            <Input
              placeholder="为视频添加自定义标题"
              prefix="📝"
            />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              💡 支持的视频平台：YouTube、Bilibili、腾讯视频、爱奇艺、优酷等
            </Text>
          </div>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={videoAnalyzing}
                icon={<BarChartOutlined />}
              >
                {videoAnalyzing ? '分析中...' : '开始分析'}
              </Button>
              <Button onClick={() => {
                setVideoUrlModalVisible(false)
                videoUrlForm.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ResourcesPage
