import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

// 学习事件接口
export interface StudyEvent {
  id: string
  title: string
  start: string
  end: string
  type: 'study' | 'exam' | 'assignment' | 'review'
  subject: string
  description?: string
  completed?: boolean
  user_id?: number
}

// 学习计划接口
export interface StudyPlan {
  id: string
  title: string
  description: string
  subject: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  goals: string[]
  schedule: StudyEvent[]
  created_at: string
  progress: number
  user_id?: number
}

// AI生成计划请求接口
export interface AIStudyPlanRequest {
  subject: string
  goal: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  preferences?: string[]
  dailyTime?: number
  requirements?: string
}

// API响应接口
interface APIResponse<T> {
  data: T
  message: string
  success: boolean
}

class StudyPlanAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // 获取学习事件列表
  async getStudyEvents(): Promise<APIResponse<StudyEvent[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/student/study-events`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('获取学习事件失败:', error)
      throw error
    }
  }

  // 创建学习事件
  async createStudyEvent(event: Omit<StudyEvent, 'id'>): Promise<APIResponse<StudyEvent>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/student/study-events`, event, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('创建学习事件失败:', error)
      throw error
    }
  }

  // 更新学习事件
  async updateStudyEvent(id: string, event: Partial<StudyEvent>): Promise<APIResponse<StudyEvent>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/student/study-events/${id}`, event, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('更新学习事件失败:', error)
      throw error
    }
  }

  // 删除学习事件
  async deleteStudyEvent(id: string): Promise<APIResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/student/study-events/${id}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('删除学习事件失败:', error)
      throw error
    }
  }

  // 标记事件完成
  async markEventCompleted(id: string, completed: boolean): Promise<APIResponse<StudyEvent>> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/student/study-events/${id}/complete`, 
        { completed }, 
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('标记事件完成失败:', error)
      throw error
    }
  }

  // 获取学习计划列表
  async getStudyPlans(): Promise<APIResponse<StudyPlan[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/student/study-plans`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('获取学习计划失败:', error)
      throw error
    }
  }

  // 创建学习计划
  async createStudyPlan(plan: Omit<StudyPlan, 'id' | 'created_at'>): Promise<APIResponse<StudyPlan>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/student/study-plans`, plan, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('创建学习计划失败:', error)
      throw error
    }
  }

  // AI生成学习计划
  async generateAIStudyPlan(request: AIStudyPlanRequest): Promise<APIResponse<StudyPlan>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/student/ai-study-plan`, request, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('AI生成学习计划失败:', error)
      throw error
    }
  }

  // 更新学习计划进度
  async updateStudyPlanProgress(id: string, progress: number): Promise<APIResponse<StudyPlan>> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/student/study-plans/${id}/progress`, 
        { progress }, 
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('更新学习计划进度失败:', error)
      throw error
    }
  }

  // 删除学习计划
  async deleteStudyPlan(id: string): Promise<APIResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/student/study-plans/${id}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('删除学习计划失败:', error)
      throw error
    }
  }

  // 导出学习计划为Word文档
  async exportStudyPlanToWord(id: string): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/student/study-plans/${id}/export`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('导出学习计划失败:', error)
      throw error
    }
  }

  // 获取学习统计数据
  async getStudyStatistics(): Promise<APIResponse<{
    totalEvents: number
    completedEvents: number
    totalStudyTime: number
    weeklyProgress: number[]
    subjectDistribution: { subject: string; count: number }[]
  }>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/student/study-statistics`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('获取学习统计失败:', error)
      throw error
    }
  }

  // 获取学习建议
  async getStudySuggestions(): Promise<APIResponse<{
    suggestions: string[]
    recommendedSchedule: StudyEvent[]
    improvementAreas: string[]
  }>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/student/study-suggestions`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('获取学习建议失败:', error)
      throw error
    }
  }

  // 同步课程表
  async syncCourseSchedule(): Promise<APIResponse<StudyEvent[]>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/student/sync-course-schedule`, {}, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error) {
      console.error('同步课程表失败:', error)
      throw error
    }
  }
}

export const studyPlanAPI = new StudyPlanAPI()
export default studyPlanAPI
