import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, List, Typography, Tag, Progress, Avatar, Table, Button, Space, Tooltip, Badge } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  BookOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BellOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const AdminDashboardPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false)

  const data = {
    total_users: 1247,
    total_classes: 23,
    total_resources: 856,
    total_videos: 142,
    online_users: 89,
    today_logins: 234,
    ai_interactions: 1567,
    system_alerts: 3,
    recent_activities: [
      {
        title: '新增用户：李明',
        time: '2024-08-06 14:25',
        type: 'user',
        avatar: 'L',
        color: '#1890ff',
        description: '计算机科学专业学生'
      },
      {
        title: '创建班级：人工智能2024级',
        time: '2024-08-06 13:45',
        type: 'class',
        avatar: 'A',
        color: '#52c41a',
        description: '王教授创建新班级'
      },
      {
        title: '上传视频：深度学习基础',
        time: '2024-08-06 12:30',
        type: 'video',
        avatar: 'D',
        color: '#722ed1',
        description: '时长45分钟，已审核通过'
      },
      {
        title: 'AI对话：学生提问Python语法',
        time: '2024-08-06 11:15',
        type: 'ai',
        avatar: 'A',
        color: '#fa8c16',
        description: '张三同学与AI助手互动'
      },
      {
        title: '系统备份：数据库备份完成',
        time: '2024-08-06 10:00',
        type: 'system',
        avatar: 'S',
        color: '#13c2c2',
        description: '自动备份任务执行成功'
      },
      {
        title: '资源下载：机器学习教材',
        time: '2024-08-06 09:30',
        type: 'download',
        avatar: 'M',
        color: '#eb2f96',
        description: '已下载127次'
      }
    ],
    system_stats: {
      cpu_usage: 45,
      memory_usage: 68,
      disk_usage: 32,
      network_usage: 78,
      database_size: '2.3GB',
      active_sessions: 89,
      response_time: '120ms'
    },
    popular_courses: [
      { name: 'Python编程基础', students: 156, progress: 78, teacher: '张教授' },
      { name: '机器学习入门', students: 134, progress: 65, teacher: '李教授' },
      { name: '数据结构与算法', students: 98, progress: 82, teacher: '王教授' },
      { name: '深度学习实战', students: 87, progress: 45, teacher: '陈教授' },
      { name: 'Web开发技术', students: 76, progress: 90, teacher: '刘教授' }
    ],
    system_alerts: [
      { type: 'warning', message: '服务器磁盘使用率较高', time: '10分钟前' },
      { type: 'info', message: '系统将于今晚2点进行维护', time: '1小时前' },
      { type: 'success', message: '数据库备份完成', time: '2小时前' }
    ]
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // 模拟刷新数据
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
            系统仪表板
          </Title>
          <Text type="secondary">
            欢迎回来，这里是您的系统概览
          </Text>
        </div>
        <Space>
          <Badge count={data.system_alerts.length} offset={[10, 0]}>
            <Button icon={<BellOutlined />} size="large">
              系统通知
            </Button>
          </Badge>
          <Button
            icon={<SyncOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
            size="large"
          >
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="总用户数"
              value={data.total_users}
              prefix={<UserOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6', fontSize: 24, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +12%
                </span>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              本月新增 {Math.floor(data.total_users * 0.12)} 人
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="在线用户"
              value={data.online_users}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +15
                </span>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              今日登录 {data.today_logins} 人次
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="AI互动次数"
              value={data.ai_interactions}
              prefix={<MessageOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 24, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +23%
                </span>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              今日新增 {Math.floor(data.ai_interactions * 0.08)} 次
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="教学视频"
              value={data.total_videos}
              prefix={<VideoCameraOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +5
                </span>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              总时长 {Math.floor(data.total_videos * 25)} 分钟
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 第二行统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="班级数量"
              value={data.total_classes}
              prefix={<BookOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontSize: 24, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              活跃班级 {Math.floor(data.total_classes * 0.85)} 个
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="学习资源"
              value={data.total_resources}
              prefix={<FileTextOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96', fontSize: 24, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              本周新增 {Math.floor(data.total_resources * 0.03)} 个
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="系统响应"
              value={data.system_stats.response_time}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              平均响应时间
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="系统状态"
              value="优秀"
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              运行稳定 99.9%
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 最近活动 */}
        <Col xs={24} lg={12}>
          <Card
            title="最近活动"
            className="dashboard-card"
            extra={<Button type="link">查看全部</Button>}
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
                        <Tag color={
                          item.type === 'user' ? 'blue' :
                          item.type === 'class' ? 'green' :
                          item.type === 'video' ? 'purple' :
                          item.type === 'ai' ? 'orange' :
                          item.type === 'system' ? 'cyan' : 'magenta'
                        }>
                          {
                            item.type === 'user' ? '用户' :
                            item.type === 'class' ? '班级' :
                            item.type === 'video' ? '视频' :
                            item.type === 'ai' ? 'AI' :
                            item.type === 'system' ? '系统' : '下载'
                          }
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text>
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

        {/* 热门课程 */}
        <Col xs={24} lg={12}>
          <Card
            title="热门课程"
            className="dashboard-card"
            extra={<Button type="link">查看全部</Button>}
          >
            <List
              dataSource={data.popular_courses}
              renderItem={(course: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#8b5cf6', color: '#fff' }}
                        size={40}
                        icon={<BookOutlined />}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{course.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{course.students} 人学习</Text>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>授课教师：{course.teacher}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>进度：{course.progress}%</Text>
                        </div>
                        <Progress
                          percent={course.progress}
                          strokeColor="#8b5cf6"
                          showInfo={false}
                          size="small"
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统监控和通知 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* 系统通知 */}
        <Col xs={24} lg={12}>
          <Card
            title="系统通知"
            className="dashboard-card"
            extra={<Button type="link">查看全部</Button>}
          >
            <List
              dataSource={data.system_alerts}
              renderItem={(alert: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: alert.type === 'warning' ? '#faad14' :
                                          alert.type === 'success' ? '#52c41a' : '#1890ff',
                          color: '#fff'
                        }}
                        size={32}
                        icon={
                          alert.type === 'warning' ? <WarningOutlined /> :
                          alert.type === 'success' ? <CheckCircleOutlined /> : <BellOutlined />
                        }
                      />
                    }
                    title={<Text>{alert.message}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 12 }}>{alert.time}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 系统监控 */}
        <Col xs={24} lg={12}>
          <Card
            title="系统监控"
            className="dashboard-card"
            extra={<Button type="link">详细监控</Button>}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>CPU 使用率</Text>
                <Text strong>{data.system_stats.cpu_usage}%</Text>
              </div>
              <Progress
                percent={data.system_stats.cpu_usage}
                strokeColor="#8b5cf6"
                showInfo={false}
                size="small"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
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

            <div style={{ marginBottom: 16 }}>
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

            <div style={{ marginBottom: 16 }}>
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

            <div style={{ marginTop: 20, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="数据库大小"
                    value={data.system_stats.database_size}
                    valueStyle={{ fontSize: 16, color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="活跃会话"
                    value={data.system_stats.active_sessions}
                    valueStyle={{ fontSize: 16, color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboardPage 