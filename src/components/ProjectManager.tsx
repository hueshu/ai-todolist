"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import { Project } from '@/types'
import { CalendarDays, Target, Archive, Trash2, Edit2, DollarSign, TrendingUp, Heart, Coins, Rocket, Flag, Building2 } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MilestoneManager } from './MilestoneManager'
import { IndustryManager } from './IndustryManager'

export function ProjectManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingMilestones, setViewingMilestones] = useState<Project | null>(null)
  const [viewingArchive, setViewingArchive] = useState(false)
  const [viewingIndustries, setViewingIndustries] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    duration: 30,
    priority: 'small-potential' as Project['priority'],
    industryId: ''
  })
  
  const projects = useStore((state) => state.projects) || []
  const industries = useStore((state) => state.industries) || []
  const addProject = useStore((state) => state.addProject)
  const updateProject = useStore((state) => state.updateProject)
  const deleteProject = useStore((state) => state.deleteProject)
  
  // 安全过滤，确保项目数据完整
  const activeProjects = projects.filter(p => 
    p && 
    p.status === 'active' && 
    p.id && 
    p.name &&
    p.duration !== undefined &&
    p.priority
  )
  
  const archivedProjects = projects.filter(p => 
    p && 
    p.status === 'archived' && 
    p.id && 
    p.name &&
    p.duration !== undefined &&
    p.priority
  )
  
  const handleCreateProject = () => {
    if (!newProject.name.trim()) return
    
    const project: Project = {
      id: uuidv4(),
      name: newProject.name,
      description: newProject.description,
      industryId: newProject.industryId || undefined,
      duration: newProject.duration,
      priority: newProject.priority,
      status: 'active',
      weeklyGoals: [],
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    if (editingProject) {
      updateProject(editingProject.id, {
        ...project,
        id: editingProject.id,
        createdAt: editingProject.createdAt
      })
      setEditingProject(null)
    } else {
      addProject(project)
    }
    
    setNewProject({ name: '', description: '', duration: 30, priority: 'small-potential', industryId: '' })
    setIsCreating(false)
  }
  
  const startEditProject = (project: Project) => {
    setEditingProject(project)
    setNewProject({
      name: project.name,
      description: project.description,
      duration: project.duration,
      priority: project.priority,
      industryId: project.industryId || ''
    })
    setIsCreating(true)
  }
  
  const priorityLabels = {
    'small-earning': '小项目在赚钱',
    'small-potential': '小项目可能赚钱',
    'small-hobby': '小项目是爱好',
    'earning': '项目赚钱',
    'working-on-earning': '项目正在努力实现赚钱'
  }
  
  const priorityIcons = {
    'small-earning': <Coins className="w-4 h-4" />,
    'small-potential': <TrendingUp className="w-4 h-4" />,
    'small-hobby': <Heart className="w-4 h-4" />,
    'earning': <DollarSign className="w-4 h-4" />,
    'working-on-earning': <Rocket className="w-4 h-4" />
  }
  
  const priorityColors = {
    'small-earning': 'bg-green-100 text-green-800',
    'small-potential': 'bg-blue-100 text-blue-800',
    'small-hobby': 'bg-purple-100 text-purple-800',
    'earning': 'bg-emerald-100 text-emerald-800',
    'working-on-earning': 'bg-orange-100 text-orange-800'
  }
  
  // 如果正在查看行业管理，显示行业管理界面
  if (viewingIndustries) {
    return <IndustryManager onBack={() => setViewingIndustries(false)} />
  }
  
  // 如果正在查看归档，显示归档项目管理界面
  if (viewingArchive) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewingArchive(false)}
          >
            ← 返回活跃项目
          </Button>
          <h2 className="text-xl font-semibold">归档项目管理</h2>
        </div>
        
        {archivedProjects.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">暂无归档项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedProjects.map((project) => {
              const priority = project.priority || 'small-potential'
              const duration = project.duration || 30
              const createdAt = project.createdAt ? new Date(project.createdAt) : new Date()
              
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow bg-gray-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Archive className="w-4 h-4 text-muted-foreground" />
                          {project.name || '未命名项目'}
                        </CardTitle>
                        <CardDescription className="mt-1">{project.description || ''}</CardDescription>
                      </div>
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${priorityColors[priority]}`}>
                        {priorityIcons[priority]}
                        <span>{priorityLabels[priority]}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        <span>项目周期：{duration} 天</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          创建于 {format(createdAt, 'yyyy年MM月dd日', { locale: zhCN })}，
                          预计 {format(addDays(createdAt, duration), 'MM月dd日', { locale: zhCN })} 完成
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>周目标：{(project.weeklyGoals || []).length} 个</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        <span>里程碑：{(project.milestones || []).length} 个</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProject(project.id, { status: 'active' })}
                        className="text-green-600 hover:text-green-600"
                      >
                        <Archive className="w-4 h-4 mr-1 rotate-180" />
                        恢复活跃
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingMilestones(project)}
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        查看里程碑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
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
  
  // 如果正在查看里程碑，显示里程碑管理界面
  if (viewingMilestones) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewingMilestones(null)}
          >
            ← 返回项目列表
          </Button>
          <h2 className="text-xl font-semibold">{viewingMilestones.name} - 里程碑管理</h2>
        </div>
        <MilestoneManager
          project={viewingMilestones}
          onUpdateProject={(updates) => {
            updateProject(viewingMilestones.id, updates)
            setViewingMilestones({ ...viewingMilestones, ...updates })
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">项目管理</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setViewingIndustries(true)}
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            行业管理 ({industries.length})
          </Button>
          <Button 
            variant="outline"
            onClick={() => setViewingArchive(true)}
            className="flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            归档项目 ({archivedProjects.length})
          </Button>
          <Button onClick={() => {
            setIsCreating(!isCreating)
            if (!isCreating) {
              setEditingProject(null)
              setNewProject({ name: '', description: '', duration: 30, priority: 'small-potential', industryId: '' })
            }
          }}>
            {isCreating ? '取消' : '新建项目'}
          </Button>
        </div>
      </div>
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProject ? '编辑项目' : '新建项目'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="项目名称"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
            <textarea
              placeholder="项目描述"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full min-h-[80px] p-2 border rounded-md text-sm"
            />
            <div>
              <label className="text-sm text-muted-foreground">所属行业</label>
              <select
                className="w-full h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newProject.industryId}
                onChange={(e) => setNewProject({ ...newProject, industryId: e.target.value })}
              >
                <option value="">选择行业</option>
                {industries.map(industry => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground">项目周期</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={newProject.duration}
                    onChange={(e) => setNewProject({ ...newProject, duration: Number(e.target.value) })}
                    min="1"
                    className="w-20"
                  />
                  <span className="text-sm">天</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">项目类型</label>
                <select
                  className="w-full h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as Project['priority'] })}
                >
                  <option value="small-earning">小项目在赚钱</option>
                  <option value="small-potential">小项目可能赚钱</option>
                  <option value="small-hobby">小项目是爱好</option>
                  <option value="earning">项目赚钱</option>
                  <option value="working-on-earning">项目正在努力实现赚钱</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">快捷设置周期：</span>
              {[7, 14, 30, 60, 90].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setNewProject({ ...newProject, duration: days })}
                  className="px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {days}天
                </button>
              ))}
            </div>
            <Button onClick={handleCreateProject} className="w-full">
              {editingProject ? '保存修改' : '创建项目'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeProjects.map((project) => {
          // 安全获取项目属性，避免崩溃
          const priority = project.priority || 'small-potential'
          const duration = project.duration || 30
          const createdAt = project.createdAt ? new Date(project.createdAt) : new Date()
          const industry = industries.find(i => i.id === project.industryId)
          
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name || '未命名项目'}</CardTitle>
                    <CardDescription className="mt-1">{project.description || ''}</CardDescription>
                  </div>
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${priorityColors[priority]}`}>
                    {priorityIcons[priority]}
                    <span>{priorityLabels[priority]}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>项目周期：{duration} 天</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      创建于 {format(createdAt, 'yyyy年MM月dd日', { locale: zhCN })}，
                      预计 {format(addDays(createdAt, duration), 'MM月dd日', { locale: zhCN })} 完成
                    </span>
                  </div>
                  {industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>行业：{industry.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>周目标：{(project.weeklyGoals || []).length} 个</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <span>里程碑：{(project.milestones || []).length} 个</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditProject(project)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingMilestones(project)}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    里程碑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateProject(project.id, { status: 'archived' })}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    归档
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {activeProjects.length === 0 && !isCreating && (
        <p className="text-center text-muted-foreground py-8">
          暂无活跃项目，点击"新建项目"创建你的第一个项目
        </p>
      )}
    </div>
  )
}