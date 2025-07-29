"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import { Task } from '@/types'
import { Brain, Clock, ChevronDown, ChevronUp } from 'lucide-react'

export function TaskInput() {
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [estimatedHours, setEstimatedHours] = useState(1)
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [projectId, setProjectId] = useState<string>('')
  const [taskType, setTaskType] = useState<Task['taskType']>('single')
  
  const addTask = useStore((state) => state.addTask)
  const projects = useStore((state) => state.projects)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newTask: Task = {
      id: uuidv4(),
      title: input,
      priority: priority,
      estimatedHours: estimatedHours,
      projectId: projectId || undefined,
      status: 'pool',
      tags: [],
      taskType: taskType,
      createdAt: new Date(),
    }

    addTask(newTask)
    resetForm()
  }
  
  const resetForm = () => {
    setInput('')
    setEstimatedHours(1)
    setPriority('medium')
    setProjectId('')
    setTaskType('single')
  }

  const handleAIAnalysis = async () => {
    if (!input.trim()) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/analyze-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: input,
          context: {
            currentProjects: projects,
            recentTasks: []
          }
        })
      })
      
      const data = await response.json()
      
      const newTask: Task = {
        id: uuidv4(),
        title: data.parsedTask.title,
        priority: data.parsedTask.suggestedPriority as Task['priority'],
        estimatedHours: data.parsedTask.estimatedHours,
        projectId: data.parsedTask.suggestedProject,
        status: 'pool',
        tags: data.parsedTask.suggestedTags,
        taskType: taskType,
        createdAt: new Date(),
      }
      
      addTask(newTask)
      resetForm()
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入任务内容，支持自然语言..."
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline"
          onClick={handleAIAnalysis}
          disabled={isAnalyzing}
        >
          <Brain className="w-4 h-4 mr-1" />
          {isAnalyzing ? '分析中...' : 'AI分析'}
        </Button>
        <Button type="submit">添加任务</Button>
      </form>
      
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <Clock className="w-4 h-4" />
              预估时长
            </label>
            <Input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              min="0.1"
              step="0.1"
              className="text-center"
              placeholder="小时"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="urgent">🔴 紧急</option>
              <option value="high">🟠 高</option>
              <option value="medium">🟡 中</option>
              <option value="low">🟢 低</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">所属项目</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">📋 无项目</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  📁 {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">任务类型</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as Task['taskType'])}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="single">📅 单次任务</option>
              <option value="daily">🔁 每日任务</option>
              <option value="weekly">📆 每周任务</option>
              <option value="monthly">🗓️ 每月任务</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">快捷设置时长</label>
          <div className="flex flex-wrap gap-2">
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
                onClick={() => setEstimatedHours(value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  estimatedHours === value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}