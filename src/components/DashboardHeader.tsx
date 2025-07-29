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
    <div className="text-center mb-8">
      {/* 主标题区域 */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
          {format(getBeijingTime(), 'M月d日', { locale: zhCN })}
        </h1>
        <h2 className="text-base md:text-lg font-medium text-gray-600 mb-2">
          {format(getBeijingTime(), 'EEEE', { locale: zhCN })}
        </h2>
        <p className="text-gray-500 text-sm">
          今日任务 {todayTasks.length} 个，已完成 {completedToday.length} 个，剩余 {pendingToday.length} 个
        </p>
      </div>
      
      {/* 统计卡片区域 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">📋</span>
            </div>
            <p className="text-sm text-blue-600 font-medium mb-1">今日待办</p>
            <p className="text-3xl font-bold text-blue-800">{pendingToday.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">✅</span>
            </div>
            <p className="text-sm text-green-600 font-medium mb-1">今日完成</p>
            <p className="text-3xl font-bold text-green-800">{completedToday.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">⏰</span>
            </div>
            <p className="text-sm text-orange-600 font-medium mb-1">计划工时</p>
            <p className="text-3xl font-bold text-orange-800">{totalHoursToday.toFixed(1)}h</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <p className="text-sm text-purple-600 font-medium mb-1">完成工时</p>
            <p className="text-3xl font-bold text-purple-800">{completedHoursToday.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}