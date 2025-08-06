import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd'
import {
  DashboardOutlined,
  BulbOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './TeacherLayout.css'

const { Header, Sider, Content } = Layout

const TeacherLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/teacher/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/teacher/teaching-plans',
      icon: <BulbOutlined />,
      label: '智能教学设计',
    },
    {
      key: '/teacher/mindmaps',
      icon: <ShareAltOutlined />,
      label: 'AI知识图谱',
    },
    {
      key: '/teacher/exam-generator',
      icon: <FileTextOutlined />,
      label: '智能出题',
    },
    {
      key: '/teacher/videos',
      icon: <VideoCameraOutlined />,
      label: '视频管理',
    },
    {
      key: '/teacher/settings',
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
    <Layout className="teacher-layout">
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
        <Header className="teacher-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger"
          />
          <div className="header-right">
            <span className="welcome-text">
              欢迎，{user?.display_name} 老师
            </span>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar icon={<SettingOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content className="teacher-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default TeacherLayout 