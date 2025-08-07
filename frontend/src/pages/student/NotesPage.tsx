import React, { useState, useEffect } from 'react'
import {
  Card, Row, Col, Button, Input, Select, List, Typography, Tag, Modal, Form,
  message, Space, Tooltip, Popconfirm, Tabs, Statistic, Alert, Divider
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, StarOutlined,
  StarFilled, FileTextOutlined, BookOutlined, MessageOutlined, BulbOutlined,
  TagsOutlined, CalendarOutlined, EyeOutlined
} from '@ant-design/icons'
import { noteAPI } from '../../services/api'
import ReactMarkdown from 'react-markdown'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

interface Note {
  id: number
  title: string
  content: string
  author_id: number
  created_at: string
  updated_at: string
  is_public: boolean
  tags?: string
  category?: string
  source_type?: string
  is_favorite?: boolean
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [form] = Form.useForm()

  // 笔记分类选项
  const categories = [
    { value: '', label: '全部分类' },
    { value: '自主笔记', label: '📝 自主笔记' },
    { value: '知识导入', label: '📚 知识导入' },
    { value: '错题笔记', label: '❌ 错题笔记' },
    { value: '聊天记录', label: '💬 聊天记录' },
    { value: '学习心得', label: '💡 学习心得' },
    { value: '项目笔记', label: '🚀 项目笔记' }
  ]

