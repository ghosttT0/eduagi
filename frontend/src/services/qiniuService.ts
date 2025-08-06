// 七牛云服务
interface QiniuConfig {
  accessKey: string
  secretKey: string
  bucket: string
  domain: string
}

interface QiniuFile {
  key: string
  hash: string
  fsize: number
  mimeType: string
  putTime: number
  type: number
  status: number
  md5?: string
}

interface QiniuListResponse {
  items: QiniuFile[]
  marker?: string
  commonPrefixes?: string[]
}

class QiniuService {
  private config: QiniuConfig

  constructor() {
    // 从环境变量或配置中获取七牛云配置
    this.config = {
      accessKey: process.env.REACT_APP_QINIU_ACCESS_KEY || '',
      secretKey: process.env.REACT_APP_QINIU_SECRET_KEY || '',
      bucket: process.env.REACT_APP_QINIU_BUCKET_NAME || 'eduagi',
      domain: process.env.REACT_APP_QINIU_DOMAIN || 'https://eduagi.site'
    }
  }

  /**
   * 获取文件列表
   * @param prefix 文件前缀
   * @param limit 限制数量
   * @param marker 分页标记
   */
  async listFiles(prefix: string = '', limit: number = 100, marker?: string): Promise<QiniuListResponse> {
    try {
      // 由于前端无法直接调用七牛云API（需要服务端签名），这里模拟数据
      // 实际项目中应该通过后端API来获取
      const mockFiles: QiniuFile[] = [
        {
          key: 'videos/python-basics.mp4',
          hash: 'FhGxwBJh1hYGidkdkdkdkdkdkdkd',
          fsize: 268435456, // 256MB
          mimeType: 'video/mp4',
          putTime: 16912345678900000,
          type: 0,
          status: 0
        },
        {
          key: 'videos/web-development.mp4',
          hash: 'FhGxwBJh2hYGidkdkdkdkdkdkdkd',
          fsize: 467664896, // 446MB
          mimeType: 'video/mp4',
          putTime: 16912345679000000,
          type: 0,
          status: 0
        },
        {
          key: 'videos/machine-learning.mp4',
          hash: 'FhGxwBJh3hYGidkdkdkdkdkdkdkd',
          fsize: 712345600, // 679MB
          mimeType: 'video/mp4',
          putTime: 16912345680000000,
          type: 0,
          status: 0
        },
        {
          key: 'documents/data-structure.pdf',
          hash: 'FhGxwBJh4hYGidkdkdkdkdkdkdkd',
          fsize: 12902400, // 12.3MB
          mimeType: 'application/pdf',
          putTime: 16912345681000000,
          type: 0,
          status: 0
        },
        {
          key: 'images/algorithm-chart.png',
          hash: 'FhGxwBJh5hYGidkdkdkdkdkdkdkd',
          fsize: 2202009, // 2.1MB
          mimeType: 'image/png',
          putTime: 16912345682000000,
          type: 0,
          status: 0
        }
      ]

      // 根据前缀过滤
      const filteredFiles = prefix 
        ? mockFiles.filter(file => file.key.startsWith(prefix))
        : mockFiles

      return {
        items: filteredFiles.slice(0, limit),
        marker: filteredFiles.length > limit ? 'next_marker' : undefined
      }
    } catch (error) {
      console.error('获取文件列表失败:', error)
      throw new Error('获取文件列表失败')
    }
  }

  /**
   * 获取文件下载URL
   * @param key 文件key
   */
  getDownloadUrl(key: string): string {
    return `${this.config.domain}/${key}`
  }

  /**
   * 获取文件预览URL（用于图片、视频等）
   * @param key 文件key
   */
  getPreviewUrl(key: string): string {
    return this.getDownloadUrl(key)
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 根据文件扩展名获取文件类型
   * @param key 文件key
   */
  getFileType(key: string): 'video' | 'document' | 'image' | 'audio' | 'other' {
    const extension = key.split('.').pop()?.toLowerCase()
    
    if (!extension) return 'other'
    
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
    const documentExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma']
    
    if (videoExts.includes(extension)) return 'video'
    if (documentExts.includes(extension)) return 'document'
    if (imageExts.includes(extension)) return 'image'
    if (audioExts.includes(extension)) return 'audio'
    
    return 'other'
  }

  /**
   * 格式化上传时间
   * @param putTime 七牛云时间戳（纳秒）
   */
  formatUploadTime(putTime: number): string {
    // 七牛云时间戳是纳秒，需要转换为毫秒
    const date = new Date(putTime / 10000)
    return date.toLocaleDateString('zh-CN')
  }

  /**
   * 获取文件名（不包含路径）
   * @param key 文件key
   */
  getFileName(key: string): string {
    return key.split('/').pop() || key
  }

  /**
   * 获取文件目录
   * @param key 文件key
   */
  getFileDirectory(key: string): string {
    const parts = key.split('/')
    return parts.length > 1 ? parts.slice(0, -1).join('/') : ''
  }

  /**
   * 检查是否为视频文件
   * @param key 文件key
   */
  isVideoFile(key: string): boolean {
    return this.getFileType(key) === 'video'
  }

  /**
   * 检查是否为图片文件
   * @param key 文件key
   */
  isImageFile(key: string): boolean {
    return this.getFileType(key) === 'image'
  }

  /**
   * 获取视频缩略图URL（如果七牛云支持）
   * @param key 视频文件key
   */
  getVideoThumbnail(key: string): string {
    if (!this.isVideoFile(key)) return ''
    
    // 七牛云视频缩略图处理
    return `${this.getDownloadUrl(key)}?vframe/jpg/offset/1`
  }

  /**
   * 获取图片缩略图URL
   * @param key 图片文件key
   * @param width 宽度
   * @param height 高度
   */
  getImageThumbnail(key: string, width: number = 200, height: number = 200): string {
    if (!this.isImageFile(key)) return ''
    
    // 七牛云图片处理
    return `${this.getDownloadUrl(key)}?imageView2/1/w/${width}/h/${height}`
  }

  /**
   * 模拟获取视频分析数据
   * @param key 视频文件key
   */
  async getVideoAnalysis(key: string): Promise<any> {
    // 模拟视频分析数据
    const fileName = this.getFileName(key)
    
    const mockAnalysis = {
      videoName: fileName,
      duration: '45:32',
      keyPoints: ['核心概念讲解', '实践演示', '案例分析', '总结回顾'],
      sentiment: 'positive' as const,
      engagement: Math.floor(Math.random() * 30) + 70, // 70-100
      topics: ['编程基础', '实战技巧', '最佳实践'],
      summary: `这是一个关于${fileName.replace('.mp4', '')}的教学视频，内容丰富，讲解清晰，适合初学者学习。`
    }
    
    return mockAnalysis
  }
}

// 导出单例
export const qiniuService = new QiniuService()
export default qiniuService
