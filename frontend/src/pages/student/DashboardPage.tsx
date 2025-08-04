import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, List, Typography, Tag, Progress } from 'antd'
import { BookOutlined, VideoCameraOutlined, FileTextOutlined, TrophyOutlined } from '@ant-design/icons'
import { analyticsAPI } from '../../services/api'

const { Title, Text } = Typography

interface StudentDashboard {
  total_courses: number
  total_resources: number
  total_exams: number
  recent_activities: any[]
  learning_progress: number
}

const StudentDashboardPage: React.FC = () => {
  const [data, setData] = useState<StudentDashboard>({
    total_courses: 0,
    total_resources: 0,
    total_exams: 0,
    recent_activities: [],
    learning_progress: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getStudentDashboard()
      setData(response.data)
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>学习中心</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="我的课程"
              value={data.total_courses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学习资源"
              value={data.total_resources}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="考试数量"
              value={data.total_exams}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="视频学习"
              value={0}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="学习进度" size="small">
            <Progress
              type="circle"
              percent={data.learning_progress}
              format={(percent) => `${percent}%`}
            />
            <div style={{ marginTop: 16 }}>
              <Text>当前学习进度：{data.learning_progress}%</Text>
            </div>
          </Card>
        </Col>
        <Col span={12}>
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
                        <Tag color={item.type === 'course' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                          {item.type === 'course' ? '课程' : '活动'}
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

export default StudentDashboardPage 