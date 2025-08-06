import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Progress,
  Table,
  Tooltip,
  Badge,
  Alert,
  Divider,
  Select,
  DatePicker,
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  VideoCameraOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BellOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  MessageOutlined,
  HeartOutlined,
  DollarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  FireOutlined,
  EyeOutlined,
  DownloadOutlined,
  LikeOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { Line, Column, Pie, Area } from '@ant-design/charts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const AdvancedDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('month')

  // 模拟数据
  const [dashboardData, setDashboardData] = useState({
    // 核心指标
    totalEarning: 242650,
    averageEarning: 17347,
    conversionRate: 74.86,
    monthlyGrowth: 15.2,
    
    // 用户统计
    totalUsers: 1248,
    activeUsers: 892,
    newUsers: 156,
    onlineUsers: 234,
    
    // 学习数据
    totalCourses: 45,
    completedLessons: 1567,
    studyHours: 8934,
    aiInteractions: 2341,
    
    // 系统数据
    serverLoad: 68,
    databaseSize: 2.4,
    activeSessions: 156,
    apiCalls: 45678,
  })

  // 周销售数据
  const weeklyData = [
    { day: 'Sun', value: 30000, type: 'current' },
    { day: 'Mon', value: 45000, type: 'current' },
    { day: 'Tue', value: 38000, type: 'current' },
    { day: 'Wed', value: 52000, type: 'current' },
    { day: 'Thu', value: 41000, type: 'current' },
    { day: 'Fri', value: 48000, type: 'current' },
    { day: 'Sat', value: 35000, type: 'current' },
  ]

  // 收入趋势数据
  const incomeData = [
    { month: 'Jun', value: 100000 },
    { month: 'Jul', value: 120000 },
    { month: 'Aug', value: 180000 },
    { month: 'Sep', value: 150000 },
    { month: 'Oct', value: 200000 },
    { month: 'Nov', value: 170000 },
    { month: 'Dec', value: 240000 },
  ]

  // 点击率数据
  const clickData = [
    { type: 'Clicks', value: 210 },
    { type: 'Impressions', value: 42 },
  ]

  // 用户团队数据
  const teamMembers = [
    { id: 1, name: 'Mahid Ahmed', role: 'Senior Developer', avatar: '👨‍💻', status: 'online' },
    { id: 2, name: 'Daniel Karl', role: 'UI Designer', avatar: '👨‍🎨', status: 'online' },
    { id: 3, name: 'Rena Michel', role: 'Product Manager', avatar: '👩‍💼', status: 'away' },
    { id: 4, name: 'Salina Metho', role: 'Data Analyst', avatar: '👩‍💻', status: 'online' },
  ]

  // 热门课程数据
  const topCourses = [
    { name: 'Python基础编程', students: 234, progress: 85, revenue: 12500 },
    { name: 'Web前端开发', students: 189, progress: 92, revenue: 15600 },
    { name: '数据科学入门', students: 156, progress: 78, revenue: 9800 },
    { name: '机器学习实战', students: 143, progress: 88, revenue: 18900 },
  ]

  // 活动记录
  const recentActivities = [
    { type: 'user_register', message: '新用户注册', user: '张同学', time: '2分钟前', icon: <UserOutlined />, color: 'green' },
    { type: 'course_complete', message: '完成课程学习', user: '李同学', time: '5分钟前', icon: <TrophyOutlined />, color: 'gold' },
    { type: 'ai_interaction', message: 'AI对话互动', user: '王同学', time: '8分钟前', icon: <MessageOutlined />, color: 'blue' },
    { type: 'video_upload', message: '上传教学视频', user: '陈老师', time: '12分钟前', icon: <VideoCameraOutlined />, color: 'purple' },
    { type: 'exam_create', message: '创建智能试卷', user: '刘老师', time: '15分钟前', icon: <BookOutlined />, color: 'orange' },
  ]

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const refreshData = () => {
    loadDashboardData()
  }

  // 周销售图表配置
  const weeklyConfig = {
    data: weeklyData,
    xField: 'day',
    yField: 'value',
    smooth: true,
    color: '#8b5cf6',
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#8b5cf6',
        lineWidth: 2,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: 'Sales', value: `$${datum.value.toLocaleString()}` }
      },
    },
  }

  // 收入趋势图表配置
  const incomeConfig = {
    data: incomeData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    color: '#3b82f6',
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#3b82f6 1:#1e40af',
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: 'Income', value: `$${datum.value.toLocaleString()}` }
      },
    },
  }

  // 点击率饼图配置
  const clickConfig = {
    data: clickData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    color: ['#fbbf24', '#e5e7eb'],
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '34.09%',
      },
    },
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 头部区域 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Dashboard</Title>
          <Text type="secondary">14th Aug 2023</Text>
        </div>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="quarter">本季度</Select.Option>
            <Select.Option value="year">本年</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* 第一行 - 核心指标卡片 */}
        <Col span={6}>
          <Card style={{ background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Earning</span>}
              value={dashboardData.totalEarning}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              prefix="$"
              suffix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  From the running month
                </div>
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Average Earning</span>}
              value={dashboardData.averageEarning}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              prefix="$"
              suffix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  From the running month
                </div>
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Conversion Rate</span>}
              value={dashboardData.conversionRate}
              precision={2}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              suffix="%"
              prefix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  +5.2% from last month
                </div>
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', border: 'none' }}>
            <div style={{ color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                Upgrade to Pro
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 4 }}>
                $4.20
              </div>
              <div style={{ fontSize: '14px', marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>
                / Month
              </div>
              <div style={{ fontSize: '12px', marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>
                $50 Billed Annually
              </div>
              <Button 
                type="primary" 
                size="small"
                style={{ 
                  background: '#fbbf24', 
                  borderColor: '#fbbf24',
                  color: '#000',
                  fontWeight: 'bold'
                }}
              >
                Upgrade Now
              </Button>
            </div>
          </Card>
        </Col>

        {/* 第二行 - 图表区域 */}
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Regular Sell</span>
                <Button size="small" type="primary" ghost>Export</Button>
              </div>
            }
            style={{ height: 400 }}
          >
            <Line {...weeklyConfig} height={300} />
          </Card>
        </Col>

        <Col span={6}>
          <Card title="Click-Through Rate" style={{ height: 400 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Statistic
                value={34.09}
                suffix="%"
                valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}
              />
            </div>
            <Pie {...clickConfig} height={200} />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>210</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Clicks</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>42</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Impressions</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card title="Income Statistics" extra={<Select defaultValue="Monthly" size="small" />} style={{ height: 400 }}>
            <Area {...incomeConfig} height={250} />
            <div style={{ marginTop: 16 }}>
              <Tag color="red" style={{ marginBottom: 8 }}>-15%</Tag>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Advertising will drive +25.33% more visitors
              </div>
            </div>
          </Card>
        </Col>

        {/* 第三行 - 详细信息 */}
        <Col span={8}>
          <Card title="More Analysis" extra={<a href="#">There are more to view</a>}>
            <List
              size="small"
              dataSource={[
                { title: 'Store Sell Ratio', value: '85%', trend: 'up' },
                { title: 'Top Item sold', value: '1,234', trend: 'up' },
                { title: 'Customer Satisfaction', value: '4.8/5', trend: 'stable' },
                { title: 'Revenue Growth', value: '+15.2%', trend: 'up' },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    item.trend === 'up' ? 
                      <RiseOutlined style={{ color: '#52c41a' }} /> : 
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {item.value}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card 
            title="Top Store" 
            extra={<Button size="small" type="primary">Share</Button>}
          >
            <Table
              size="small"
              pagination={false}
              columns={[
                { title: 'Store Name', dataIndex: 'name', key: 'name' },
                { title: 'Location', dataIndex: 'location', key: 'location' },
                { title: 'Sell', dataIndex: 'sell', key: 'sell' },
                { title: 'Amount', dataIndex: 'amount', key: 'amount' },
              ]}
              dataSource={[
                { key: 1, name: 'Solaris Sparkle', location: 'Miami, Florida', sell: '102 Quantity', amount: '12.50K' },
                { key: 2, name: 'Crimson Dusk', location: 'Denver, Colorado', sell: '214 Quantity', amount: '07.85K' },
                { key: 3, name: 'Indigo Zephyr', location: 'Orlando, Florida', sell: '143 Quantity', amount: '16.40K' },
                { key: 4, name: 'Roseate Crest', location: 'Las Vegas, Nevada', sell: '185 Quantity', amount: '23.64K' },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card 
            title="Team Member" 
            extra={<Button size="small" type="primary">Add more member</Button>}
          >
            <List
              dataSource={teamMembers}
              renderItem={(member) => (
                <List.Item
                  actions={[<Button type="link" size="small">View</Button>]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={member.status === 'online' ? 'success' : 'default'} 
                        offset={[-5, 5]}
                      >
                        <Avatar size={40}>{member.avatar}</Avatar>
                      </Badge>
                    }
                    title={member.name}
                    description={member.role}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 第四行 - 升级卡片和会议信息 */}
        <Col span={12}>
          <Card style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)', border: 'none' }}>
            <Row>
              <Col span={12}>
                <div style={{ color: '#fff', padding: '20px 0' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>
                    UPGRADE PRO PLAN
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: 20, opacity: 0.8 }}>
                    Get access to premium features and unlimited resources
                  </div>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ 
                      background: '#fff', 
                      borderColor: '#fff',
                      color: '#1e40af',
                      fontWeight: 'bold'
                    }}
                  >
                    14-Day Free Trial
                  </Button>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Avatar size={120} style={{ background: 'rgba(255,255,255,0.2)' }}>
                    👩‍💼
                  </Avatar>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Daily Meeting" extra={<Badge count={5} />}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>26 People</Text>
              <Text type="secondary" style={{ marginLeft: 16 }}>9:00 PM</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Avatar.Group maxCount={4}>
                <Avatar>👨‍💻</Avatar>
                <Avatar>👩‍💼</Avatar>
                <Avatar>👨‍🎨</Avatar>
                <Avatar>👩‍💻</Avatar>
                <Avatar>👨‍🔬</Avatar>
              </Avatar.Group>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>They will conduct the meeting</Text>
            </div>
            <Button type="primary" block>
              Click for meeting link
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdvancedDashboard
