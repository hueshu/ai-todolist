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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* 头部区域 */}
        <div className="mb-8">
          <DashboardHeader />
        </div>
        
        {/* 主要内容区域 */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">今日</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <ListTodo className="w-4 h-4" />
                <span className="hidden sm:inline">任务池</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">项目</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">日历</span>
              </TabsTrigger>
              <TabsTrigger 
                value="fixed-events" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">固定事件</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI助手</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">分析</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* 今日仪表板 */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <TodayTaskList />
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">快速操作</h3>
                  <div className="space-y-3">
                    <button className="w-full p-3 text-left rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
                      <div className="flex items-center gap-3">
                        <ListTodo className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">添加新任务</span>
                      </div>
                    </button>
                    <button className="w-full p-3 text-left rounded-xl bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-green-600" />
                        <span className="font-medium">AI生成计划</span>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                  <DatabaseTest />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* 任务池 */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <ListTodo className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">任务池</h2>
              </div>
              
              <div className="mb-8">
                <TaskInput />
              </div>
              
              <TaskList filter="pool" />
            </div>
          </TabsContent>
          
          {/* 项目管理 */}
          <TabsContent value="projects" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FolderOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">项目管理</h2>
              </div>
              <ProjectManager />
            </div>
          </TabsContent>
          
          {/* 日历视图 */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">日历视图</h2>
              </div>
              <CalendarView />
            </div>
          </TabsContent>
          
          {/* 固定事件 */}
          <TabsContent value="fixed-events" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800">固定事件</h2>
              </div>
              <div className="space-y-6">
                <TestFixedEvents />
                <div className="border-t border-gray-200 pt-6">
                  <FixedEventManager />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* AI助手 */}
          <TabsContent value="ai" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-800">AI智能助手</h2>
              </div>
              <AIAssistant />
            </div>
          </TabsContent>
          
          {/* 数据分析 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-800">数据分析</h2>
              </div>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">功能开发中...</p>
                <p className="text-gray-400 text-sm mt-2">即将为您提供详细的任务完成统计和效率分析</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}