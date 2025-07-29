import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Task } from "@/types"
import { isToday } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 时间操作工具函数
export function parseTimeSlot(timeSlot: string): { start: Date; end: Date } {
  const [startStr, endStr] = timeSlot.split('-')
  const [startHour, startMin] = startStr.split(':').map(Number)
  const [endHour, endMin] = endStr.split(':').map(Number)
  
  const start = new Date()
  start.setHours(startHour, startMin, 0, 0)
  
  const end = new Date()
  end.setHours(endHour, endMin, 0, 0)
  
  return { start, end }
}

export function formatTimeSlot(start: Date, end: Date): string {
  const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
  const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
  return `${startStr}-${endStr}`
}

// 重新计算后续任务时间
export function recalculateSubsequentTasks(
  completedTask: Task,
  allTasks: Task[],
  actualCompletionTime: Date
): Partial<Task>[] {
  // 获取今日所有有时间安排的任务
  const todayScheduledTasks = allTasks
    .filter(task => 
      task.timeSlot && 
      task.scheduledStartTime && 
      isToday(new Date(task.deadline || ''))
    )
    .sort((a, b) => {
      const aStart = new Date(a.scheduledStartTime!)
      const bStart = new Date(b.scheduledStartTime!)
      return aStart.getTime() - bStart.getTime()
    })

  const completedTaskIndex = todayScheduledTasks.findIndex(task => task.id === completedTask.id)
  
  if (completedTaskIndex === -1) return []

  const updates: Partial<Task>[] = []
  
  // 计算完成任务的实际结束时间与计划结束时间的差异
  const originalEnd = parseTimeSlot(completedTask.timeSlot!).end
  const timeDifference = actualCompletionTime.getTime() - originalEnd.getTime()
  
  // 如果没有时间差异，不需要调整
  if (Math.abs(timeDifference) < 60000) return [] // 小于1分钟的差异忽略
  
  // 调整后续所有任务的时间
  for (let i = completedTaskIndex + 1; i < todayScheduledTasks.length; i++) {
    const task = todayScheduledTasks[i]
    const { start, end } = parseTimeSlot(task.timeSlot!)
    
    // 应用时间偏移
    const newStart = new Date(start.getTime() + timeDifference)
    const newEnd = new Date(end.getTime() + timeDifference)
    
    updates.push({
      id: task.id,
      scheduledStartTime: newStart,
      deadline: newEnd,
      timeSlot: formatTimeSlot(newStart, newEnd)
    })
  }
  
  return updates
}