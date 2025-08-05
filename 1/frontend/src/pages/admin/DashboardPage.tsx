import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Typography, Spin } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { analyticsAPI } from '../../services/api'

const { Title } = Typography

interface DashboardData {
  total_users: number
  total_resources: number
  total_exams: number
  recent_activities: any[]
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_users: 0,
    total_resources: 0,
    total_exams: 0,
    recent_activities: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboardData()
      setDashboardData(response.data)
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const activityColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 150,
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 100,
    },
    {
      title: '活动',
      dataIndex: 'activity',
      key: 'activity',
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>系统仪表板</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={dashboardData.total_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资源数"
              value={dashboardData.total_resources}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总考试数"
              value={dashboardData.total_exams}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="视频分析"
              value={0}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="最近活动" size="small">
            <Table
              columns={activityColumns}
              dataSource={dashboardData.recent_activities}
              pagination={false}
              size="small"
              locale={{
                emptyText: '暂无活动记录',
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage 