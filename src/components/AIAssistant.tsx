"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { Sparkles, Calendar, Clock, Coffee, Target, Loader2 } from 'lucide-react'
import { DailyPlanResponse } from '@/types'
import { cn } from '@/lib/utils'
import { getBeijingTime, getBeijingHourMinute } from '@/lib/timezone'

export function AIAssistant() {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(null)
  const [workEndTime, setWorkEndTime] = useState('20:00')
  const [userPreferences, setUserPreferences] = useState('') // 用户自定义偏好
  
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  const fixedEvents = useStore((state) => state.fixedEvents)
  const preferences = useStore((state) => state.preferences)
  const updateTask = useStore((state) => state.updateTask)
  const updatePreferences = useStore((state) => state.updatePreferences)
  
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true)
    try {
      const poolTasks = tasks.filter(t => t.status === 'pool')
      
      if (poolTasks.length === 0) {
        alert('任务池中没有待安排的任务！请先添加一些任务到任务池。')
        setIsGeneratingPlan(false)
        return
      }
      
      // 在点击按钮时获取当前北京时间作为起始时间点
      const now = new Date()
      // 使用新的工具函数获取北京时间的时和分
      const { hour: currentHour, minute: currentMinute } = getBeijingHourMinute()
      const startTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      console.log('[前端] 使用getBeijingHourMinute获取时间')
      console.log('[前端] 北京时间时:', currentHour, '分:', currentMinute)
      console.log('[前端] 发送的开始时间:', startTimeString)
      console.log('[前端] 本地Date对象:', now.toString())
      
      // 构建包含项目信息的任务数据
      const tasksWithProjectInfo = poolTasks.map(task => {
        const project = projects.find(p => p.id === task.projectId)
        return {
          ...task,
          project: project ? {
            id: project.id,
            name: project.name,
            duration: project.duration,
            priority: project.priority,
            status: project.status,
            weeklyGoals: project.weeklyGoals
          } : null
        }
      })

      // 获取所有任务的频次统计
      const taskFrequencyStats = {
        daily: tasks.filter(t => t.taskType === 'daily').length,
        weekly: tasks.filter(t => t.taskType === 'weekly').length,
        monthly: tasks.filter(t => t.taskType === 'monthly').length,
        single: tasks.filter(t => t.taskType === 'single').length
      }

      console.log('Sending request with data:', {
        date: now,
        startTime: now,
        availableHours: 8,
        existingTasks: tasksWithProjectInfo,
        projects: projects,
        fixedEvents: fixedEvents,
        preferences: preferences,
        taskFrequencyStats: taskFrequencyStats
      })

      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: now,
          startTime: now, // 添加起始时间
          startTimeString: startTimeString, // 直接传递时间字符串
          workEndTime: workEndTime, // 添加停止工作时间
          availableHours: 8, // 固定为8小时
          existingTasks: tasksWithProjectInfo,
          projects: projects,
          fixedEvents: fixedEvents,
          preferences: preferences,
          taskFrequencyStats: taskFrequencyStats,
          userPreferences: userPreferences // 添加用户自定义偏好
        })
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Received response:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setDailyPlan(data)
    } catch (error) {
      console.error('Failed to generate plan:', error)
      alert('生成计划失败：' + (error instanceof Error ? error.message : '请检查网络连接或API配置'))
    } finally {
      setIsGeneratingPlan(false)
    }
  }
  
  const applyPlan = () => {
    if (!dailyPlan) return
    
    // 将计划中的任务更新为 scheduled 状态
    dailyPlan.schedule.forEach((item) => {
      if (item.task.id !== 'break') {
        // 解析时间段，设置deadline和开始时间
        const [startTime, endTime] = item.timeSlot.split('-')
        const [startHours, startMinutes] = startTime.split(':').map(Number)
        const [endHours, endMinutes] = endTime.split(':').map(Number)
        
        const startDate = getBeijingTime()
        startDate.setHours(startHours, startMinutes, 0, 0)
        
        const endDate = getBeijingTime()
        endDate.setHours(endHours, endMinutes, 0, 0)
        
        updateTask(item.task.id, {
          status: 'scheduled',
          deadline: endDate,
          scheduledStartTime: startDate, // 新增开始时间字段
          timeSlot: item.timeSlot // 新增时间段信息
        })
      }
    })
    
    alert('计划已应用！请查看今日任务')
    setDailyPlan(null)
  }
  
  return (
    <>
      {/* 生成中的全屏遮罩 */}
      {isGeneratingPlan && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">正在生成今日计划</h3>
                <p className="text-sm text-gray-600">AI正在分析您的任务并制定最优方案...</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI 智能助手
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          让 AI 帮你分析任务、生成最优工作计划
        </p>
      </div>
      
      <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
              智能日程规划
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3" />
                  待安排任务
                </p>
                <p className="text-xl sm:text-3xl font-bold text-purple-600">
                  {tasks.filter(t => t.status === 'pool').length}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <p className="text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  停止工作时间
                </p>
                <Input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full h-8 sm:h-10 text-sm sm:text-base text-center font-medium border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1 flex items-center justify-center gap-1">
                <Coffee className="w-4 h-4 text-orange-500" />
                番茄工作法
              </p>
              <p className="text-xs text-gray-600">工作30分钟，休息5分钟</p>
              <p className="text-xs text-gray-600">工作时间: 当前时间 - {workEndTime}</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                今日偏好（可选）
              </label>
              <textarea
                value={userPreferences}
                onChange={(e) => setUserPreferences(e.target.value)}
                placeholder="例如：今天想专注于某个项目、需要预留时间处理紧急事务、下午精力较好等..."
                className="w-full h-16 sm:h-20 p-2 sm:p-3 text-xs sm:text-sm border-2 border-gray-200 rounded-lg resize-none focus:border-purple-400 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 italic">💡 AI会参考你的偏好来生成计划，但不会严格遵循</p>
            </div>
            
            
            <Button 
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan || tasks.filter(t => t.status === 'pool').length === 0}
              className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              {isGeneratingPlan ? '生成中...' : '生成今日计划'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {dailyPlan && (
        <Card className="border-green-100 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                  今日建议计划
                </span>
              </span>
              <Button variant="ghost" size="sm" onClick={() => setDailyPlan(null)} className="w-8 h-8 hover:bg-red-50 hover:text-red-600 transition-colors">
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4">
            <div className="space-y-2 sm:space-y-3">
              {dailyPlan.schedule.map((item, index) => {
                const typeIcons = {
                  focus: <Target className="w-3 h-3 sm:w-4 sm:h-4" />,
                  regular: <Clock className="w-3 h-3 sm:w-4 sm:h-4" />,
                  break: <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
                }
                
                return (
                  <div key={index} className={cn(
                    "flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border",
                    item.type === 'break' ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}>
                    <div className={cn(
                      "p-1.5 sm:p-2 rounded-full shrink-0",
                      item.type === 'focus' && "bg-purple-100 text-purple-700",
                      item.type === 'regular' && "bg-blue-100 text-blue-700",
                      item.type === 'break' && "bg-green-100 text-green-700"
                    )}>
                      {typeIcons[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-xs sm:text-sm">{item.timeSlot}</p>
                        <span className={cn(
                          "text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shrink-0",
                          item.type === 'focus' && "bg-purple-100 text-purple-700",
                          item.type === 'regular' && "bg-blue-100 text-blue-700",
                          item.type === 'break' && "bg-green-100 text-green-700"
                        )}>
                          {item.type === 'focus' ? '深度' : 
                           item.type === 'regular' ? '常规' : '休息'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm mt-1 truncate">{item.task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.reason}</p>
                    </div>
                  </div>
                )
              })}
              
              {dailyPlan.suggestions.length > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                    AI 建议
                  </p>
                  <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
                    {dailyPlan.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">预计生产力指数</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 sm:w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${dailyPlan.estimatedProductivity}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold shrink-0">{dailyPlan.estimatedProductivity}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setDailyPlan(null)} size="sm" className="flex-1 sm:flex-none text-xs px-3">
                      重新生成
                    </Button>
                    <Button onClick={applyPlan} size="sm" className="flex-1 sm:flex-none text-xs px-3">
                      应用计划
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  )
}