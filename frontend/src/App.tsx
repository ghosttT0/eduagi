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

// 路由守卫组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// 根据用户角色重定向的组件
const RoleBasedRedirect = () => {
  const { user } = useAuthStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  switch (user.role) {
    case '管理员':
      return <Navigate to="/admin/dashboard" replace />
    case '教师':
      return <Navigate to="/teacher/dashboard" replace />
    case '学生':
      return <Navigate to="/student/dashboard" replace />
    default:
      return <Navigate to="/teacher/dashboard" replace />
  }
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="App">
      <Routes>
        {/* 登录页面 - 如果已登录则重定向到对应仪表板 */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <RoleBasedRedirect /> : <LoginPage />
          } 
        />
        
        {/* 教师路由 */}
        <Route 
          path="/teacher/*" 
          element={
            <ProtectedRoute>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="resources" element={<div>资源管理页面</div>} />
          <Route path="videos" element={<div>视频分析页面</div>} />
          <Route path="exams" element={<div>考试管理页面</div>} />
          <Route path="notes" element={<div>笔记管理页面</div>} />
          <Route path="settings" element={<div>个人设置页面</div>} />
        </Route>

        {/* 学生路由 */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="learning" element={<div>学习页面</div>} />
          <Route path="notes" element={<div>笔记页面</div>} />
          <Route path="exams" element={<div>考试页面</div>} />
          <Route path="settings" element={<div>个人设置页面</div>} />
        </Route>

        {/* 管理员路由 */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<div>用户管理页面</div>} />
          <Route path="classes" element={<div>班级管理页面</div>} />
          <Route path="settings" element={<div>系统设置页面</div>} />
        </Route>

        {/* 根路径和未知路径重定向 */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </div>
  )
}

export default App 