#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 启动 EduAGI 前端服务...')

// 检查 package.json 是否存在
const packageJsonPath = path.join(__dirname, 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.log('📦 初始化前端项目...')
  
  // 创建 package.json
  const packageJson = {
    "name": "eduagi-frontend",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.8.1",
      "antd": "^5.12.8",
      "@ant-design/icons": "^5.2.6",
      "axios": "^1.6.2",
      "zustand": "^4.4.7"
    },
    "devDependencies": {
      "@types/react": "^18.2.43",
      "@types/react-dom": "^18.2.17",
      "@typescript-eslint/eslint-plugin": "^6.14.0",
      "@typescript-eslint/parser": "^6.14.0",
      "@vitejs/plugin-react": "^4.2.1",
      "eslint": "^8.55.0",
      "eslint-plugin-react-hooks": "^4.6.0",
      "eslint-plugin-react-refresh": "^0.4.5",
      "typescript": "^5.2.2",
      "vite": "^5.0.8"
    }
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('✅ package.json 创建成功')
}

// 检查 node_modules 是否存在
const nodeModulesPath = path.join(__dirname, 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 安装依赖...')
  const install = spawn('npm', ['install'], { 
    stdio: 'inherit',
    cwd: __dirname 
  })
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 依赖安装完成')
      startDevServer()
    } else {
      console.error('❌ 依赖安装失败')
      process.exit(1)
    }
  })
} else {
  startDevServer()
}

function startDevServer() {
  console.log('🌐 启动开发服务器...')
  console.log('📍 前端地址: http://localhost:3001')
  console.log('🔄 热重载: 启用')
  
  const dev = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    cwd: __dirname 
  })
  
  dev.on('close', (code) => {
    console.log(`开发服务器已停止，退出码: ${code}`)
  })
  
  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止开发服务器...')
    dev.kill('SIGINT')
  })
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 正在停止开发服务器...')
    dev.kill('SIGTERM')
  })
} 