"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { Sparkles, Send, Calendar, ListTodo, Clock, Coffee, Target } from 'lucide-react'
import { DailyPlanResponse } from '@/types'
import { cn } from '@/lib/utils'
import { getBeijingTime } from '@/lib/timezone'

export function AIAssistant() {
  const [message, setMessage] = useState('')
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(null)
  const [availableHours, setAvailableHours] = useState(8)
  
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
      const now = getBeijingTime()
      console.log('=== 前端时间调试 ===')
      console.log('点击时的当前北京时间:', now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0'))
      console.log('北京时间对象:', now)
      console.log('ISO字符串:', now.toISOString())
      console.log('================')
      
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
        availableHours: availableHours,
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
          availableHours: availableHours,
          existingTasks: tasksWithProjectInfo,
          projects: projects,
          fixedEvents: fixedEvents,
          preferences: preferences,
          taskFrequencyStats: taskFrequencyStats
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">AI 智能助手</h2>
        <p className="text-muted-foreground mb-6">
          让 AI 帮你分析任务、生成最优工作计划
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            智能日程规划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">待安排任务</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pool').length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">可用时间</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(Number(e.target.value))}
                    className="w-16 h-8"
                    min="1"
                    max="12"
                  />
                  <span className="text-sm">小时</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">工作风格</p>
                <select
                  value={preferences.workStyle}
                  onChange={(e) => updatePreferences({ workStyle: e.target.value as any })}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="morning-person">早起型</option>
                  <option value="night-owl">夜猫子</option>
                  <option value="balanced">平衡型</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">深度工作块</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={preferences.focusBlocks}
                    onChange={(e) => updatePreferences({ focusBlocks: Number(e.target.value) })}
                    className="w-16 h-8"
                    min="1"
                    max="5"
                  />
                  <span className="text-sm">个</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">休息频率</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={preferences.breakFrequency}
                    onChange={(e) => updatePreferences({ breakFrequency: Number(e.target.value) })}
                    className="w-16 h-8"
                    min="30"
                    max="120"
                    step="15"
                  />
                  <span className="text-sm">分钟</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan || tasks.filter(t => t.status === 'pool').length === 0}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingPlan ? '生成中...' : '生成今日计划'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {dailyPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>今日建议计划</span>
              <Button variant="ghost" size="sm" onClick={() => setDailyPlan(null)}>
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyPlan.schedule.map((item, index) => {
                const typeIcons = {
                  focus: <Target className="w-4 h-4" />,
                  regular: <Clock className="w-4 h-4" />,
                  break: <Coffee className="w-4 h-4" />
                }
                
                return (
                  <div key={index} className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    item.type === 'break' ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}>
                    <div className={cn(
                      "p-2 rounded-full",
                      item.type === 'focus' && "bg-purple-100 text-purple-700",
                      item.type === 'regular' && "bg-blue-100 text-blue-700",
                      item.type === 'break' && "bg-green-100 text-green-700"
                    )}>
                      {typeIcons[item.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{item.timeSlot}</p>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          item.type === 'focus' && "bg-purple-100 text-purple-700",
                          item.type === 'regular' && "bg-blue-100 text-blue-700",
                          item.type === 'break' && "bg-green-100 text-green-700"
                        )}>
                          {item.type === 'focus' ? '深度工作' : 
                           item.type === 'regular' ? '常规任务' : '休息'}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{item.task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                    </div>
                  </div>
                )
              })}
              
              {dailyPlan.suggestions.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    AI 建议
                  </p>
                  <ul className="text-sm space-y-1 text-gray-700">
                    {dailyPlan.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">预计生产力指数</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${dailyPlan.estimatedProductivity}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{dailyPlan.estimatedProductivity}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDailyPlan(null)}>
                    重新生成
                  </Button>
                  <Button onClick={applyPlan}>
                    应用计划
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5" />
            自然语言添加任务
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            // 处理自然语言输入
          }} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="例如：明天下午3点开会讨论新项目..."
              className="flex-1"
            />
            <Button type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}