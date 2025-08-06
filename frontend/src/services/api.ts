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
  refreshToken: () => api.post('/auth/refresh'),
}

// 教师端API
export const teacherAPI = {
  // 智能教学设计
  createTeachingPlan: (data: any) => api.post('/teacher/teaching-plans', data),
  getTeachingPlans: () => api.get('/teacher/teaching-plans'),
  getTeachingPlan: (id: number) => api.get(`/teacher/teaching-plans/${id}`),

  // AI知识图谱
  createMindMap: (data: any) => api.post('/teacher/mindmaps', data),
  getMindMaps: () => api.get('/teacher/mindmaps'),

  // 智能出题
  generateExam: (data: any) => api.post('/teacher/generate-exam', data),

  // 学生疑问处理
  getStudentDisputes: () => api.get('/teacher/disputes'),
  replyToDispute: (disputeId: number, reply: string) =>
    api.post(`/teacher/disputes/${disputeId}/reply`, { reply }),

  // 视频管理
  createVideo: (data: any) => api.post('/teacher/videos', data),
  getVideos: () => api.get('/teacher/videos'),
  analyzeVideo: (videoId: number) => api.post(`/teacher/videos/${videoId}/analyze`),
}

// 学生端API
export const studentAPI = {
  // AI学习伙伴
  chatWithAI: (data: { question: string; ai_mode: string }) =>
    api.post('/student/chat', data),
  getChatHistory: (limit: number = 50) =>
    api.get(`/student/chat/history?limit=${limit}`),
  clearChatHistory: () => api.delete('/student/chat/history'),

  // 自主练习
  generatePracticeQuestion: (topic: string) =>
    api.post('/student/practice/generate', { topic }),
  submitPracticeAnswer: (data: any) =>
    api.post('/student/practice/submit', data),

  // 向老师提问
  createDispute: (message: string) =>
    api.post('/student/disputes', { message }),
  getMyDisputes: () => api.get('/student/disputes'),

  // 知识掌握评估
  createKnowledgeMastery: (data: any) =>
    api.post('/student/knowledge-mastery', data),
  getKnowledgeMastery: () => api.get('/student/knowledge-mastery'),

  // 视频学习
  getAvailableVideos: () => api.get('/student/videos'),
  getVideoDetail: (videoId: number) => api.get(`/student/videos/${videoId}`),
}

