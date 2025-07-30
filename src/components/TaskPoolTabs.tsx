"use client"

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TaskInput } from './TaskInput'
import { TaskList } from './TaskList'
import { CheckCircle2, Circle } from 'lucide-react'
import { useStore } from '@/lib/store'

export function TaskPoolTabs() {
  const tasks = useStore((state) => state.tasks)
  
  // 计算待处理和已完成任务数量
  const pendingCount = tasks.filter(task => task.status !== 'completed').length
  const completedCount = tasks.filter(task => task.status === 'completed').length
  
  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Circle className="w-4 h-4" />
          <span>待处理</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>已完成</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {completedCount}
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="space-y-4">
        <div className="mb-4 sm:mb-8">
          <TaskInput />
        </div>
        <TaskList filter="pool" />
      </TabsContent>
      
      <TabsContent value="completed" className="space-y-4">
        <TaskList filter="completed" />
      </TabsContent>
    </Tabs>
  )
}