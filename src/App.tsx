import React, { useState } from 'react'
import { Header } from './components/Header'
import { UploadStep } from './components/UploadStep'
import { ColumnMappingStep } from './components/ColumnMappingStep'
import { TagEditingStep } from './components/TagEditingStep'
import { AnalysisStep } from './components/AnalysisStep'
import { VisualizationStep } from './components/VisualizationStep'
import { UploadResponse, AnalysisRequest, AnalysisResult, ColumnMapping } from './types'

type Step = 'upload' | 'mapping' | 'tags' | 'analysis' | 'visualization'

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null)
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleUploadComplete = (data: UploadResponse) => {
    setUploadData(data)
    setCurrentStep('mapping')
  }

  const handleMappingComplete = (mapping: ColumnMapping) => {
    // ColumnMappingからAnalysisRequestを作成
    const request: AnalysisRequest = {
      column_mapping: mapping,
      tag_rules: [],
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
        
        {currentStep === 'mapping' && uploadData && (
          <ColumnMappingStep
            columns={uploadData.columns}
            sampleData={uploadData.sample_data}
            onComplete={handleMappingComplete}
            onBack={() => setCurrentStep('upload')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        
        {currentStep === 'tags' && analysisRequest && uploadData && (
          <TagEditingStep
            tagCandidates={uploadData.tag_candidates}
            onComplete={() => setCurrentStep('analysis')}
            onBack={() => setCurrentStep('mapping')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        
        {currentStep === 'analysis' && analysisRequest && (
          <AnalysisStep
            columnMapping={analysisRequest.column_mapping}
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
