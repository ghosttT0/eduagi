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
  Dropdown,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons'
import { userAPI, classAPI } from '../../services/api'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { Title, Text } = Typography
const { Option } = Select

interface User {
  id: number
  account_id: string
  display_name: string
  role: string
  class_id?: number
}

interface Class {
  id: number
  name: string
  description?: string
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')

  // 模拟数据
  const mockUsers: User[] = [
    { id: 1, account_id: 'admin', display_name: '系统管理员', role: '管理员', class_id: undefined },
    { id: 2, account_id: 'T001', display_name: '张教授', role: '教师', class_id: 1 },
    { id: 3, account_id: 'T002', display_name: '李教授', role: '教师', class_id: 2 },
    { id: 4, account_id: 'T003', display_name: '王教授', role: '教师', class_id: 3 },
    { id: 5, account_id: 'S001', display_name: '张三', role: '学生', class_id: 1 },
    { id: 6, account_id: 'S002', display_name: '李四', role: '学生', class_id: 1 },
    { id: 7, account_id: 'S003', display_name: '王五', role: '学生', class_id: 2 },
    { id: 8, account_id: 'S004', display_name: '赵六', role: '学生', class_id: 2 },
    { id: 9, account_id: 'S005', display_name: '钱七', role: '学生', class_id: 3 },
    { id: 10, account_id: 'S006', display_name: '孙八', role: '学生', class_id: 3 },
    { id: 11, account_id: 'T004', display_name: '陈教授', role: '教师', class_id: 4 },
    { id: 12, account_id: 'S007', display_name: '周九', role: '学生', class_id: 4 },
    { id: 13, account_id: 'S008', display_name: '吴十', role: '学生', class_id: 1 },
    { id: 14, account_id: 'T005', display_name: '刘教授', role: '教师', class_id: 5 },
    { id: 15, account_id: 'S009', display_name: '郑一', role: '学生', class_id: 5 }
  ]

  const mockClasses: Class[] = [
    { id: 1, name: '计算机科学2024级1班', description: '计算机科学与技术专业' },
    { id: 2, name: '软件工程2024级1班', description: '软件工程专业' },
    { id: 3, name: '人工智能2024级1班', description: '人工智能专业' },
    { id: 4, name: '数据科学2024级1班', description: '数据科学与大数据技术专业' },
    { id: 5, name: '网络工程2024级1班', description: '网络工程专业' }
  ]

