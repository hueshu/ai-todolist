"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project, Milestone } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Calendar, Target, CheckCircle2, Circle, Clock, Trash2, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface MilestoneManagerProps {
  project: Project
  onUpdateProject: (updates: Partial<Project>) => void
}

export function MilestoneManager({ project, onUpdateProject }: MilestoneManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: '',
    progress: 0
  })

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim()) return

    const milestone: Milestone = {
      id: uuidv4(),
      title: newMilestone.title,
      description: newMilestone.description,
      targetDate: new Date(newMilestone.targetDate),
      status: 'pending',
      progress: newMilestone.progress
    }

    if (editingMilestone) {
      // 编辑现有里程碑
      const updatedMilestones = project.milestones.map(m =>
        m.id === editingMilestone.id
          ? { ...milestone, id: editingMilestone.id }
          : m
      )
      onUpdateProject({ milestones: updatedMilestones })
      setEditingMilestone(null)
    } else {
      // 添加新里程碑
      onUpdateProject({
        milestones: [...(project.milestones || []), milestone]
      })
    }

    setNewMilestone({ title: '', description: '', targetDate: '', progress: 0 })
    setIsAdding(false)
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setNewMilestone({
      title: milestone.title,
      description: milestone.description || '',
      targetDate: format(new Date(milestone.targetDate), 'yyyy-MM-dd'),
      progress: milestone.progress
    })
    setIsAdding(true)
  }

  const handleDeleteMilestone = (milestoneId: string) => {
    const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId)
    onUpdateProject({ milestones: updatedMilestones })
  }

  const handleUpdateProgress = (milestoneId: string, progress: number) => {
    const updatedMilestones = project.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          progress,
          status: progress === 100 ? 'completed' as const : 
                 progress > 0 ? 'in-progress' as const : 'pending' as const
        }
      }
      return m
    })
    onUpdateProject({ milestones: updatedMilestones })
  }

  const milestones = project.milestones || []
  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const totalProgress = milestones.length > 0 
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            项目里程碑
          </h3>
          <p className="text-sm text-muted-foreground">
            {completedMilestones}/{milestones.length} 个里程碑已完成，总进度 {totalProgress}%
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAdding(!isAdding)
            if (!isAdding) {
              setEditingMilestone(null)
              setNewMilestone({ title: '', description: '', targetDate: '', progress: 0 })
            }
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isAdding ? '取消' : '添加里程碑'}
        </Button>
      </div>

      {/* 项目总进度条 */}
      {milestones.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">项目总进度</span>
              <span className="text-sm font-bold">{totalProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  totalProgress >= 80 ? "bg-green-500" :
                  totalProgress >= 60 ? "bg-blue-500" :
                  totalProgress >= 40 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添加/编辑里程碑表单 */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingMilestone ? '编辑里程碑' : '添加新里程碑'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="里程碑标题"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            />
            <textarea
              placeholder="里程碑描述（可选）"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className="w-full min-h-[60px] p-2 border rounded-md text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">目标日期</label>
                <Input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">初始进度 (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newMilestone.progress}
                  onChange={(e) => setNewMilestone({ ...newMilestone, progress: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleAddMilestone} className="w-full">
              {editingMilestone ? '保存修改' : '添加里程碑'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 里程碑列表 */}
      {milestones.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">暂无里程碑</p>
            <p className="text-sm text-muted-foreground mt-1">
              添加里程碑来跟踪项目重要节点
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones
            .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
            .map((milestone) => {
              const isOverdue = new Date(milestone.targetDate) < new Date() && milestone.status !== 'completed'
              
              return (
                <Card key={milestone.id} className={cn(
                  "transition-all",
                  milestone.status === 'completed' && "bg-green-50 border-green-200",
                  isOverdue && "bg-red-50 border-red-200"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {milestone.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : milestone.status === 'in-progress' ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <h4 className={cn(
                            "font-medium",
                            milestone.status === 'completed' && "line-through text-green-700"
                          )}>
                            {milestone.title}
                          </h4>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {milestone.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(milestone.targetDate), 'MM月dd日', { locale: zhCN })}
                            {isOverdue && <span className="text-red-500 ml-1">(已逾期)</span>}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMilestone(milestone)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* 进度调整 */}
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={milestone.progress}
                            onChange={(e) => handleUpdateProgress(milestone.id, Number(e.target.value))}
                            className="w-16 h-1"
                          />
                          <span className="text-xs font-medium w-8">{milestone.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}