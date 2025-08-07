import React, { useEffect, useRef, useState } from 'react'
import { Card, Button, Space, Select, Switch, Tooltip, message } from 'antd'
import { ReloadOutlined, DownloadOutlined, FullscreenOutlined, CloudOutlined } from '@ant-design/icons'
import WordCloud from 'wordcloud'

interface WordCloudData {
  text: string
  size: number
  color?: string
}

interface WordCloudChartProps {
  data?: WordCloudData[]
  width?: number
  height?: number
  title?: string
  backgroundColor?: string
  onWordClick?: (word: string) => void
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({
  data,
  width = 600,
  height = 400,
  title = "知识点词云",
  backgroundColor = '#f5f5f5',
  onWordClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentData, setCurrentData] = useState<WordCloudData[]>([])
  const [colorScheme, setColorScheme] = useState('default')
  const [rotateWords, setRotateWords] = useState(true)

  // 默认计算机科学词云数据
  const defaultData: WordCloudData[] = [
    { text: '深度学习', size: 60 },
    { text: '机器学习', size: 55 },
    { text: '人工智能', size: 50 },
    { text: '神经网络', size: 45 },
    { text: '数据结构', size: 40 },
    { text: '算法设计', size: 38 },
    { text: 'Python编程', size: 35 },
    { text: '计算机网络', size: 33 },
    { text: '操作系统', size: 30 },
    { text: '数据库', size: 28 },
    { text: '软件工程', size: 25 },
    { text: '卷积神经网络', size: 23 },
    { text: '循环神经网络', size: 22 },
    { text: '自然语言处理', size: 20 },
    { text: '计算机视觉', size: 18 },
    { text: '数据挖掘', size: 16 },
    { text: '大数据', size: 15 },
    { text: '云计算', size: 14 },
    { text: '区块链', size: 13 },
    { text: '物联网', size: 12 },
    { text: '网络安全', size: 11 },
    { text: '前端开发', size: 10 },
    { text: '后端开发', size: 9 },
    { text: '移动开发', size: 8 },
    { text: '游戏开发', size: 7 },
    { text: '嵌入式系统', size: 6 },
    { text: '分布式系统', size: 5 },
    { text: '微服务', size: 4 },
    { text: 'DevOps', size: 3 },
    { text: '敏捷开发', size: 2 }
  ]

  useEffect(() => {
    setCurrentData(data || defaultData)
  }, [data])

  useEffect(() => {
    if (!canvasRef.current || currentData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // 准备词云数据
    const wordList = currentData.map(item => {
      let color = item.color
      if (!color) {
        switch (colorScheme) {
          case 'blue':
            color = `hsl(${200 + Math.random() * 60}, 70%, ${40 + Math.random() * 30}%)`
            break
          case 'green':
            color = `hsl(${100 + Math.random() * 60}, 70%, ${40 + Math.random() * 30}%)`
            break
          case 'purple':
            color = `hsl(${260 + Math.random() * 60}, 70%, ${40 + Math.random() * 30}%)`
            break
          case 'warm':
            color = `hsl(${Math.random() * 60}, 70%, ${40 + Math.random() * 30}%)`
            break
          default:
            color = `hsl(${Math.random() * 360}, 70%, ${40 + Math.random() * 30}%)`
        }
      }
      return [item.text, item.size, color]
    })

    // 配置词云选项
    const options = {
      list: wordList,
      gridSize: Math.round(16 * width / 1024),
      weightFactor: (size: number) => Math.pow(size, 0.8) * width / 1024,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      color: 'random-dark',
      rotateRatio: rotateWords ? 0.5 : 0,
      backgroundColor: backgroundColor,
      click: (item: any) => {
        if (onWordClick && item && item[0]) {
          onWordClick(item[0])
        }
      },
      hover: (item: any, dimension: any, event: any) => {
        if (item) {
          canvas.style.cursor = 'pointer'
        } else {
          canvas.style.cursor = 'default'
        }
      }
    }

    try {
      WordCloud(canvas, options)
    } catch (error) {
      console.error('词云生成失败:', error)
      message.error('词云生成失败')
    }
  }, [currentData, width, height, backgroundColor, colorScheme, rotateWords, onWordClick])

  const handleRegenerate = () => {
    // 重新生成词云（添加一些随机性）
    const shuffledData = [...currentData].sort(() => Math.random() - 0.5)
    setCurrentData(shuffledData)
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = 'wordcloud.png'
    link.href = canvas.toDataURL()
    link.click()
    message.success('词云图已下载')
  }

  const generateRandomData = () => {
    const topics = [
      '深度学习', '机器学习', '人工智能', '神经网络', '数据科学',
      '算法优化', 'Python', 'JavaScript', 'React', 'Vue',
      '数据库设计', '系统架构', '微服务', '云原生', 'DevOps',
      '前端框架', '后端开发', '全栈开发', '移动开发', '游戏开发'
    ]
    
    const randomData = topics.map(topic => ({
      text: topic,
      size: Math.floor(Math.random() * 50) + 10
    })).sort((a, b) => b.size - a.size)
    
    setCurrentData(randomData)
    message.success('已生成新的词云数据')
  }

  return (
    <Card
      title={
        <Space>
          <CloudOutlined />
          {title}
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="旋转文字">
            <Switch
              checked={rotateWords}
              onChange={setRotateWords}
              size="small"
            />
          </Tooltip>
          <Select
            value={colorScheme}
            onChange={setColorScheme}
            size="small"
            style={{ width: 100 }}
          >
            <Select.Option value="default">彩色</Select.Option>
            <Select.Option value="blue">蓝色系</Select.Option>
            <Select.Option value="green">绿色系</Select.Option>
            <Select.Option value="purple">紫色系</Select.Option>
            <Select.Option value="warm">暖色系</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} size="small" onClick={handleRegenerate}>
            重新生成
          </Button>
          <Button icon={<CloudOutlined />} size="small" onClick={generateRandomData}>
            随机数据
          </Button>
          <Button icon={<DownloadOutlined />} size="small" onClick={handleDownload}>
            下载
          </Button>
          <Button icon={<FullscreenOutlined />} size="small">
            全屏
          </Button>
        </Space>
      }
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            backgroundColor: backgroundColor,
            cursor: 'default'
          }}
        />
      </div>
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <Space split={<span>|</span>}>
          <span>点击词语查看详情</span>
          <span>字体大小反映热度</span>
          <span>基于AI分析生成</span>
        </Space>
      </div>
    </Card>
  )
}

export default WordCloudChart
