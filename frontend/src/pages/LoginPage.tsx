import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons'
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

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await authAPI.login(values.account_id, values.password)
      const { access_token, user } = response.data
      
      login(user, access_token)
      message.success('登录成功！')
    } catch (error: any) {
      message.error(error.response?.data?.detail || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <RobotOutlined className="login-logo" />
          <Title level={2} className="login-title">
            EduAGI 智能教学系统
          </Title>
          <Text type="secondary">基于AI的教育管理平台</Text>
        </div>

        <Card className="login-card" bordered={false}>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="account_id"
              rules={[{ required: true, message: '请输入账号！' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入账号"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码！' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-tips">
            <Text type="secondary">
              <strong>默认账号：</strong><br />
              管理员：admin / admin123<br />
              教师：T001 / teacher123<br />
              学生：S001 / student123
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage 