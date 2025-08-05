import React, { useEffect, useState } from 'react'
import { Card, Input, Button, Space, Table, Tag, message } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import { videoAPI } from '../../services/api'

const { Search } = Input

interface VideoAnalysis {
  id: number
  video_url: string
  status: string
  analyzed_at: string
}

const VideosPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    setLoading(true)
    try {
      const response = await videoAPI.getAnalysisHistory()
      setAnalyses(response.data)
    } catch (error) {
      message.error('获取分析历史失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      message.error('请输入视频URL')
      return
    }

    setAnalyzing(true)
    try {
      await videoAPI.analyzeVideo(videoUrl)
      message.success('视频分析已开始')
      setVideoUrl('')
      setTimeout(() => fetchAnalyses(), 2000)
    } catch (error) {
      message.error('视频分析失败')
    } finally {
      setAnalyzing(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '视频URL',
      dataIndex: 'video_url',
      key: 'video_url',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'completed' ? 'green' : status === 'processing' ? 'blue' : 'red'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '分析时间',
      dataIndex: 'analyzed_at',
      key: 'analyzed_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ]

  return (
    <div>
      <h2>视频分析</h2>

      <Card style={{ marginBottom: 24 }}>
        <h4>新增视频分析</h4>
        <Space.Compact style={{ width: '100%' }}>
          <Search
            placeholder="请输入视频URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onPressEnter={handleAnalyze}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleAnalyze}
            loading={analyzing}
          >
            开始分析
          </Button>
        </Space.Compact>
      </Card>

      <Card title="分析历史">
        <Table
          columns={columns}
          dataSource={analyses}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  )
}

export default VideosPage 