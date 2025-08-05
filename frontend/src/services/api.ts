import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期，清除认证状态
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  login: (account_id: string, password: string) =>
    api.post('/api/auth/login', { account_id, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}

// 用户管理API
export const userAPI = {
  getUsers: (params?: any) => api.get('/api/users', { params }),
  getUser: (id: number) => api.get(`/api/users/${id}`),
  createUser: (data: any) => api.post('/api/users', data),
  updateUser: (id: number, data: any) => api.put(`/api/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/api/users/${id}`),
}

// 班级管理API
export const classAPI = {
  getClasses: () => api.get('/api/classes'),
  getClass: (id: number) => api.get(`/api/classes/${id}`),
  createClass: (data: any) => api.post('/api/classes', data),
  updateClass: (id: number, data: any) => api.put(`/api/classes/${id}`, data),
  deleteClass: (id: number) => api.delete(`/api/classes/${id}`),
}

// 视频分析API
export const videoAPI = {
  analyzeVideo: (video_url: string) =>
    api.post('/api/videos/analyze', { video_url }),
  getVideoInfo: (video_url: string) =>
    api.get('/api/videos/info', { params: { video_url } }),
  getAnalysisHistory: (params?: any) =>
    api.get('/api/videos/history', { params }),
  getAnalysisResult: (id: number) => api.get(`/api/videos/${id}`),
  deleteAnalysis: (id: number) => api.delete(`/api/videos/${id}`),
}

// 考试管理API
export const examAPI = {
  getExams: (params?: any) => api.get('/api/exams', { params }),
  getExam: (id: number) => api.get(`/api/exams/${id}`),
  createExam: (data: any) => api.post('/api/exams', data),
  updateExam: (id: number, data: any) => api.put(`/api/exams/${id}`, data),
  deleteExam: (id: number) => api.delete(`/api/exams/${id}`),
}

// 笔记管理API
export const noteAPI = {
  getNotes: (params?: any) => api.get('/api/notes', { params }),
  getNote: (id: number) => api.get(`/api/notes/${id}`),
  createNote: (data: any) => api.post('/api/notes', data),
  updateNote: (id: number, data: any) => api.put(`/api/notes/${id}`, data),
  deleteNote: (id: number) => api.delete(`/api/notes/${id}`),
  searchNotes: (q: string) => api.get('/api/notes/search', { params: { q } }),
}

// 资源管理API
export const resourceAPI = {
  getResources: (params?: any) => api.get('/api/resources', { params }),
  getMyResources: (params?: any) => api.get('/api/resources/my', { params }),
  getResource: (id: number) => api.get(`/api/resources/${id}`),
  uploadResource: (data: FormData) =>
    api.post('/api/resources/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteResource: (id: number) => api.delete(`/api/resources/${id}`),
}

// 数据分析API
export const analyticsAPI = {
  getDashboardData: () => api.get('/api/analytics/dashboard'),
  getTeacherDashboard: () => api.get('/api/analytics/teacher-dashboard'),
  getStudentDashboard: () => api.get('/api/analytics/student-dashboard'),
  getUserStats: () => api.get('/api/analytics/user-stats'),
  getResourceStats: () => api.get('/api/analytics/resource-stats'),
}

// PPT生成API
export const pptgenAPI = {
  generatePPT: (data: any) => api.post('/api/pptgen/generate', data),
  getHistory: () => api.get('/api/pptgen/history'),
}

// 云存储API
export const cloudAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/clouds/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getFiles: () => api.get('/api/clouds/files'),
  deleteFile: (file_id: string) => api.delete(`/api/clouds/files/${file_id}`),
}

// 系统管理API
export const manageAPI = {
  getSystemInfo: () => api.get('/api/manage/system-info'),
  getConfigs: () => api.get('/api/manage/configs'),
  updateConfig: (key: string, value: string) =>
    api.put(`/api/manage/configs/${key}`, { value }),
  createBackup: () => api.post('/api/manage/backup'),
  restoreBackup: (backup_id: string) =>
    api.post('/api/manage/restore', { backup_id }),
}

export default api 