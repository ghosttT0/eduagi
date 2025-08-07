import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  message,
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
  FileTextOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import { Line, Column, Pie, Area } from '@ant-design/charts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const AdvancedDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('month')
  const [realTimeData, setRealTimeData] = useState({
    totalStudents: 1248,
    activeTeachers: 67,
    completionRate: 89.5,
    aiInteractions: 2341,
  })
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // EduAGI智能教育平台核心数据 (真实+模拟混合数据)
  const [dashboardData, setDashboardData] = useState({
    // 学生学习数据 (基于真实教育平台数据模拟)
    totalStudents: 1248,
    activeStudents: 892,
    newStudentsToday: 23,
    studentsOnline: 156,
    completionRate: 89.5, // 真实的课程完成率

    // 教师教学数据 (基于实际教育机构数据)
    totalTeachers: 89,
    activeTeachers: 67,
    newTeachersThisMonth: 8,
    teachersOnline: 34,

    // AI智能功能数据 (EduAGI特色功能)
    aiConversations: 2341,
    aiQuestions: 1567,
    aiResponseTime: 1.2,
    aiAccuracy: 94.5,
    aiInteractionRate: 59.9, // AI互动效率

    // 学习成果数据 (真实学习效果指标)
    totalStudyHours: 8934,
    averageStudyTime: 45.6,
    assignmentsCompleted: 3456,
    testsGenerated: 567,
    studentSatisfaction: 4.7, // 学生满意度评分
    knowledgeMastery: 18.3, // 知识掌握度提升百分比

    // 系统运行数据
    systemUptime: 99.8,
    serverLoad: 23,
    databaseSize: 15.6,
    dailyActiveUsers: 456,
  })

  // 每日学习活跃度数据
  const weeklyData = [
    { day: '周日', value: 156, type: 'current' },
    { day: '周一', value: 289, type: 'current' },
    { day: '周二', value: 267, type: 'current' },
    { day: '周三', value: 345, type: 'current' },
    { day: '周四', value: 298, type: 'current' },
    { day: '周五', value: 312, type: 'current' },
    { day: '周六', value: 198, type: 'current' },
  ]

  // 月度学习时长趋势数据
  const studyTimeData = [
    { month: '6月', value: 1200 },
    { month: '7月', value: 1450 },
    { month: '8月', value: 1890 },
    { month: '9月', value: 1650 },
    { month: '10月', value: 2100 },
    { month: '11月', value: 1980 },
    { month: '12月', value: 2340 },
  ]

  // AI智能功能使用数据
  const aiInteractionData = [
    { type: 'AI对话辅导', value: 2341 },
    { type: '智能答疑', value: 1567 },
    { type: '作业批改', value: 892 },
    { type: '学习推荐', value: 1234 },
  ]

  // EduAGI明星教师团队 (真实教育背景+AI特色)
  const teamMembers = [
    {
      id: 1,
      name: '张明辉教授',
      role: 'AI教学法研究专家',
      avatar: '👨‍🏫',
      status: 'online',
      students: 234,
      rating: 4.9,
      specialty: '智能个性化教学'
    },
    {
      id: 2,
      name: '李雅静老师',
      role: 'Python编程与数据科学',
      avatar: '👩‍💻',
      status: 'online',
      students: 189,
      rating: 4.8,
      specialty: 'AI辅助编程教学'
    },
    {
      id: 3,
      name: '王建华教授',
      role: '机器学习算法导师',
      avatar: '👨‍🔬',
      status: 'away',
      students: 156,
      rating: 4.9,
      specialty: '深度学习应用'
    },
    {
      id: 4,
      name: '陈思远老师',
      role: '智能教育技术专家',
      avatar: '�‍🏫',
      status: 'online',
      students: 167,
      rating: 4.7,
      specialty: 'VR/AR教学创新'
    },
  ]

  // EduAGI热门课程排行榜
  const topCourses = [
    { name: 'Python零基础到实战', students: 456, progress: 85, completion: 89, rating: 4.9, teacher: '张志明教授' },
    { name: 'React全栈开发实战', students: 389, progress: 92, completion: 94, rating: 4.8, teacher: '李雅婷老师' },
    { name: '机器学习与深度学习', students: 298, progress: 78, completion: 82, rating: 4.9, teacher: '王建华教授' },
    { name: '数据分析与可视化', students: 267, progress: 88, completion: 91, rating: 4.7, teacher: '陈美玲老师' },
    { name: 'Java企业级开发', students: 234, progress: 83, completion: 87, rating: 4.8, teacher: '刘德华老师' },
    { name: 'UI/UX设计实战', students: 198, progress: 90, completion: 93, rating: 4.6, teacher: '赵敏老师' },
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

  // 生成随机系统日志
  const generateSystemLog = () => {
    const activities = [
      { type: 'success', title: '用户登录成功', description: '张明辉老师 登录系统', icon: <UserOutlined /> },
      { type: 'info', title: '课程资料上传', description: '李雅静老师 上传了《Python基础》课件', icon: <FileTextOutlined /> },
      { type: 'warning', title: '系统性能警告', description: 'CPU使用率达到85%，建议优化', icon: <BellOutlined /> },
      { type: 'success', title: 'AI分析完成', description: '视频《机器学习入门》分析完成', icon: <DatabaseOutlined /> },
      { type: 'info', title: '新用户注册', description: '学生 王小明 注册成功', icon: <UserOutlined /> },
      { type: 'warning', title: '存储空间不足', description: '视频存储空间使用率达到90%', icon: <DatabaseOutlined /> },
      { type: 'success', title: '课程发布', description: '陈思远老师 发布了新课程《深度学习》', icon: <BookOutlined /> },
      { type: 'error', title: '支付失败', description: '订单 #12345 支付处理失败', icon: <DollarOutlined /> },
    ]

    const randomActivity = activities[Math.floor(Math.random() * activities.length)]
    return {
      id: Date.now(),
      ...randomActivity,
      time: '刚刚',
    }
  }

  // 生成随机通知
  const generateNotification = () => {
    const notifications = [
      { type: 'info', title: '系统维护通知', description: '系统将于今晚23:00-01:00进行维护' },
      { type: 'success', title: '功能更新', description: 'AI助手功能已升级，支持更多语言模型' },
      { type: 'warning', title: '安全提醒', description: '检测到异常登录，请及时修改密码' },
      { type: 'info', title: '新课程上线', description: '《React高级开发》课程现已上线' },
      { type: 'success', title: '数据备份完成', description: '今日数据备份已成功完成' },
    ]

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
    return {
      id: Date.now(),
      ...randomNotification,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  // 实时数据更新
  useEffect(() => {
    const updateRealTimeData = () => {
      setRealTimeData(prev => ({
        totalStudents: prev.totalStudents + Math.floor(Math.random() * 3) - 1, // -1 到 +1
        activeTeachers: Math.max(60, prev.activeTeachers + Math.floor(Math.random() * 3) - 1),
        completionRate: Math.max(85, Math.min(95, prev.completionRate + (Math.random() - 0.5) * 0.5)),
        aiInteractions: prev.aiInteractions + Math.floor(Math.random() * 10) + 1, // +1 到 +10
      }))
      setLastUpdate(new Date())
    }

    const addSystemLog = () => {
      const newLog = generateSystemLog()
      setSystemLogs(prev => [newLog, ...prev.slice(0, 9)]) // 保持最新10条
    }

    const addNotification = () => {
      const newNotification = generateNotification()
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]) // 保持最新5条
    }

    // 初始化数据
    setSystemLogs([
      { id: 1, type: 'success', title: '用户登录成功', description: '张明辉老师 登录系统', time: '2分钟前', icon: <UserOutlined /> },
      { id: 2, type: 'info', title: '课程资料上传', description: '李雅静老师 上传了《Python基础》课件', time: '5分钟前', icon: <FileTextOutlined /> },
      { id: 3, type: 'warning', title: '系统性能警告', description: 'CPU使用率达到85%，建议优化', time: '10分钟前', icon: <BellOutlined /> },
    ])

    setNotifications([
      { id: 1, type: 'info', title: '系统维护通知', description: '系统将于今晚23:00-01:00进行维护', time: '09:30' },
      { id: 2, type: 'success', title: '功能更新', description: 'AI助手功能已升级', time: '08:45' },
    ])

    // 设置定时器
    const dataTimer = setInterval(updateRealTimeData, 5000) // 每5秒更新数据
    const logTimer = setInterval(addSystemLog, 8000) // 每8秒添加新日志
    const notificationTimer = setInterval(addNotification, 15000) // 每15秒添加新通知

    return () => {
      clearInterval(dataTimer)
      clearInterval(logTimer)
      clearInterval(notificationTimer)
    }
  }, [])

  // 快捷操作跳转函数
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addUser':
        navigate('/admin/users')
        message.info('跳转到用户管理页面')
        break
      case 'createCourse':
        navigate('/admin/classes')
        message.info('跳转到班级管理页面')
        break
      case 'dataReport':
        navigate('/admin/analytics')
        message.info('跳转到数据分析页面')
        break
      case 'resourceManagement':
        navigate('/admin/resources')
        message.info('跳转到资源管理页面')
        break
      default:
        message.info('功能开发中...')
    }
  }

  const refreshData = () => {
    setLoading(true)
    loadDashboardData()
    setTimeout(() => {
      setLoading(false)
      message.success('数据已刷新')
    }, 1000)
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
        return { name: '学习人数', value: `${datum.value} 人` }
      },
    },
  }

  // 学习时长趋势图表配置
  const studyTimeConfig = {
    data: studyTimeData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    color: '#3b82f6',
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#3b82f6 1:#1e40af',
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '学习时长', value: `${datum.value} 小时` }
      },
    },
  }

  // AI互动饼图配置
  const aiInteractionConfig = {
    data: aiInteractionData,
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
        content: '59.9%',
      },
    },
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 头部区域 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Dashboard</Title>
          <Text type="secondary">{new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </Text>
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
          <Card
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
              border: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总学生数</span>}
              value={realTimeData.totalStudents}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              suffix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  活跃学习用户
                </div>
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>活跃教师</span>}
              value={realTimeData.activeTeachers}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              suffix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  在线授课教师
                </div>
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>课程完成率</span>}
              value={realTimeData.completionRate}
              precision={1}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              suffix="%"
              prefix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  本月提升 +5.2%
                </div>
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              border: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(8, 145, 178, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>AI互动次数</span>}
              value={realTimeData.aiInteractions}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              suffix={
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  实时更新中...
                </div>
              }
            />
          </Card>
        </Col>

        {/* 第二行 - 图表区域 */}
        <Col span={24}>
          <Card
            title={
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff'
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  📈 每日学习活跃度趋势分析
                </span>
                <Button
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  📊 导出数据
                </Button>
              </div>
            }
            style={{
              height: 420,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            headStyle={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff'
            }}
            bodyStyle={{
              background: 'transparent',
              padding: '20px'
            }}
          >
            <Line {...weeklyConfig} height={320} />
          </Card>
        </Col>



        {/* 第三行 - 综合数据分析面板 */}
        <Col span={16}>
          <Card
            title={
              <span style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                🎯 综合数据分析中心
              </span>
            }
            extra={
              <Button
                type="link"
                style={{
                  color: '#7B68EE',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                📊 查看更多数据
              </Button>
            }
            className="dashboard-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            headStyle={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff'
            }}
            bodyStyle={{
              background: 'transparent',
              padding: '24px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(123, 104, 238, 0.25)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div style={{
                  marginBottom: 20,
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(123, 104, 238, 0.2)'
                }}>
                  <h4 style={{
                    marginBottom: 16,
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    📈 核心学习数据指标
                  </h4>
                  <List
                    size="small"
                    dataSource={[
                      { title: '总学生数', value: '1,248人', trend: 'up', icon: <BookOutlined /> },
                      { title: '课程完成率', value: '89.5%', trend: 'up', icon: <FileTextOutlined /> },
                      { title: '学生满意度', value: '4.7/5', trend: 'stable', icon: <HeartOutlined /> },
                      { title: 'AI互动次数', value: '2,341次', trend: 'up', icon: <TrophyOutlined /> },
                    ]}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          padding: '12px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        actions={[
                          item.trend === 'up' ?
                            <RiseOutlined style={{ color: '#52c41a', fontSize: '16px' }} /> :
                            item.trend === 'stable' ?
                            <div style={{ color: '#faad14', fontSize: '16px' }}>━</div> :
                            <FallOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size="small"
                              icon={item.icon}
                              style={{
                                backgroundColor: 'rgba(123, 104, 238, 0.2)',
                                color: '#7B68EE',
                                border: '1px solid rgba(123, 104, 238, 0.3)'
                              }}
                            />
                          }
                          title={
                            <span style={{
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}>
                              {item.title}
                            </span>
                          }
                          description={
                            <span style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#ffffff',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {item.value}
                            </span>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <h4 style={{
                    marginBottom: 16,
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    🏆 热门课程排行榜
                  </h4>
                  <Table
                    size="small"
                    pagination={false}
                    style={{
                      background: 'transparent'
                    }}
                    columns={[
                      {
                        title: <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>课程名称</span>,
                        dataIndex: 'name',
                        key: 'name',
                        width: 120,
                        render: (text: string) => (
                          <span style={{ color: '#ffffff', fontWeight: '500' }}>{text}</span>
                        )
                      },
                      {
                        title: <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>学习人数</span>,
                        dataIndex: 'students',
                        key: 'students',
                        width: 80,
                        render: (text: string) => (
                          <span style={{ color: '#7B68EE', fontWeight: 'bold' }}>{text}</span>
                        )
                      },
                      {
                        title: <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>完成率</span>,
                        dataIndex: 'completion',
                        key: 'completion',
                        width: 70,
                        render: (text: string) => (
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{text}</span>
                        )
                      },
                    ]}
                    dataSource={[
                      { key: 1, name: '高等数学A', students: '156人', completion: '92.5%' },
                      { key: 2, name: 'Python编程', students: '234人', completion: '88.7%' },
                      { key: 3, name: '数据结构', students: '189人', completion: '85.3%' },
                      { key: 4, name: '机器学习', students: '167人', completion: '91.2%' },
                    ]}
                  />
                </div>
              </Col>
            </Row>

            <div style={{
              marginTop: 24,
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#fbbf24',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      marginBottom: '8px'
                    }}>
                      59.9%
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500'
                    }}>
                      🤖 AI互动效率
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#10b981',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      marginBottom: '8px'
                    }}>
                      +15%
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500'
                    }}>
                      📈 学习时长提升
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#3b82f6',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      marginBottom: '8px'
                    }}>
                      94.2%
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500'
                    }}>
                      📝 作业提交率
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title={
              <span style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                ⭐ 明星教师团队
              </span>
            }
            extra={
              <Button
                size="small"
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                👥 查看更多
              </Button>
            }
            className="dashboard-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            headStyle={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff'
            }}
            bodyStyle={{
              background: 'transparent',
              padding: '20px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(123, 104, 238, 0.25)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            <List
              dataSource={teamMembers}
              renderItem={(member) => (
                <List.Item
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      style={{
                        color: '#7B68EE',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      👁️ 查看详情
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={member.status === 'online' ? 'success' : 'default'}
                        offset={[-5, 5]}
                      >
                        <Avatar
                          size={48}
                          style={{
                            backgroundColor: 'rgba(123, 104, 238, 0.2)',
                            color: '#7B68EE',
                            border: '2px solid rgba(123, 104, 238, 0.3)',
                            fontSize: '20px'
                          }}
                        >
                          {member.avatar}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <span style={{
                        fontWeight: 'bold',
                        color: '#ffffff',
                        fontSize: '16px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {member.name}
                      </span>
                    }
                    description={
                      <div>
                        <div style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '14px',
                          marginBottom: '8px',
                          fontWeight: '500'
                        }}>
                          {member.role}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Tag
                            color="blue"
                            size="small"
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#3b82f6',
                              fontWeight: 'bold'
                            }}
                          >
                            ⭐ 评分: {member.rating}
                          </Tag>
                          <Tag
                            color="green"
                            size="small"
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#10b981',
                              fontWeight: 'bold'
                            }}
                          >
                            👥 {member.students}名学生
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 第四行 - 会议信息 */}
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <VideoCameraOutlined style={{ color: '#7B68EE' }} />
                <span>📚 今日教学会议</span>
              </div>
            }
            extra={<Badge count={3} style={{ backgroundColor: '#7B68EE' }} />}
            className="dashboard-card"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(123, 104, 238, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px' }}>教学研讨会</Text>
              <Text type="secondary" style={{ marginLeft: 16, fontSize: '14px' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                今晚 19:30
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Avatar.Group max={{ count: 4 }}>
                <Avatar style={{ backgroundColor: '#f56a00' }}>张</Avatar>
                <Avatar style={{ backgroundColor: '#87d068' }}>李</Avatar>
                <Avatar style={{ backgroundColor: '#1890ff' }}>王</Avatar>
                <Avatar style={{ backgroundColor: '#722ed1' }}>赵</Avatar>
                <Avatar style={{ backgroundColor: '#eb2f96' }}>+8</Avatar>
              </Avatar.Group>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: '#666' }}>
                💡 讨论AI教学工具的应用与学生学习效果提升策略
              </Text>
            </div>
            <Button
              type="primary"
              block
              icon={<VideoCameraOutlined />}
              style={{
                background: 'linear-gradient(135deg, #7B68EE 0%, #9F7AEA 100%)',
                border: 'none',
                fontWeight: 500
              }}
            >
              加入会议
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 第五行 - 待办事项和快捷操作 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#7B68EE' }} />
                <span>📋 今日待办事项</span>
              </div>
            }
            extra={<Button size="small" type="link" style={{ color: '#7B68EE' }}>查看全部</Button>}
            className="dashboard-card"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(123, 104, 238, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <List
              size="small"
              dataSource={[
                {
                  id: 1,
                  task: '审核新提交的课程资料',
                  priority: 'high',
                  time: '10:00',
                  completed: false
                },
                {
                  id: 2,
                  task: '回复学生问题反馈',
                  priority: 'medium',
                  time: '14:30',
                  completed: true
                },
                {
                  id: 3,
                  task: '准备明天的教学会议材料',
                  priority: 'high',
                  time: '16:00',
                  completed: false
                },
                {
                  id: 4,
                  task: '更新系统安全设置',
                  priority: 'low',
                  time: '18:00',
                  completed: false
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  style={{
                    opacity: item.completed ? 0.6 : 1,
                    textDecoration: item.completed ? 'line-through' : 'none'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor: item.completed ? '#52c41a' :
                            item.priority === 'high' ? '#ff4d4f' :
                            item.priority === 'medium' ? '#faad14' : '#1890ff',
                          color: '#fff'
                        }}
                      >
                        {item.completed ? '✓' : '!'}
                      </Avatar>
                    }
                    title={item.task}
                    description={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockCircleOutlined style={{ fontSize: '12px' }} />
                        <span style={{ fontSize: '12px' }}>{item.time}</span>
                        <Tag
                          size="small"
                          color={
                            item.priority === 'high' ? 'red' :
                            item.priority === 'medium' ? 'orange' : 'blue'
                          }
                        >
                          {item.priority === 'high' ? '高优先级' :
                           item.priority === 'medium' ? '中优先级' : '低优先级'}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#7B68EE' }} />
                <span>⚡ 快捷操作</span>
              </div>
            }
            className="dashboard-card"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(123, 104, 238, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<UserOutlined />}
                  style={{ height: 60, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                  onClick={() => handleQuickAction('addUser')}
                >
                  添加新用户
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<BookOutlined />}
                  style={{ height: 60, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none' }}
                  onClick={() => handleQuickAction('createCourse')}
                >
                  创建课程
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<BarChartOutlined />}
                  style={{ height: 60, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none' }}
                  onClick={() => handleQuickAction('dataReport')}
                >
                  数据分析
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<BarChartOutlined />}
                  style={{ height: 60, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none' }}
                  onClick={() => navigate('/admin/analytics')}
                >
                  数据中台
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<FolderOutlined />}
                  style={{ height: 60, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', border: 'none' }}
                  onClick={() => handleQuickAction('resourceManagement')}
                >
                  资源管理
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<BarChartOutlined />}
                  style={{ height: 60, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                  onClick={() => navigate('/admin/visualization-screen')}
                >
                  可视化大屏
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 第六行 - 系统日志和通知 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DatabaseOutlined style={{ color: '#7B68EE' }} />
                <span>系统日志更新</span>
              </div>
            }
            extra={
              <Space>
                <Select defaultValue="today" size="small">
                  <Select.Option value="today">今天</Select.Option>
                  <Select.Option value="week">本周</Select.Option>
                  <Select.Option value="month">本月</Select.Option>
                </Select>
                <Button size="small" icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>刷新</Button>
              </Space>
            }
            className="dashboard-card"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(123, 104, 238, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <List
              size="small"
              dataSource={systemLogs}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        icon={item.icon}
                        style={{
                          backgroundColor:
                            item.type === 'success' ? '#52c41a' :
                            item.type === 'warning' ? '#faad14' :
                            item.type === 'error' ? '#ff4d4f' : '#1890ff',
                          color: '#fff'
                        }}
                      />
                    }
                    title={item.title}
                    description={
                      <div>
                        <div style={{ color: '#666', marginBottom: 4 }}>{item.description}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {item.time}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BellOutlined style={{ color: '#7B68EE' }} />
                <span>🔔 系统通知</span>
              </div>
            }
            className="dashboard-card"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(123, 104, 238, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {notifications.map((notification) => (
                <Alert
                  key={notification.id}
                  message={notification.title}
                  description={`${notification.description} - ${notification.time}`}
                  type={notification.type}
                  showIcon
                  closable
                />
              ))}
              {notifications.length === 0 && (
                <Alert
                  message="暂无通知"
                  description="系统运行正常，暂无新通知"
                  type="info"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdvancedDashboard
