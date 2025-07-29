"use client"

import { useStore } from '@/lib/store'

export function TestFixedEvents() {
  const fixedEvents = useStore((state) => state.fixedEvents)
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-2">固定事件调试信息</h3>
      <p className="text-sm text-gray-600 mb-2">固定事件数量: {fixedEvents.length}</p>
      {fixedEvents.length > 0 && (
        <div className="max-h-40 overflow-auto">
          <pre className="text-xs bg-white p-2 rounded border">
            {JSON.stringify(fixedEvents, (key, value) => {
              // 格式化日期显示
              if (key === 'createdAt' || key === 'updatedAt') {
                return new Date(value).toLocaleString('zh-CN')
              }
              return value
            }, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}