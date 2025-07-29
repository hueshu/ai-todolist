"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import { Task } from '@/types'
import { Brain, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { ProjectSelect } from './ProjectSelect'

export function TaskInput() {
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [estimatedHours, setEstimatedHours] = useState(1)
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [projectId, setProjectId] = useState<string>('')
  const [taskType, setTaskType] = useState<Task['taskType']>('single')
  
  const addTask = useStore((state) => state.addTask)
  const projects = useStore((state) => state.projects)
  const industries = useStore((state) => state.industries)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newTaskData = {
      title: input,
      priority: priority,
      estimatedHours: estimatedHours,
      projectId: projectId || undefined,
      status: 'pool' as const,
      tags: [],
      taskType: taskType,
    }

    try {
      await addTask(newTaskData)
      resetForm()
    } catch (error) {
      console.error('Failed to add task:', error)
      // 可以添加错误提示
    }
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
    <div className="space-y-4 sm:space-y-6">
      {/* 主输入区域 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入任务内容，支持自然语言..."
            className="flex-1 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-200"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg text-sm"
            >
              添加任务
            </Button>
          </div>
        </form>
      </div>
      
      {/* 详细设置区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-3 h-3 text-blue-600" />
              </div>
              预估时长
            </label>
            <Input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              min="0.1"
              step="0.1"
              className="text-center h-11 rounded-xl border-gray-200 focus:border-blue-400"
              placeholder="小时"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xs">⚡</span>
              </div>
              优先级
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="urgent">🔴 紧急</option>
              <option value="high">🟠 高</option>
              <option value="medium">🟡 中</option>
              <option value="low">🟢 低</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xs">📁</span>
              </div>
              所属项目
            </label>
            <ProjectSelect
              value={projectId || undefined}
              onChange={(value) => setProjectId(value || '')}
              projects={projects}
              industries={industries}
              className="h-11"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">🔄</span>
              </div>
              任务类型
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as Task['taskType'])}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="single">📅 单次任务</option>
              <option value="daily">🔁 每日任务</option>
              <option value="weekly">📆 每周任务</option>
              <option value="monthly">🗓️ 每月任务</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-xs">⚡</span>
            </div>
            快捷设置时长
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
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
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
                  estimatedHours === value
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-md transform scale-105'
                    : 'bg-white hover:bg-blue-50 border-gray-200 text-gray-700 hover:border-blue-300'
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