  // 排序选项
  const sortOptions = [
    { value: 'updated_at', label: '最近更新' },
    { value: 'created_at', label: '创建时间' },
    { value: 'title', label: '标题排序' },
    { value: 'favorite', label: '收藏优先' }
  ]

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await noteAPI.getNotes()
      setNotes(response.data || [])
    } catch (error) {
      console.warn('获取笔记失败，使用模拟数据:', error)
      // 使用模拟笔记数据
      const mockNotes = [
        {
          id: 1,
          title: '深度学习基础概念整理',
          content: '# 深度学习基础\n\n## 核心概念\n- 神经网络\n- 反向传播\n- 梯度下降\n\n## 学习心得\n深度学习是机器学习的重要分支...',
          author_id: 1,
          created_at: '2024-08-05T10:00:00Z',
          updated_at: '2024-08-06T15:30:00Z',
          is_public: false,
          tags: '深度学习,神经网络,机器学习',
          category: '自主笔记',
          is_favorite: true
        },
        {
          id: 2,
          title: 'Python数据结构学习笔记',
          content: '# Python数据结构\n\n## 列表(List)\n- 可变序列\n- 支持索引和切片\n\n## 字典(Dict)\n- 键值对映射\n- 无序集合',
          author_id: 1,
          created_at: '2024-08-04T14:20:00Z',
          updated_at: '2024-08-05T09:15:00Z',
          is_public: false,
          tags: 'Python,数据结构,编程',
          category: '知识导入',
          is_favorite: false
        },
        {
          id: 3,
          title: 'AI对话记录 - 机器学习算法',
          content: '## 问题\n什么是支持向量机？\n\n## AI回答\n支持向量机(SVM)是一种监督学习算法...\n\n## 个人理解\n通过最大化间隔来找到最优分类边界',
          author_id: 1,
          created_at: '2024-08-03T16:45:00Z',
          updated_at: '2024-08-03T16:45:00Z',
          is_public: false,
          tags: '机器学习,SVM,AI对话',
          category: '聊天记录',
          is_favorite: false
        }
      ]
      setNotes(mockNotes)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingNote(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    form.setFieldsValue({
      title: note.title,
      content: note.content,
      category: note.category || '自主笔记',
      tags: note.tags || '',
      is_public: note.is_public
    })
    setModalVisible(true)
  }

  const handleView = (note: Note) => {
    setViewingNote(note)
    setViewModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await noteAPI.deleteNote(id)
      message.success('笔记删除成功')
      fetchNotes()
    } catch (error) {
      console.warn('删除失败，使用模拟删除:', error)
      setNotes(notes.filter(note => note.id !== id))
      message.success('笔记删除成功')
    }
  }

  const handleToggleFavorite = async (note: Note) => {
    try {
      await noteAPI.updateNote(note.id, { ...note, is_favorite: !note.is_favorite })
      message.success(note.is_favorite ? '取消收藏' : '已收藏')
      fetchNotes()
    } catch (error) {
      console.warn('收藏操作失败，使用模拟操作:', error)
      setNotes(notes.map(n => 
        n.id === note.id ? { ...n, is_favorite: !n.is_favorite } : n
      ))
      message.success(note.is_favorite ? '取消收藏' : '已收藏')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingNote) {
        await noteAPI.updateNote(editingNote.id, values)
        message.success('笔记更新成功')
      } else {
        await noteAPI.createNote(values)
        message.success('笔记创建成功')
      }
      setModalVisible(false)
      fetchNotes()
    } catch (error) {
      console.warn('保存失败，使用模拟保存:', error)
      if (editingNote) {
        setNotes(notes.map(n => 
          n.id === editingNote.id ? { ...n, ...values, updated_at: new Date().toISOString() } : n
        ))
        message.success('笔记更新成功')
      } else {
        const newNote = {
          id: Date.now(),
          ...values,
          author_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_favorite: false
        }
        setNotes([newNote, ...notes])
        message.success('笔记创建成功')
      }
      setModalVisible(false)
    }
  }

  // 过滤和排序笔记
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = !searchText || 
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.content.toLowerCase().includes(searchText.toLowerCase()) ||
        (note.tags && note.tags.toLowerCase().includes(searchText.toLowerCase()))
      
      const matchesCategory = !categoryFilter || note.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'favorite':
          if (a.is_favorite && !b.is_favorite) return -1
          if (!a.is_favorite && b.is_favorite) return 1
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        default: // updated_at
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  // 统计数据
  const stats = {
    total: notes.length,
    favorites: notes.filter(n => n.is_favorite).length,
    categories: [...new Set(notes.map(n => n.category).filter(Boolean))].length,
    thisWeek: notes.filter(n => {
      const noteDate = new Date(n.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return noteDate > weekAgo
    }).length
  }

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总笔记数"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="收藏笔记"
              value={stats.favorites}
              prefix={<StarFilled style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats.categories}
              prefix={<TagsOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="本周新增"
              value={stats.thisWeek}
              prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>📝 我的笔记</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建笔记
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="搜索笔记标题、内容或标签..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="选择分类"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
            >
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              {sortOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        {filteredNotes.length === 0 ? (
          <Alert
            message="暂无笔记"
            description="还没有任何笔记，点击上方「新建笔记」开始记录学习心得吧！"
            type="info"
            showIcon
            style={{ margin: '40px 0' }}
          />
        ) : (
          <List
            loading={loading}
            dataSource={filteredNotes}
            renderItem={(note) => (
              <List.Item
                key={note.id}
                actions={[
                  <Tooltip title={note.is_favorite ? '取消收藏' : '收藏'}>
                    <Button
                      type="text"
                      icon={note.is_favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => handleToggleFavorite(note)}
                    />
                  </Tooltip>,
                  <Tooltip title="查看">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(note)}
                    />
                  </Tooltip>,
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(note)}
                    />
                  </Tooltip>,
                  <Popconfirm
                    title="确定要删除这条笔记吗？"
                    onConfirm={() => handleDelete(note.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {note.is_favorite && <StarFilled style={{ color: '#faad14' }} />}
                      <Text strong>{note.title}</Text>
                      {note.category && (
                        <Tag color="blue">{note.category}</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '8px 0' }}>
                        {note.content.replace(/[#*`]/g, '').substring(0, 150)}...
                      </Paragraph>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {note.tags && note.tags.split(',').map(tag => (
                            <Tag key={tag} size="small">{tag.trim()}</Tag>
                          ))}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          更新于 {new Date(note.updated_at).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 编辑/新建笔记模态框 */}
      <Modal
        title={editingNote ? '编辑笔记' : '新建笔记'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: '自主笔记',
            is_public: false
          }}
        >
          <Form.Item
            name="title"
            label="笔记标题"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="输入笔记标题..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="笔记分类">
                <Select>
                  {categories.slice(1).map(cat => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="标签（用逗号分隔）">
                <Input placeholder="如：深度学习,神经网络,AI" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label="笔记内容（支持Markdown格式）"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <TextArea
              rows={12}
              placeholder="在这里记录您的学习心得...&#10;&#10;支持Markdown格式：&#10;# 标题&#10;## 二级标题&#10;- 列表项&#10;**粗体** *斜体*&#10;```代码块```"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingNote ? '更新笔记' : '创建笔记'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看笔记模态框 */}
      <Modal
        title={viewingNote?.title}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setViewModalVisible(false)
            handleEdit(viewingNote!)
          }}>
            编辑
          </Button>,
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingNote && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                {viewingNote.category && <Tag color="blue">{viewingNote.category}</Tag>}
                {viewingNote.is_favorite && <Tag color="gold" icon={<StarFilled />}>收藏</Tag>}
                <Text type="secondary">
                  创建于 {new Date(viewingNote.created_at).toLocaleString()}
                </Text>
              </Space>
            </div>
            
            {viewingNote.tags && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>标签：</Text>
                {viewingNote.tags.split(',').map(tag => (
                  <Tag key={tag} style={{ margin: '0 4px 4px 0' }}>{tag.trim()}</Tag>
                ))}
              </div>
            )}
            
            <Divider />
            
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <ReactMarkdown>{viewingNote.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NotesPage
