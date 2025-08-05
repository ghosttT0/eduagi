import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, List, Typography, Tag } from 'antd'
import { FileTextOutlined, VideoCameraOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons'
import { analyticsAPI } from '../../services/api'

const { Title, Text } = Typography

interface TeacherDashboard {
  total_resources: number
  total_videos: number
  total_students: number
  recent_activities: any[]
}

const TeacherDashboardPage: React.FC = () => {
  const [data, setData] = useState<TeacherDashboard>({
    total_resources: 0,
    total_videos: 0,
    total_students: 0,
    recent_activities: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getTeacherDashboard()
      setData(response.data)
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>教师仪表板</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="我的资源"
              value={data.total_resources}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="视频分析"
              value={data.total_videos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学生数量"
              value={data.total_students}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="课程笔记"
              value={0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="最近活动" size="small">
            <List
              dataSource={data.recent_activities}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <div>
                        <Text type="secondary">{item.time}</Text>
                        <Tag color={item.type === 'resource' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                          {item.type === 'resource' ? '资源' : '活动'}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
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

export default TeacherDashboardPage 