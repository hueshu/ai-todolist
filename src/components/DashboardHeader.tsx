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
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">
        {format(getBeijingTime(), 'M月d日 EEEE', { locale: zhCN })}
      </h1>
      <p className="text-muted-foreground mb-4">
        今日任务 {todayTasks.length} 个，已完成 {completedToday.length} 个，剩余 {pendingToday.length} 个
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">今日待办</p>
            <p className="text-2xl font-bold">{pendingToday.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">今日完成</p>
            <p className="text-2xl font-bold">{completedToday.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">计划工时</p>
            <p className="text-2xl font-bold">{totalHoursToday.toFixed(1)}h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">完成工时</p>
            <p className="text-2xl font-bold">{completedHoursToday.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}