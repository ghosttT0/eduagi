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
    api.post('/auth/login', { account_id, password }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// 用户管理API
export const userAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: number) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
}

// 班级管理API
export const classAPI = {
  getClasses: () => api.get('/classes'),
  getClass: (id: number) => api.get(`/classes/${id}`),
  createClass: (data: any) => api.post('/classes', data),
  updateClass: (id: number, data: any) => api.put(`/classes/${id}`, data),
  deleteClass: (id: number) => api.delete(`/classes/${id}`),
}

// 视频分析API
export const videoAPI = {
  analyzeVideo: (video_url: string) =>
    api.post('/videos/analyze', { video_url }),
  getVideoInfo: (video_url: string) =>
    api.get('/videos/info', { params: { video_url } }),
  getAnalysisHistory: (params?: any) =>
    api.get('/videos/history', { params }),
  getAnalysisResult: (id: number) => api.get(`/videos/${id}`),
  deleteAnalysis: (id: number) => api.delete(`/videos/${id}`),
}

// 考试管理API
export const examAPI = {
  getExams: (params?: any) => api.get('/exams', { params }),
  getExam: (id: number) => api.get(`/exams/${id}`),
  createExam: (data: any) => api.post('/exams', data),
  updateExam: (id: number, data: any) => api.put(`/exams/${id}`, data),
  deleteExam: (id: number) => api.delete(`/exams/${id}`),
}

// 笔记管理API
export const noteAPI = {
  getNotes: (params?: any) => api.get('/notes', { params }),
  getNote: (id: number) => api.get(`/notes/${id}`),
  createNote: (data: any) => api.post('/notes', data),
  updateNote: (id: number, data: any) => api.put(`/notes/${id}`, data),
  deleteNote: (id: number) => api.delete(`/notes/${id}`),
  searchNotes: (q: string) => api.get('/notes/search', { params: { q } }),
}

// 资源管理API
export const resourceAPI = {
  getResources: (params?: any) => api.get('/resources', { params }),
  getMyResources: (params?: any) => api.get('/resources/my', { params }),
  getResource: (id: number) => api.get(`/resources/${id}`),
  uploadResource: (data: FormData) =>
    api.post('/resources/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteResource: (id: number) => api.delete(`/resources/${id}`),
}

// 数据分析API
export const analyticsAPI = {
  getDashboardData: () => api.get('/analytics/dashboard'),
  getTeacherDashboard: () => api.get('/analytics/teacher-dashboard'),
  getStudentDashboard: () => api.get('/analytics/student-dashboard'),
  getUserStats: () => api.get('/analytics/user-stats'),
  getResourceStats: () => api.get('/analytics/resource-stats'),
}

// PPT生成API
export const pptgenAPI = {
  generatePPT: (data: any) => api.post('/pptgen/generate', data),
  getHistory: () => api.get('/pptgen/history'),
}

// 云存储API
export const cloudAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/clouds/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getFiles: () => api.get('/clouds/files'),
  deleteFile: (file_id: string) => api.delete(`/clouds/files/${file_id}`),
}

// 系统管理API
export const manageAPI = {
  getSystemInfo: () => api.get('/manage/system-info'),
  getConfigs: () => api.get('/manage/configs'),
  updateConfig: (key: string, value: string) =>
    api.put(`/manage/configs/${key}`, { value }),
  createBackup: () => api.post('/manage/backup'),
  restoreBackup: (backup_id: string) =>
    api.post('/manage/restore', { backup_id }),
}

export default api 