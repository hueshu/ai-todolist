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
      
      {/* 统计卡片区域 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all duration-300">
          <CardContent className="px-2 py-2 text-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-white font-bold text-xs">📋</span>
            </div>
            <p className="text-xs text-blue-600 font-medium mb-0.5">今日待办</p>
            <p className="text-lg font-bold text-blue-800">{pendingToday.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all duration-300">
          <CardContent className="px-2 py-2 text-center">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-white font-bold text-xs">✅</span>
            </div>
            <p className="text-xs text-green-600 font-medium mb-0.5">今日完成</p>
            <p className="text-lg font-bold text-green-800">{completedToday.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-all duration-300">
          <CardContent className="px-2 py-2 text-center">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-white font-bold text-xs">⏰</span>
            </div>
            <p className="text-xs text-orange-600 font-medium mb-0.5">计划工时</p>
            <p className="text-lg font-bold text-orange-800">{totalHoursToday.toFixed(1)}h</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all duration-300">
          <CardContent className="px-2 py-2 text-center">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-white font-bold text-xs">⚡</span>
            </div>
            <p className="text-xs text-purple-600 font-medium mb-0.5">完成工时</p>
            <p className="text-lg font-bold text-purple-800">{completedHoursToday.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}