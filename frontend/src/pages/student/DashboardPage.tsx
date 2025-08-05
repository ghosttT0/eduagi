import React from 'react'
import { Card, Row, Col, Statistic, List, Typography, Tag } from 'antd'
import { BookOutlined, FileTextOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const StudentDashboardPage: React.FC = () => {
  const data = {
    total_courses: 5,
    total_assignments: 12,
    total_notes: 8,
    recent_activities: [
      { title: '完成了Python基础课程', time: '2024-01-15', type: 'course' },
      { title: '提交了作业：数据结构', time: '2024-01-14', type: 'assignment' },
      { title: '创建了新的学习笔记', time: '2024-01-13', type: 'note' },
    ]
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>学生仪表板</Title>

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
              title="待完成作业"
              value={data.total_assignments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学习笔记"
              value={data.total_notes}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学习成就"
              value={3}
              prefix={<TrophyOutlined />}
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
                        <Tag color={item.type === 'course' ? 'blue' : item.type === 'assignment' ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                          {item.type === 'course' ? '课程' : item.type === 'assignment' ? '作业' : '笔记'}
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