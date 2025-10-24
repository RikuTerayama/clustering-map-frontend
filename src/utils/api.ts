import axios from 'axios'
import { UploadResponse, AnalysisRequest, AnalysisResult, TagCandidate } from '../types'

// 環境変数からAPI URLを取得（Vite環境変数）
const getApiUrl = (): string => {
  try {
    // Vite環境変数の型定義を回避
    const env = (import.meta as any).env
    return env?.VITE_API_URL || 'https://clustering-map-api.onrender.com'
  } catch (error) {
    // フォールバック
    return 'https://clustering-map-api.onrender.com'
  }
}

const API_BASE_URL = getApiUrl()

console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// ヘルスチェック
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health')
    console.log('Health check response:', response.data)
    return response.status === 200
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}

// ファイルアップロード
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

// データ解析
export const analyzeData = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const response = await api.post('/analyze', request)
  return response.data
}

// タグ辞書取得
export const getTags = async (): Promise<{ success: boolean; tags: any[] }> => {
  const response = await api.get('/tags')
  return response.data
}

// タグ辞書更新
export const updateTags = async (tags: any): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/tags', tags)
  return response.data
}

// PDFエクスポート
export const exportPDF = async (): Promise<Blob> => {
  const response = await api.get('/export/pdf', {
    responseType: 'blob',
  })
  return response.data
}

// PNGエクスポート
export const exportPNG = async (): Promise<Blob> => {
  const response = await api.get('/export/png', {
    responseType: 'blob',
  })
  return response.data
}

// テンプレートダウンロード
export const downloadTemplate = async (): Promise<void> => {
  try {
    console.log('Downloading template from backend...')
    const response = await api.get('/template', {
      responseType: 'blob',
    })
    
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'clustering_map_template.xlsx')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('Template downloaded successfully')
    
  } catch (error) {
    console.error('Template download error:', error)
    // フォールバック: CSV形式でダウンロード
    downloadTemplateCSV()
  }
}

// フォールバック用のCSVダウンロード
const downloadTemplateCSV = (): void => {
  const sampleData = [
    '22時以降の残業を禁止にして欲しいです。夜に連絡がくるのでワークライフバランスが保てません。',
    'チームの仲間がとても協力的で、困った時には助け合える環境です。上司も理解があります。',
    'スキルアップのための研修制度が充実していて、キャリア成長を実感できます。',
    '給与や待遇面で満足しており、ボーナスも期待できます。昇進の機会も多いです。',
    '夜中や休日に緊急の連絡が来ることがあり、プライベートの時間が取れません。'
  ]

  const csvContent = [
    '自由記述',
    ...sampleData.map(text => `"${text}"`)
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'clustering_map_template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    })
    
    if (error.response) {
      // サーバーからのエラーレスポンス
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.detail || 'サーバーエラーが発生しました'
      console.error(`Server Error ${status}:`, message)
      throw new Error(`${status}: ${message}`)
    } else if (error.request) {
      // リクエストが送信されなかった
      console.error('Network Error:', error.request)
      console.error('API Base URL:', API_BASE_URL)
      console.error('Request URL:', error.config?.url)
      console.error('Full URL:', `${API_BASE_URL}${error.config?.url}`)
      throw new Error(`ネットワークエラー: サーバーに接続できません (${API_BASE_URL})`)
    } else {
      // その他のエラー
      console.error('Unknown Error:', error.message)
      throw new Error(`予期しないエラー: ${error.message}`)
    }
  }
)
