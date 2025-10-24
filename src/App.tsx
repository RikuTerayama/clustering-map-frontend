import React, { useState } from 'react'
import { Header } from './components/Header'
import { UploadStep } from './components/UploadStep'
import { TagEditingStep } from './components/TagEditingStep'
import { AnalysisStep } from './components/AnalysisStep'
import { VisualizationStep } from './components/VisualizationStep'
import { UploadResponse, AnalysisRequest, AnalysisResult } from './types'

type Step = 'upload' | 'tags' | 'analysis' | 'visualization'

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null)
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleUploadComplete = (data: UploadResponse) => {
    setUploadData(data)
    // 自動的にタグ生成ステップに進む
    setCurrentStep('tags')
  }

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result)
    setCurrentStep('visualization')
  }

  const resetApp = () => {
    setCurrentStep('upload')
    setUploadData(null)
    setAnalysisRequest(null)
    setAnalysisResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && (
          <UploadStep
            onComplete={handleUploadComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        
        {currentStep === 'tags' && uploadData && (
          <TagEditingStep
            tagCandidates={uploadData.tag_candidates}
            onComplete={(tagRules) => {
              // デフォルトのAnalysisRequestを作成
              const request: AnalysisRequest = {
                column_mapping: {
                  text_column: uploadData.columns[0] || '自由記述',
                  id_column: '',
                  group_column: ''
                },
                tag_rules: tagRules,
                cluster_method: 'hdbscan',
                hdbscan_params: {
                  min_cluster_size: 15,
                  min_samples: 5
                },
                kmeans_params: {
                  n_clusters: 8
                },
                umap_params: {
                  n_neighbors: 15,
                  min_dist: 0.1,
                  random_state: 42
                }
              }
              setAnalysisRequest(request)
              setCurrentStep('analysis')
            }}
            onBack={() => setCurrentStep('upload')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        
        {currentStep === 'analysis' && analysisRequest && (
          <AnalysisStep
            analysisRequest={analysisRequest}
            onComplete={handleAnalysisComplete}
            onBack={() => setCurrentStep('tags')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        
        {currentStep === 'visualization' && analysisResult && (
          <VisualizationStep
            analysisResult={analysisResult}
            onBack={() => setCurrentStep('analysis')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </main>
    </div>
  )
}

export default App
