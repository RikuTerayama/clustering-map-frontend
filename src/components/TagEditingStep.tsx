import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Edit3, Trash2, Plus, Tag } from 'lucide-react'
import { TagCandidate, TagRule } from '../types'

interface TagEditingStepProps {
  tagCandidates: TagCandidate[]
  onComplete: (tagRules: TagRule[]) => void
  onBack: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const TagEditingStep: React.FC<TagEditingStepProps> = ({
  tagCandidates,
  onComplete,
  onBack,
  isLoading,
  setIsLoading,
}) => {
  const [tags, setTags] = useState<TagCandidate[]>([])
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagText, setNewTagText] = useState('')
  const [newTagCategory, setNewTagCategory] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setTags(tagCandidates)
  }, [tagCandidates])

  const handleEditTag = (index: number, field: keyof TagCandidate, value: any) => {
    setTags(prev => prev.map((tag, i) => 
      i === index ? { ...tag, [field]: value } : tag
    ))
  }

  const handleDeleteTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (newTagText.trim()) {
      const newTag: TagCandidate = {
        text: newTagText.trim(),
        score: 0,
        category: newTagCategory.trim() || undefined,
        count: 1
      }
      setTags(prev => [...prev, newTag])
      setNewTagText('')
      setNewTagCategory('')
      setShowAddForm(false)
    }
  }

  const handleNext = () => {
    // TagCandidateをTagRuleに変換
    const tagRules: TagRule[] = tags.map(tag => ({
      key: tag.text,
      synonyms: [tag.text], // 基本的には同じテキストを同義語として設定
      category: tag.category || 'その他'
    }))
    
    onComplete(tagRules)
  }

  const filteredTags = tags.filter(tag => 
    tag.text.toLowerCase().includes(filter.toLowerCase()) ||
    (tag.category && tag.category.toLowerCase().includes(filter.toLowerCase()))
  )

  const categoryColors = {
    '営業': 'bg-blue-100 text-blue-800',
    '開発': 'bg-green-100 text-green-800',
    '人事': 'bg-purple-100 text-purple-800',
    '組織': 'bg-orange-100 text-orange-800',
    '': 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-6xl mx-auto">
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
          タグ編集
        </h2>
        <div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* タグ一覧 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                タグ候補 ({tags.length}個)
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                タグを追加
              </button>
            </div>

            {/* 検索フィルター */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="タグを検索..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input"
              />
            </div>

            {/* タグリスト */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{tag.text}</span>
                      {tag.category && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          categoryColors[tag.category as keyof typeof categoryColors] || categoryColors['']
                        }`}>
                          {tag.category}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      スコア: {tag.score.toFixed(3)} | 出現回数: {tag.count}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTag(editingTag === tag.text ? null : tag.text)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTags.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {filter ? '検索条件に一致するタグがありません' : 'タグがありません'}
              </div>
            )}
          </div>
        </div>

        {/* タグ追加フォーム */}
        <div className="space-y-6">
          {showAddForm && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                新しいタグを追加
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タグテキスト
                  </label>
                  <input
                    type="text"
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    placeholder="タグを入力..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ（オプション）
                  </label>
                  <select
                    value={newTagCategory}
                    onChange={(e) => setNewTagCategory(e.target.value)}
                    className="input"
                  >
                    <option value="">カテゴリなし</option>
                    <option value="営業">営業</option>
                    <option value="開発">開発</option>
                    <option value="人事">人事</option>
                    <option value="組織">組織</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddTag}
                    className="btn btn-primary flex-1"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewTagText('')
                      setNewTagCategory('')
                    }}
                    className="btn btn-secondary"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 統計情報 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              統計情報
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総タグ数</span>
                <span className="text-sm font-medium">{tags.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">カテゴリ別</span>
                <div className="text-sm">
                  {Object.entries(
                    tags.reduce((acc, tag) => {
                      const cat = tag.category || '未分類'
                      acc[cat] = (acc[cat] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([cat, count]) => (
                    <span key={cat} className="ml-2">
                      {cat}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary flex items-center"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </button>
        <button
          onClick={handleNext}
          className="btn btn-primary flex items-center"
          disabled={isLoading}
        >
          次へ
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  )
}
