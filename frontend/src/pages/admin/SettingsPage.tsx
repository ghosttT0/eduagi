import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Divider,
  Typography,
  Space,
  message,
  Upload,
  Tabs,
  InputNumber,
  Radio,
  Slider,
} from 'antd'
import {
  SettingOutlined,
  BellOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SaveOutlined,
  UploadOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // 系统设置状态
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'EduAGI智能教育平台',
    siteDescription: '基于AI的智能教育解决方案',
    allowRegistration: true,
    emailVerification: true,
    maintenanceMode: false,
    maxUploadSize: 100,
    sessionTimeout: 30,
    backupFrequency: 'daily',
  })

  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    userActivity: true,
    securityAlerts: true,
  })

  // AI配置状态
  const [aiSettings, setAiSettings] = useState({
    deepseekApiKey: 'sk-**********************',
    tongyiApiKey: 'sk-**********************',
    maxTokens: 2000,
    temperature: 0.7,
    enableAutoResponse: true,
    responseDelay: 1000,
  })

  // 七牛云配置状态
  const [qiniuSettings, setQiniuSettings] = useState({
    accessKey: 'nE-**********************',
    secretKey: 'iial**********************',
    bucketName: 'eduagi',
    domain: 'https://eduagi.site',
    enableCdn: true,
    autoCompress: true,
  })

  const handleSaveSettings = async (values: any) => {
    setLoading(true)
    try {
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('设置保存成功')
    } catch (error) {
      message.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async (type: string) => {
    message.loading(`正在测试${type}连接...`, 2)
    try {
      // 模拟测试连接
      await new Promise(resolve => setTimeout(resolve, 2000))
      message.success(`${type}连接测试成功`)
    } catch (error) {
      message.error(`${type}连接测试失败`)
    }
  }

  const handleExportSettings = () => {
    const settings = {
      system: systemSettings,
      notifications: notificationSettings,
      ai: aiSettings,
      qiniu: qiniuSettings,
    }

    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'eduagi-settings.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('设置导出成功')
  }

  const handleImportSettings = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        setSystemSettings(settings.system || systemSettings)
        setNotificationSettings(settings.notifications || notificationSettings)
        setAiSettings(settings.ai || aiSettings)
        setQiniuSettings(settings.qiniu || qiniuSettings)
        message.success('设置导入成功')
      } catch (error) {
        message.error('设置文件格式错误')
      }
    }
    reader.readAsText(file)
    return false // 阻止默认上传行为
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>系统设置</Title>
        <Text type="secondary">管理EduAGI平台的各项配置和参数</Text>
      </div>

      <Tabs defaultActiveKey="system" type="card">
        {/* 系统设置 */}
        <TabPane tab={<span><SettingOutlined />系统设置</span>} key="system">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="基本设置" extra={<Button type="primary" onClick={() => handleSaveSettings(systemSettings)}>保存设置</Button>}>
                <Form layout="vertical" initialValues={systemSettings}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="网站名称" name="siteName">
                        <Input
                          value={systemSettings.siteName}
                          onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="网站描述" name="siteDescription">
                        <Input
                          value={systemSettings.siteDescription}
                          onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="允许用户注册" name="allowRegistration">
                        <Switch
                          checked={systemSettings.allowRegistration}
                          onChange={(checked) => setSystemSettings({...systemSettings, allowRegistration: checked})}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="邮箱验证" name="emailVerification">
                        <Switch
                          checked={systemSettings.emailVerification}
                          onChange={(checked) => setSystemSettings({...systemSettings, emailVerification: checked})}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="维护模式" name="maintenanceMode">
                        <Switch
                          checked={systemSettings.maintenanceMode}
                          onChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="最大上传大小 (MB)" name="maxUploadSize">
                        <InputNumber
                          min={1}
                          max={1000}
                          value={systemSettings.maxUploadSize}
                          onChange={(value) => setSystemSettings({...systemSettings, maxUploadSize: value || 100})}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="会话超时 (分钟)" name="sessionTimeout">
                        <InputNumber
                          min={5}
                          max={120}
                          value={systemSettings.sessionTimeout}
                          onChange={(value) => setSystemSettings({...systemSettings, sessionTimeout: value || 30})}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="备份频率" name="backupFrequency">
                    <Radio.Group
                      value={systemSettings.backupFrequency}
                      onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                    >
                      <Radio value="hourly">每小时</Radio>
                      <Radio value="daily">每天</Radio>
                      <Radio value="weekly">每周</Radio>
                      <Radio value="monthly">每月</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="系统状态" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>系统版本</Text>
                    <Text strong>v2.1.0</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>运行时间</Text>
                    <Text strong>15天 8小时</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>CPU使用率</Text>
                    <Text strong style={{ color: '#52c41a' }}>23%</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>内存使用率</Text>
                    <Text strong style={{ color: '#faad14' }}>67%</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>磁盘使用率</Text>
                    <Text strong style={{ color: '#1890ff' }}>45%</Text>
                  </div>
                </Space>
              </Card>

              <Card title="快速操作">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<ReloadOutlined />}>重启系统</Button>
                  <Button block icon={<ExportOutlined />} onClick={handleExportSettings}>导出设置</Button>
                  <Upload beforeUpload={handleImportSettings} showUploadList={false}>
                    <Button block icon={<ImportOutlined />}>导入设置</Button>
                  </Upload>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* AI配置 */}
        <TabPane tab={<span><DatabaseOutlined />AI配置</span>} key="ai">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="AI服务配置">
                <Form layout="vertical">
                  <Form.Item label="DeepSeek API Key">
                    <Input.Password
                      value={aiSettings.deepseekApiKey}
                      onChange={(e) => setAiSettings({...aiSettings, deepseekApiKey: e.target.value})}
                      placeholder="请输入DeepSeek API Key"
                    />
                  </Form.Item>

                  <Form.Item label="通义千问 API Key">
                    <Input.Password
                      value={aiSettings.tongyiApiKey}
                      onChange={(e) => setAiSettings({...aiSettings, tongyiApiKey: e.target.value})}
                      placeholder="请输入通义千问 API Key"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="最大Token数">
                        <InputNumber
                          min={100}
                          max={4000}
                          value={aiSettings.maxTokens}
                          onChange={(value) => setAiSettings({...aiSettings, maxTokens: value || 2000})}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="温度参数">
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={aiSettings.temperature}
                          onChange={(value) => setAiSettings({...aiSettings, temperature: value})}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Space>
                    <Button type="primary" onClick={() => handleSaveSettings(aiSettings)}>
                      保存AI配置
                    </Button>
                    <Button onClick={() => handleTestConnection('AI服务')}>
                      测试连接
                    </Button>
                  </Space>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="AI使用统计">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>今日调用次数</Text>
                    <Text strong>1,234</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>本月调用次数</Text>
                    <Text strong>45,678</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>平均响应时间</Text>
                    <Text strong>1.2s</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>成功率</Text>
                    <Text strong style={{ color: '#52c41a' }}>99.8%</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 七牛云配置 */}
        <TabPane tab={<span><CloudOutlined />七牛云配置</span>} key="qiniu">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="七牛云存储配置">
                <Form layout="vertical">
                  <Form.Item label="Access Key">
                    <Input.Password
                      value={qiniuSettings.accessKey}
                      onChange={(e) => setQiniuSettings({...qiniuSettings, accessKey: e.target.value})}
                      placeholder="请输入七牛云Access Key"
                    />
                  </Form.Item>

                  <Form.Item label="Secret Key">
                    <Input.Password
                      value={qiniuSettings.secretKey}
                      onChange={(e) => setQiniuSettings({...qiniuSettings, secretKey: e.target.value})}
                      placeholder="请输入七牛云Secret Key"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="存储空间名称">
                        <Input
                          value={qiniuSettings.bucketName}
                          onChange={(e) => setQiniuSettings({...qiniuSettings, bucketName: e.target.value})}
                          placeholder="请输入Bucket名称"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="访问域名">
                        <Input
                          value={qiniuSettings.domain}
                          onChange={(e) => setQiniuSettings({...qiniuSettings, domain: e.target.value})}
                          placeholder="请输入访问域名"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Space>
                    <Button type="primary" onClick={() => handleSaveSettings(qiniuSettings)}>
                      保存七牛云配置
                    </Button>
                    <Button onClick={() => handleTestConnection('七牛云存储')}>
                      测试连接
                    </Button>
                  </Space>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="存储统计">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>总文件数</Text>
                    <Text strong>2,456</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>存储空间使用</Text>
                    <Text strong>15.6 GB</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>本月流量</Text>
                    <Text strong>234.5 GB</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>CDN命中率</Text>
                    <Text strong style={{ color: '#52c41a' }}>95.2%</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default SettingsPage 