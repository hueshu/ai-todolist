"use client"

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export function AllTasksDebug() {
  const tasks = useStore((state) => state.tasks)
  const updateTask = useStore((state) => state.updateTask)
  
  // 按状态分组任务
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)
  
  // 找出可能有问题的任务
  const problematicTasks = tasks.filter(task => 
    task.status === 'in-progress' || 
    task.status === 'scheduled' || 
    !['pool', 'completed'].includes(task.status)
  )
  
  const handleFixTask = (taskId: string) => {
    updateTask(taskId, { 
      status: 'pool',
      timeSlot: undefined,
      scheduledStartTime: undefined
    })
  }
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          所有任务调试视图
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">任务总数: {tasks.length}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-red-600">可能有问题的任务 ({problematicTasks.length}):</h4>
            {problematicTasks.map(task => (
              <div key={task.id} className="p-3 bg-white rounded-lg border border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      状态: <span className="font-mono bg-gray-100 px-1 rounded">{task.status}</span>
                    </p>
                    {task.timeSlot && (
                      <p className="text-xs text-gray-600">
                        时间段: <span className="font-mono bg-gray-100 px-1 rounded">{task.timeSlot}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {task.id}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFixTask(task.id)}
                    className="ml-2"
                  >
                    修复
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">按状态分组:</h4>
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="space-y-1">
                <p className="font-medium text-gray-700">
                  {status} ({statusTasks.length}):
                </p>
                <div className="pl-4 space-y-1">
                  {statusTasks.map(task => (
                    <div key={task.id} className="text-xs text-gray-600 bg-white p-2 rounded">
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}