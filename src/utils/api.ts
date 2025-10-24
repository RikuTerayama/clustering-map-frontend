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

// テンプレートダウンロード
export const downloadTemplate = (): void => {
  // サンプルデータを作成
  const sampleData = [
    {
      'ID': 1,
      '回答者': 'Aさん',
      '自由記述': 'このサービスはとても使いやすく、機能も充実しています。特にUIが分かりやすいのが良いです。',
      'グループ': '満足'
    },
    {
      'ID': 2,
      '回答者': 'Bさん',
      '自由記述': '料金が少し高いと感じます。もう少し安くなれば利用したいです。',
      'グループ': '不満'
    },
    {
      'ID': 3,
      '回答者': 'Cさん',
      '自由記述': 'サポートが丁寧で、問題がすぐに解決されました。ありがとうございます。',
      'グループ': '満足'
    },
    {
      'ID': 4,
      '回答者': 'Dさん',
      '自由記述': '機能は良いのですが、もう少しシンプルな操作ができると良いです。',
      'グループ': '改善要望'
    },
    {
      'ID': 5,
      '回答者': 'Eさん',
      '自由記述': '全体的に満足しています。継続して利用したいと思います。',
      'グループ': '満足'
    }
  ]

  // CSV形式でダウンロード
  const headers = ['ID', '回答者', '自由記述', 'グループ']
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => 
      headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
    )
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
      throw new Error(`ネットワークエラー: サーバーに接続できません (${API_BASE_URL})`)
    } else {
      // その他のエラー
      console.error('Unknown Error:', error.message)
      throw new Error(`予期しないエラー: ${error.message}`)
    }
  }
)
