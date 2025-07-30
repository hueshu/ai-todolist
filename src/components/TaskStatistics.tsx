"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Target,
  Activity,
  Award
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { 
  getTaskCompletionHistoryByDateRange,
  getTaskCompletionHistoryByTaskId 
} from '@/lib/database'
import { TaskCompletionHistory, Task } from '@/types'
import { getBeijingTime, formatBeijingDate } from '@/lib/timezone'

interface TaskStats {
  taskId: string
  taskTitle: string
  taskType: string
  totalCompletions: number
  lastCompleted?: Date
  averageHours: number
  completionDates: Date[]
}

export function TaskStatistics() {
  const [isLoading, setIsLoading] = useState(true)
  const [completionHistory, setCompletionHistory] = useState<TaskCompletionHistory[]>([])
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  
  // 获取历史数据
  useEffect(() => {
    loadHistoryData()
  }, [dateRange])
  
  const loadHistoryData = async () => {
    setIsLoading(true)
    try {
      const endDate = getBeijingTime()
      const startDate = getBeijingTime()
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }
      
      const history = await getTaskCompletionHistoryByDateRange(startDate, endDate)
      setCompletionHistory(history)
    } catch (error) {
      console.error('加载历史数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 按任务统计
  const getTaskStats = (): TaskStats[] => {
    const statsMap = new Map<string, TaskStats>()
    
    completionHistory.forEach(record => {
      if (!statsMap.has(record.taskId)) {
        statsMap.set(record.taskId, {
          taskId: record.taskId,
          taskTitle: record.taskTitle,
          taskType: record.taskType,
          totalCompletions: 0,
          averageHours: 0,
          completionDates: []
        })
      }
      
      const stats = statsMap.get(record.taskId)!
      stats.totalCompletions++
      stats.completionDates.push(record.completedAt)
      stats.lastCompleted = record.completedAt
      
      if (record.actualHours) {
        stats.averageHours = (stats.averageHours * (stats.totalCompletions - 1) + record.actualHours) / stats.totalCompletions
      }
    })
    
    return Array.from(statsMap.values()).sort((a, b) => b.totalCompletions - a.totalCompletions)
  }
  
  // 按日期统计
  const getDailyStats = () => {
    const dailyMap = new Map<string, number>()
    
    completionHistory.forEach(record => {
      const dateKey = formatBeijingDate(record.completedAt)
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1)
    })
    
    return Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))
  }
  
  // 按项目统计
  const getProjectStats = () => {
    const projectMap = new Map<string, { name: string; count: number; hours: number }>()
    
    completionHistory.forEach(record => {
      if (record.projectId) {
        const project = projects.find(p => p.id === record.projectId)
        if (project) {
          if (!projectMap.has(record.projectId)) {
            projectMap.set(record.projectId, {
              name: project.name,
              count: 0,
              hours: 0
            })
          }
          
          const stats = projectMap.get(record.projectId)!
          stats.count++
          stats.hours += record.actualHours || record.estimatedHours
        }
      }
    })
    
    return Array.from(projectMap.values()).sort((a, b) => b.count - a.count)
  }
  
  const taskStats = getTaskStats()
  const dailyStats = getDailyStats()
  const projectStats = getProjectStats()
  
  // 计算总体统计
  const totalCompletions = completionHistory.length
  const totalHours = completionHistory.reduce((sum, record) => 
    sum + (record.actualHours || record.estimatedHours), 0
  )
  const uniqueTasks = new Set(completionHistory.map(r => r.taskId)).size
  
  // 计算连续完成天数
  const getStreak = () => {
    const dates = new Set(completionHistory.map(r => formatBeijingDate(r.completedAt)))
    let streak = 0
    const today = getBeijingTime()
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = formatBeijingDate(checkDate)
      
      if (dates.has(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }
  
  const currentStreak = getStreak()
  
  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">任务统计</h2>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('week')}
          >
            最近一周
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('month')}
          >
            最近一月
          </Button>
          <Button
            variant={dateRange === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('year')}
          >
            最近一年
          </Button>
        </div>
      </div>
      
      {/* 总体统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总完成次数</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              {uniqueTasks} 个不同任务
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总工作时长</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              平均 {totalCompletions > 0 ? (totalHours / totalCompletions).toFixed(1) : 0}h/任务
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">连续完成</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} 天</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak > 0 ? '继续保持！' : '开始新的连续记录'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">日均完成</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyStats.length > 0 ? (totalCompletions / dailyStats.length).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              个任务/天
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 详细统计标签页 */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">任务统计</TabsTrigger>
          <TabsTrigger value="timeline">时间分布</TabsTrigger>
          <TabsTrigger value="projects">项目统计</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                任务完成排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskStats.map((stat, index) => {
                  const task = tasks.find(t => t.id === stat.taskId)
                  const taskTypeIcon = {
                    daily: '🔁',
                    weekly: '📆',
                    monthly: '🗓️',
                    single: '📅'
                  }[stat.taskType] || '📋'
                  
                  return (
                    <div key={stat.taskId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{taskTypeIcon}</span>
                            <span className="font-medium">{stat.taskTitle}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            最后完成: {stat.lastCompleted ? formatBeijingDate(stat.lastCompleted) : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{stat.totalCompletions}</div>
                        <div className="text-sm text-gray-500">次完成</div>
                      </div>
                    </div>
                  )
                })}
                
                {taskStats.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    暂无完成记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                每日完成趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyStats.reverse().slice(0, 30).map(stat => {
                  const maxCount = Math.max(...dailyStats.map(d => d.count))
                  const percentage = (stat.count / maxCount) * 100
                  
                  return (
                    <div key={stat.date} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-500">{stat.date}</div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{stat.count}</div>
                    </div>
                  )
                })}
                
                {dailyStats.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    暂无完成记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                项目完成统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{stat.name}</div>
                      <div className="text-sm text-gray-500">
                        {stat.hours.toFixed(1)} 小时
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{stat.count}</div>
                      <div className="text-sm text-gray-500">个任务</div>
                    </div>
                  </div>
                ))}
                
                {projectStats.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    暂无项目完成记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}