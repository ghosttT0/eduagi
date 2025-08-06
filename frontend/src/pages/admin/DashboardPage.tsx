import React from 'react'
import { Card, Row, Col, Statistic, List, Typography, Tag, Progress, Avatar } from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const AdminDashboardPage: React.FC = () => {
  const data = {
    total_users: 156,
    total_classes: 8,
    total_resources: 245,
    recent_activities: [
      { 
        title: '新增用户：张三', 
        time: '2024-01-15', 
        type: 'user',
        avatar: 'Z',
        color: '#1890ff'
      },
      { 
        title: '创建班级：计算机科学2班', 
        time: '2024-01-14', 
        type: 'class',
        avatar: 'C',
        color: '#52c41a'
      },
      { 
        title: '上传资源：Python教程', 
        time: '2024-01-13', 
        type: 'resource',
        avatar: 'P',
        color: '#722ed1'
      },
    ],
    system_stats: {
      cpu_usage: 45,
      memory_usage: 68,
      disk_usage: 32,
      network_usage: 78
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
          系统仪表板
        </Title>
        <Text type="secondary">
          欢迎回来，这里是您的系统概览
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="总用户数"
              value={data.total_users}
              prefix={<UserOutlined style={{ color: '#7B68EE' }} />}
              valueStyle={{ color: '#7B68EE', fontSize: 28, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="班级数量"
              value={data.total_classes}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +3
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="资源总数"
              value={data.total_resources}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="系统状态"
              value="正常"
              prefix={<SettingOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 最近活动 */}
        <Col xs={24} lg={16}>
          <Card 
            title="最近活动" 
            className="dashboard-card"
            extra={<Text type="secondary">查看全部</Text>}
          >
            <List
              dataSource={data.recent_activities}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ backgroundColor: item.color, color: '#fff' }}
                        size={40}
                      >
                        {item.avatar}
                      </Avatar>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>{item.title}</Text>
                        <Tag color={item.type === 'user' ? 'blue' : item.type === 'class' ? 'green' : 'purple'}>
                          {item.type === 'user' ? '用户' : item.type === 'class' ? '班级' : '资源'}
                        </Tag>
                      </div>
                    }
                    description={
                      <Text type="secondary">{item.time}</Text>
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

        {/* 系统状态 */}
        <Col xs={24} lg={8}>
          <Card 
            title="系统状态" 
            className="dashboard-card"
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>CPU 使用率</Text>
                <Text strong>{data.system_stats.cpu_usage}%</Text>
              </div>
              <Progress 
                percent={data.system_stats.cpu_usage} 
                strokeColor="#7B68EE"
                showInfo={false}
                size="small"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>内存使用率</Text>
                <Text strong>{data.system_stats.memory_usage}%</Text>
              </div>
              <Progress 
                percent={data.system_stats.memory_usage} 
                strokeColor="#52c41a"
                showInfo={false}
                size="small"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>磁盘使用率</Text>
                <Text strong>{data.system_stats.disk_usage}%</Text>
              </div>
              <Progress 
                percent={data.system_stats.disk_usage} 
                strokeColor="#722ed1"
                showInfo={false}
                size="small"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>网络使用率</Text>
                <Text strong>{data.system_stats.network_usage}%</Text>
              </div>
              <Progress 
                percent={data.system_stats.network_usage} 
                strokeColor="#faad14"
                showInfo={false}
                size="small"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboardPage 