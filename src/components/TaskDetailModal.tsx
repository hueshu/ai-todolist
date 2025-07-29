"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Task, Project } from '@/types'
import { useStore } from '@/lib/store'
import { X, Save, Calendar, Clock, Tag, FolderOpen, Link } from 'lucide-react'
import { format } from 'date-fns'

interface TaskDetailModalProps {
  task: Task | null
  onClose: () => void
  onSave: (task: Task) => void
}

export function TaskDetailModal({ task, onClose, onSave }: TaskDetailModalProps) {
  const projects = useStore((state) => state.projects)
  const tasks = useStore((state) => state.tasks)
  
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [newTag, setNewTag] = useState('')
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([])
  
  useEffect(() => {
    if (task) {
      setEditedTask({ 
        ...task, 
        taskType: task.taskType || 'single' // 为旧任务添加默认类型
      })
      setSelectedDependencies(task.dependencies || [])
    }
  }, [task])
  
  if (!task || !editedTask) return null
  
  const handleSave = () => {
    onSave({
      ...editedTask,
      dependencies: selectedDependencies
    })
    onClose()
  }
  
  const addTag = () => {
    if (newTag.trim() && !editedTask.tags.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...editedTask.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }
  
  const removeTag = (tag: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags.filter(t => t !== tag)
    })
  }
  
  const toggleDependency = (taskId: string) => {
    if (selectedDependencies.includes(taskId)) {
      setSelectedDependencies(selectedDependencies.filter(id => id !== taskId))
    } else {
      setSelectedDependencies([...selectedDependencies, taskId])
    }
  }
  
  const availableTasks = tasks.filter(t => t.id !== task.id && t.status !== 'completed')
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>任务详情</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">任务标题</label>
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">描述</label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="mt-1 w-full min-h-[100px] p-2 border rounded-md"
              placeholder="添加任务描述..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                所属项目
              </label>
              <select
                value={editedTask.projectId || ''}
                onChange={(e) => setEditedTask({ ...editedTask, projectId: e.target.value || undefined })}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">无</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">优先级</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                预估时间（小时）
              </label>
              <Input
                type="number"
                value={editedTask.estimatedHours}
                onChange={(e) => setEditedTask({ ...editedTask, estimatedHours: Number(e.target.value) })}
                className="mt-1"
                min="0.1"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">任务类型</label>
              <select
                value={editedTask.taskType}
                onChange={(e) => setEditedTask({ ...editedTask, taskType: e.target.value as Task['taskType'] })}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="single">📅 单次任务</option>
                <option value="daily">🔁 每日任务</option>
                <option value="weekly">📆 每周任务</option>
                <option value="monthly">🗓️ 每月任务</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">快捷设置时间</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {[
                { label: '10分钟', value: 0.17 },
                { label: '20分钟', value: 0.33 },
                { label: '30分钟', value: 0.5 },
                { label: '40分钟', value: 0.67 },
                { label: '50分钟', value: 0.83 },
                { label: '1小时', value: 1 },
                { label: '1.5小时', value: 1.5 },
                { label: '2小时', value: 2 },
                { label: '3小时', value: 3 },
                { label: '4小时', value: 4 },
                { label: '半天', value: 4 },
                { label: '1天', value: 8 }
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setEditedTask({ ...editedTask, estimatedHours: value })}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    editedTask.estimatedHours === value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {editedTask.status === 'completed' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">实际用时（小时）</label>
                <Input
                  type="number"
                  value={editedTask.actualHours || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, actualHours: Number(e.target.value) })}
                  className="mt-1"
                  min="0.5"
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">完成时间</label>
                <Input
                  type="datetime-local"
                  value={editedTask.completedAt ? format(new Date(editedTask.completedAt), "yyyy-MM-dd'T'HH:mm") : ''}
                  className="mt-1"
                  readOnly
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              标签
            </label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="添加标签..."
                  className="flex-1"
                />
                <Button onClick={addTag} size="sm">添加</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-sm flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-500">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              依赖任务
            </label>
            <div className="mt-1 max-h-[150px] overflow-y-auto border rounded-md p-2">
              {availableTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">无可用任务</p>
              ) : (
                availableTasks.map(t => (
                  <label key={t.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDependencies.includes(t.id)}
                      onChange={() => toggleDependency(t.id)}
                    />
                    <span className="text-sm">{t.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}