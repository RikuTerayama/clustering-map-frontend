import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Clustering Map
            </h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              v0.1.0
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Excelアンケート結果からクラスタリングマップを生成
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
