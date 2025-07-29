"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Clock, AlertCircle, FolderOpen, Tag, Calendar, Edit2, Trash2, MoreVertical, Link } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskDetailModal } from './TaskDetailModal'
import { TaskCompletionDialog } from './TaskCompletionDialog'
import { Task } from '@/types'

const priorityColors = {
  urgent: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
}

const priorityIcons = {
  urgent: <AlertCircle className="w-4 h-4" />,
  high: <AlertCircle className="w-4 h-4" />,
  medium: <Clock className="w-4 h-4" />,
  low: <Circle className="w-4 h-4" />,
}

export function TaskList({ filter = 'all' }: { filter?: 'all' | 'pool' | 'scheduled' | 'completed' }) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [showBatchActions, setShowBatchActions] = useState(false)
  
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  const updateTask = useStore((state) => state.updateTask)
  const deleteTask = useStore((state) => state.deleteTask)

  // 异步包装函数
  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pool') return task.status === 'pool'
    if (filter === 'scheduled') return task.status === 'scheduled'
    if (filter === 'completed') return task.status === 'completed'
    return true
  })

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      if (task.status !== 'completed') {
        // 显示完成反馈对话框
        setCompletingTask(task)
      } else {
        // 取消完成状态
        handleUpdateTask(taskId, {
          status: 'pool',
          completedAt: undefined,
          actualHours: undefined
        })
      }
    }
  }

  const getProject = (projectId?: string) => {
    if (!projectId) return null
    return projects.find(p => p.id === projectId)
  }
  
  const toggleTaskSelection = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId))
    } else {
      setSelectedTasks([...selectedTasks, taskId])
    }
    setShowBatchActions(true)
  }
  
  const selectAll = () => {
    setSelectedTasks(filteredTasks.map(t => t.id))
    setShowBatchActions(true)
  }
  
  const clearSelection = () => {
    setSelectedTasks([])
    setShowBatchActions(false)
  }
  
  const batchDelete = () => {
    if (confirm(`确定要删除 ${selectedTasks.length} 个任务吗？`)) {
      selectedTasks.forEach(id => handleDeleteTask(id))
      clearSelection()
    }
  }
  
  const batchUpdateStatus = (status: Task['status']) => {
    selectedTasks.forEach(id => handleUpdateTask(id, { status }))
    clearSelection()
  }
  
  const batchUpdatePriority = (priority: Task['priority']) => {
    selectedTasks.forEach(id => handleUpdateTask(id, { priority }))
    clearSelection()
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      {showBatchActions && selectedTasks.length > 0 && (
        <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <span className="text-xs sm:text-sm">已选择 {selectedTasks.length} 个任务</span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button size="sm" variant="outline" onClick={clearSelection} className="text-xs px-2 py-1">
                取消选择
              </Button>
              <Button size="sm" variant="outline" onClick={selectAll} className="text-xs px-2 py-1">
                全选
              </Button>
              <select
                onChange={(e) => batchUpdateStatus(e.target.value as Task['status'])}
                className="px-2 py-1 text-xs border rounded"
                defaultValue=""
              >
                <option value="" disabled>更新状态</option>
                <option value="pool">任务池</option>
                <option value="scheduled">已安排</option>
                <option value="completed">已完成</option>
              </select>
              <select
                onChange={(e) => batchUpdatePriority(e.target.value as Task['priority'])}
                className="px-2 py-1 text-xs border rounded"
                defaultValue=""
              >
                <option value="" disabled>更新优先级</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              <Button size="sm" variant="destructive" onClick={batchDelete} className="text-xs px-2 py-1">
                批量删除
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
      {filteredTasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          暂无任务，请添加新任务
        </p>
      ) : (
        filteredTasks.map((task) => {
          const project = getProject(task.projectId)
          
          return (
            <Card key={task.id} className={cn(
              "hover:shadow-md transition-shadow",
              selectedTasks.includes(task.id) && "ring-2 ring-blue-500"
            )}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="w-4 h-4"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTaskStatus(task.id)}
                      className="shrink-0 w-8 h-8 sm:w-10 sm:h-10"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium text-sm sm:text-base truncate",
                        task.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap text-xs sm:text-sm">
                        <span className={cn("flex items-center gap-1", priorityColors[task.priority])}>
                          {priorityIcons[task.priority]}
                          <span className="hidden sm:inline">{task.priority}</span>
                        </span>
                        <span className="text-muted-foreground">
                          {task.estimatedHours}h
                        </span>
                        <span className="px-1 sm:px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                          {task.taskType === 'daily' ? '🔁' : 
                           task.taskType === 'weekly' ? '📆' :
                           task.taskType === 'monthly' ? '🗓️' : '📅'}
                          <span className="hidden sm:inline ml-1">
                            {task.taskType === 'daily' ? '每日' : 
                             task.taskType === 'weekly' ? '每周' :
                             task.taskType === 'monthly' ? '每月' : '单次'}
                          </span>
                        </span>
                        {project && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <FolderOpen className="w-3 h-3" />
                            <span className="truncate max-w-20">{project.name}</span>
                          </span>
                        )}
                        {task.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs bg-gray-100 px-1 py-0.5 rounded truncate max-w-16">
                              {task.tags[0]}{task.tags.length > 1 && '+'}
                            </span>
                          </div>
                        )}
                        {task.deadline && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {new Date(task.deadline).toLocaleDateString('zh-CN')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTask(task)}
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    {task.status === 'pool' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateTask(task.id, { status: 'scheduled' })}
                        className="text-xs px-2 py-1 sm:px-3 sm:py-2"
                      >
                        安排
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm(`确定要删除任务"${task.title}"吗？此操作无法撤销。`)) {
                          handleDeleteTask(task.id)
                        }
                      }}
                      className="text-destructive hover:text-destructive w-8 h-8 sm:w-10 sm:h-10"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
      </div>
      
      {editingTask && (
        <TaskDetailModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            handleUpdateTask(updatedTask.id, updatedTask)
            setEditingTask(null)
          }}
        />
      )}
      
      {completingTask && (
        <TaskCompletionDialog
          task={completingTask}
          onClose={() => setCompletingTask(null)}
          onSubmit={(feedback) => {
            handleUpdateTask(completingTask.id, {
              status: 'completed',
              completedAt: new Date(),
              actualHours: feedback.actualHours
            })
            // 这里可以保存反馈信息到数据库
            console.log('Task completion feedback:', feedback)
            setCompletingTask(null)
          }}
        />
      )}
    </div>
  )
}