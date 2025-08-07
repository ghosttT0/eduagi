import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Input, Space, Typography, Badge, Dropdown, Tooltip } from 'antd'
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
  DownOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './AdminLayout.css'

const { Header, Sider, Content } = Layout
const { Text } = Typography

// 侧边栏头部组件 - 已移除用户头像和信息

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
              <Text strong style={{ fontSize: 18, color: '#1a1a1a' }}>
                {menuItems.find(item => item.key === location.pathname)?.label || '仪表板'}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Text>
            </div>
          </div>

          <Space align="center" size="middle" className="header-right">
            {/* 搜索框 */}
            <Input
              placeholder="全局搜索..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              style={{
                width: 240,
                borderRadius: 20,
                backgroundColor: '#f8f9ff',
                border: '1px solid #e8e9ff'
              }}
              size="middle"
            />

            {/* 工具按钮组 */}
            <Space size="small">
              <Tooltip title="帮助中心">
                <Button
                  type="text"
                  icon={<QuestionCircleOutlined />}
                  className="header-action-button"
                  shape="circle"
                />
              </Tooltip>

              <Tooltip title="主题切换">
                <Button
                  type="text"
                  icon={<SunOutlined />}
                  className="header-action-button"
                  shape="circle"
                />
              </Tooltip>

              <Tooltip title="语言设置">
                <Button
                  type="text"
                  icon={<GlobalOutlined />}
                  className="header-action-button"
                  shape="circle"
                />
              </Tooltip>

              <Tooltip title="通知中心">
                <Badge count={5} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="header-action-button"
                    shape="circle"
                  />
                </Badge>
              </Tooltip>
            </Space>

            {/* 在线用户 */}
            <div className="online-users">
              <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>
                在线: 24人
              </Text>
              <Avatar.Group max={{ count: 4 }} size="small">
                <Avatar style={{ backgroundColor: '#f56a00' }}>张</Avatar>
                <Avatar style={{ backgroundColor: '#87d068' }}>李</Avatar>
                <Avatar style={{ backgroundColor: '#1890ff' }}>王</Avatar>
                <Avatar style={{ backgroundColor: '#722ed1' }}>赵</Avatar>
                <Avatar style={{ backgroundColor: '#eb2f96' }}>+20</Avatar>
              </Avatar.Group>
            </div>

            {/* 用户菜单 */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    label: '个人资料',
                    icon: <UserOutlined />,
                  },
                  {
                    key: 'settings',
                    label: '账户设置',
                    icon: <SettingOutlined />,
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    label: '退出登录',
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                  },
                ],
              }}
              placement="bottomRight"
              arrow
            >
              <div className="user-dropdown">
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff'
                  }}
                />
                <div className="user-info">
                  <Text strong style={{ fontSize: 14, color: '#1a1a1a' }}>
                    {user?.display_name || 'Admin'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    管理员
                  </Text>
                </div>
                <DownOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
              </div>
            </Dropdown>
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