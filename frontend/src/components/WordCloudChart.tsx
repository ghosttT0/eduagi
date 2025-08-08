import React, { useEffect, useRef, useState } from 'react'
import { Card, Button, Space, Select, Switch, Tooltip, message, Slider, Input, Radio } from 'antd'
import { ReloadOutlined, DownloadOutlined, FullscreenOutlined, CloudOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import WordCloud from 'wordcloud'

interface WordCloudData {
  text: string
  size: number
  color?: string
  weight?: number
  category?: string
}

interface WordCloudChartProps {
  data?: WordCloudData[]
  width?: number
  height?: number
  title?: string
  backgroundColor?: string
  onWordClick?: (word: string) => void
  onWordHover?: (word: string) => void
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({
  data,
  width = 600,
  height = 400,
  title = "知识点词云",
  backgroundColor = '#f5f5f5',
  onWordClick,
  onWordHover
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentData, setCurrentData] = useState<WordCloudData[]>([])
  const [colorScheme, setColorScheme] = useState('default')
  const [rotateWords, setRotateWords] = useState(true)
  const [showAnimation, setShowAnimation] = useState(true)
  const [fontSize, setFontSize] = useState(12)
  const [density, setDensity] = useState(0.5)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(new Set())

  // 增强的默认数据 - 按类别组织
  const defaultData: WordCloudData[] = [
    // AI/机器学习类别
    { text: '深度学习', size: 60, category: 'ai', weight: 10 },
    { text: '机器学习', size: 55, category: 'ai', weight: 9 },
    { text: '人工智能', size: 50, category: 'ai', weight: 8 },
    { text: '神经网络', size: 45, category: 'ai', weight: 7 },
    { text: '卷积神经网络', size: 23, category: 'ai', weight: 4 },
    { text: '循环神经网络', size: 22, category: 'ai', weight: 4 },
    { text: '自然语言处理', size: 20, category: 'ai', weight: 3 },
    { text: '计算机视觉', size: 18, category: 'ai', weight: 3 },
    
    // 编程语言类别
    { text: 'Python编程', size: 35, category: 'programming', weight: 6 },
    { text: 'JavaScript', size: 30, category: 'programming', weight: 5 },
    { text: 'React', size: 25, category: 'programming', weight: 4 },
    { text: 'Vue', size: 20, category: 'programming', weight: 3 },
    { text: 'TypeScript', size: 18, category: 'programming', weight: 3 },
    { text: 'Java', size: 15, category: 'programming', weight: 2 },
    { text: 'C++', size: 12, category: 'programming', weight: 2 },
    
    // 数据结构与算法类别
    { text: '数据结构', size: 40, category: 'algorithm', weight: 7 },
    { text: '算法设计', size: 38, category: 'algorithm', weight: 6 },
    { text: '动态规划', size: 25, category: 'algorithm', weight: 4 },
    { text: '图算法', size: 20, category: 'algorithm', weight: 3 },
    { text: '排序算法', size: 18, category: 'algorithm', weight: 3 },
    { text: '搜索算法', size: 15, category: 'algorithm', weight: 2 },
    
    // 系统与网络类别
    { text: '计算机网络', size: 33, category: 'system', weight: 5 },
    { text: '操作系统', size: 30, category: 'system', weight: 5 },
    { text: '数据库', size: 28, category: 'system', weight: 4 },
    { text: '分布式系统', size: 15, category: 'system', weight: 2 },
    { text: '微服务', size: 12, category: 'system', weight: 2 },
    { text: '云计算', size: 14, category: 'system', weight: 2 },
    
    // 开发工具类别
    { text: '软件工程', size: 25, category: 'tools', weight: 4 },
    { text: 'DevOps', size: 20, category: 'tools', weight: 3 },
    { text: 'Git', size: 18, category: 'tools', weight: 3 },
    { text: 'Docker', size: 15, category: 'tools', weight: 2 },
    { text: 'Kubernetes', size: 12, category: 'tools', weight: 2 },
    { text: 'CI/CD', size: 10, category: 'tools', weight: 1 }
  ]

  useEffect(() => {
    setCurrentData(data || defaultData)
  }, [data])

  // 过滤数据
  const filteredData = currentData.filter(item => {
    const matchesSearch = !searchTerm || item.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    if (!canvasRef.current || filteredData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // 准备词云数据
    const wordList = filteredData.map(item => {
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
          case 'category':
            // 根据类别设置颜色
            const categoryColors = {
              'ai': '#ff6b6b',
              'programming': '#4ecdc4',
              'algorithm': '#45b7d1',
              'system': '#96ceb4',
              'tools': '#feca57'
            }
            color = categoryColors[item.category as keyof typeof categoryColors] || '#d9d9d9'
            break
          default:
            color = `hsl(${Math.random() * 360}, 70%, ${40 + Math.random() * 30}%)`
        }
      }

      // 高亮搜索词
      if (highlightedWords.has(item.text)) {
        color = '#ff4d4f'
      }

      return [item.text, item.size, color]
    })

    // 配置词云选项
    const options = {
      list: wordList,
      gridSize: Math.round(16 * width / 1024 * density),
      weightFactor: (size: number) => Math.pow(size, 0.8) * width / 1024,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      color: 'random-dark',
      rotateRatio: rotateWords ? 0.5 : 0,
      backgroundColor: backgroundColor,
      minSize: fontSize,
      shape: 'circle', // 可选: circle, square, diamond, triangle
      ellipticity: 1,
      drawOutOfBound: false,
      shrinkToFit: true,
      click: (item: any) => {
        if (onWordClick && item && item[0]) {
          onWordClick(item[0])
          message.info(`点击了: ${item[0]}`)
        }
      },
      hover: (item: any, dimension: any, event: any) => {
        if (item) {
          canvas.style.cursor = 'pointer'
          if (onWordHover) {
            onWordHover(item[0])
          }
        } else {
          canvas.style.cursor = 'default'
        }
      }
    }

    try {
      if (showAnimation) {
        // 动画效果：逐个显示词语
        let currentIndex = 0
        const animateWords = () => {
          if (currentIndex < wordList.length) {
            const partialList = wordList.slice(0, currentIndex + 1)
            const partialOptions = { ...options, list: partialList }
            WordCloud(canvas, partialOptions)
            currentIndex++
            setTimeout(animateWords, 100)
          }
        }
        animateWords()
      } else {
        WordCloud(canvas, options)
      }
    } catch (error) {
      console.error('词云生成失败:', error)
      message.error('词云生成失败')
    }
  }, [filteredData, width, height, backgroundColor, colorScheme, rotateWords, showAnimation, fontSize, density, highlightedWords, onWordClick, onWordHover])

  const handleRegenerate = () => {
    // 重新生成词云（添加一些随机性）
    const shuffledData = [...currentData].sort(() => Math.random() - 0.5)
    setCurrentData(shuffledData)
    message.success('词云已重新生成')
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
      size: Math.floor(Math.random() * 50) + 10,
      category: ['ai', 'programming', 'algorithm', 'system', 'tools'][Math.floor(Math.random() * 5)]
    })).sort((a, b) => b.size - a.size)
    
    setCurrentData(randomData)
    message.success('已生成新的词云数据')
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value) {
      const matchingWords = currentData.filter(item => 
        item.text.toLowerCase().includes(value.toLowerCase())
      ).map(item => item.text)
      setHighlightedWords(new Set(matchingWords))
    } else {
      setHighlightedWords(new Set())
    }
  }

  const categories = [
    { label: '全部', value: 'all' },
    { label: 'AI/机器学习', value: 'ai' },
    { label: '编程语言', value: 'programming' },
    { label: '数据结构算法', value: 'algorithm' },
    { label: '系统网络', value: 'system' },
    { label: '开发工具', value: 'tools' }
  ]

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
          <Input.Search
            placeholder="搜索词语..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 150 }}
            size="small"
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            size="small"
            style={{ width: 120 }}
          >
            {categories.map(cat => (
              <Select.Option key={cat.value} value={cat.value}>
                {cat.label}
              </Select.Option>
            ))}
          </Select>
          <Tooltip title="旋转文字">
            <Switch
              checked={rotateWords}
              onChange={setRotateWords}
              size="small"
            />
          </Tooltip>
          <Tooltip title="动画效果">
            <Switch
              checked={showAnimation}
              onChange={setShowAnimation}
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
            <Select.Option value="category">按类别</Select.Option>
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
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '12px' }}>字体大小:</span>
            <Slider
              min={8}
              max={20}
              value={fontSize}
              onChange={setFontSize}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '12px' }}>{fontSize}px</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '12px' }}>密度:</span>
            <Slider
              min={0.1}
              max={1}
              step={0.1}
              value={density}
              onChange={setDensity}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '12px' }}>{density}</span>
          </div>
        </Space>
      </div>
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
          <span>词语数: {filteredData.length}</span>
        </Space>
      </div>
      {colorScheme === 'category' && (
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: 8 }}>
          <Space split={<span>|</span>}>
            <span style={{ color: '#ff6b6b' }}>● AI/机器学习</span>
            <span style={{ color: '#4ecdc4' }}>● 编程语言</span>
            <span style={{ color: '#45b7d1' }}>● 数据结构算法</span>
            <span style={{ color: '#96ceb4' }}>● 系统网络</span>
            <span style={{ color: '#feca57' }}>● 开发工具</span>
          </Space>
        </div>
      )}
    </Card>
  )
}

export default WordCloudChart
