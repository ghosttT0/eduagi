import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Progress } from 'antd'
import { Line, Column, Pie, Area, Radar } from '@ant-design/charts'
import './DataVisualizationScreen.css'

const { Title, Text } = Typography

const DataVisualizationScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [realTimeData, setRealTimeData] = useState({
    onlineStudents: 2190,
    activeTeachers: 190,
    totalCourses: 3001,
    examSessions: 108,
    cpuUsage: 75,
    memoryUsage: 68,
    networkTraffic: 45
  })

  // 实时数据更新
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeData(prev => ({
        onlineStudents: Math.max(2000, Math.min(2500, prev.onlineStudents + Math.floor(Math.random() * 20) - 10)),
        activeTeachers: Math.max(180, Math.min(200, prev.activeTeachers + Math.floor(Math.random() * 4) - 2)),
        totalCourses: Math.max(2900, Math.min(3100, prev.totalCourses + Math.floor(Math.random() * 6) - 3)),
        examSessions: Math.max(100, Math.min(120, prev.examSessions + Math.floor(Math.random() * 4) - 2)),
        cpuUsage: Math.max(60, Math.min(85, prev.cpuUsage + Math.floor(Math.random() * 6) - 3)),
        memoryUsage: Math.max(60, Math.min(80, prev.memoryUsage + Math.floor(Math.random() * 4) - 2)),
        networkTraffic: Math.max(30, Math.min(60, prev.networkTraffic + Math.floor(Math.random() * 6) - 3))
      }))
      setCurrentTime(new Date())
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  // 课程状态数据
  const courseStatus = [
    { name: '数据结构与算法', status: '进行中', icon: '🔥', color: '#ff6b6b' },
    { name: '机器学习基础', status: '准备中', icon: '🤖', color: '#4ecdc4' },
    { name: 'Web开发实战', status: '进行中', icon: '🌐', color: '#45b7d1' },
    { name: '移动应用开发', status: '已完成', icon: '📱', color: '#96ceb4' }
  ]

  // 学习趋势数据
  const learningTrendData = [
    { month: '1月', value: 1200 },
    { month: '2月', value: 1350 },
    { month: '3月', value: 1480 },
    { month: '4月', value: 1620 },
    { month: '5月', value: 1750 },
    { month: '6月', value: 1890 },
    { month: '7月', value: 2020 },
    { month: '8月', value: 2180 },
    { month: '9月', value: 2340 },
    { month: '10月', value: 2480 },
    { month: '11月', value: 2620 },
    { month: '12月', value: 2780 }
  ]

  // 学习效果雷达数据
  const radarData = [
    { item: '理论掌握', score: 85 },
    { item: '实践能力', score: 78 },
    { item: '创新思维', score: 82 },
    { item: '团队协作', score: 90 },
    { item: '问题解决', score: 88 },
    { item: '学习态度', score: 92 }
  ]

  // 成绩分布数据
  const gradeDistributionData = [
    { grade: '优秀(90-100)', count: 450, percentage: 25 },
    { grade: '良好(80-89)', count: 720, percentage: 40 },
    { grade: '中等(70-79)', count: 450, percentage: 25 },
    { grade: '及格(60-69)', count: 180, percentage: 10 }
  ]

  // 图表配置
  const trendConfig = {
    data: learningTrendData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    color: '#00d4ff',
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: '#00d4ff',
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
    areaStyle: {
      fill: 'l(270) 0:#00d4ff 0.5:#4facfe 1:rgba(79, 172, 254, 0.1)',
    },
  }

  const radarConfig = {
    data: radarData,
    xField: 'item',
    yField: 'score',
    color: '#ff6b6b',
    area: {
      style: {
        fill: 'rgba(255, 107, 107, 0.2)',
      },
    },
    point: {
      size: 4,
      style: {
        fill: '#ff6b6b',
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
  }

  const gradeConfig = {
    data: gradeDistributionData,
    angleField: 'count',
    colorField: 'grade',
    radius: 0.8,
    innerRadius: 0.6,
    color: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
    label: {
      content: '{name}: {percentage}%',
      style: {
        fontSize: 12,
        fill: '#ffffff',
        fontWeight: 'bold'
      },
    },
  }

  return (
    <div className="dashboard-container">
      {/* 头部标题 */}
      <header className="dashboard-header">
        <h1 className="main-title">
          🎓 智能教育数据监控平台
        </h1>
        <p className="subtitle">
          实时数据 · 智能分析 · 精准决策 · 未来教育
        </p>
      </header>

      {/* 实时统计概览 */}
      <section className="stats-overview">
        <h2 className="section-title">📊 实时统计概览</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{realTimeData.onlineStudents.toLocaleString()}</div>
            <div className="stat-label">在线学生</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{realTimeData.activeTeachers}</div>
            <div className="stat-label">活跃教师</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{realTimeData.totalCourses.toLocaleString()}</div>
            <div className="stat-label">课程总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{realTimeData.examSessions}</div>
            <div className="stat-label">考试场次</div>
          </div>
        </div>
      </section>

      {/* 课程状态 */}
      <section className="course-status">
        <div className="course-list">
          {courseStatus.map((course, index) => (
            <div key={index} className="course-item" style={{ borderLeftColor: course.color }}>
              <span className="course-icon">{course.icon}</span>
              <span className="course-name">{course.name}</span>
              <span className="course-status">{course.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 图表区域 */}
      <div className="charts-container">
        <Row gutter={[24, 24]}>
          {/* 学习趋势分析 */}
          <Col span={8}>
            <div className="chart-panel">
              <h3 className="chart-title">📈 学习趋势分析</h3>
              <div className="chart-content">
                <Area {...trendConfig} height={200} />
              </div>
            </div>
          </Col>

          {/* 学习效果雷达 */}
          <Col span={8}>
            <div className="chart-panel">
              <h3 className="chart-title">🎯 学习效果雷达</h3>
              <div className="chart-content">
                <Radar {...radarConfig} height={200} />
              </div>
            </div>
          </Col>

          {/* 成绩分布统计 */}
          <Col span={8}>
            <div className="chart-panel">
              <h3 className="chart-title">🏆 成绩分布统计</h3>
              <div className="chart-content">
                <Pie {...gradeConfig} height={200} />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 系统运行状态 */}
      <section className="system-status">
        <h2 className="section-title">⚡ 系统运行状态</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-icon">🖥️</span>
            <span className="status-label">CPU使用率</span>
            <span className="status-value">{realTimeData.cpuUsage}%</span>
            <Progress
              percent={realTimeData.cpuUsage}
              strokeColor="#ff6b6b"
              showInfo={false}
              size="small"
            />
          </div>
          <div className="status-item">
            <span className="status-icon">💾</span>
            <span className="status-label">内存使用率</span>
            <span className="status-value">{realTimeData.memoryUsage}%</span>
            <Progress
              percent={realTimeData.memoryUsage}
              strokeColor="#4ecdc4"
              showInfo={false}
              size="small"
            />
          </div>
          <div className="status-item">
            <span className="status-icon">🌐</span>
            <span className="status-label">网络流量</span>
            <span className="status-value">{realTimeData.networkTraffic}%</span>
            <Progress
              percent={realTimeData.networkTraffic}
              strokeColor="#45b7d1"
              showInfo={false}
              size="small"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default DataVisualizationScreen
