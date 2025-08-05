import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import TeacherLayout from './layouts/TeacherLayout'
import StudentLayout from './layouts/StudentLayout'
import TeacherDashboardPage from './pages/teacher/DashboardPage'
import StudentDashboardPage from './pages/student/DashboardPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import './App.css'
import './styles/global.css'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* 教师路由 */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="resources" element={<div>资源管理页面</div>} />
          <Route path="videos" element={<div>视频分析页面</div>} />
          <Route path="exams" element={<div>考试管理页面</div>} />
          <Route path="notes" element={<div>笔记管理页面</div>} />
          <Route path="settings" element={<div>个人设置页面</div>} />
        </Route>

        {/* 学生路由 */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="learning" element={<div>学习页面</div>} />
          <Route path="notes" element={<div>笔记页面</div>} />
          <Route path="exams" element={<div>考试页面</div>} />
          <Route path="settings" element={<div>个人设置页面</div>} />
        </Route>

        {/* 管理员路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<div>用户管理页面</div>} />
          <Route path="classes" element={<div>班级管理页面</div>} />
          <Route path="settings" element={<div>系统设置页面</div>} />
        </Route>

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App 