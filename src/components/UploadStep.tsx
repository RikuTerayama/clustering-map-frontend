import React, { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, Info } from 'lucide-react'
import { uploadFile, downloadTemplate, checkHealth } from '../utils/api'
import { UploadResponse } from '../types'
import { ProgressIndicator } from './ProgressIndicator'

interface UploadStepProps {
  onComplete: (data: UploadResponse) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const UploadStep: React.FC<UploadStepProps> = ({
  onComplete,
  isLoading,
  setIsLoading,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // サーバーの状態をチェック
  React.useEffect(() => {
    const checkServer = async () => {
      try {
        const isHealthy = await checkHealth()
        setServerStatus(isHealthy ? 'online' : 'offline')
      } catch (error) {
        console.error('Server health check failed:', error)
        setServerStatus('offline')
      }
    }
    
    checkServer()
  }, [])

  const progressSteps = [
    {
      id: 'file-selection',
      title: 'ファイル選択',
      description: 'Excelファイルを選択またはドラッグ&ドロップ',
      status: uploadedFile ? 'completed' : 'current' as const
    },
    {
      id: 'file-validation',
      title: 'ファイル検証',
      description: 'ファイル形式とサイズをチェック',
      status: uploadedFile && !isLoading ? 'completed' : uploadedFile && isLoading ? 'current' : 'pending' as const
    },
    {
      id: 'upload',
      title: 'アップロード',
      description: 'サーバーにファイルを送信中',
      status: isLoading ? 'current' : uploadedFile ? 'completed' : 'pending' as const
    },
    {
      id: 'processing',
      title: 'データ処理',
      description: 'ファイル内容を解析中',
      status: isLoading ? 'current' : 'pending' as const
    }
  ]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setUploadedFile(file)
    setUploadProgress('ファイルを検証中...')

    // ファイル形式の検証
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      setError('Excelファイル（.xlsx, .xls）をアップロードしてください。')
      setUploadProgress('')
      return
    }

    // ファイルサイズの検証（50MB制限）
    if (file.size > 50 * 1024 * 1024) {
      setError('ファイルサイズが大きすぎます。50MB以下のファイルをアップロードしてください。')
      setUploadProgress('')
      return
    }

    try {
      setIsLoading(true)
      setUploadProgress('サーバーにアップロード中...')
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'https://clustering-map-api.onrender.com')
      
      const response = await uploadFile(file)
      setUploadProgress('データを処理中...')
      
      console.log('Upload response:', response)
      onComplete(response)
      setUploadProgress('完了！')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'ファイルのアップロードに失敗しました。')
      setUploadProgress('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ファイルアップロード
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Excelファイル（.xlsx）をアップロードして、アンケート結果の解析を開始します。
        </p>
        
        {/* サーバー状態表示 */}
        <div className="mb-6 flex justify-center">
          {serverStatus === 'checking' && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">サーバー状態を確認中...</span>
            </div>
          )}
          {serverStatus === 'online' && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">サーバーに接続済み</span>
            </div>
          )}
          {serverStatus === 'offline' && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">サーバーに接続できません</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={downloadTemplate}
            className="btn btn-secondary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            テンプレートをダウンロード
          </button>
        </div>
      </div>

      {/* 進捗表示 */}
      {(uploadedFile || isLoading) && (
        <ProgressIndicator
          steps={progressSteps}
          currentStep={isLoading ? 'upload' : 'file-selection'}
          error={error || undefined}
        />
      )}

      {uploadProgress && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-500 mr-3" />
            <span className="text-blue-800">{uploadProgress}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="loading mb-4"></div>
              <p className="text-gray-600">ファイルを処理中...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                ファイルが選択されました
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                処理中です。しばらくお待ちください...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                ファイルをドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-600 mb-4">
                または
              </p>
              <button className="btn btn-primary">
                <Upload className="w-4 h-4 mr-2" />
                ファイルを選択
              </button>
              <p className="text-xs text-gray-500 mt-4">
                対応形式: .xlsx, .xls（最大50MB）
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">エラーが発生しました</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          ファイル形式について
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Excelファイル（.xlsx, .xls）のみ対応</li>
          <li>• 1行目はヘッダー行として扱われます</li>
          <li>• 自由記述のテキスト列を含む必要があります</li>
          <li>• 最大50,000行まで処理可能</li>
        </ul>
      </div>
    </div>
  )
}
