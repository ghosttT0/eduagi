import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Progress, Statistic, Badge, Table, Button } from 'antd'
import { FullscreenOutlined } from '@ant-design/icons'
import { Line, Column, Pie, Area, Gauge } from '@ant-design/charts'
import { useNavigate } from 'react-router-dom'
import './DataVisualization.css'

const { Title, Text } = Typography

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate()
  const [realTimeData, setRealTimeData] = useState({
    totalUsers: 12480,
    activeUsers: 8920,
    systemLoad: 67.5,
    networkSpeed: 245.6,
    dataProcessed: 1.2,
    aiAccuracy: 94.8,
    onlineTeachers: 234,
    coursesActive: 567
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  // 实时数据更新
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeData(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 10) - 5,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
        systemLoad: Math.max(50, Math.min(90, prev.systemLoad + (Math.random() - 0.5) * 5)),
        networkSpeed: Math.max(200, Math.min(300, prev.networkSpeed + (Math.random() - 0.5) * 20)),
        dataProcessed: Math.max(0.8, Math.min(2.0, prev.dataProcessed + (Math.random() - 0.5) * 0.1)),
        aiAccuracy: Math.max(90, Math.min(98, prev.aiAccuracy + (Math.random() - 0.5) * 0.5)),
        onlineTeachers: Math.max(200, Math.min(300, prev.onlineTeachers + Math.floor(Math.random() * 6) - 3)),
        coursesActive: Math.max(500, Math.min(600, prev.coursesActive + Math.floor(Math.random() * 8) - 4))
      }))
      setCurrentTime(new Date())
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  // 地区数据分布
  const regionData = [
    { region: '华东地区', value: 3456, percentage: 28.5, color: '#00f2fe' },
    { region: '华南地区', value: 2890, percentage: 23.8, color: '#4facfe' },
    { region: '华北地区', value: 2234, percentage: 18.4, color: '#00c9ff' },
    { region: '西南地区', value: 1567, percentage: 12.9, color: '#92fe9d' },
    { region: '华中地区', value: 1234, percentage: 10.2, color: '#ff9a9e' },
    { region: '西北地区', value: 789, percentage: 6.5, color: '#ffecd2' }
  ]

  // 实时流量数据
  const trafficData = [
    { time: '00:00', value: 156, type: '学习访问' },
    { time: '02:00', value: 89, type: '学习访问' },
    { time: '04:00', value: 67, type: '学习访问' },
    { time: '06:00', value: 234, type: '学习访问' },
    { time: '08:00', value: 567, type: '学习访问' },
    { time: '10:00', value: 789, type: '学习访问' },
    { time: '12:00', value: 892, type: '学习访问' },
    { time: '14:00', value: 756, type: '学习访问' },
    { time: '16:00', value: 634, type: '学习访问' },
    { time: '18:00', value: 823, type: '学习访问' },
    { time: '20:00', value: 945, type: '学习访问' },
    { time: '22:00', value: 678, type: '学习访问' }
  ]

  // 系统性能数据
  const performanceData = [
    { metric: 'CPU使用率', value: realTimeData.systemLoad, color: '#3b82f6' },
    { metric: '内存使用率', value: 78.2, color: '#10b981' },
    { metric: '磁盘使用率', value: 45.8, color: '#f59e0b' },
    { metric: '网络带宽', value: 89.3, color: '#ef4444' }
  ]

  // 学习效果分析数据
  const learningData = [
    { subject: '深度学习', score: 89.2, students: 1456 },
    { subject: '机器学习', score: 91.5, students: 1789 },
    { subject: '数据结构', score: 94.3, students: 2234 },
    { subject: '算法设计', score: 87.8, students: 1567 },
    { subject: '计算机网络', score: 85.6, students: 1234 },
    { subject: '操作系统', score: 88.9, students: 1098 },
    { subject: '数据库', score: 92.1, students: 1345 }
  ]

  // 热门课程排行
  const topCourses = [
    { rank: 1, name: '深度学习与神经网络', students: 2456, completion: 89.5, trend: '↑' },
    { rank: 2, name: '机器学习算法实战', students: 2134, completion: 92.3, trend: '↑' },
    { rank: 3, name: '数据结构与算法', students: 1987, completion: 94.1, trend: '↑' },
    { rank: 4, name: '计算机网络原理', students: 1567, completion: 87.8, trend: '↓' },
    { rank: 5, name: '操作系统设计', students: 1234, completion: 91.2, trend: '↑' },
    { rank: 6, name: '数据库系统设计', students: 1098, completion: 88.9, trend: '→' },
    { rank: 7, name: 'Python高级编程', students: 987, completion: 93.4, trend: '↑' }
  ]

  // 教师使用统计数据
  const teacherUsageData = {
    today: { active: 156, total: 234, usage: 67 },
    thisWeek: { active: 198, total: 234, usage: 85 },
    dailyUsage: [
      { day: '周一', count: 145 },
      { day: '周二', count: 167 },
      { day: '周三', count: 189 },
      { day: '周四', count: 198 },
      { day: '周五', count: 176 },
      { day: '周六', count: 134 },
      { day: '周日', count: 112 }
    ]
  }

  // 学生使用统计数据
  const studentUsageData = {
    today: { active: 2156, total: 3456, usage: 62 },
    thisWeek: { active: 2890, total: 3456, usage: 84 },
    dailyUsage: [
      { day: '周一', count: 2145 },
      { day: '周二', count: 2367 },
      { day: '周三', count: 2589 },
      { day: '周四', count: 2890 },
      { day: '周五', count: 2676 },
      { day: '周六', count: 2234 },
      { day: '周日', count: 1987 }
    ]
  }

  // 教学效率指数数据
  const teachingEfficiencyData = {
    preparationTime: { average: 45, trend: -8 }, // 备课耗时(分钟)
    correctionTime: { average: 32, trend: -12 }, // 修正耗时(分钟)
    exerciseDesignTime: { average: 28, trend: -5 }, // 课后练习设计耗时(分钟)
    courseOptimization: [
      { subject: '深度学习', passRate: 72, trend: 'up', issue: '神经网络架构设计理解提升' },
      { subject: '机器学习', passRate: 68, trend: 'down', issue: '特征工程实践能力需加强' },
      { subject: '算法设计', passRate: 85, trend: 'up', issue: '动态规划掌握情况良好' },
      { subject: '数据库', passRate: 76, trend: 'up', issue: 'SQL优化技能有所提升' },
      { subject: '计算机网络', passRate: 63, trend: 'down', issue: '网络协议理解需要加强' }
    ]
  }

  // 学生学习效果数据
  const learningEffectData = {
    averageAccuracy: [
      { month: '1月', rate: 72 },
      { month: '2月', rate: 75 },
      { month: '3月', rate: 78 },
      { month: '4月', rate: 81 },
      { month: '5月', rate: 83 },
      { month: '6月', rate: 85 }
    ],
    knowledgePoints: [
      { point: '深度学习基础', mastery: 89, difficulty: 'hard' },
      { point: '机器学习算法', mastery: 82, difficulty: 'medium' },
      { point: '数据结构与算法', mastery: 91, difficulty: 'medium' },
      { point: '计算机网络', mastery: 76, difficulty: 'medium' },
      { point: '操作系统原理', mastery: 68, difficulty: 'hard' },
      { point: 'Python编程', mastery: 94, difficulty: 'easy' },
      { point: '数据库设计', mastery: 73, difficulty: 'medium' }
    ],
    frequentErrors: [
      { error: '神经网络反向传播', frequency: 287, subject: '深度学习' },
      { error: '决策树剪枝策略', frequency: 234, subject: '机器学习' },
      { error: '动态规划状态转移', frequency: 198, subject: '算法设计' },
      { error: 'TCP/UDP协议区别', frequency: 176, subject: '计算机网络' },
      { error: '进程线程同步机制', frequency: 154, subject: '操作系统' },
      { error: 'SQL查询优化', frequency: 132, subject: '数据库' }
    ]
  }

  const trafficConfig = {
    data: trafficData,
    xField: 'time',
    yField: 'value',
    smooth: true,
    color: '#00f2fe',
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#00f2fe',
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
    areaStyle: {
      fill: 'l(270) 0:#00f2fe 0.5:#4facfe 1:rgba(79, 172, 254, 0.1)',
    },
  }

  const regionConfig = {
    data: regionData,
    angleField: 'value',
    colorField: 'region',
    radius: 0.8,
    innerRadius: 0.6,
    color: regionData.map(item => item.color),
    label: {
      type: 'inner',
      content: '{name}\n{percentage}%',
      style: {
        fontSize: 11,
        fill: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      },
    },
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fill: '#ffffff'
        }
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.region,
          value: `${datum.value}人 (${datum.percentage}%)`
        }
      }
    }
  }

  const learningConfig = {
    data: learningData,
    xField: 'subject',
    yField: 'score',
    color: '#10b981',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  }

  return (
    <div className="data-visualization">
      {/* 头部标题 */}
      <div className="header">
        <div className="header-content">
          <Title level={1} className="main-title">
            EduAGI 智能教育数据中台
          </Title>
          <div className="subtitle">
            <Text className="date-text">
              {currentTime.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </Text>
            <Text className="time-text">
              实时更新: {currentTime.toLocaleTimeString('zh-CN')}
            </Text>
          </div>
        </div>
        <div className="header-actions">
          <Button
            type="primary"
            size="large"
            icon={<FullscreenOutlined />}
            onClick={() => navigate('/admin/visualization-screen')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              height: '48px',
              padding: '0 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginRight: '20px'
            }}
          >
            进入可视化大屏
          </Button>
          <div className="status-indicators">
            <Badge status="processing" text="系统运行中" />
            <Badge status="success" text="数据同步正常" />
            <Badge status="warning" text="高负载预警" />
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[24, 24]} className="metrics-row">
        <Col span={4}>
          <Card className="metric-card metric-card-1">
            <div className="metric-content">
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <div className="metric-value">{realTimeData.totalUsers.toLocaleString()}</div>
                <div className="metric-label">总用户数</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="metric-card metric-card-2">
            <div className="metric-content">
              <div className="metric-icon">🔥</div>
              <div className="metric-info">
                <div className="metric-value">{realTimeData.activeUsers.toLocaleString()}</div>
                <div className="metric-label">活跃用户</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="metric-card metric-card-3">
            <div className="metric-content">
              <div className="metric-icon">⚡</div>
              <div className="metric-info">
                <div className="metric-value">{realTimeData.systemLoad.toFixed(1)}%</div>
                <div className="metric-label">系统负载</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="metric-card metric-card-4">
            <div className="metric-content">
              <div className="metric-icon">🌐</div>
              <div className="metric-info">
                <div className="metric-value">{realTimeData.networkSpeed.toFixed(1)}MB/s</div>
                <div className="metric-label">网络速度</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="metric-card metric-card-5">
            <div className="metric-content">
              <div className="metric-icon">👨‍🏫</div>
              <div className="metric-info">
                <div className="metric-value">{realTimeData.onlineTeachers}</div>
                <div className="metric-label">在线教师</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="metric-card metric-card-6">
            <div className="metric-content">
              <div className="metric-icon">🎯</div>
              <div className="metric-info">
                <div className="metric-value">{realTimeData.aiAccuracy.toFixed(1)}%</div>
                <div className="metric-label">AI准确率</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col span={16}>
          <Card className="chart-card" title="实时学习流量监控">
            <Area {...trafficConfig} height={300} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="chart-card" title="用户地区分布">
            <Pie {...regionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="charts-row">
        <Col span={8}>
          <Card className="chart-card" title="学科成绩分析">
            <Column {...learningConfig} height={280} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="chart-card" title="系统性能监控">
            <div className="performance-grid">
              {performanceData.map((item, index) => (
                <div key={index} className="performance-item">
                  <div className="performance-label">{item.metric}</div>
                  <Progress
                    type="circle"
                    percent={item.value}
                    size={80}
                    strokeColor={item.color}
                    format={(percent) => `${percent?.toFixed(1)}%`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="chart-card" title="热门课程排行榜">
            <Table
              dataSource={topCourses}
              pagination={false}
              size="small"
              className="ranking-table"
              columns={[
                {
                  title: '排名',
                  dataIndex: 'rank',
                  key: 'rank',
                  width: 60,
                  render: (rank: number) => (
                    <div className={`rank-badge rank-${rank}`}>
                      {rank}
                    </div>
                  )
                },
                {
                  title: '课程名称',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true
                },
                {
                  title: '学员数',
                  dataIndex: 'students',
                  key: 'students',
                  width: 80,
                  render: (students: number) => students.toLocaleString()
                },
                {
                  title: '完成率',
                  dataIndex: 'completion',
                  key: 'completion',
                  width: 80,
                  render: (completion: number) => `${completion}%`
                },
                {
                  title: '趋势',
                  dataIndex: 'trend',
                  key: 'trend',
                  width: 60,
                  render: (trend: string) => (
                    <span className={`trend-indicator trend-${trend === '↑' ? 'up' : trend === '↓' ? 'down' : 'stable'}`}>
                      {trend}
                    </span>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 教师使用统计 */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col span={12}>
          <Card className="chart-card" title="教师使用次数统计/活跃板块">
            <div className="usage-stats">
              <div className="usage-summary">
                <div className="usage-item">
                  <span className="usage-label">当日活跃:</span>
                  <span className="usage-value">{teacherUsageData.today.active}/{teacherUsageData.today.total}</span>
                  <span className="usage-percent">({teacherUsageData.today.usage}%)</span>
                </div>
                <div className="usage-item">
                  <span className="usage-label">本周活跃:</span>
                  <span className="usage-value">{teacherUsageData.thisWeek.active}/{teacherUsageData.thisWeek.total}</span>
                  <span className="usage-percent">({teacherUsageData.thisWeek.usage}%)</span>
                </div>
              </div>
              <Column
                data={teacherUsageData.dailyUsage}
                xField="day"
                yField="count"
                height={200}
                color="#3b82f6"
                columnStyle={{
                  radius: [4, 4, 0, 0],
                }}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="chart-card" title="学生使用次数统计/活跃板块">
            <div className="usage-stats">
              <div className="usage-summary">
                <div className="usage-item">
                  <span className="usage-label">当日活跃:</span>
                  <span className="usage-value">{studentUsageData.today.active.toLocaleString()}/{studentUsageData.today.total.toLocaleString()}</span>
                  <span className="usage-percent">({studentUsageData.today.usage}%)</span>
                </div>
                <div className="usage-item">
                  <span className="usage-label">本周活跃:</span>
                  <span className="usage-value">{studentUsageData.thisWeek.active.toLocaleString()}/{studentUsageData.thisWeek.total.toLocaleString()}</span>
                  <span className="usage-percent">({studentUsageData.thisWeek.usage}%)</span>
                </div>
              </div>
              <Column
                data={studentUsageData.dailyUsage}
                xField="day"
                yField="count"
                height={200}
                color="#10b981"
                columnStyle={{
                  radius: [4, 4, 0, 0],
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 教学效率指数 */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col span={12}>
          <Card className="chart-card" title="教学效率指数">
            <div className="efficiency-metrics">
              <div className="efficiency-item">
                <div className="efficiency-label">备课与修正耗时</div>
                <div className="efficiency-value">
                  {teachingEfficiencyData.preparationTime.average}分钟
                  <span className={`trend ${teachingEfficiencyData.preparationTime.trend < 0 ? 'down' : 'up'}`}>
                    {teachingEfficiencyData.preparationTime.trend > 0 ? '+' : ''}{teachingEfficiencyData.preparationTime.trend}
                  </span>
                </div>
              </div>
              <div className="efficiency-item">
                <div className="efficiency-label">课后练习设计与修正耗时</div>
                <div className="efficiency-value">
                  {teachingEfficiencyData.exerciseDesignTime.average}分钟
                  <span className={`trend ${teachingEfficiencyData.exerciseDesignTime.trend < 0 ? 'down' : 'up'}`}>
                    {teachingEfficiencyData.exerciseDesignTime.trend > 0 ? '+' : ''}{teachingEfficiencyData.exerciseDesignTime.trend}
                  </span>
                </div>
              </div>
              <div className="efficiency-item">
                <div className="efficiency-label">修正耗时</div>
                <div className="efficiency-value">
                  {teachingEfficiencyData.correctionTime.average}分钟
                  <span className={`trend ${teachingEfficiencyData.correctionTime.trend < 0 ? 'down' : 'up'}`}>
                    {teachingEfficiencyData.correctionTime.trend > 0 ? '+' : ''}{teachingEfficiencyData.correctionTime.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="chart-card" title="课程优化方向">
            <Table
              dataSource={teachingEfficiencyData.courseOptimization}
              pagination={false}
              size="small"
              columns={[
                {
                  title: '学科',
                  dataIndex: 'subject',
                  key: 'subject',
                  width: 80
                },
                {
                  title: '通过率',
                  dataIndex: 'passRate',
                  key: 'passRate',
                  width: 80,
                  render: (rate: number) => `${rate}%`
                },
                {
                  title: '趋势',
                  dataIndex: 'trend',
                  key: 'trend',
                  width: 60,
                  render: (trend: string) => (
                    <span className={`trend-indicator trend-${trend}`}>
                      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                    </span>
                  )
                },
                {
                  title: '问题分析',
                  dataIndex: 'issue',
                  key: 'issue',
                  ellipsis: true
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 学生学习效果 */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col span={12}>
          <Card className="chart-card" title="平均正确率趋势">
            <Line
              data={learningEffectData.averageAccuracy}
              xField="month"
              yField="rate"
              height={250}
              smooth={true}
              color="#f59e0b"
              point={{
                size: 5,
                shape: 'circle',
                style: {
                  fill: '#f59e0b',
                  stroke: '#ffffff',
                  lineWidth: 2,
                },
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="chart-card" title="知识点掌握情况">
            <Table
              dataSource={learningEffectData.knowledgePoints}
              pagination={false}
              size="small"
              columns={[
                {
                  title: '知识点',
                  dataIndex: 'point',
                  key: 'point',
                  width: 120
                },
                {
                  title: '掌握度',
                  dataIndex: 'mastery',
                  key: 'mastery',
                  width: 100,
                  render: (mastery: number) => (
                    <Progress
                      percent={mastery}
                      size="small"
                      strokeColor={mastery >= 80 ? '#52c41a' : mastery >= 60 ? '#faad14' : '#ff4d4f'}
                    />
                  )
                },
                {
                  title: '难度',
                  dataIndex: 'difficulty',
                  key: 'difficulty',
                  width: 80,
                  render: (difficulty: string) => (
                    <span className={`difficulty-tag difficulty-${difficulty}`}>
                      {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 高频错误知识点 */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col span={24}>
          <Card className="chart-card" title="高频错误知识点统计">
            <Table
              dataSource={learningEffectData.frequentErrors}
              pagination={false}
              size="middle"
              columns={[
                {
                  title: '排名',
                  key: 'rank',
                  width: 80,
                  render: (_, __, index) => (
                    <div className={`rank-badge rank-${index + 1}`}>
                      {index + 1}
                    </div>
                  )
                },
                {
                  title: '错误类型',
                  dataIndex: 'error',
                  key: 'error',
                  width: 200
                },
                {
                  title: '学科',
                  dataIndex: 'subject',
                  key: 'subject',
                  width: 100,
                  render: (subject: string) => (
                    <span className={`subject-tag subject-${subject}`}>
                      {subject}
                    </span>
                  )
                },
                {
                  title: '错误频次',
                  dataIndex: 'frequency',
                  key: 'frequency',
                  width: 120,
                  render: (frequency: number) => (
                    <div className="frequency-display">
                      <span className="frequency-number">{frequency}</span>
                      <Progress
                        percent={(frequency / 250) * 100}
                        size="small"
                        showInfo={false}
                        strokeColor="#ff4d4f"
                      />
                    </div>
                  )
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 120,
                  render: () => (
                    <Button type="link" size="small">
                      查看详情
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AnalyticsPage
