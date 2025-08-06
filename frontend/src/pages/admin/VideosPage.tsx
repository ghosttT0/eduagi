import React, { useEffect, useState } from 'react'
import {
  Card,
  Input,
  Button,
  Space,
  Table,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Typography,
  Modal,
  Form,
  Select,
  Upload,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd'
import {
  PlayCircleOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { videoAPI } from '../../services/api'

const { Search } = Input
const { Title, Text } = Typography
const { Option } = Select

interface Video {
  id: number
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration: number
  file_size: string
  upload_date: string
  uploader: string
  category: string
  status: 'processing' | 'completed' | 'failed' | 'pending'
  views: number
  likes: number
  comments: number
  tags: string[]
}

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // 模拟视频数据
  const mockVideos: Video[] = [
    {
      id: 1,
      title: 'Python编程基础 - 第1讲：环境搭建',
      description: '本视频详细介绍了Python开发环境的搭建过程，包括Python解释器安装、IDE选择等内容。',
      video_url: 'https://example.com/video1.mp4',
      thumbnail_url: 'https://example.com/thumb1.jpg',
      duration: 1800, // 30分钟
      file_size: '256MB',
      upload_date: '2024-08-01T10:00:00Z',
      uploader: '张教授',
      category: '编程基础',
      status: 'completed',
      views: 1245,
      likes: 89,
      comments: 23,
      tags: ['Python', '编程', '基础', '环境搭建']
    },
    {
      id: 2,
      title: '机器学习入门 - 线性回归算法详解',
      description: '深入讲解线性回归算法的原理、实现和应用场景，包含实际案例演示。',
      video_url: 'https://example.com/video2.mp4',
      thumbnail_url: 'https://example.com/thumb2.jpg',
      duration: 2700, // 45分钟
      file_size: '512MB',
      upload_date: '2024-08-02T14:30:00Z',
      uploader: '李教授',
      category: '机器学习',
      status: 'completed',
      views: 987,
      likes: 156,
      comments: 45,
      tags: ['机器学习', '线性回归', '算法', '数学']
    },
    {
      id: 3,
      title: 'Web开发实战 - React组件设计模式',
      description: 'React组件的设计模式和最佳实践，提升前端开发效率。',
      video_url: 'https://example.com/video3.mp4',
      thumbnail_url: 'https://example.com/thumb3.jpg',
      duration: 3600, // 60分钟
      file_size: '768MB',
      upload_date: '2024-08-03T09:15:00Z',
      uploader: '王教授',
      category: 'Web开发',
      status: 'processing',
      views: 654,
      likes: 78,
      comments: 12,
      tags: ['React', 'Web开发', '组件', '前端']
    },
    {
      id: 4,
      title: '数据结构与算法 - 二叉树遍历',
      description: '详细讲解二叉树的三种遍历方式：前序、中序、后序遍历的实现。',
      video_url: 'https://example.com/video4.mp4',
      thumbnail_url: 'https://example.com/thumb4.jpg',
      duration: 2400, // 40分钟
      file_size: '384MB',
      upload_date: '2024-08-04T16:45:00Z',
      uploader: '陈教授',
      category: '数据结构',
      status: 'completed',
      views: 1567,
      likes: 234,
      comments: 67,
      tags: ['数据结构', '算法', '二叉树', '遍历']
    },
    {
      id: 5,
      title: '深度学习实战 - CNN卷积神经网络',
      description: '卷积神经网络的原理和实现，包含图像识别项目实战。',
      video_url: 'https://example.com/video5.mp4',
      thumbnail_url: 'https://example.com/thumb5.jpg',
      duration: 4200, // 70分钟
      file_size: '1.2GB',
      upload_date: '2024-08-05T11:20:00Z',
      uploader: '刘教授',
      category: '深度学习',
      status: 'failed',
      views: 432,
      likes: 45,
      comments: 8,
      tags: ['深度学习', 'CNN', '神经网络', '图像识别']
    },
    {
      id: 6,
      title: '数据库设计原理 - MySQL优化技巧',
      description: 'MySQL数据库性能优化的实用技巧和最佳实践。',
      video_url: 'https://example.com/video6.mp4',
      thumbnail_url: 'https://example.com/thumb6.jpg',
      duration: 3300, // 55分钟
      file_size: '645MB',
      upload_date: '2024-08-06T08:30:00Z',
      uploader: '赵教授',
      category: '数据库',
      status: 'pending',
      views: 0,
      likes: 0,
      comments: 0,
      tags: ['数据库', 'MySQL', '优化', '性能']
    }
  ]

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      // 使用模拟数据，实际项目中应该调用API
      setTimeout(() => {
        setVideos(mockVideos)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error('获取视频列表失败')
      setLoading(false)
    }
  }

  const handleUpload = () => {
    setUploadModalVisible(true)
    form.resetFields()
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setEditModalVisible(true)
    form.setFieldsValue(video)
  }

  const handleDelete = async (id: number) => {
    try {
      // 模拟删除操作
      setVideos(videos.filter(v => v.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingVideo) {
        // 模拟更新操作
        setVideos(videos.map(v => v.id === editingVideo.id ? { ...v, ...values } : v))
        message.success('更新成功')
        setEditModalVisible(false)
      } else {
        // 模拟上传操作
        const newVideo: Video = {
          id: Date.now(),
          ...values,
          upload_date: new Date().toISOString(),
          uploader: '当前用户',
          status: 'pending' as const,
          views: 0,
          likes: 0,
          comments: 0,
          tags: values.tags || []
        }
        setVideos([newVideo, ...videos])
        message.success('上传成功')
        setUploadModalVisible(false)
      }
    } catch (error) {
      message.error(editingVideo ? '更新失败' : '上传失败')
    }
  }

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const columns = [
    {
      title: '视频信息',
      key: 'video_info',
      width: 350,
      render: (_: any, record: Video) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            size={64}
            shape="square"
            src={record.thumbnail_url}
            icon={<VideoCameraOutlined />}
            style={{ marginRight: 12, backgroundColor: '#8b5cf6' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {record.title}
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {record.description?.substring(0, 80)}...
            </Text>
            <Space size={4}>
              {record.tags.slice(0, 3).map(tag => (
                <Tag key={tag} size="small" color="purple">{tag}</Tag>
              ))}
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 120,
      render: (name: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {name.charAt(0)}
          </Avatar>
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
      filters: [
        { text: '编程基础', value: '编程基础' },
        { text: '机器学习', value: '机器学习' },
        { text: 'Web开发', value: 'Web开发' },
        { text: '数据结构', value: '数据结构' },
        { text: '深度学习', value: '深度学习' },
        { text: '数据库', value: '数据库' },
      ],
      onFilter: (value: any, record: Video) => record.category === value,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8b5cf6' }} />
          <Text>{formatDuration(duration)}</Text>
        </Space>
      ),
      sorter: (a: Video, b: Video) => a.duration - b.duration,
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 80,
      render: (size: string) => (
        <Text type="secondary">{size}</Text>
      ),
    },
    {
      title: '统计',
      key: 'stats',
      width: 120,
      render: (_: any, record: Video) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <Space size={4}>
              <EyeOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: 12 }}>{record.views}</Text>
            </Space>
            <Space size={4}>
              <LikeOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: 12 }}>{record.likes}</Text>
            </Space>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space size={4}>
              <MessageOutlined style={{ color: '#fa8c16' }} />
              <Text style={{ fontSize: 12 }}>{record.comments}</Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          completed: { color: 'green', text: '已完成' },
          processing: { color: 'blue', text: '处理中' },
          failed: { color: 'red', text: '失败' },
          pending: { color: 'orange', text: '待处理' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      },
      filters: [
        { text: '已完成', value: 'completed' },
        { text: '处理中', value: 'processing' },
        { text: '失败', value: 'failed' },
        { text: '待处理', value: 'pending' },
      ],
      onFilter: (value: any, record: Video) => record.status === value,
    },
    {
      title: '上传时间',
      dataIndex: 'upload_date',
      key: 'upload_date',
      width: 120,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
      sorter: (a: Video, b: Video) => new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Video) => (
        <Space size="small">
          <Tooltip title="预览视频">
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="编辑信息">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="下载视频">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个视频吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除视频">
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

  return (
    <div>
      <h2>视频分析</h2>

      <Card style={{ marginBottom: 24 }}>
        <h4>新增视频分析</h4>
        <Space.Compact style={{ width: '100%' }}>
          <Search
            placeholder="请输入视频URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onPressEnter={handleAnalyze}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleAnalyze}
            loading={analyzing}
          >
            开始分析
          </Button>
        </Space.Compact>
      </Card>

      <Card title="分析历史">
        <Table
          columns={columns}
          dataSource={analyses}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  )
}

export default VideosPage 