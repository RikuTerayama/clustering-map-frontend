import React, { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { uploadFile } from '../utils/api'
import { UploadResponse } from '../types'

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

    // ファイル形式の検証
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      setError('Excelファイル（.xlsx, .xls）をアップロードしてください。')
      return
    }

    // ファイルサイズの検証（50MB制限）
    if (file.size > 50 * 1024 * 1024) {
      setError('ファイルサイズが大きすぎます。50MB以下のファイルをアップロードしてください。')
      return
    }

    try {
      setIsLoading(true)
      const response = await uploadFile(file)
      onComplete(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルのアップロードに失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ファイルアップロード
        </h2>
        <p className="text-lg text-gray-600">
          Excelファイル（.xlsx）をアップロードして、アンケート結果の解析を開始します。
        </p>
      </div>

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
