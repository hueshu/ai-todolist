"use client"

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RecoverTasks() {
  const tasks = useStore((state) => state.tasks)
  const updateTask = useStore((state) => state.updateTask)
  
  // 查找可能"消失"的任务（进行中状态但没有时间安排）
  const problematicTasks = tasks.filter(task => 
    task.status === 'in-progress' && !task.timeSlot
  )
  
  // 恢复任务到任务池
  const recoverTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { 
        status: 'pool',
        timeSlot: undefined,
        scheduledStartTime: undefined
      })
      alert('任务已恢复到任务池')
    } catch (error) {
      console.error('恢复任务失败:', error)
      alert('恢复任务失败')
    }
  }
  
  // 一键恢复所有问题任务
  const recoverAll = async () => {
    for (const task of problematicTasks) {
      await updateTask(task.id, { 
        status: 'pool',
        timeSlot: undefined,
        scheduledStartTime: undefined
      })
    }
    alert(`已恢复 ${problematicTasks.length} 个任务到任务池`)
  }
  
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">任务恢复工具</CardTitle>
      </CardHeader>
      <CardContent>
        {problematicTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">没有发现需要恢复的任务</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-orange-700">
              发现 {problematicTasks.length} 个可能"消失"的任务（进行中但无时间安排）
            </p>
            
            <div className="space-y-2">
              {problematicTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      状态: {task.status} | 创建时间: {new Date(task.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => recoverTask(task.id)}
                  >
                    恢复
                  </Button>
                </div>
              ))}
            </div>
            
            {problematicTasks.length > 1 && (
              <Button
                onClick={recoverAll}
                className="w-full"
                variant="default"
              >
                一键恢复全部
              </Button>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            提示：此工具会查找状态为"进行中"但没有时间安排的任务，这些任务可能不会显示在今日任务中。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}