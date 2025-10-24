export interface DataPoint {
  id: string | number
  text: string
  x: number
  y: number
  cluster_id: number
  tags: string[]
  group?: string
  metadata?: Record<string, any>
}

export interface Cluster {
  size: number
  top_tags: string[]
  center_x: number
  center_y: number
}

export interface AnalysisResult {
  data_points: DataPoint[]
  clusters: Record<number, Cluster>
  tags: string[]
  config: Record<string, any>
}

export interface TagCandidate {
  text: string
  score: number
  category?: string
  count: number
}

export interface TagRule {
  key: string
  synonyms: string[]
  category?: string
}

export interface ColumnMapping {
  text_column: string
  id_column: string
  group_column: string
}

export type Step = 'upload' | 'mapping' | 'tags' | 'analysis' | 'visualization'

export interface UploadResponse {
  success: boolean
  message: string
  columns: string[]
  sample_data: Record<string, any>[]
  tag_candidates: TagCandidate[]
}

export interface AnalysisRequest {
  column_mapping: ColumnMapping
  tag_rules: TagRule[]
  cluster_method: 'hdbscan' | 'kmeans' | 'dbscan'
  hdbscan_params: Record<string, any>
  kmeans_params: Record<string, any>
  umap_params: Record<string, any>
  shape_mask_path?: string
}
