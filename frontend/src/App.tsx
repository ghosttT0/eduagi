import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import TeacherLayout from './layouts/TeacherLayout'
import StudentLayout from './layouts/StudentLayout'
import './App.css'
import './styles/global.css'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // 根据用户角色渲染不同的布局
  const renderLayout = () => {
    switch (user?.role) {
      case '管理员':
        return <AdminLayout />
      case '教师':
        return <TeacherLayout />
      case '学生':
        return <StudentLayout />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={renderLayout()} />
      </Routes>
    </div>
  )
}

export default App 