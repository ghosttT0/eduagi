import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
  Avatar,
  Tooltip,
  Select,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { classAPI } from '../../services/api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface Class {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  student_count?: number
  teacher_name?: string
  course_count?: number
  progress?: number
  status?: 'active' | 'inactive'
}

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // 模拟班级数据
  const mockClasses: Class[] = [
    {
      id: 1,
      name: '计算机科学2024级1班',
      description: '计算机科学与技术专业，专注于算法、数据结构和软件工程',
      created_at: '2024-08-01T10:00:00Z',
      updated_at: '2024-08-06T14:30:00Z',
      student_count: 45,
      teacher_name: '张教授',
      course_count: 8,
      progress: 78,
      status: 'active'
    },
    {
      id: 2,
      name: '软件工程2024级1班',
      description: '软件工程专业，培养软件开发和项目管理能力',
      created_at: '2024-08-01T11:00:00Z',
      updated_at: '2024-08-06T13:45:00Z',
      student_count: 38,
      teacher_name: '李教授',
      course_count: 6,
      progress: 65,
      status: 'active'
    },
    {
      id: 3,
      name: '人工智能2024级1班',
      description: '人工智能专业，学习机器学习、深度学习等前沿技术',
      created_at: '2024-08-01T12:00:00Z',
      updated_at: '2024-08-06T12:30:00Z',
      student_count: 32,
      teacher_name: '王教授',
      course_count: 10,
      progress: 82,
      status: 'active'
    },
    {
      id: 4,
      name: '数据科学2024级1班',
      description: '数据科学与大数据技术专业，专注于数据分析和挖掘',
      created_at: '2024-08-01T13:00:00Z',
      updated_at: '2024-08-06T11:15:00Z',
      student_count: 28,
      teacher_name: '陈教授',
      course_count: 7,
      progress: 45,
      status: 'active'
    },
    {
      id: 5,
      name: '网络工程2024级1班',
      description: '网络工程专业，学习网络架构、安全和运维技术',
      created_at: '2024-08-01T14:00:00Z',
      updated_at: '2024-08-06T10:00:00Z',
      student_count: 25,
      teacher_name: '刘教授',
      course_count: 5,
      progress: 90,
      status: 'active'
    },
    {
      id: 6,
      name: '信息安全2024级1班',
      description: '信息安全专业，培养网络安全和信息保护专家',
      created_at: '2024-08-01T15:00:00Z',
      updated_at: '2024-08-05T16:00:00Z',
      student_count: 20,
      teacher_name: '赵教授',
      course_count: 4,
      progress: 30,
      status: 'inactive'
    }
  ]

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      // 使用模拟数据，实际项目中应该调用API
      setTimeout(() => {
        setClasses(mockClasses)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error('获取班级列表失败')
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingClass(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Class) => {
    setEditingClass(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await classAPI.deleteClass(id)
      message.success('删除成功')
      fetchClasses()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingClass) {
        await classAPI.updateClass(editingClass.id, values)
        message.success('更新成功')
      } else {
        await classAPI.createClass(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchClasses()
    } catch (error) {
      message.error(editingClass ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: Class, b: Class) => a.id - b.id,
    },
    {
      title: '班级信息',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: Class) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar
              style={{ backgroundColor: '#8b5cf6', marginRight: 8 }}
              icon={<TeamOutlined />}
              size="small"
            />
            <Text strong>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description?.substring(0, 50)}...
          </Text>
        </div>
      ),
    },
    {
      title: '学生数量',
      dataIndex: 'student_count',
      key: 'student_count',
      width: 100,
      render: (count: number) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
            {count}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>人</Text>
        </div>
      ),
      sorter: (a: Class, b: Class) => (a.student_count || 0) - (b.student_count || 0),
    },
    {
      title: '授课教师',
      dataIndex: 'teacher_name',
      key: 'teacher_name',
      width: 120,
      render: (name: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {name?.charAt(0)}
          </Avatar>
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: '课程进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <div>
          <Progress
            percent={progress}
            size="small"
            strokeColor="#8b5cf6"
            format={(percent) => `${percent}%`}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            完成度
          </Text>
        </div>
      ),
      sorter: (a: Class, b: Class) => (a.progress || 0) - (b.progress || 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
      filters: [
        { text: '活跃', value: 'active' },
        { text: '停用', value: 'inactive' },
      ],
      onFilter: (value: any, record: Class) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(text).toLocaleDateString()}
        </Text>
      ),
      sorter: (a: Class, b: Class) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Class) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="编辑班级">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个班级吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除班级">
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

  // 过滤班级数据
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         cls.teacher_name?.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = selectedStatus === '' || cls.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // 计算统计数据
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)
  const activeClasses = classes.filter(cls => cls.status === 'active').length
  const avgProgress = classes.reduce((sum, cls) => sum + (cls.progress || 0), 0) / classes.length

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总班级数"
              value={classes.length}
              prefix={<TeamOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃班级"
              value={activeClasses}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={totalStudents}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均进度"
              value={Math.round(avgProgress)}
              suffix="%"
              prefix={<BookOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>班级管理</Title>
          <Space>
            <Input.Search
              placeholder="搜索班级名称或教师"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="筛选状态"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="">全部状态</Option>
              <Option value="active">活跃</Option>
              <Option value="inactive">停用</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加班级
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredClasses}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingClass ? '编辑班级' : '添加班级'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="请输入班级名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="班级描述"
          >
            <TextArea
              placeholder="请输入班级描述"
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingClass ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ClassesPage 