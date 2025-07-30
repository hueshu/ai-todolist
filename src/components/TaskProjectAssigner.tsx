"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link2, FolderOpen } from 'lucide-react'
import { isBeijingToday } from '@/lib/timezone'

export function TaskProjectAssigner() {
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  const updateTask = useStore((state) => state.updateTask)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  
  // 获取今日任务中没有项目的任务
  const todayTasksWithoutProject = tasks.filter(task => {
    const isToday = task.timeSlot || 
      (task.completedAt && isBeijingToday(task.completedAt)) || 
      (task.deadline && isBeijingToday(task.deadline))
    return isToday && !task.projectId
  })
  
  const handleAssign = (taskId: string, projectId: string) => {
    setAssignments(prev => ({ ...prev, [taskId]: projectId }))
  }
  
  const handleApplyAssignments = () => {
    Object.entries(assignments).forEach(([taskId, projectId]) => {
      updateTask(taskId, { projectId })
    })
    setAssignments({})
    alert('项目关联已更新！')
  }
  
  if (todayTasksWithoutProject.length === 0) {
    return null
  }
  
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          任务项目关联工具
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            发现 {todayTasksWithoutProject.length} 个今日任务没有关联项目
          </p>
          
          <div className="space-y-3">
            {todayTasksWithoutProject.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                </div>
                <Select
                  value={assignments[task.id] || ''}
                  onValueChange={(value) => handleAssign(task.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          {Object.keys(assignments).length > 0 && (
            <Button 
              onClick={handleApplyAssignments}
              className="w-full"
            >
              应用项目关联 ({Object.keys(assignments).length} 个任务)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}