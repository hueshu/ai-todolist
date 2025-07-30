"use client"

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isBeijingToday } from '@/lib/timezone'

export function TodayTasksDebug() {
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
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800">今日任务调试信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>项目总数: {projects.length}</p>
          <p>行业总数: {industries.length}</p>
          <p>今日任务数: {todayTasks.length}</p>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">今日任务详情:</h4>
            {todayTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId)
              const industry = project?.industryId ? industries.find(i => i.id === project.industryId) : null
              
              return (
                <div key={task.id} className="p-2 bg-white rounded text-xs space-y-1">
                  <div className="font-semibold">{task.title}</div>
                  <div>状态: {task.status}</div>
                  <div className="text-red-600">
                    ProjectId: {task.projectId || '无'} 
                    {task.projectId && !project && ' (项目未找到!)'}
                  </div>
                  {project && (
                    <>
                      <div className="text-blue-600">项目: {project.name}</div>
                      <div className="text-purple-600">
                        IndustryId: {project.industryId || '无'}
                        {project.industryId && !industry && ' (行业未找到!)'}
                      </div>
                      {industry && <div className="text-purple-600">行业: {industry.name}</div>}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">所有项目:</h4>
            {projects.map(project => (
              <div key={project.id} className="text-xs bg-white p-1 rounded">
                {project.name} (ID: {project.id})
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}