// 管理员端API
export const adminAPI = {
  // 数据分析
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getStudentAnalytics: () => api.get('/analytics/students'),
  getTeacherAnalytics: () => api.get('/analytics/teachers'),
  getClassAnalytics: () => api.get('/analytics/classes'),
  getSystemActivities: (limit: number = 20) =>
    api.get(`/analytics/activities?limit=${limit}`),
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

// 教师相关API
export const teacherAPI = {
  // 教学计划
  getTeachingPlans: () => api.get('/api/teacher/teaching-plans'),
  createTeachingPlan: (data: any) => api.post('/api/teacher/teaching-plans', data),
  getTeachingPlan: (id: number) => api.get(`/api/teacher/teaching-plans/${id}`),
  updateTeachingPlan: (id: number, data: any) => api.put(`/api/teacher/teaching-plans/${id}`, data),
  deleteTeachingPlan: (id: number) => api.delete(`/api/teacher/teaching-plans/${id}`),
  
  // 试卷管理
  getExams: () => api.get('/api/teacher/exams'),
  createExam: (data: any) => api.post('/api/teacher/exams', data),
  getExam: (id: number) => api.get(`/api/teacher/exams/${id}`),
  updateExam: (id: number, data: any) => api.put(`/api/teacher/exams/${id}`, data),
  deleteExam: (id: number) => api.delete(`/api/teacher/exams/${id}`),
  
  // 思维导图
  getMindMaps: () => api.get('/api/teacher/mindmaps'),
  createMindMap: (data: any) => api.post('/api/teacher/mindmaps', data),
  getMindMap: (id: number) => api.get(`/api/teacher/mindmaps/${id}`),
  updateMindMap: (id: number, data: any) => api.put(`/api/teacher/mindmaps/${id}`, data),
  deleteMindMap: (id: number) => api.delete(`/api/teacher/mindmaps/${id}`),
  
  // 学生管理
  getStudents: () => api.get('/api/teacher/students'),
  getStudent: (id: number) => api.get(`/api/teacher/students/${id}`),
  updateStudent: (id: number, data: any) => api.put(`/api/teacher/students/${id}`, data),
  
  // 课程管理
  getCourses: () => api.get('/api/teacher/courses'),
  createCourse: (data: any) => api.post('/api/teacher/courses', data),
  getCourse: (id: number) => api.get(`/api/teacher/courses/${id}`),
  updateCourse: (id: number, data: any) => api.put(`/api/teacher/courses/${id}`, data),
  deleteCourse: (id: number) => api.delete(`/api/teacher/courses/${id}`),
}

// 学生相关API
export const studentAPI = {
  // 学习记录
  getLearningHistory: () => api.get('/api/student/learning-history'),
  createLearningRecord: (data: any) => api.post('/api/student/learning-records', data),
  
  // 笔记管理
  getNotes: () => api.get('/api/student/notes'),
  createNote: (data: any) => api.post('/api/student/notes', data),
  getNote: (id: number) => api.get(`/api/student/notes/${id}`),
  updateNote: (id: number, data: any) => api.put(`/api/student/notes/${id}`, data),
  deleteNote: (id: number) => api.delete(`/api/student/notes/${id}`),
  
  // 考试记录
  getExams: () => api.get('/api/student/exams'),
  getExam: (id: number) => api.get(`/api/student/exams/${id}`),
  submitExam: (id: number, data: any) => api.post(`/api/student/exams/${id}/submit`, data),
  
  // AI对话
  getChatHistory: () => api.get('/api/student/chat-history'),
  sendMessage: (data: any) => api.post('/api/student/chat', data),
  clearChatHistory: () => api.delete('/api/student/chat-history'),
  
  // 知识掌握
  getKnowledgeMastery: () => api.get('/api/student/knowledge-mastery'),
  updateKnowledgeMastery: (data: any) => api.post('/api/student/knowledge-mastery', data),
}

// 管理员相关API
export const adminAPI = {
  // 用户管理
  getUsers: (params?: any) => api.get('/api/admin/users', { params }),
  createUser: (data: any) => api.post('/api/admin/users', data),
  getUser: (id: number) => api.get(`/api/admin/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),
  
  // 班级管理
  getClasses: () => api.get('/api/admin/classes'),
  createClass: (data: any) => api.post('/api/admin/classes', data),
  getClass: (id: number) => api.get(`/api/admin/classes/${id}`),
  updateClass: (id: number, data: any) => api.put(`/api/admin/classes/${id}`, data),
  deleteClass: (id: number) => api.delete(`/api/admin/classes/${id}`),
  
  // 系统统计
  getSystemStats: () => api.get('/api/admin/system-stats'),
  getActivityLogs: (params?: any) => api.get('/api/admin/activity-logs', { params }),
}

// 文件管理API
export const fileAPI = {
  // 文件上传
  uploadFile: (file: File, fileType: string = 'any', storageType: string = 'local') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', fileType)
    formData.append('storage_type', storageType)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadVideo: (file: File, storageType: string = 'local') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storage_type', storageType)
    return api.post('/files/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadImage: (file: File, storageType: string = 'local') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storage_type', storageType)
    return api.post('/files/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadDocument: (file: File, storageType: string = 'local') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storage_type', storageType)
    return api.post('/files/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 文件管理
  getFileList: (fileType: string = 'any', limit: number = 100) =>
    api.get(`/files/list?file_type=${fileType}&limit=${limit}`),

  deleteFile: (fileType: string, filename: string) =>
    api.delete(`/files/delete/${fileType}/${filename}`),

  getFileInfo: (fileType: string, filename: string) =>
    api.get(`/files/info/${fileType}/${filename}`),

  downloadFile: (fileType: string, filename: string) =>
    api.get(`/files/download/${fileType}/${filename}`, { responseType: 'blob' }),

  // 七牛云相关
  uploadToQiniu: (file: File, fileType: string = 'any') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', fileType)
    return api.post('/files/qiniu/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getQiniuUploadToken: () => api.get('/files/qiniu/token'),
}

export default api