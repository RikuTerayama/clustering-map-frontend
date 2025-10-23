import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { ColumnMapping } from '../types'

interface ColumnMappingStepProps {
  columns: string[]
  sampleData: Record<string, any>[]
  onComplete: (mapping: ColumnMapping) => void
  onBack: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({
  columns,
  sampleData,
  onComplete,
  onBack,
  isLoading,
  setIsLoading,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({
    text_column: '',
    id_column: '',
    group_column: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // 自動的にテキスト列を推測
    const textColumns = columns.filter(col => 
      col.toLowerCase().includes('text') || 
      col.toLowerCase().includes('回答') ||
      col.toLowerCase().includes('comment') ||
      col.toLowerCase().includes('free')
    )
    
    if (textColumns.length > 0) {
      setMapping(prev => ({
        ...prev,
        text_column: textColumns[0]
      }))
    }
  }, [columns])

  const validateMapping = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!mapping.text_column) {
      newErrors.text_column = 'テキスト列を選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateMapping()) {
      onComplete(mapping)
    }
  }

  const getColumnPreview = (columnName: string) => {
    if (!columnName || sampleData.length === 0) return ''
    const value = sampleData[0][columnName]
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...'
    }
    return String(value || '')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </button>
        <h2 className="text-3xl font-bold text-gray-900">
          列マッピング
        </h2>
        <div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* マッピング設定 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            列の設定
          </h3>

          <div className="space-y-6">
            {/* テキスト列（必須） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テキスト列 <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.text_column}
                onChange={(e) => setMapping(prev => ({ ...prev, text_column: e.target.value }))}
                className={`input ${errors.text_column ? 'border-red-500' : ''}`}
                disabled={isLoading}
              >
                <option value="">選択してください</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              {errors.text_column && (
                <p className="mt-1 text-sm text-red-600">{errors.text_column}</p>
              )}
            </div>

            {/* ID列（オプション） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID列（オプション）
              </label>
              <select
                value={mapping.id_column}
                onChange={(e) => setMapping(prev => ({ ...prev, id_column: e.target.value }))}
                className="input"
                disabled={isLoading}
              >
                <option value="">なし</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {/* グループ列（オプション） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                グループ列（オプション）
              </label>
              <select
                value={mapping.group_column}
                onChange={(e) => setMapping(prev => ({ ...prev, group_column: e.target.value }))}
                className="input"
                disabled={isLoading}
              >
                <option value="">なし</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={isLoading || !mapping.text_column}
              className="btn btn-primary flex items-center"
            >
              次へ
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* データプレビュー */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            データプレビュー
          </h3>

          {sampleData.length > 0 ? (
            <div className="space-y-4">
              {sampleData.slice(0, 3).map((row, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    行 {index + 1}
                  </div>
                  <div className="space-y-2">
                    {Object.entries(row).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="w-24 text-sm font-medium text-gray-600 flex-shrink-0">
                          {key}:
                        </span>
                        <span className="text-sm text-gray-900 flex-1">
                          {getColumnPreview(key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* ヘルプ情報 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              列マッピングについて
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>テキスト列</strong>: 解析対象の自由記述テキスト（必須）</li>
              <li>• <strong>ID列</strong>: 回答の一意識別子（オプション）</li>
              <li>• <strong>グループ列</strong>: 部署や属性などの分類（オプション）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
