"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Clock, AlertCircle, FolderOpen, Tag, Calendar, Edit2, Trash2, MoreVertical, Link, Building2 } from 'lucide-react'
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
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'created'>(filter === 'pool' ? 'created' : 'priority')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  const industries = useStore((state) => state.industries)
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

  const filteredTasks = tasks
    .filter(task => {
      if (filter !== 'all' && task.status !== filter) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      // sortBy === 'created'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      {/* 过滤和排序控件 */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium text-gray-700">排序：</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 text-sm border rounded-md bg-white"
          >
            <option value="priority">按优先级</option>
            <option value="deadline">按截止日期</option>
            <option value="created">按创建时间</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium text-gray-700">筛选：</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md bg-white"
          >
            <option value="all">所有优先级</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            共 {filteredTasks.length} 个任务
          </span>
          {selectedTasks.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBatchActions(!showBatchActions)}
              className="text-xs"
            >
              批量操作
            </Button>
          )}
        </div>
      </div>
      
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
          const industry = project?.industryId ? industries.find(i => i.id === project.industryId) : null
          
          return (
            <Card key={task.id} className={cn(
              "hover:shadow-md transition-all duration-200 border-l-4",
              selectedTasks.includes(task.id) && "ring-2 ring-blue-500",
              task.priority === 'urgent' && "border-l-red-500",
              task.priority === 'high' && "border-l-orange-500",
              task.priority === 'medium' && "border-l-yellow-500",
              task.priority === 'low' && "border-l-green-500"
            )}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3">
                  {/* 标题行 */}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="shrink-0 w-8 h-8"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={cn(
                            "font-semibold text-base sm:text-lg leading-tight",
                            task.status === 'completed' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTask(task)}
                            className="w-8 h-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm(`确定要删除任务"${task.title}"吗？`)) {
                                handleDeleteTask(task.id)
                              }
                            }}
                            className="text-destructive hover:text-destructive w-8 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 元信息行 */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pl-14">
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      {/* 优先级和时长 */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "flex items-center gap-1 font-medium",
                          priorityColors[task.priority]
                        )}>
                          {priorityIcons[task.priority]}
                          {task.priority === 'urgent' ? '紧急' :
                           task.priority === 'high' ? '高' :
                           task.priority === 'medium' ? '中' : '低'}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {task.estimatedHours}小时
                        </span>
                      </div>
                      
                      {/* 任务类型 */}
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {task.taskType === 'daily' ? '每日' : 
                         task.taskType === 'weekly' ? '每周' :
                         task.taskType === 'monthly' ? '每月' : '单次'}
                      </span>
                      
                      {/* 项目 */}
                      {project && (
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <FolderOpen className="w-3.5 h-3.5" />
                          {project.name}
                        </span>
                      )}
                      
                      {/* 行业 */}
                      {industry && (
                        <span className="flex items-center gap-1.5 text-purple-600 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {industry.name}
                        </span>
                      )}
                      
                      {/* 标签 */}
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {task.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* 截止日期 */}
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(task.deadline).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                    
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