"use client"

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DebugTasks() {
  const tasks = useStore((state) => state.tasks)
  const updateTask = useStore((state) => state.updateTask)
  
  // 获取所有任务，按状态分组
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || 'unknown'
    if (!acc[status]) acc[status] = []
    acc[status].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)
  
  // 恢复任务到任务池
  const restoreTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'pool' })
      alert('任务已恢复到任务池')
    } catch (error) {
      console.error('恢复任务失败:', error)
      alert('恢复任务失败')
    }
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>所有任务调试信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              总任务数: {tasks.length}
            </div>
            
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="space-y-2">
                <h3 className="font-semibold">
                  状态: {status} ({statusTasks.length} 个任务)
                </h3>
                <div className="space-y-2 pl-4">
                  {statusTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {task.id} | 
                          优先级: {task.priority} | 
                          创建时间: {new Date(task.createdAt).toLocaleString('zh-CN')}
                          {task.completedAt && ` | 完成时间: ${new Date(task.completedAt).toLocaleString('zh-CN')}`}
                        </div>
                      </div>
                      {status !== 'pool' && status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreTask(task.id)}
                        >
                          恢复到任务池
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                没有找到任何任务
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}