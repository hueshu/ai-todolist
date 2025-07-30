"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export function TaskRecovery() {
  const tasks = useStore((state) => state.tasks)
  const updateTask = useStore((state) => state.updateTask)
  const [recovered, setRecovered] = useState(false)
  
  // 找出所有状态为 'in-progress' 的任务（这些可能是"消失"的任务）
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress')
  
  const handleRecover = () => {
    inProgressTasks.forEach(task => {
      // 将所有 in-progress 的任务恢复为 scheduled 状态
      updateTask(task.id, { status: 'scheduled' })
    })
    setRecovered(true)
    setTimeout(() => setRecovered(false), 3000)
  }
  
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          任务恢复工具
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm space-y-2">
            <p>发现 {inProgressTasks.length} 个可能"消失"的任务（状态为进行中）</p>
            {inProgressTasks.map(task => (
              <div key={task.id} className="p-2 bg-white rounded">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">状态: {task.status}</p>
              </div>
            ))}
          </div>
          
          {inProgressTasks.length > 0 && (
            <Button
              onClick={handleRecover}
              className="w-full"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              恢复所有任务
            </Button>
          )}
          
          {recovered && (
            <p className="text-sm text-green-600 text-center">
              ✓ 已恢复 {inProgressTasks.length} 个任务
            </p>
          )}
          
          {inProgressTasks.length === 0 && (
            <p className="text-sm text-gray-600 text-center">
              没有发现需要恢复的任务
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}