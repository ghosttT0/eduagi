import React, { useEffect, useState } from 'react'
import { Card, Button, Table, message, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { resourceAPI } from '../../services/api'

interface Resource {
  id: number
  title: string
  description: string
  file_type: string
  created_at: string
}

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await resourceAPI.getMyResources()
      setResources(response.data)
    } catch (error) {
      message.error('获取资源列表失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>我的资源</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          上传资源
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={resources}
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

export default ResourcesPage 