import React from 'react'
import { Step } from '../types'

interface SidebarProps {
  currentStep: Step
}

const steps = [
  { id: 'upload', name: 'ファイルアップロード', description: 'Excelファイルを選択' },
  { id: 'mapping', name: '列マッピング', description: '列の設定' },
  { id: 'tags', name: 'タグ編集', description: 'タグの確認・編集' },
  { id: 'analysis', name: '解析実行', description: 'クラスタリング実行' },
  { id: 'visualization', name: '可視化', description: '結果の表示・エクスポート' },
]

export const Sidebar: React.FC<SidebarProps> = ({ currentStep }) => {
  const getStepIndex = (step: Step) => {
    return steps.findIndex(s => s.id === step)
  }

  const currentStepIndex = getStepIndex(currentStep)

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          解析ステップ
        </h2>
        <nav className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = step.id === currentStep
            const isUpcoming = index > currentStepIndex

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  isCurrent
                    ? 'bg-primary-50 border border-primary-200'
                    : isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : isUpcoming
                    ? 'bg-gray-50 border border-gray-200'
                    : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-primary-900'
                        : isCompleted
                        ? 'text-green-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p
                    className={`text-xs ${
                      isCurrent
                        ? 'text-primary-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
