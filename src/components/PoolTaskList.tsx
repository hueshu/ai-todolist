"use client"

import { TaskList } from './TaskList'
import { useStore } from '@/lib/store'

export function PoolTaskList() {
  const tasks = useStore((state) => state.tasks)
  const updateTask = useStore((state) => state.updateTask)
  
  // 找出所有不在池中但也不是今日任务的任务，并将它们修正为池状态
  const misplacedTasks = tasks.filter(task => 
    task.status === 'scheduled' && !task.timeSlot && !task.deadline
  )
  
  // 自动修正这些任务
  if (misplacedTasks.length > 0) {
    misplacedTasks.forEach(task => {
      updateTask(task.id, { status: 'pool' })
    })
  }
  
  return <TaskList filter="pool" />
}