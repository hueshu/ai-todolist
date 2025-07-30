"use client"

import { DashboardHeader } from '@/components/DashboardHeader'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { TodayTaskList } from '@/components/TodayTaskList'
import { ProjectManager } from '@/components/ProjectManager'
import { CalendarView } from '@/components/CalendarView'
import { AIAssistant } from '@/components/AIAssistant'
import { FixedEventManager } from '@/components/FixedEventManager'
import { DatabaseTest } from '@/components/DatabaseTest'
import { TaskPoolTabs } from '@/components/TaskPoolTabs'
import { TaskRecovery } from '@/components/TaskRecovery'
import { AllTasksDebug } from '@/components/AllTasksDebug'
import { TodayTasksDebug } from '@/components/TodayTasksDebug'
import { TaskProjectAssigner } from '@/components/TaskProjectAssigner'
import { useDataLoader } from '@/hooks/useDataLoader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Brain, Calendar, FolderOpen, Home as HomeIcon, BarChart3, ListTodo, Clock } from 'lucide-react'

export default function Home() {
  // 确保数据加载
  const { hasData, isLoading } = useDataLoader()
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6 max-w-7xl">
        {/* 头部区域 */}
        <div className="mb-3 sm:mb-6">
          <DashboardHeader />
        </div>
        
        {/* 主要内容区域 */}
        <Tabs defaultValue="dashboard" className="space-y-3 sm:space-y-6">
          {/* 移动端和桌面端不同的标签栏 */}
          <div className="flex justify-center">
            {/* 移动端标签栏 - 只显示3个主要选项 */}
            <div className="block md:hidden w-full max-w-sm mx-auto px-2">
              <TabsList className="grid grid-cols-3 gap-1 bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-1 w-full">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex flex-col items-center gap-1 px-2 py-3 text-xs rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span className="text-xs">今日</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="flex flex-col items-center gap-1 px-2 py-3 text-xs rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <ListTodo className="w-4 h-4" />
                  <span className="text-xs">任务池</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="flex flex-col items-center gap-1 px-2 py-3 text-xs rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-xs">AI助手</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 桌面端标签栏 - 单行布局 */}
            <TabsList className="hidden md:grid md:grid-cols-7 gap-1 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <HomeIcon className="w-4 h-4" />
                <span>今日</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <ListTodo className="w-4 h-4" />
                <span>任务池</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <FolderOpen className="w-4 h-4" />
                <span>项目</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>日历</span>
              </TabsTrigger>
              <TabsTrigger 
                value="fixed-events" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Clock className="w-4 h-4" />
                <span>固定事件</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Brain className="w-4 h-4" />
                <span>AI助手</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:bg-blue-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span>分析</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* 今日仪表板 */}
          <TabsContent value="dashboard" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <TodayTaskList />
            </div>
            
            {/* 任务项目关联工具 */}
            <TaskProjectAssigner />
            
            {/* 任务恢复工具 */}
            <TaskRecovery />
            
            {/* 所有任务调试视图 */}
            <AllTasksDebug />
            
            {/* 今日任务调试视图 */}
            <TodayTasksDebug />
            
            {/* 系统检测 - 仅在开发环境显示 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4">
                <DatabaseTest />
              </div>
            )}
          </TabsContent>
          
          {/* 任务池 */}
          <TabsContent value="tasks" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <ListTodo className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">任务池</h2>
              </div>
              
              <TaskPoolTabs />
            </div>
          </TabsContent>
          
          {/* 项目管理 */}
          <TabsContent value="projects" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <FolderOpen className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">项目管理</h2>
              </div>
              <ProjectManager />
            </div>
          </TabsContent>
          
          {/* 日历视图 */}
          <TabsContent value="calendar" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">日历视图</h2>
              </div>
              <CalendarView />
            </div>
          </TabsContent>
          
          {/* 固定事件 */}
          <TabsContent value="fixed-events" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">固定事件</h2>
              </div>
              <div className="space-y-3 sm:space-y-6">
                <FixedEventManager />
              </div>
            </div>
          </TabsContent>
          
          {/* AI助手 */}
          <TabsContent value="ai" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">AI智能助手</h2>
              </div>
              <AIAssistant />
            </div>
          </TabsContent>
          
          {/* 数据分析 */}
          <TabsContent value="analytics" className="space-y-3 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">数据分析</h2>
              </div>
              <div className="text-center py-8 sm:py-12">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">功能开发中...</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">即将为您提供详细的任务完成统计和效率分析</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}