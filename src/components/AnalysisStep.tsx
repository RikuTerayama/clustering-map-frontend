import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Play, Settings, BarChart3 } from 'lucide-react'
import { analyzeData } from '../utils/api'
import { ColumnMapping, AnalysisRequest } from '../types'
import { ShapeSelector, ShapeType } from './ShapeSelector'
import { StatusDisplay, useStatusManager } from './StatusDisplay'

interface AnalysisStepProps {
  analysisRequest: AnalysisRequest
  onComplete: (result: any) => void
  onBack: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({
  analysisRequest,
  onComplete,
  onBack,
  isLoading,
  setIsLoading,
}) => {
  const [clusterMethod, setClusterMethod] = useState<'hdbscan' | 'kmeans'>('hdbscan')
  const [hdbscanParams, setHdbscanParams] = useState({
    min_cluster_size: 5,
    min_samples: 3
  })
  const [kmeansParams, setKmeansParams] = useState({
    n_clusters: 8
  })
  const [umapParams, setUmapParams] = useState({
    n_neighbors: 15,
    min_dist: 0.1
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle')
  const { statuses, addStatus, clearStatuses } = useStatusManager()

  const handleAnalyze = async () => {
    try {
      clearStatuses()
      setIsLoading(true)
      
      addStatus('解析を開始しています...', 'loading')
      
      const request: AnalysisRequest = {
        ...analysisRequest,
        cluster_method: clusterMethod,
        hdbscan_params: hdbscanParams,
        kmeans_params: kmeansParams,
        umap_params: umapParams,
        shape_mask_path: selectedShape // 図形情報を追加
      }

      addStatus('リクエストを準備しました', 'info')
      console.log('Analysis request:', request)

      addStatus('サーバーに解析リクエストを送信中...', 'loading')
      const result = await analyzeData(request)
      
      addStatus('解析が完了しました', 'success')
      console.log('Analysis result:', result)
      
      onComplete(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      addStatus(`解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`, 'error')
    } finally {
      setIsLoading(false)
    }
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
          解析実行
        </h2>
        <div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 図形選択 */}
        <div className="card">
          <ShapeSelector
            selectedShape={selectedShape}
            onShapeChange={setSelectedShape}
          />
        </div>

        {/* 解析設定 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            解析設定
          </h3>

          <div className="space-y-6">
            {/* クラスタリング手法 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クラスタリング手法
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="hdbscan"
                    checked={clusterMethod === 'hdbscan'}
                    onChange={(e) => setClusterMethod(e.target.value as 'hdbscan')}
                    className="mr-3"
                    disabled={isLoading}
                  />
                  <span className="text-sm">HDBSCAN（推奨）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="kmeans"
                    checked={clusterMethod === 'kmeans'}
                    onChange={(e) => setClusterMethod(e.target.value as 'kmeans')}
                    className="mr-3"
                    disabled={isLoading}
                  />
                  <span className="text-sm">K-Means</span>
                </label>
              </div>
            </div>

            {/* 基本パラメータ */}
            {clusterMethod === 'hdbscan' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最小クラスタサイズ
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={hdbscanParams.min_cluster_size}
                    onChange={(e) => setHdbscanParams(prev => ({
                      ...prev,
                      min_cluster_size: parseInt(e.target.value) || 5
                    }))}
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最小サンプル数
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={hdbscanParams.min_samples}
                    onChange={(e) => setHdbscanParams(prev => ({
                      ...prev,
                      min_samples: parseInt(e.target.value) || 3
                    }))}
                    className="input"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {clusterMethod === 'kmeans' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  クラスタ数
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={kmeansParams.n_clusters}
                  onChange={(e) => setKmeansParams(prev => ({
                    ...prev,
                    n_clusters: parseInt(e.target.value) || 8
                  }))}
                  className="input"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* 詳細設定の切り替え */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-primary-600 hover:text-primary-800"
              disabled={isLoading}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? '詳細設定を隠す' : '詳細設定を表示'}
            </button>

            {/* 詳細設定 */}
            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  UMAP設定
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    近傍数
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={umapParams.n_neighbors}
                    onChange={(e) => setUmapParams(prev => ({
                      ...prev,
                      n_neighbors: parseInt(e.target.value) || 15
                    }))}
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最小距離
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    max="1.0"
                    step="0.01"
                    value={umapParams.min_dist}
                    onChange={(e) => setUmapParams(prev => ({
                      ...prev,
                      min_dist: parseFloat(e.target.value) || 0.1
                    }))}
                    className="input"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 解析実行 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            解析実行
          </h3>

          <div className="text-center">
            {isLoading ? (
              <div className="space-y-4">
                <div className="loading mx-auto"></div>
                <p className="text-gray-600">解析を実行中...</p>
                <p className="text-sm text-gray-500">
                  データの埋め込みベクトル化、次元圧縮、クラスタリングを行っています。
                  <br />
                  データ量によっては数分かかる場合があります。
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <BarChart3 className="w-16 h-16 text-primary-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    解析を開始します
                  </h4>
                  <p className="text-gray-600 mb-4">
                    以下の処理を実行します：
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• テキストの前処理と正規化</li>
                    <li>• 埋め込みベクトルの生成</li>
                    <li>• UMAP次元圧縮</li>
                    <li>• {clusterMethod === 'hdbscan' ? 'HDBSCAN' : 'K-Means'}クラスタリング</li>
                    <li>• 結果の可視化準備</li>
                  </ul>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="btn btn-primary flex items-center mx-auto"
                >
                  <Play className="w-4 h-4 mr-2" />
                  解析を開始
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ステータス表示 */}
      {statuses.length > 0 && (
        <div className="mt-8">
          <StatusDisplay statuses={statuses} title="解析ステータス" />
        </div>
      )}

      {/* ヘルプ情報 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          解析手法について
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>HDBSCAN:</strong> 密度ベースのクラスタリング。クラスタ数を自動決定し、ノイズを検出できます。</p>
          <p><strong>K-Means:</strong> 事前に指定したクラスタ数でデータを分割します。シンプルで高速です。</p>
          <p><strong>UMAP:</strong> 高次元データを2次元に圧縮し、局所的な構造を保持します。</p>
        </div>
      </div>
    </div>
  )
}
