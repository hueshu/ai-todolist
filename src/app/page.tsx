"use client"

import { DashboardHeader } from '@/components/DashboardHeader'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { TodayTaskList } from '@/components/TodayTaskList'
import { ProjectManager } from '@/components/ProjectManager'
import { CalendarView } from '@/components/CalendarView'
import { AIAssistant } from '@/components/AIAssistant'
import { FixedEventManager } from '@/components/FixedEventManager'
import { TestFixedEvents } from '@/components/TestFixedEvents'
import { DatabaseTest } from '@/components/DatabaseTest'
import { useDataLoader } from '@/hooks/useDataLoader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Brain, Calendar, FolderOpen, Home as HomeIcon, BarChart3, ListTodo, Clock } from 'lucide-react'

export default function Home() {
  // 确保数据加载
  const { hasData, isLoading } = useDataLoader()
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <DashboardHeader />
        
        <Tabs defaultValue="dashboard" className="mt-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4" />
              今日
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              任务池
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              项目
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              日历
            </TabsTrigger>
            <TabsTrigger value="fixed-events" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              固定事件
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI助手
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              分析
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              <DatabaseTest />
              <div className="bg-white rounded-lg shadow-sm p-6">
                <TodayTaskList />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">任务池</h2>
              
              <div className="mb-6">
                <TaskInput />
              </div>
              
              <TaskList filter="pool" />
            </div>
          </TabsContent>
          
          <TabsContent value="projects">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProjectManager />
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <CalendarView />
            </div>
          </TabsContent>
          
          <TabsContent value="fixed-events">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <TestFixedEvents />
              <hr className="my-4" />
              <FixedEventManager />
            </div>
          </TabsContent>
          
          <TabsContent value="ai">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <AIAssistant />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">数据分析</h2>
              <p className="text-muted-foreground">功能开发中...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}