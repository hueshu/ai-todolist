"use client"

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isBeijingToday } from '@/lib/timezone'

export function DebugTodayTasks() {
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  const industries = useStore((state) => state.industries)
  
  // 获取今日任务
  const todayTasks = tasks.filter(task => {
    if (task.timeSlot) return true
    if (task.completedAt && isBeijingToday(task.completedAt)) return true
    if (task.deadline && isBeijingToday(task.deadline)) return true
    return false
  })
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">今日任务调试信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>总项目数: {projects.length}</p>
          <p>总行业数: {industries.length}</p>
          <p>今日任务数: {todayTasks.length}</p>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">任务详情:</h4>
            {todayTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId)
              const industry = project?.industryId ? industries.find(i => i.id === project.industryId) : null
              
              return (
                <div key={task.id} className="p-2 bg-white rounded text-xs">
                  <div>任务: {task.title}</div>
                  <div>ProjectId: {task.projectId || '无'}</div>
                  <div>项目: {project?.name || '未关联项目'}</div>
                  <div>行业: {industry?.name || '无行业'}</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}