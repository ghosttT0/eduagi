import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AnalyticsPage from '../AnalyticsPage'

// Mock the charts library
jest.mock('@ant-design/charts', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Column: () => <div data-testid="column-chart">Column Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Area: () => <div data-testid="area-chart">Area Chart</div>,
  Gauge: () => <div data-testid="gauge-chart">Gauge Chart</div>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AnalyticsPage', () => {
  test('renders main title', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('EduAGI 智能教育数据中台')).toBeInTheDocument()
  })

  test('renders teacher usage statistics section', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('教师使用次数统计/活跃板块')).toBeInTheDocument()
    expect(screen.getByText('当日活跃:')).toBeInTheDocument()
    expect(screen.getByText('本周活跃:')).toBeInTheDocument()
  })

  test('renders student usage statistics section', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('学生使用次数统计/活跃板块')).toBeInTheDocument()
  })

  test('renders teaching efficiency section', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('教学效率指数')).toBeInTheDocument()
    expect(screen.getByText('备课与修正耗时')).toBeInTheDocument()
    expect(screen.getByText('课后练习设计与修正耗时')).toBeInTheDocument()
  })

  test('renders course optimization section', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('课程优化方向')).toBeInTheDocument()
  })

  test('renders learning effect section', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('平均正确率趋势')).toBeInTheDocument()
    expect(screen.getByText('知识点掌握情况')).toBeInTheDocument()
  })

  test('renders frequent errors section', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('高频错误知识点统计')).toBeInTheDocument()
  })

  test('displays correct teacher usage data', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('156/234')).toBeInTheDocument() // Today's teacher usage
    expect(screen.getByText('(67%)')).toBeInTheDocument()
  })

  test('displays correct student usage data', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('2,156/3,456')).toBeInTheDocument() // Today's student usage
    expect(screen.getByText('(62%)')).toBeInTheDocument()
  })

  test('displays teaching efficiency metrics', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('45分钟')).toBeInTheDocument() // Preparation time
    expect(screen.getByText('28分钟')).toBeInTheDocument() // Exercise design time
    expect(screen.getByText('32分钟')).toBeInTheDocument() // Correction time
  })

  test('displays course optimization data', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('几何证明题通过率偏低')).toBeInTheDocument()
    expect(screen.getByText('化学方程式配平错误率高')).toBeInTheDocument()
  })

  test('displays frequent error data', () => {
    renderWithRouter(<AnalyticsPage />)
    expect(screen.getByText('函数定义域判断')).toBeInTheDocument()
    expect(screen.getByText('时态语法错误')).toBeInTheDocument()
    expect(screen.getByText('化学方程式配平')).toBeInTheDocument()
  })

  test('renders all chart components', () => {
    renderWithRouter(<AnalyticsPage />)
    const lineCharts = screen.getAllByTestId('line-chart')
    const columnCharts = screen.getAllByTestId('column-chart')
    const pieCharts = screen.getAllByTestId('pie-chart')
    const areaCharts = screen.getAllByTestId('area-chart')
    
    expect(lineCharts.length).toBeGreaterThan(0)
    expect(columnCharts.length).toBeGreaterThan(0)
    expect(pieCharts.length).toBeGreaterThan(0)
    expect(areaCharts.length).toBeGreaterThan(0)
  })
})
