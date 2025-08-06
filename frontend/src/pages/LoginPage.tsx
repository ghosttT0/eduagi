import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import './LoginPage.css'

const { Title, Text } = Typography

interface LoginForm {
  account_id: string
  password: string
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await authAPI.login(values.account_id, values.password)
      const { access_token, user } = response.data
      
      // 更新认证状态
      login(user, access_token)
      message.success('登录成功！')
      
      // 根据用户角色跳转到对应的仪表板
      setTimeout(() => {
        switch (user.role) {
          case '管理员':
            navigate('/admin/dashboard')
            break
          case '教师':
            navigate('/teacher/dashboard')
            break
          case '学生':
            navigate('/student/dashboard')
            break
          default:
            navigate('/teacher/dashboard')
        }
      }, 500) // 延迟500ms确保状态更新完成
      
    } catch (error: any) {
      message.error(error.response?.data?.detail || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-main-card">
        {/* 左侧图片栏 */}
        <div className="login-image-section">
          <div className="login-logo-wrapper">
            <div className="logo-circle">L</div>
          </div>
          <div className="image-overlay"></div>
        </div>

        {/* 右侧表单栏 */}
        <div className="login-form-section">
          <div className="form-content">
            <div className="login-header">
              <Title level={2} className="login-title">
                EduAGI 智能教学系统
              </Title>
              <Text className="login-subtitle">基于AI的教育管理平台</Text>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              className="login-form"
            >
              <Form.Item
                name="account_id"
                rules={[{ required: true, message: '请输入账号！' }]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="请输入账号"
                  autoComplete="username"
                  className="custom-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码！' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="custom-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="login-button"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="login-tips">
              <Text className="tips-text">
                <strong>测试账号：</strong><br />
                管理员：admin / admin123<br />
                教师：T001 / teacher123<br />
                学生：S001 / student123
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage 