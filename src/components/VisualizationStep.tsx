import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Download, FileText, Image, Filter, Eye, EyeOff } from 'lucide-react'
import { exportPDF, exportPNG } from '../utils/api'
import { AnalysisResult, DataPoint } from '../types'
import * as echarts from 'echarts'

interface VisualizationStepProps {
  analysisResult: AnalysisResult | null
  onBack: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const VisualizationStep: React.FC<VisualizationStepProps> = ({
  analysisResult,
  onBack,
  isLoading,
  setIsLoading,
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [selectedPoints, setSelectedPoints] = useState<DataPoint[]>([])
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [showLabels, setShowLabels] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)

  useEffect(() => {
    if (analysisResult && chartRef.current) {
      renderChart()
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
      }
    }
  }, [analysisResult, filteredTags, selectedCluster])

  const renderChart = () => {
    if (!analysisResult || !chartRef.current) return

    // 既存のチャートを破棄
    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    // チャートインスタンスを作成
    chartInstance.current = echarts.init(chartRef.current)

    // データをフィルタリング
    let filteredData = analysisResult.data_points
    if (filteredTags.length > 0) {
      filteredData = filteredData.filter(point => 
        point.tags.some(tag => filteredTags.includes(tag))
      )
    }
    if (selectedCluster !== null) {
      filteredData = filteredData.filter(point => point.cluster_id === selectedCluster)
    }

    // クラスタごとにデータをグループ化
    const clusterGroups: Record<number, DataPoint[]> = {}
    filteredData.forEach(point => {
      if (!clusterGroups[point.cluster_id]) {
        clusterGroups[point.cluster_id] = []
      }
      clusterGroups[point.cluster_id].push(point)
    })

    // 色パレット
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ]

    // シリーズデータを作成
    const series = Object.entries(clusterGroups).map(([clusterId, points], index) => ({
      name: `クラスタ ${clusterId}`,
      type: 'scatter',
      data: points.map(point => [point.x, point.y, point.id, point.text, point.tags]),
      symbolSize: 8,
      itemStyle: {
        color: colors[index % colors.length],
        opacity: 0.7
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
          borderColor: '#000',
          borderWidth: 2
        }
      }
    }))

    // クラスタの中心を追加
    const clusterCenters = Object.entries(analysisResult.clusters).map(([clusterId, cluster]: [string, any]) => ({
      name: `中心 ${clusterId}`,
      type: 'scatter',
      data: [[cluster.center_x, cluster.center_y, `center_${clusterId}`, '', []]],
      symbolSize: 15,
      symbol: 'diamond',
      itemStyle: {
        color: colors[parseInt(clusterId) % colors.length],
        opacity: 0.8
      },
      label: {
        show: true,
        position: 'top',
        formatter: `C${clusterId}`,
        fontSize: 12,
        fontWeight: 'bold'
      }
    }))

    const option = {
      title: {
        text: 'クラスタリングマップ',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.data[2].startsWith('center_')) {
            const clusterId = params.data[2].replace('center_', '')
            const cluster = analysisResult.clusters[parseInt(clusterId)]
            return `
              <div>
                <strong>クラスタ ${clusterId} の中心</strong><br/>
                サイズ: ${cluster.size}点<br/>
                主要タグ: ${cluster.top_tags.join(', ')}
              </div>
            `
          }
          return `
            <div>
              <strong>ID: ${params.data[2]}</strong><br/>
              <strong>テキスト:</strong> ${params.data[3].substring(0, 100)}${params.data[3].length > 100 ? '...' : ''}<br/>
              <strong>タグ:</strong> ${params.data[4].join(', ')}
            </div>
          `
        }
      },
      legend: {
        data: series.map(s => s.name),
        bottom: 10,
        type: 'scroll'
      },
      xAxis: {
        name: 'UMAP 1',
        nameLocation: 'middle',
        nameGap: 30,
        type: 'value',
        axisLine: { show: true },
        axisTick: { show: true },
        splitLine: { show: true }
      },
      yAxis: {
        name: 'UMAP 2',
        nameLocation: 'middle',
        nameGap: 50,
        type: 'value',
        axisLine: { show: true },
        axisTick: { show: true },
        splitLine: { show: true }
      },
      series: [...series, ...clusterCenters],
      animation: true,
      animationDuration: 1000
    }

    chartInstance.current.setOption(option)

    // クリックイベント
    chartInstance.current.on('click', (params: any) => {
      if (!params.data[2].startsWith('center_')) {
        const point = analysisResult.data_points.find(p => p.id === params.data[2])
        if (point) {
          setSelectedPoints(prev => {
            const exists = prev.some(p => p.id === point.id)
            if (exists) {
              return prev.filter(p => p.id !== point.id)
            } else {
              return [...prev, point]
            }
          })
        }
      }
    })
  }

  const handleExportPDF = async () => {
    try {
      setIsLoading(true)
      const blob = await exportPDF()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'clustering_map.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPNG = async () => {
    try {
      setIsLoading(true)
      const blob = await exportPNG()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'clustering_map.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PNG export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!analysisResult) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">解析結果がありません</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
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
          可視化結果
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExportPDF}
            disabled={isLoading}
            className="btn btn-secondary flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button
            onClick={handleExportPNG}
            disabled={isLoading}
            className="btn btn-secondary flex items-center"
          >
            <Image className="w-4 h-4 mr-2" />
            PNG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* メインチャート */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="h-96" ref={chartRef}></div>
          </div>
        </div>

        {/* サイドパネル */}
        <div className="space-y-6">
          {/* フィルター */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              フィルター
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグでフィルター
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {analysisResult.tags.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filteredTags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilteredTags(prev => [...prev, tag])
                          } else {
                            setFilteredTags(prev => prev.filter(t => t !== tag))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  クラスタでフィルター
                </label>
                <select
                  value={selectedCluster || ''}
                  onChange={(e) => setSelectedCluster(e.target.value ? parseInt(e.target.value) : null)}
                  className="input"
                >
                  <option value="">すべて</option>
                  {Object.keys(analysisResult.clusters).map(clusterId => (
                    <option key={clusterId} value={clusterId}>
                      クラスタ {clusterId}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setFilteredTags([])
                  setSelectedCluster(null)
                }}
                className="btn btn-secondary w-full"
              >
                フィルターをクリア
              </button>
            </div>
          </div>

          {/* 選択されたポイント */}
          {selectedPoints.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                選択されたポイント ({selectedPoints.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedPoints.map(point => (
                  <div key={point.id} className="p-2 border border-gray-200 rounded text-sm">
                    <div className="font-medium">ID: {point.id}</div>
                    <div className="text-gray-600 truncate">
                      {point.text.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-500">
                      タグ: {point.tags.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 統計情報 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              統計情報
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>総データ数</span>
                <span>{analysisResult.data_points.length}</span>
              </div>
              <div className="flex justify-between">
                <span>クラスタ数</span>
                <span>{Object.keys(analysisResult.clusters).length}</span>
              </div>
              <div className="flex justify-between">
                <span>タグ数</span>
                <span>{analysisResult.tags.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
