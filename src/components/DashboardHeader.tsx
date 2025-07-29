"use client"

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { getBeijingTime, isBeijingToday, formatBeijingTime } from '@/lib/timezone'

export function DashboardHeader() {
  const tasks = useStore((state) => state.tasks)
  
  // 获取今日任务（根据deadline判断）
  const todayTasks = tasks.filter(task => {
    if (!task.deadline) return false
    return isBeijingToday(task.deadline)
  })
  
  // 今日已完成的任务
  const completedToday = tasks.filter(
    task => task.status === 'completed' && 
    task.completedAt && 
    isBeijingToday(task.completedAt)
  )
  
  // 今日待完成的任务
  const pendingToday = todayTasks.filter(task => task.status !== 'completed')
  
  // 计算今日工作时长
  const totalHoursToday = pendingToday.reduce((sum, task) => sum + task.estimatedHours, 0)
  const completedHoursToday = completedToday.reduce((sum, task) => sum + (task.actualHours || task.estimatedHours), 0)
  
  return (
    <div className="text-center mb-6">
      {/* 简洁的一行标题 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {format(getBeijingTime(), 'M月d日 EEEE', { locale: zhCN })} · 
          今日任务 {todayTasks.length} 个，已完成 {completedToday.length} 个，剩余 {pendingToday.length} 个
        </p>
      </div>
      
      {/* 统计信息一行显示 */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-blue-600">📋</span>
          <span className="text-gray-600">今日待办</span>
          <span className="font-semibold text-blue-800">{pendingToday.length}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-green-600">✅</span>
          <span className="text-gray-600">已完成</span>
          <span className="font-semibold text-green-800">{completedToday.length}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-orange-600">⏰</span>
          <span className="text-gray-600">计划工时</span>
          <span className="font-semibold text-orange-800">{totalHoursToday.toFixed(1)}h</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-purple-600">⚡</span>
          <span className="text-gray-600">完成工时</span>
          <span className="font-semibold text-purple-800">{completedHoursToday.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  )
}