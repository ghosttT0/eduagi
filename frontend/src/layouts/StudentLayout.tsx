import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd'
import {
  DashboardOutlined,
  RobotOutlined,
  EditOutlined,
  VideoCameraOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './StudentLayout.css'

const { Header, Sider, Content } = Layout

const StudentLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/student/dashboard',
      icon: <DashboardOutlined />,
      label: '学习中心',
    },
    {
      key: '/student/ai-partner',
      icon: <RobotOutlined />,
      label: 'AI学习伙伴',
    },
    {
      key: '/student/practice',
      icon: <EditOutlined />,
      label: '自主练习',
    },
    {
      key: '/student/study-plan',
      icon: <CalendarOutlined />,
      label: '学习计划',
    },
    {
      key: '/student/videos',
      icon: <VideoCameraOutlined />,
      label: '视频学习',
    },
    {
      key: '/student/disputes',
      icon: <QuestionCircleOutlined />,
      label: '向老师提问',
    },
    {
      key: '/student/settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<SettingOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout className="student-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <h2>{collapsed ? 'EA' : 'EduAGI'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="student-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger"
          />
          <div className="header-right">
            <span className="welcome-text">
              欢迎，{user?.display_name} 同学
            </span>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar icon={<SettingOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content className="student-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default StudentLayout 