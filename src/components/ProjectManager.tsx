"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import { Project } from '@/types'
import { CalendarDays, Target, Archive, Trash2, Edit2, DollarSign, TrendingUp, Heart, Coins, Rocket, Flag, Building2, ArrowUpDown } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MilestoneManager } from './MilestoneManager'
import { IndustryManager } from './IndustryManager'
import { ProjectPrioritySort } from './ProjectPrioritySort'

export function ProjectManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingMilestones, setViewingMilestones] = useState<Project | null>(null)
  const [viewingArchive, setViewingArchive] = useState(false)
  const [viewingIndustries, setViewingIndustries] = useState(false)
  const [viewingPrioritySort, setViewingPrioritySort] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    duration: 30,
    priority: 'small-potential' as Project['priority'],
    projectSize: 'small' as Project['projectSize'],
    profitStatus: 'hobby' as Project['profitStatus'],
    difficulty: 'normal' as Project['difficulty'],
    industryId: ''
  })
  
  const projects = useStore((state) => state.projects) || []
  const industries = useStore((state) => state.industries) || []
  const addProject = useStore((state) => state.addProject)
  const updateProject = useStore((state) => state.updateProject)
  const deleteProject = useStore((state) => state.deleteProject)
  
  // 安全过滤并排序，确保项目数据完整
  const activeProjects = projects
    .filter(p => 
      p && 
      p.status === 'active' && 
      p.id && 
      p.name &&
      p.duration !== undefined &&
      p.priority
    )
    .sort((a, b) => {
      // 优先使用 displayOrder，如果没有则使用默认优先级顺序
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder
      }
      
      // 如果只有一个有 displayOrder
      if (a.displayOrder !== undefined) return -1
      if (b.displayOrder !== undefined) return 1
      
      // 都没有 displayOrder，使用优先级预设顺序
      const priorityOrder = {
        'earning': 0,
        'working-on-earning': 1,
        'small-earning': 2,
        'small-potential': 3,
        'small-hobby': 4
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  
  const archivedProjects = projects.filter(p => 
    p && 
    p.status === 'archived' && 
    p.id && 
    p.name &&
    p.duration !== undefined &&
    p.priority
  )
  
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return
    
    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          name: newProject.name,
          description: newProject.description,
          industryId: newProject.industryId || undefined,
          duration: newProject.duration,
          priority: newProject.priority,
          projectSize: newProject.projectSize,
          profitStatus: newProject.profitStatus,
          difficulty: newProject.difficulty,
        })
        setEditingProject(null)
      } else {
        const projectData = {
          name: newProject.name,
          description: newProject.description,
          industryId: newProject.industryId || undefined,
          duration: newProject.duration,
          priority: newProject.priority,
          projectSize: newProject.projectSize,
          profitStatus: newProject.profitStatus,
          difficulty: newProject.difficulty,
          status: 'active' as const,
          weeklyGoals: [],
          milestones: [],
        }
        await addProject(projectData)
      }
      
      setNewProject({ name: '', description: '', duration: 30, priority: 'small-potential', projectSize: 'small', profitStatus: 'hobby', difficulty: 'normal', industryId: '' })
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }
  
  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const startEditProject = (project: Project) => {
    setEditingProject(project)
    setNewProject({
      name: project.name,
      description: project.description,
      duration: project.duration,
      priority: project.priority,
      projectSize: project.projectSize || 'small',
      profitStatus: project.profitStatus || 'hobby',
      difficulty: project.difficulty || 'normal',
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
  
  // 项目属性标签
  const projectSizeLabels = {
    'small': '小项目',
    'medium': '中项目',
    'large': '大项目'
  }
  
  const profitStatusLabels = {
    'earning': '赚钱',
    'trying': '尝试赚钱',
    'hobby': '爱好'
  }
  
  const difficultyLabels = {
    'easy': '简单',
    'normal': '普通',
    'hard': '困难'
  }
  
  const difficultyColors = {
    'easy': 'bg-green-100 text-green-800',
    'normal': 'bg-yellow-100 text-yellow-800',
    'hard': 'bg-red-100 text-red-800'
  }
  
  const profitStatusColors = {
    'earning': 'bg-emerald-100 text-emerald-800',
    'trying': 'bg-orange-100 text-orange-800',
    'hobby': 'bg-purple-100 text-purple-800'
  }
  
  // 如果正在查看优先级排序，显示排序界面
  if (viewingPrioritySort) {
    return <ProjectPrioritySort onBack={() => setViewingPrioritySort(false)} />
  }
  
  // 如果正在查看行业管理，显示行业管理界面
  if (viewingIndustries) {
    return <IndustryManager onBack={() => setViewingIndustries(false)} />
  }
  
  // 如果正在查看归档，显示归档项目管理界面
  if (viewingArchive) {
    return (
      <div className="space-y-3 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewingArchive(false)}
            size="sm"
            className="self-start"
          >
            ← 返回活跃项目
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold">归档项目管理</h2>
        </div>
        
        {archivedProjects.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">暂无归档项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {archivedProjects.map((project) => {
              const priority = project.priority || 'small-potential'
              const duration = project.duration || 30
              const createdAt = project.createdAt ? new Date(project.createdAt) : new Date()
              
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow bg-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 leading-tight">
                          <Archive className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{project.name || '未命名项目'}</span>
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="mt-1 text-sm line-clamp-2">{project.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${profitStatusColors[project.profitStatus || 'hobby']}`}>
                          {profitStatusLabels[project.profitStatus || 'hobby']}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                          {projectSizeLabels[project.projectSize || 'small']}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${difficultyColors[project.difficulty || 'normal']}`}>
                          {difficultyLabels[project.difficulty || 'normal']}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3 h-3 flex-shrink-0" />
                        <span>周期 {duration} 天</span>
                      </div>
                      <div className="text-xs">
                        创建于 {format(createdAt, 'MM月dd日', { locale: zhCN })}，
                        预计 {format(addDays(createdAt, duration), 'MM月dd日', { locale: zhCN })} 完成
                      </div>
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>周目标 {(project.weeklyGoals || []).length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          <span>里程碑 {(project.milestones || []).length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProject(project.id, { status: 'active' })}
                          className="text-green-600 hover:text-green-600 h-8 text-xs px-2"
                        >
                          <Archive className="w-3 h-3 mr-1 rotate-180" />
                          恢复
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingMilestones(project)}
                          className="h-8 text-xs px-2"
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          里程碑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-destructive hover:text-destructive h-8 text-xs px-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
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
  
  // 如果正在查看里程碑，显示里程碑管理界面
  if (viewingMilestones) {
    return (
      <div className="space-y-3 px-2 sm:px-0">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => setViewingMilestones(null)}
            size="sm"
            className="self-start"
          >
            ← 返回项目列表
          </Button>
          <h2 className="text-base sm:text-xl font-semibold leading-tight">
            <span className="block sm:inline">{viewingMilestones.name}</span>
            <span className="block sm:inline text-sm sm:text-xl text-muted-foreground sm:text-current"> - 里程碑管理</span>
          </h2>
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
    <div className="space-y-3 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">项目管理</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setViewingPrioritySort(true)}
              className="flex items-center gap-1 text-sm px-2 py-1 h-8"
              size="sm"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span className="hidden xs:inline">优先级排序</span>
              <span className="xs:hidden">排序</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setViewingIndustries(true)}
              className="flex items-center gap-1 text-sm px-2 py-1 h-8"
              size="sm"
            >
              <Building2 className="w-3 h-3" />
              <span className="hidden xs:inline">行业管理</span>
              <span className="xs:hidden">行业</span>
              ({industries.length})
            </Button>
            <Button 
              variant="outline"
              onClick={() => setViewingArchive(true)}
              className="flex items-center gap-1 text-sm px-2 py-1 h-8"
              size="sm"
            >
              <Archive className="w-3 h-3" />
              <span className="hidden xs:inline">归档项目</span>
              <span className="xs:hidden">归档</span>
              ({archivedProjects.length})
            </Button>
          </div>
          <Button 
            onClick={() => {
              setIsCreating(!isCreating)
              if (!isCreating) {
                setEditingProject(null)
                setNewProject({ name: '', description: '', duration: 30, priority: 'small-potential', projectSize: 'small', profitStatus: 'hobby', difficulty: 'normal', industryId: '' })
              }
            }}
            className="text-sm px-3 py-1 h-8"
            size="sm"
          >
            {isCreating ? '取消' : '新建项目'}
          </Button>
        </div>
      </div>
      
      {isCreating && (
        <Card className="mx-2 sm:mx-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{editingProject ? '编辑项目' : '新建项目'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <Input
              placeholder="项目名称"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="h-10 text-base"
            />
            <textarea
              placeholder="项目描述"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full min-h-[70px] p-3 border rounded-md text-base resize-none"
            />
            <div>
              <label className="text-sm text-muted-foreground block mb-1">所属行业</label>
              <select
                className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base"
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
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">项目周期</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newProject.duration}
                      onChange={(e) => setNewProject({ ...newProject, duration: Number(e.target.value) })}
                      min="1"
                      className="w-20 h-10 text-base"
                    />
                    <span className="text-sm">天</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">项目大小</label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base"
                    value={newProject.projectSize}
                    onChange={(e) => setNewProject({ ...newProject, projectSize: e.target.value as Project['projectSize'] })}
                  >
                    <option value="small">小项目</option>
                    <option value="medium">中项目</option>
                    <option value="large">大项目</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">是否已经赚钱</label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base"
                    value={newProject.profitStatus}
                    onChange={(e) => setNewProject({ ...newProject, profitStatus: e.target.value as Project['profitStatus'] })}
                  >
                    <option value="earning">赚钱</option>
                    <option value="trying">尝试赚钱</option>
                    <option value="hobby">爱好</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">难易度</label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base"
                    value={newProject.difficulty}
                    onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value as Project['difficulty'] })}
                  >
                    <option value="easy">简单</option>
                    <option value="normal">普通难度</option>
                    <option value="hard">难</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">快捷设置周期：</span>
              <div className="flex flex-wrap gap-2">
                {[7, 14, 30, 60, 90].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setNewProject({ ...newProject, duration: days })}
                    className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md border border-gray-200 min-w-[60px]"
                  >
                    {days}天
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateProject} className="w-full h-11 text-base mt-4">
              {editingProject ? '保存修改' : '创建项目'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2 sm:px-0">
        {activeProjects.map((project) => {
          // 安全获取项目属性，避免崩溃
          const priority = project.priority || 'small-potential'
          const duration = project.duration || 30
          const createdAt = project.createdAt ? new Date(project.createdAt) : new Date()
          const industry = industries.find(i => i.id === project.industryId)
          
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg leading-tight">{project.name || '未命名项目'}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-1 text-sm line-clamp-2">{project.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded ${profitStatusColors[project.profitStatus || 'hobby']}`}>
                      {profitStatusLabels[project.profitStatus || 'hobby']}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                      {projectSizeLabels[project.projectSize || 'small']}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${difficultyColors[project.difficulty || 'normal']}`}>
                      {difficultyLabels[project.difficulty || 'normal']}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 flex-shrink-0" />
                    <span>周期 {duration} 天</span>
                  </div>
                  <div className="text-xs">
                    创建于 {format(createdAt, 'MM月dd日', { locale: zhCN })}，
                    预计 {format(addDays(createdAt, duration), 'MM月dd日', { locale: zhCN })} 完成
                  </div>
                  {industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{industry.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>周目标 {(project.weeklyGoals || []).length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      <span>里程碑 {(project.milestones || []).length}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditProject(project)}
                      className="h-8 text-xs px-2"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingMilestones(project)}
                      className="h-8 text-xs px-2"
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      里程碑
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProject(project.id, { status: 'archived' })}
                      className="h-8 text-xs px-2"
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      归档
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      className="text-destructive hover:text-destructive h-8 text-xs px-2"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {activeProjects.length === 0 && !isCreating && (
        <div className="text-center text-muted-foreground py-8 px-4">
          <p className="text-sm sm:text-base">
            暂无活跃项目，点击"新建项目"创建你的第一个项目
          </p>
        </div>
      )}
    </div>
  )
}