  useEffect(() => {
    fetchUsers()
    fetchClasses()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userAPI.getUsers()
      setUsers(response.data)
    } catch (error) {
      console.error('API调用失败，使用模拟数据:', error)
      // 如果API调用失败，使用模拟数据
      setUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses()
      setClasses(response.data)
    } catch (error) {
      console.error('API调用失败，使用模拟数据:', error)
      // 如果API调用失败，使用模拟数据
      setClasses(mockClasses)
    }
  }

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: User) => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await userAPI.deleteUser(id)
      message.success('删除成功')
      fetchUsers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, values)
        message.success('更新成功')
      } else {
        await userAPI.createUser(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchUsers()
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败')
    }
  }

  // Excel导出功能
  const handleExportExcel = () => {
    try {
      // 准备导出数据
      const exportData = users.map(user => {
        const classItem = classes.find(c => c.id === user.class_id)
        return {
          'ID': user.id,
          '账号': user.account_id,
          '姓名': user.display_name,
          '角色': user.role,
          '班级': classItem ? classItem.name : '未分配',
          '班级ID': user.class_id || '',
          '创建时间': '2024-08-01', // 模拟数据
          '状态': Math.random() > 0.2 ? '活跃' : '禁用'
        }
      })

      // 创建工作簿
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '用户列表')

      // 设置列宽
      const colWidths = [
        { wch: 8 },  // ID
        { wch: 15 }, // 账号
        { wch: 15 }, // 姓名
        { wch: 10 }, // 角色
        { wch: 25 }, // 班级
        { wch: 10 }, // 班级ID
        { wch: 15 }, // 创建时间
        { wch: 10 }  // 状态
      ]
      ws['!cols'] = colWidths

      // 导出文件
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, `用户列表_${new Date().toISOString().split('T')[0]}.xlsx`)

      message.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败')
    }
  }

  // Excel导入功能
  const handleImportExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // 验证和转换数据
        const importedUsers: any[] = []
        const errors: string[] = []

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2 // Excel行号从2开始（第1行是标题）

          // 验证必填字段
          if (!row['账号']) {
            errors.push(`第${rowNum}行：账号不能为空`)
            return
          }
          if (!row['姓名']) {
            errors.push(`第${rowNum}行：姓名不能为空`)
            return
          }
          if (!row['角色']) {
            errors.push(`第${rowNum}行：角色不能为空`)
            return
          }

          // 验证角色值
          const validRoles = ['管理员', '教师', '学生']
          if (!validRoles.includes(row['角色'])) {
            errors.push(`第${rowNum}行：角色必须是 ${validRoles.join('、')} 之一`)
            return
          }

          // 查找班级ID
          let classId = undefined
          if (row['班级'] && row['班级'] !== '未分配') {
            const classItem = classes.find(c => c.name === row['班级'])
            if (classItem) {
              classId = classItem.id
            } else if (row['班级ID']) {
              classId = parseInt(row['班级ID'])
            }
          }

          importedUsers.push({
            account_id: row['账号'],
            display_name: row['姓名'],
            role: row['角色'],
            class_id: classId,
            password: '123456' // 默认密码
          })
        })

        if (errors.length > 0) {
          Modal.error({
            title: '导入数据验证失败',
            content: (
              <div>
                <p>发现以下错误：</p>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ),
            width: 600
          })
          return
        }

        // 显示导入预览
        Modal.confirm({
          title: '确认导入',
          content: `即将导入 ${importedUsers.length} 个用户，是否继续？`,
          onOk: async () => {
            try {
              // 这里应该调用批量创建API
              // await userAPI.batchCreateUsers(importedUsers)

              // 模拟批量导入
              const newUsers = importedUsers.map((user, index) => ({
                ...user,
                id: users.length + index + 1
              }))
              setUsers([...users, ...newUsers])

              message.success(`成功导入 ${importedUsers.length} 个用户`)
            } catch (error) {
              message.error('批量导入失败')
            }
          }
        })

      } catch (error) {
        console.error('解析Excel文件失败:', error)
        message.error('解析Excel文件失败，请检查文件格式')
      }
    }
    reader.readAsArrayBuffer(file)
    return false // 阻止默认上传行为
  }

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '账号': 'S001',
        '姓名': '张三',
        '角色': '学生',
        '班级': '计算机科学2024级1班',
        '班级ID': '1',
        '备注': '角色可选：管理员、教师、学生'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '用户导入模板')

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 账号
      { wch: 15 }, // 姓名
      { wch: 10 }, // 角色
      { wch: 25 }, // 班级
      { wch: 10 }, // 班级ID
      { wch: 30 }  // 备注
    ]
    ws['!cols'] = colWidths

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, '用户导入模板.xlsx')

    message.success('模板下载成功')
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: User, b: User) => a.id - b.id,
    },
    {
      title: '账号',
      dataIndex: 'account_id',
      key: 'account_id',
      width: 120,
      sorter: (a: User, b: User) => a.account_id.localeCompare(b.account_id),
    },
    {
      title: '姓名',
      dataIndex: 'display_name',
      key: 'display_name',
      width: 120,
      sorter: (a: User, b: User) => a.display_name.localeCompare(b.display_name),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => {
        const colors = {
          '管理员': 'red',
          '教师': 'blue',
          '学生': 'green'
        }
        return <Tag color={colors[role as keyof typeof colors]}>{role}</Tag>
      },
      filters: [
        { text: '管理员', value: '管理员' },
        { text: '教师', value: '教师' },
        { text: '学生', value: '学生' },
      ],
      onFilter: (value: any, record: User) => record.role === value,
    },
    {
      title: '班级',
      dataIndex: 'class_id',
      key: 'class_id',
      width: 200,
      render: (class_id: number) => {
        const classItem = classes.find(c => c.id === class_id)
        return classItem ? (
          <Tag color="purple">{classItem.name}</Tag>
        ) : (
          <Text type="secondary">未分配</Text>
        )
      },
    },
    {
      title: '创建时间',
      key: 'created_at',
      width: 120,
      render: () => {
        // 模拟创建时间
        const dates = ['2024-08-01', '2024-08-02', '2024-08-03', '2024-08-04', '2024-08-05']
        return <Text type="secondary">{dates[Math.floor(Math.random() * dates.length)]}</Text>
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: () => {
        // 模拟用户状态
        const isActive = Math.random() > 0.2
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? '活跃' : '禁用'}
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: User) => (
        <Space size="small">
          <Tooltip title="编辑用户">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Button
              type="link"
              icon={<SettingOutlined />}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除用户">
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

  // 过滤用户数据
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.account_id.toLowerCase().includes(searchText.toLowerCase())
    const matchesRole = selectedRole === '' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>用户管理</Title>
          <Space>
            <Input.Search
              placeholder="搜索用户名或账号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="筛选角色"
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="">全部角色</Option>
              <Option value="管理员">管理员</Option>
              <Option value="教师">教师</Option>
              <Option value="学生">学生</Option>
            </Select>

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'export',
                    label: '导出用户列表',
                    icon: <ExportOutlined />,
                    onClick: handleExportExcel
                  },
                  {
                    key: 'template',
                    label: '下载导入模板',
                    icon: <DownloadOutlined />,
                    onClick: handleDownloadTemplate
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Button icon={<DownloadOutlined />}>
                导出 <span style={{ marginLeft: 4 }}>▼</span>
              </Button>
            </Dropdown>

            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleImportExcel}
              showUploadList={false}
            >
              <Button icon={<ImportOutlined />}>
                导入Excel
              </Button>
            </Upload>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加用户
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
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
            name="account_id"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="管理员">管理员</Option>
              <Option value="教师">教师</Option>
              <Option value="学生">学生</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="class_id"
            label="班级"
          >
            <Select placeholder="请选择班级" allowClear>
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
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

export default UsersPage 