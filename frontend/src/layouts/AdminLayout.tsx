import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Input, Space, Typography, Badge } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './AdminLayout.css'

const { Header, Sider, Content } = Layout
const { Text } = Typography

// 侧边栏头部组件
const SiderHeader = ({ user }: { user: any }) => (
  <div className="admin-sider-header">
    <Avatar 
      size={48} 
      icon={<UserOutlined />}
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      }}
    />
    <div className="user-profile">
      <Text strong className="user-name">
        {user?.display_name || 'Admin User'}
      </Text>
      <Text type="secondary" className="user-role">
        {user?.role === '管理员' ? 'Pro Member' : user?.role}
      </Text>
    </div>
  </div>
)

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/admin/classes',
      icon: <TeamOutlined />,
      label: '班级管理',
    },
    {
      key: '/admin/resources',
      icon: <FileTextOutlined />,
      label: '资源管理',
    },
    {
      key: '/admin/videos',
      icon: <VideoCameraOutlined />,
      label: '视频分析',
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout className="admin-layout">
      <Sider 
        width={280}
        className="admin-sider"
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <SiderHeader user={user} />
        
        <div className="sider-search">
          <Input 
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />} 
            placeholder="搜索..." 
            size="large"
            style={{ borderRadius: 12 }}
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />

        <div className="sider-footer">
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="logout-button"
          >
            {!collapsed && '退出登录'}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-button"
            />
            <div className="page-title">
              <Text strong style={{ fontSize: 18 }}>
                {menuItems.find(item => item.key === location.pathname)?.label || '仪表板'}
              </Text>
            </div>
          </div>

          <Space align="center" size="large" className="header-right">
            <Button 
              type="text" 
              icon={<ShareAltOutlined />}
              className="header-action-button"
            >
              分享
            </Button>
            
            <Badge count={3} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />}
                className="header-action-button"
              />
            </Badge>

            <Avatar.Group maxCount={3} size="small">
              <Avatar style={{ backgroundColor: '#f56a00' }}>A</Avatar>
              <Avatar style={{ backgroundColor: '#87d068' }}>B</Avatar>
              <Avatar style={{ backgroundColor: '#1890ff' }}>C</Avatar>
            </Avatar.Group>

                         <Avatar 
               size={36}
               icon={<UserOutlined />}
               style={{ 
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 color: '#fff'
               }}
             />
          </Space>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout 