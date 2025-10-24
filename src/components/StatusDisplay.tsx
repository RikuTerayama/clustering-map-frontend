import React from 'react'
import { CheckCircle, AlertCircle, Clock, XCircle, Info } from 'lucide-react'

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface StatusItem {
  id: string
  message: string
  type: StatusType
  timestamp?: Date
}

interface StatusDisplayProps {
  statuses: StatusItem[]
  title?: string
}

const getStatusIcon = (type: StatusType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    case 'loading':
      return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-500" />
  }
}

const getStatusColor = (type: StatusType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'loading':
      return 'bg-blue-50 border-blue-200 text-blue-800'
    case 'info':
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ 
  statuses, 
  title = "ステータス" 
}) => {
  if (statuses.length === 0) {
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-500" />
        {title}
      </h3>
      
      <div className="space-y-3">
        {statuses.map((status) => (
          <div
            key={status.id}
            className={`p-3 rounded-lg border flex items-start space-x-3 ${getStatusColor(status.type)}`}
          >
            {getStatusIcon(status.type)}
            <div className="flex-1">
              <p className="text-sm font-medium">{status.message}</p>
              {status.timestamp && (
                <p className="text-xs opacity-75 mt-1">
                  {status.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ステータス管理用のフック
export const useStatusManager = () => {
  const [statuses, setStatuses] = React.useState<StatusItem[]>([])

  const addStatus = (message: string, type: StatusType) => {
    const newStatus: StatusItem = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    }
    setStatuses(prev => [...prev, newStatus])
  }

  const clearStatuses = () => {
    setStatuses([])
  }

  const removeStatus = (id: string) => {
    setStatuses(prev => prev.filter(status => status.id !== id))
  }

  return {
    statuses,
    addStatus,
    clearStatuses,
    removeStatus
  }
}
