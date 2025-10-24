import axios from 'axios'
import { UploadResponse, AnalysisRequest, AnalysisResult, TagCandidate } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://clustering-map-api.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

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

// エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // サーバーからのエラーレスポンス
      const message = error.response.data?.message || 'サーバーエラーが発生しました'
      throw new Error(message)
    } else if (error.request) {
      // リクエストが送信されなかった
      throw new Error('ネットワークエラーが発生しました')
    } else {
      // その他のエラー
      throw new Error('予期しないエラーが発生しました')
    }
  }
)
