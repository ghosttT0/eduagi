import React from 'react'
import { Card, Row, Col, Statistic, List, Typography, Tag } from 'antd'
import { UserOutlined, TeamOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const AdminDashboardPage: React.FC = () => {
  const data = {
    total_users: 156,
    total_classes: 8,
    total_resources: 245,
    recent_activities: [
      { title: '新增用户：张三', time: '2024-01-15', type: 'user' },
      { title: '创建班级：计算机科学2班', time: '2024-01-14', type: 'class' },
      { title: '上传资源：Python教程', time: '2024-01-13', type: 'resource' },
    ]
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>管理员仪表板</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={data.total_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="班级数量"
              value={data.total_classes}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="资源总数"
              value={data.total_resources}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="系统状态"
              value="正常"
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#52c41a' }}
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
                        <Tag color={item.type === 'user' ? 'blue' : item.type === 'class' ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                          {item.type === 'user' ? '用户' : item.type === 'class' ? '班级' : '资源'}
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

export default AdminDashboardPage 