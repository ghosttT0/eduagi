import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { useAuthStore } from './stores/authStore'
import { adminTheme } from './theme/adminTheme'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import TeacherLayout from './layouts/TeacherLayout'
import StudentLayout from './layouts/StudentLayout'
import TeacherDashboardPage from './pages/teacher/DashboardPage'
import StudentDashboardPage from './pages/student/DashboardPage'
import StudyPlanPage from './pages/student/StudyPlanPage'
import AdvancedDashboard from './pages/admin/AdvancedDashboard'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import DataVisualizationScreen from './pages/admin/DataVisualizationScreen'
import UsersPage from './pages/admin/UsersPage'
import ClassesPage from './pages/admin/ClassesPage'
import ResourcesPage from './pages/admin/ResourcesPage'
import SettingsPage from './pages/admin/SettingsPage'
import TeachingPlanPage from './pages/teacher/TeachingPlanPage'
import MindMapPage from './pages/teacher/MindMapPage'
import ExamGeneratorPage from './pages/teacher/ExamGeneratorPage'
import AIPartnerPage from './pages/student/AIPartnerPage'
import PracticePage from './pages/student/PracticePage'
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
          <Route path="teaching-plans" element={<TeachingPlanPage />} />
          <Route path="mindmaps" element={<MindMapPage />} />
          <Route path="exam-generator" element={<ExamGeneratorPage />} />
          <Route path="resources" element={<ResourcesPage />} />
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
          <Route path="ai-partner" element={<AIPartnerPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="study-plan" element={<StudyPlanPage />} />
          <Route path="videos" element={<div>视频学习页面</div>} />
          <Route path="disputes" element={<div>向老师提问页面</div>} />
          <Route path="settings" element={<div>个人设置页面</div>} />
        </Route>

        {/* 管理员路由 - 应用自定义主题 */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <ConfigProvider theme={adminTheme}>
                <AdminLayout />
              </ConfigProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdvancedDashboard />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="visualization-screen" element={<DataVisualizationScreen />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 根路径和未知路径重定向 */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </div>
  )
}

export default App 