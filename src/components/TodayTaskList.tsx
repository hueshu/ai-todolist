"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { TaskList } from './TaskList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { isToday } from 'date-fns'
import { Calendar, Clock, CheckCircle, Circle, AlertTriangle, Plus, Target } from 'lucide-react'
import { cn, recalculateSubsequentTasks } from '@/lib/utils'
import { Task } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { getBeijingTime, isBeijingToday } from '@/lib/timezone'
import { FocusMode } from './FocusMode'

export function TodayTaskList() {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const tasks = useStore((state) => state.tasks)
  const addTask = useStore((state) => state.addTask)
  
  // 获取今日任务：包括今天安排的、今天完成的，或截止日期是今天的
  const todayTasks = tasks.filter(task => {
    // 1. 有时间安排的任务（timeSlot 表示今天要做）
    if (task.timeSlot) return true
    
    // 2. 今天完成的任务
    if (task.completedAt && isBeijingToday(task.completedAt)) return true
    
    // 3. 截止日期是今天的任务
    if (task.deadline && isBeijingToday(task.deadline)) return true
    
    return false
  }).sort((a, b) => {
    // 首先按是否有时间安排排序
    const aHasTimeSlot = !!a.timeSlot
    const bHasTimeSlot = !!b.timeSlot
    
    if (aHasTimeSlot && !bHasTimeSlot) return -1
    if (!aHasTimeSlot && bHasTimeSlot) return 1
    
    // 如果都有时间安排，按开始时间排序
    if (aHasTimeSlot && bHasTimeSlot) {
      const aStartTime = a.scheduledStartTime ? new Date(a.scheduledStartTime) : getBeijingTime()
      const bStartTime = b.scheduledStartTime ? new Date(b.scheduledStartTime) : getBeijingTime()
      return aStartTime.getTime() - bStartTime.getTime()
    }
    
    // 如果都没有时间安排，按优先级排序：urgent > high > medium > low
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
  
  const pendingTasks = todayTasks.filter(task => task.status !== 'completed')
  const completedTasks = todayTasks.filter(task => task.status === 'completed')
  
  // 计算进度
  const totalHours = todayTasks.reduce((sum, task) => sum + task.estimatedHours, 0)
  const completedHours = completedTasks.reduce((sum, task) => sum + (task.actualHours || task.estimatedHours), 0)
  const progress = totalHours > 0 ? (completedHours / totalHours) * 100 : 0
  
  // 检查是否有紧急任务
  const hasUrgentTasks = pendingTasks.some(task => task.priority === 'urgent')
  
  // 检查是否所有任务都已完成
  const allTasksCompleted = todayTasks.length > 0 && pendingTasks.length === 0
  
  // 添加新任务的处理函数
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    
    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      priority: 'medium',
      estimatedHours: 1,
      status: 'scheduled',
      deadline: getBeijingTime(), // 设为今天
      tags: [],
      taskType: 'single',
      createdAt: getBeijingTime(),
    }
    
    addTask(newTask)
    setNewTaskTitle('')
    setIsAddingTask(false)
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        今日任务
      </h2>
      
      {hasUrgentTasks && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              您有 {pendingTasks.filter(t => t.priority === 'urgent').length} 个紧急任务待处理
            </span>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">今日进度</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all",
                  progress >= 80 ? "bg-green-500" : 
                  progress >= 50 ? "bg-blue-500" : 
                  progress >= 30 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            已完成 {completedHours.toFixed(1)} / {totalHours.toFixed(1)} 小时
          </p>
        </div>
        
        <div className="space-y-3">
          {/* 待完成任务 - 总是显示 */}
          {pendingTasks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Circle className="w-4 h-4" />
                待完成 ({pendingTasks.length})
              </p>
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onFocusMode={setFocusTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* 已完成任务 */}
          {completedTasks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                已完成 ({completedTasks.length})
              </p>
              <div className="space-y-2 opacity-60">
                {completedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 添加任务功能 - 只有在所有任务完成时才显示 */}
        {allTasksCompleted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-800">恭喜！今日任务全部完成</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddingTask(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  加一个任务
                </Button>
              </div>
              
              {isAddingTask && (
                <div className="flex gap-2 mt-3">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="输入新任务标题..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    autoFocus
                  />
                  <Button onClick={handleAddTask} size="sm">
                    添加
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsAddingTask(false)
                      setNewTaskTitle('')
                    }}
                  >
                    取消
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {todayTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">今日暂无安排任务</p>
              <p className="text-sm text-muted-foreground mt-1">
                可以从任务池中选择任务安排到今天，或使用 AI 生成今日计划
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* 专注模式 */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onClose={() => setFocusTask(null)}
          onComplete={() => {
            const updateTask = useStore.getState().updateTask
            const tasks = useStore.getState().tasks
            const completionTime = getBeijingTime()
            updateTask(focusTask.id, { status: 'completed', completedAt: completionTime })
            
            // 如果任务有时间安排，重新计算后续任务时间
            if (focusTask.timeSlot) {
              const subsequentUpdates = recalculateSubsequentTasks(focusTask, tasks, completionTime)
              
              // 应用后续任务的时间调整
              subsequentUpdates.forEach(update => {
                if (update.id) {
                  updateTask(update.id, update)
                }
              })
            }
            
            setFocusTask(null)
          }}
        />
      )}
    </div>
  )
}

// 简化的任务项组件
function TaskItem({ task, onFocusMode }: { task: Task; onFocusMode?: (task: Task) => void }) {
  const updateTask = useStore((state) => state.updateTask)
  const projects = useStore((state) => state.projects)
  const tasks = useStore((state) => state.tasks)
  const project = projects.find(p => p.id === task.projectId)
  
  const priorityColors: Record<Task['priority'], string> = {
    urgent: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-green-300 bg-green-50',
  }
  
  const handleToggleStatus = (taskId?: string) => {
    const targetTaskId = taskId || task.id
    const targetTask = taskId ? tasks.find(t => t.id === taskId) : task
    if (!targetTask) return
    
    if (targetTask.status === 'completed') {
      updateTask(targetTaskId, { status: 'scheduled', completedAt: undefined })
    } else {
      const completionTime = getBeijingTime()
      updateTask(targetTaskId, { status: 'completed', completedAt: completionTime })
      
      // 如果任务有时间安排，重新计算后续任务时间
      if (targetTask.timeSlot) {
        const subsequentUpdates = recalculateSubsequentTasks(targetTask, tasks, completionTime)
        
        // 应用后续任务的时间调整
        subsequentUpdates.forEach(update => {
          if (update.id) {
            updateTask(update.id, update)
          }
        })
        
        // 如果有调整，提示用户
        if (subsequentUpdates.length > 0) {
          const timeDiffMinutes = Math.round((completionTime.getTime() - getBeijingTime().getTime()) / 60000)
          const action = timeDiffMinutes > 0 ? '延后' : '提前'
          console.log(`任务完成时间${action}，已自动调整${subsequentUpdates.length}个后续任务的时间`)
        }
      }
    }
  }
  
  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer hover:shadow-md",
        task.status === 'completed' ? 'opacity-60' : priorityColors[task.priority]
      )}
      onClick={(e) => {
        // 如果点击的是完成按钮，不触发专注模式
        if ((e.target as HTMLElement).closest('button')) return
        // 只有未完成的任务才能进入专注模式
        if (task.status !== 'completed' && onFocusMode) {
          onFocusMode(task)
        }
      }}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => handleToggleStatus()}
        >
          {task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </Button>
        
        <div className="flex-1">
          <p className={cn(
            "font-medium",
            task.status === 'completed' && "line-through"
          )}>
            {task.title}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedHours}h
            </span>
            {task.timeSlot && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                📅 {task.timeSlot}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {task.taskType === 'daily' ? '🔁' : 
               task.taskType === 'weekly' ? '📆' :
               task.taskType === 'monthly' ? '🗓️' : '📅'}
            </span>
            {project && (
              <span>{project.name}</span>
            )}
            {task.tags.length > 0 && (
              <span>{task.tags.join(', ')}</span>
            )}
          </div>
        </div>
        
        <div className="text-xs font-medium">
          {task.priority === 'urgent' && <span className="text-red-600">紧急</span>}
          {task.priority === 'high' && <span className="text-orange-600">高</span>}
          {task.priority === 'medium' && <span className="text-yellow-600">中</span>}
          {task.priority === 'low' && <span className="text-green-600">低</span>}
        </div>
      </CardContent>
    </Card>
  )
}