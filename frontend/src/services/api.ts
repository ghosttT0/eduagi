import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://eduagi-backend.zeabur.app',
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

// 模拟数据
const mockUsers = [
  { id: 1, account_id: 'admin', display_name: '系统管理员', role: '管理员', email: 'admin@eduagi.com', created_at: '2024-01-01' },
  { id: 2, account_id: 'teacher1', display_name: '张老师', role: '教师', email: 'teacher1@eduagi.com', created_at: '2024-01-02' },
  { id: 3, account_id: 'student1', display_name: '李同学', role: '学生', email: 'student1@eduagi.com', created_at: '2024-01-03' },
]

// 用户管理API (带降级机制)
export const userAPI = {
  getUsers: async (params?: any) => {
    try {
      return await api.get('/users', { params })
    } catch (error) {
      console.warn('用户API不可用，使用模拟数据:', error)
      return { data: mockUsers }
    }
  },
  getUser: async (id: number) => {
    try {
      return await api.get(`/users/${id}`)
    } catch (error) {
      console.warn('用户API不可用，使用模拟数据:', error)
      const user = mockUsers.find(u => u.id === id)
      return { data: user || null }
    }
  },
  createUser: async (data: any) => {
    try {
      return await api.post('/users', data)
    } catch (error) {
      console.warn('用户API不可用，模拟创建成功:', error)
      const newUser = { id: Date.now(), ...data, created_at: new Date().toISOString() }
      mockUsers.push(newUser)
      return { data: newUser }
    }
  },
  updateUser: async (id: number, data: any) => {
    try {
      return await api.put(`/users/${id}`, data)
    } catch (error) {
      console.warn('用户API不可用，模拟更新成功:', error)
      const index = mockUsers.findIndex(u => u.id === id)
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...data }
        return { data: mockUsers[index] }
      }
      return { data: null }
    }
  },
  deleteUser: async (id: number) => {
    try {
      return await api.delete(`/users/${id}`)
    } catch (error) {
      console.warn('用户API不可用，模拟删除成功:', error)
      const index = mockUsers.findIndex(u => u.id === id)
      if (index !== -1) {
        mockUsers.splice(index, 1)
      }
      return { data: { success: true } }
    }
  },
}

// 模拟班级数据
const mockClasses = [
  { id: 1, name: 'Python编程基础班', description: 'Python编程入门课程', teacher_id: 2, student_count: 25, created_at: '2024-01-01' },
  { id: 2, name: 'Web开发进阶班', description: 'React和Node.js全栈开发', teacher_id: 2, student_count: 18, created_at: '2024-01-02' },
  { id: 3, name: '数据科学实战班', description: '机器学习和数据分析', teacher_id: 2, student_count: 22, created_at: '2024-01-03' },
]

// 班级管理API (带降级机制)
export const classAPI = {
  getClasses: async () => {
    try {
      return await api.get('/classes')
    } catch (error) {
      console.warn('班级API不可用，使用模拟数据:', error)
      return { data: mockClasses }
    }
  },
  getClass: async (id: number) => {
    try {
      return await api.get(`/classes/${id}`)
    } catch (error) {
      console.warn('班级API不可用，使用模拟数据:', error)
      const classData = mockClasses.find(c => c.id === id)
      return { data: classData || null }
    }
  },
  createClass: async (data: any) => {
    try {
      return await api.post('/classes', data)
    } catch (error) {
      console.warn('班级API不可用，模拟创建成功:', error)
      const newClass = { id: Date.now(), ...data, student_count: 0, created_at: new Date().toISOString() }
      mockClasses.push(newClass)
      return { data: newClass }
    }
  },
  updateClass: async (id: number, data: any) => {
    try {
      return await api.put(`/classes/${id}`, data)
    } catch (error) {
      console.warn('班级API不可用，模拟更新成功:', error)
      const index = mockClasses.findIndex(c => c.id === id)
      if (index !== -1) {
        mockClasses[index] = { ...mockClasses[index], ...data }
        return { data: mockClasses[index] }
      }
      return { data: null }
    }
  },
  deleteClass: async (id: number) => {
    try {
      return await api.delete(`/classes/${id}`)
    } catch (error) {
      console.warn('班级API不可用，模拟删除成功:', error)
      const index = mockClasses.findIndex(c => c.id === id)
      if (index !== -1) {
        mockClasses.splice(index, 1)
      }
      return { data: { success: true } }
    }
  },
}

// 模拟视频数据
const mockVideos = [
  {
    id: 1,
    title: 'Python基础语法讲解',
    url: 'https://example.com/video1.mp4',
    duration: 1800,
    views: 156,
    likes: 23,
    status: 'analyzed',
    created_at: '2024-01-01',
    analysis: {
      summary: '本视频详细讲解了Python的基础语法，包括变量、数据类型、控制结构等内容。',
      key_points: ['变量定义', '数据类型', 'if语句', 'for循环'],
      difficulty: 'beginner'
    }
  },
  {
    id: 2,
    title: 'React组件开发实战',
    url: 'https://example.com/video2.mp4',
    duration: 2400,
    views: 89,
    likes: 15,
    status: 'processing',
    created_at: '2024-01-02'
  }
]

// 视频分析API (带降级机制)
export const videoAPI = {
  analyzeVideo: async (video_url: string) => {
    try {
      return await api.post('/videos/analyze', { video_url })
    } catch (error) {
      console.warn('视频API不可用，模拟分析成功:', error)
      const newVideo = {
        id: Date.now(),
        title: '新视频分析',
        url: video_url,
        duration: 0,
        views: 0,
        likes: 0,
        status: 'processing',
        created_at: new Date().toISOString()
      }
      mockVideos.push(newVideo)
      return { data: newVideo }
    }
  },
  getVideoInfo: async (video_url: string) => {
    try {
      return await api.get('/videos/info', { params: { video_url } })
    } catch (error) {
      console.warn('视频API不可用，使用模拟数据:', error)
      const video = mockVideos.find(v => v.url === video_url)
      return { data: video || null }
    }
  },
  getAnalysisHistory: async (params?: any) => {
    try {
      return await api.get('/videos/history', { params })
    } catch (error) {
      console.warn('视频API不可用，使用模拟数据:', error)
      return { data: mockVideos }
    }
  },
  getAnalysisResult: async (id: number) => {
    try {
      return await api.get(`/videos/${id}`)
    } catch (error) {
      console.warn('视频API不可用，使用模拟数据:', error)
      const video = mockVideos.find(v => v.id === id)
      return { data: video || null }
    }
  },
  deleteAnalysis: async (id: number) => {
    try {
      return await api.delete(`/videos/${id}`)
    } catch (error) {
      console.warn('视频API不可用，模拟删除成功:', error)
      const index = mockVideos.findIndex(v => v.id === id)
      if (index !== -1) {
        mockVideos.splice(index, 1)
      }
      return { data: { success: true } }
    }
  },
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

// 旧版API（保留兼容性）
export const teacherAPILegacy = {
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

// 旧版学生API（保留兼容性）
export const studentAPILegacy = {
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

// 旧版管理员API（保留兼容性）
export const adminAPILegacy = {
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