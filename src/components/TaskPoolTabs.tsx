"use client"

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TaskInput } from './TaskInput'
import { TaskList } from './TaskList'
import { PoolTaskList } from './PoolTaskList'
import { CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { resetDailyTasks } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { TestResetButton } from './TestResetButton'

export function TaskPoolTabs() {
  const [isResetting, setIsResetting] = useState(false)
  const tasks = useStore((state) => state.tasks)
  const loadTasks = useStore((state) => state.loadTasks)
  
  // 计算待处理和已完成任务数量
  const pendingCount = tasks.filter(task => task.status === 'pool').length
  const completedCount = tasks.filter(task => task.status === 'completed').length
  
  // 手动重置每日任务
  const handleResetDailyTasks = async () => {
    // 先检查有多少任务需要重置
    const completedPeriodicTasks = tasks.filter(task => 
      task.status === 'completed' && 
      ['daily', 'weekly', 'monthly'].includes(task.taskType)
    )
    
    if (completedPeriodicTasks.length === 0) {
      alert('没有需要重置的周期性任务')
      return
    }
    
    if (!confirm(`找到 ${completedPeriodicTasks.length} 个已完成的周期性任务。\n\n确定要检查并重置符合条件的任务吗？\n\n重置规则：\n- 每日任务：昨天及之前完成的\n- 每周任务：7天前完成的\n- 每月任务：上月完成的`)) {
      return
    }
    
    setIsResetting(true)
    try {
      await resetDailyTasks()
      await loadTasks() // 重新加载任务列表
      
      // 重新检查，看看实际重置了多少个
      const stillCompleted = tasks.filter(task => 
        task.status === 'completed' && 
        ['daily', 'weekly', 'monthly'].includes(task.taskType)
      ).length
      
      const resetCount = completedPeriodicTasks.length - stillCompleted
      
      if (resetCount > 0) {
        alert(`成功重置 ${resetCount} 个周期性任务！`)
      } else {
        alert('没有任务需要重置（所有任务的完成时间都还不符合重置条件）')
      }
    } catch (error) {
      console.error('重置任务失败:', error)
      alert('重置任务失败，请查看控制台了解详情')
    } finally {
      setIsResetting(false)
    }
  }
  
  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Circle className="w-4 h-4" />
          <span>待处理</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>已完成</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {completedCount}
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="space-y-4">
        <div className="mb-4 sm:mb-8">
          <TaskInput />
        </div>
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDailyTasks}
            disabled={isResetting}
            className="text-xs"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
            重置周期任务
          </Button>
        </div>
        <PoolTaskList />
      </TabsContent>
      
      <TabsContent value="completed" className="space-y-4">
        {/* 测试工具 */}
        <TestResetButton />
        <TaskList filter="completed" />
      </TabsContent>
    </Tabs>
  )
}