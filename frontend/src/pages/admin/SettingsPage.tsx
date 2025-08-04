import React, { useEffect, useState } from 'react'
import { Card, Input, Button, message, Table, Space, Typography } from 'antd'
import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import { manageAPI } from '../../services/api'

const { Title, Text } = Typography

interface SystemConfig {
  key: string
  value: string
  description: string
}

const SettingsPage: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const response = await manageAPI.getConfigs()
      setConfigs(response.data)
    } catch (error) {
      message.error('获取系统配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: SystemConfig) => {
    setEditingKey(record.key)
    setEditingValue(record.value)
  }

  const handleSave = async () => {
    if (!editingKey) return

    try {
      await manageAPI.updateConfig(editingKey, editingValue)
      message.success('配置更新成功')
      setEditingKey(null)
      fetchConfigs()
    } catch (error) {
      message.error('配置更新失败')
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditingValue('')
  }

  const columns = [
    {
      title: '配置项',
      dataIndex: 'key',
      key: 'key',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (text: string, record: SystemConfig) => {
        if (editingKey === record.key) {
          return (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              style={{ width: 300 }}
            />
          )
        }
        return <Text ellipsis style={{ maxWidth: 300 }}>{text || '-'}</Text>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: SystemConfig) => {
        if (editingKey === record.key) {
          return (
            <Space>
              <Button
                type="link"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                保存
              </Button>
              <Button type="link" onClick={handleCancel}>
                取消
              </Button>
            </Space>
          )
        }
        return (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        )
      },
    },
  ]

  return (
    <div>
      <Title level={2}>系统设置</Title>

      <Card title="系统配置" loading={loading}>
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="key"
          pagination={false}
          locale={{
            emptyText: '暂无配置项',
          }}
        />
      </Card>

      <Card title="系统信息" style={{ marginTop: 16 }}>
        <Text>
          系统版本：1.0.0<br />
          运行状态：正常<br />
          最后更新：{new Date().toLocaleString()}
        </Text>
      </Card>
    </div>
  )
}

export default SettingsPage 