import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Progress, Tag, List, Typography, Alert, Button, Space, Statistic, Timeline } from 'antd'
import { TrophyOutlined, BookOutlined, ClockCircleOutlined, FireOutlined, TargetOutlined } from '@ant-design/icons'
import { Line, Radar, Column, Pie } from '@ant-design/charts'

const { Title, Text } = Typography

interface LearningAnalysisProps {
  studentId?: string
  knowledgeMastery?: any[]
}

const LearningAnalysis: React.FC<LearningAnalysisProps> = ({ studentId, knowledgeMastery = [] }) => {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 模拟学情分析数据
  const mockAnalysisData = {
    overallProgress: 78.5,
    studyTime: 156, // 小时
    completedCourses: 12,
    totalCourses: 18,
    weakPoints: [
      { name: '深度学习', score: 45, trend: 'down' },
      { name: '计算机网络', score: 52, trend: 'stable' },
      { name: '操作系统', score: 58, trend: 'up' }
    ],
    strongPoints: [
      { name: 'Python编程', score: 95, trend: 'up' },
      { name: '数据结构', score: 89, trend: 'up' },
      { name: '机器学习', score: 87, trend: 'stable' }
    ],
    learningTrend: [
      { date: '2024-07-01', score: 65 },
      { date: '2024-07-08', score: 68 },
      { date: '2024-07-15', score: 72 },
      { date: '2024-07-22', score: 75 },
      { date: '2024-07-29', score: 78 },
      { date: '2024-08-05', score: 79 }
    ],
    subjectRadar: [
      { subject: '编程基础', score: 85 },
      { subject: '算法设计', score: 78 },
      { subject: '数据库', score: 82 },
      { subject: '网络技术', score: 65 },
      { subject: '人工智能', score: 75 },
      { subject: '软件工程', score: 80 }
    ],
    studyHabits: [
      { habit: '每日学习时长', value: '2.5小时', status: 'good' },
      { habit: '作业完成率', value: '92%', status: 'excellent' },
      { habit: '课堂参与度', value: '78%', status: 'good' },
      { habit: '复习频率', value: '每周3次', status: 'average' }
    ],
    recommendations: [
      {
        type: 'urgent',
        title: '重点关注深度学习',
        description: '建议增加深度学习相关练习，观看推荐视频教程',
        action: '立即学习'
      },
      {
        type: 'important',
        title: '加强网络基础',
        description: '计算机网络基础需要巩固，建议系统复习TCP/IP协议',
        action: '制定计划'
      },
      {
        type: 'suggestion',
        title: '保持编程优势',
        description: 'Python编程能力优秀，可以尝试更高难度的项目实战',
        action: '查看项目'
      }
    ],
    recentActivities: [
      { time: '2024-08-07 09:30', activity: '完成机器学习作业', type: 'homework' },
      { time: '2024-08-06 14:20', activity: '观看深度学习视频', type: 'video' },
      { time: '2024-08-06 10:15', activity: '参与算法讨论', type: 'discussion' },
      { time: '2024-08-05 16:45', activity: '提交项目代码', type: 'project' },
      { time: '2024-08-05 11:30', activity: '完成知识点评估', type: 'assessment' }
    ]
  }

  useEffect(() => {
    setAnalysisData(mockAnalysisData)
  }, [studentId, knowledgeMastery])

  const generateAnalysis = async () => {
    setLoading(true)
    // 模拟AI分析过程
    setTimeout(() => {
      setAnalysisData({
        ...mockAnalysisData,
        overallProgress: mockAnalysisData.overallProgress + Math.random() * 5 - 2.5,
        analysisTime: new Date().toLocaleString()
      })
      setLoading(false)
    }, 2000)
  }

  if (!analysisData) {
    return (
      <Card>
        <Alert
          message="学情分析"
          description="点击下方按钮开始AI智能学情分析"
          type="info"
          action={
            <Button type="primary" onClick={generateAnalysis} loading={loading}>
              开始分析
            </Button>
          }
        />
      </Card>
    )
  }

  const trendConfig = {
    data: analysisData.learningTrend,
    xField: 'date',
    yField: 'score',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      style: {
        fill: '#1890ff',
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
        fillOpacity: 0.3,
      },
    },
  }

  const radarConfig = {
    data: analysisData.subjectRadar,
    xField: 'subject',
    yField: 'score',
    color: '#52c41a',
    area: {
      style: {
        fill: 'rgba(82, 196, 26, 0.2)',
      },
    },
    point: {
      size: 4,
      style: {
        fill: '#52c41a',
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
  }

  return (
    <div>
      {/* 总体概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="学习进度"
              value={analysisData.overallProgress}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<TrophyOutlined />}
            />
            <Progress percent={analysisData.overallProgress} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计学习时长"
              value={analysisData.studyTime}
              suffix="小时"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="课程完成度"
              value={`${analysisData.completedCourses}/${analysisData.totalCourses}`}
              valueStyle={{ color: '#722ed1' }}
              prefix={<BookOutlined />}
            />
            <Progress 
              percent={(analysisData.completedCourses / analysisData.totalCourses) * 100} 
              strokeColor="#722ed1" 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="学习热度"
              value={85}
              suffix="分"
              valueStyle={{ color: '#fa541c' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 学习趋势 */}
        <Col span={12}>
          <Card title="📈 学习趋势分析" extra={
            <Button size="small" onClick={generateAnalysis} loading={loading}>
              重新分析
            </Button>
          }>
            <Line {...trendConfig} height={200} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {analysisData.analysisTime && `最后分析时间: ${analysisData.analysisTime}`}
            </Text>
          </Card>
        </Col>

        {/* 能力雷达图 */}
        <Col span={12}>
          <Card title="🎯 能力雷达图">
            <Radar {...radarConfig} height={200} />
          </Card>
        </Col>

        {/* 薄弱环节 */}
        <Col span={12}>
          <Card title="⚠️ 需要加强的知识点" extra={<Tag color="red">重点关注</Tag>}>
            <List
              dataSource={analysisData.weakPoints}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {item.name}
                        <Tag color={item.trend === 'down' ? 'red' : item.trend === 'up' ? 'green' : 'orange'}>
                          {item.trend === 'down' ? '↓' : item.trend === 'up' ? '↑' : '→'} {item.score}分
                        </Tag>
                      </Space>
                    }
                    description={
                      <Progress 
                        percent={item.score} 
                        strokeColor={item.score < 60 ? '#ff4d4f' : '#faad14'} 
                        size="small"
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 优势领域 */}
        <Col span={12}>
          <Card title="🌟 优势知识点" extra={<Tag color="green">保持优势</Tag>}>
            <List
              dataSource={analysisData.strongPoints}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {item.name}
                        <Tag color={item.trend === 'down' ? 'red' : item.trend === 'up' ? 'green' : 'orange'}>
                          {item.trend === 'down' ? '↓' : item.trend === 'up' ? '↑' : '→'} {item.score}分
                        </Tag>
                      </Space>
                    }
                    description={
                      <Progress 
                        percent={item.score} 
                        strokeColor="#52c41a" 
                        size="small"
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* AI建议 */}
        <Col span={24}>
          <Card title="🤖 AI学习建议" extra={<Tag color="blue">个性化推荐</Tag>}>
            <List
              dataSource={analysisData.recommendations}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button 
                      type={item.type === 'urgent' ? 'primary' : 'default'} 
                      size="small"
                      danger={item.type === 'urgent'}
                    >
                      {item.action}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Tag color={
                        item.type === 'urgent' ? 'red' : 
                        item.type === 'important' ? 'orange' : 'blue'
                      }>
                        {item.type === 'urgent' ? '紧急' : 
                         item.type === 'important' ? '重要' : '建议'}
                      </Tag>
                    }
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col span={24}>
          <Card title="📋 最近学习活动">
            <Timeline>
              {analysisData.recentActivities.map((activity: any, index: number) => (
                <Timeline.Item
                  key={index}
                  color={
                    activity.type === 'homework' ? 'green' :
                    activity.type === 'video' ? 'blue' :
                    activity.type === 'discussion' ? 'orange' :
                    activity.type === 'project' ? 'red' : 'gray'
                  }
                >
                  <Text strong>{activity.time}</Text>
                  <br />
                  <Text>{activity.activity}</Text>
                  <Tag 
                    color={
                      activity.type === 'homework' ? 'green' :
                      activity.type === 'video' ? 'blue' :
                      activity.type === 'discussion' ? 'orange' :
                      activity.type === 'project' ? 'red' : 'gray'
                    }
                    style={{ marginLeft: 8 }}
                  >
                    {activity.type === 'homework' ? '作业' :
                     activity.type === 'video' ? '视频' :
                     activity.type === 'discussion' ? '讨论' :
                     activity.type === 'project' ? '项目' : '评估'}
                  </Tag>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default LearningAnalysis
