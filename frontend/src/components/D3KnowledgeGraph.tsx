import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card, Button, Space, Select, Switch, Tooltip } from 'antd'
import { FullscreenOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'

interface KnowledgeNode {
  id: string
  name: string
  group: number
  size?: number
  color?: string
  mastery_level?: number
  generation_id?: number
}

interface KnowledgeLink {
  source: string
  target: string
  value: number
  type?: string
}

interface KnowledgeGraphData {
  nodes: KnowledgeNode[]
  links: KnowledgeLink[]
}

interface D3KnowledgeGraphProps {
  data?: KnowledgeGraphData
  width?: number
  height?: number
  showMastery?: boolean
  interactive?: boolean
  onNodeClick?: (node: KnowledgeNode) => void
}

const D3KnowledgeGraph: React.FC<D3KnowledgeGraphProps> = ({
  data,
  width = 800,
  height = 600,
  showMastery = false,
  interactive = true,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [currentData, setCurrentData] = useState<KnowledgeGraphData | null>(null)
  const [forceStrength, setForceStrength] = useState(-300)
  const [linkDistance, setLinkDistance] = useState(100)
  const [showLabels, setShowLabels] = useState(true)

  // 默认数据 - 计算机科学知识图谱
  const defaultData: KnowledgeGraphData = {
    nodes: [
      { id: 'cs', name: '计算机科学', group: 0, size: 25, generation_id: 0 },
      { id: 'ai', name: '人工智能', group: 1, size: 20, generation_id: 1 },
      { id: 'ml', name: '机器学习', group: 1, size: 18, generation_id: 1 },
      { id: 'dl', name: '深度学习', group: 2, size: 16, generation_id: 2 },
      { id: 'nn', name: '神经网络', group: 2, size: 15, generation_id: 2 },
      { id: 'cnn', name: '卷积神经网络', group: 3, size: 12, generation_id: 3 },
      { id: 'rnn', name: '循环神经网络', group: 3, size: 12, generation_id: 3 },
      { id: 'nlp', name: '自然语言处理', group: 2, size: 14, generation_id: 2 },
      { id: 'cv', name: '计算机视觉', group: 2, size: 14, generation_id: 2 },
      { id: 'ds', name: '数据结构', group: 1, size: 18, generation_id: 1 },
      { id: 'algo', name: '算法设计', group: 1, size: 17, generation_id: 1 },
      { id: 'dp', name: '动态规划', group: 3, size: 13, generation_id: 3 },
      { id: 'graph', name: '图算法', group: 3, size: 12, generation_id: 3 },
      { id: 'sort', name: '排序算法', group: 3, size: 11, generation_id: 3 },
      { id: 'db', name: '数据库', group: 1, size: 16, generation_id: 1 },
      { id: 'sql', name: 'SQL', group: 3, size: 12, generation_id: 3 },
      { id: 'nosql', name: 'NoSQL', group: 3, size: 11, generation_id: 3 },
      { id: 'net', name: '计算机网络', group: 1, size: 15, generation_id: 1 },
      { id: 'tcp', name: 'TCP/IP', group: 3, size: 10, generation_id: 3 },
      { id: 'http', name: 'HTTP', group: 3, size: 10, generation_id: 3 },
      { id: 'os', name: '操作系统', group: 1, size: 16, generation_id: 1 },
      { id: 'thread', name: '进程线程', group: 3, size: 11, generation_id: 3 },
      { id: 'memory', name: '内存管理', group: 3, size: 10, generation_id: 3 }
    ],
    links: [
      { source: 'cs', target: 'ai', value: 5 },
      { source: 'cs', target: 'ds', value: 5 },
      { source: 'cs', target: 'algo', value: 5 },
      { source: 'cs', target: 'db', value: 4 },
      { source: 'cs', target: 'net', value: 4 },
      { source: 'cs', target: 'os', value: 4 },
      { source: 'ai', target: 'ml', value: 5 },
      { source: 'ai', target: 'nlp', value: 4 },
      { source: 'ai', target: 'cv', value: 4 },
      { source: 'ml', target: 'dl', value: 5 },
      { source: 'ml', target: 'nn', value: 4 },
      { source: 'dl', target: 'cnn', value: 4 },
      { source: 'dl', target: 'rnn', value: 4 },
      { source: 'nn', target: 'cnn', value: 3 },
      { source: 'nn', target: 'rnn', value: 3 },
      { source: 'ds', target: 'algo', value: 5 },
      { source: 'algo', target: 'dp', value: 4 },
      { source: 'algo', target: 'graph', value: 4 },
      { source: 'algo', target: 'sort', value: 3 },
      { source: 'db', target: 'sql', value: 4 },
      { source: 'db', target: 'nosql', value: 3 },
      { source: 'net', target: 'tcp', value: 4 },
      { source: 'net', target: 'http', value: 3 },
      { source: 'os', target: 'thread', value: 4 },
      { source: 'os', target: 'memory', value: 3 },
      { source: 'cv', target: 'cnn', value: 3 },
      { source: 'nlp', target: 'rnn', value: 3 }
    ]
  }

  useEffect(() => {
    setCurrentData(data || defaultData)
  }, [data])

  useEffect(() => {
    if (!currentData || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const simulation = d3.forceSimulation(currentData.nodes as any)
      .force('link', d3.forceLink(currentData.links).id((d: any) => d.id).distance(linkDistance).strength(1))
      .force('charge', d3.forceManyBody().strength(forceStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => (d.size || 15) + 2))

    // 创建箭头标记
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999')

    // 创建连接线
    const link = svg.append('g')
      .selectAll('line')
      .data(currentData.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value) * 2)
      .attr('marker-end', 'url(#arrow)')

    // 创建节点
    const node = svg.append('g')
      .selectAll('circle')
      .data(currentData.nodes)
      .join('circle')
      .attr('r', (d: any) => d.size || 15)
      .attr('fill', (d: any) => {
        if (showMastery && d.mastery_level !== undefined) {
          const colors = ['#ff4d4f', '#faad14', '#52c41a', '#1890ff']
          return colors[d.mastery_level] || '#d9d9d9'
        }
        return d3.schemeCategory10[(d.generation_id || 0) % 10]
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', interactive ? 'pointer' : 'default')

    // 添加标签
    const text = svg.append('g')
      .selectAll('text')
      .data(currentData.nodes)
      .join('text')
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('font-family', 'sans-serif')
      .attr('fill', '#333')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#fff')
      .attr('stroke-width', '3px')
      .style('display', showLabels ? 'block' : 'none')
      .style('pointer-events', 'none')

    if (interactive) {
      // 添加拖拽功能
      const drag = d3.drag()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })

      node.call(drag as any)

      // 添加点击事件
      node.on('click', (event: any, d: any) => {
        if (onNodeClick) {
          onNodeClick(d)
        }
      })

      // 添加悬停效果
      node.on('mouseover', function(event: any, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d.size || 15) * 1.2)
          .attr('stroke-width', 4)
      })
      .on('mouseout', function(event: any, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size || 15)
          .attr('stroke-width', 2)
      })
    }

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)

      text
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    return () => {
      simulation.stop()
    }
  }, [currentData, width, height, forceStrength, linkDistance, showLabels, showMastery, interactive])

  const handleRestart = () => {
    setCurrentData({ ...currentData! })
  }

  const handleDownload = () => {
    if (!svgRef.current) return
    
    const svgElement = svgRef.current
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'knowledge-graph.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card
      title="D3矢量重力知识图谱"
      extra={
        <Space>
          <Tooltip title="显示标签">
            <Switch
              checked={showLabels}
              onChange={setShowLabels}
              size="small"
            />
          </Tooltip>
          <Select
            value={forceStrength}
            onChange={setForceStrength}
            size="small"
            style={{ width: 100 }}
          >
            <Select.Option value={-100}>弱引力</Select.Option>
            <Select.Option value={-300}>中引力</Select.Option>
            <Select.Option value={-500}>强引力</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} size="small" onClick={handleRestart}>
            重新布局
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
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        />
      </div>
      {showMastery && (
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
          <span style={{ color: '#ff4d4f' }}>● 薄弱环节</span>
          <span style={{ color: '#faad14', marginLeft: 16 }}>● 基本掌握</span>
          <span style={{ color: '#52c41a', marginLeft: 16 }}>● 熟练掌握</span>
          <span style={{ color: '#1890ff', marginLeft: 16 }}>● 精通</span>
        </div>
      )}
    </Card>
  )
}

export default D3KnowledgeGraph
