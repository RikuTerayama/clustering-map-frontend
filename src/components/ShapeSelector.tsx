import React from 'react'
import { Circle, Square, Triangle, Heart, Star, Hexagon } from 'lucide-react'

export type ShapeType = 'circle' | 'square' | 'triangle' | 'heart' | 'star' | 'hexagon'

interface ShapeSelectorProps {
  selectedShape: ShapeType
  onShapeChange: (shape: ShapeType) => void
}

const shapes: { type: ShapeType; name: string; icon: React.ReactNode }[] = [
  { type: 'circle', name: '円形', icon: <Circle className="w-8 h-8" /> },
  { type: 'square', name: '四角形', icon: <Square className="w-8 h-8" /> },
  { type: 'triangle', name: '三角形', icon: <Triangle className="w-8 h-8" /> },
  { type: 'heart', name: 'ハート', icon: <Heart className="w-8 h-8" /> },
  { type: 'star', name: '星形', icon: <Star className="w-8 h-8" /> },
  { type: 'hexagon', name: '六角形', icon: <Hexagon className="w-8 h-8" /> },
]

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  selectedShape,
  onShapeChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">マップの形状を選択</h3>
      <p className="text-sm text-gray-600">
        クラスタリングマップのレイアウト形状を選択してください
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            onClick={() => onShapeChange(shape.type)}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${
              selectedShape === shape.type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`${
                selectedShape === shape.type ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {shape.icon}
              </div>
              <span className="text-sm font-medium">{shape.name}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>選択した形状:</strong> {shapes.find(s => s.type === selectedShape)?.name}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          データポイントは選択した形状に沿って配置されます
        </p>
      </div>
    </div>
  )
}
