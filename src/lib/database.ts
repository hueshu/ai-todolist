import { supabase } from './supabase'
import { Task, Project, FixedEvent } from '@/types'

// 获取当前用户ID (简化版，后续可以换成真正的认证)
function getCurrentUserId(): string {
  // 只在客户端运行
  if (typeof window === 'undefined') {
    return 'server-user-id' // 服务器端返回默认ID
  }
  
  // 临时方案：使用设备标识作为用户ID
  let userId = localStorage.getItem('device-user-id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('device-user-id', userId)
  }
  return userId
}

// 任务相关操作
export const taskService = {
  async getAll(): Promise<Task[]> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      projectId: row.project_id || undefined,
      priority: row.priority,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours || undefined,
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      scheduledStartTime: row.scheduled_start_time ? new Date(row.scheduled_start_time) : undefined,
      timeSlot: row.time_slot || undefined,
      status: row.status,
      tags: row.tags,
      dependencies: [], // 暂时不支持
      taskType: row.task_type,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    })) || []
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: task.title,
        description: task.description || null,
        project_id: task.projectId || null,
        priority: task.priority,
        estimated_hours: task.estimatedHours,
        actual_hours: task.actualHours || null,
        deadline: task.deadline?.toISOString() || null,
        scheduled_start_time: task.scheduledStartTime?.toISOString() || null,
        time_slot: task.timeSlot || null,
        status: task.status,
        tags: task.tags,
        task_type: task.taskType,
        completed_at: task.completedAt?.toISOString() || null,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      projectId: data.project_id || undefined,
      priority: data.priority,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours || undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
      timeSlot: data.time_slot || undefined,
      status: data.status,
      tags: data.tags,
      dependencies: [],
      taskType: data.task_type,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    }
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description || null,
        project_id: updates.projectId || null,
        priority: updates.priority,
        estimated_hours: updates.estimatedHours,
        actual_hours: updates.actualHours || null,
        deadline: updates.deadline?.toISOString() || null,
        scheduled_start_time: updates.scheduledStartTime?.toISOString() || null,
        time_slot: updates.timeSlot || null,
        status: updates.status,
        tags: updates.tags,
        task_type: updates.taskType,
        completed_at: updates.completedAt?.toISOString() || null,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      projectId: data.project_id || undefined,
      priority: data.priority,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours || undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
      timeSlot: data.time_slot || undefined,
      status: data.status,
      tags: data.tags,
      dependencies: [],
      taskType: data.task_type,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 项目相关操作
export const projectService = {
  async getAll(): Promise<Project[]> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      duration: row.duration,
      priority: row.priority,
      status: row.status,
      weeklyGoals: row.weekly_goals,
      milestones: [], // 暂时不支持
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })) || []
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: project.name,
        description: project.description || null,
        duration: project.duration,
        priority: project.priority,
        status: project.status,
        weekly_goals: project.weeklyGoals,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      duration: data.duration,
      priority: data.priority,
      status: data.status,
      weeklyGoals: data.weekly_goals,
      milestones: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description || null,
        duration: updates.duration,
        priority: updates.priority,
        status: updates.status,
        weekly_goals: updates.weeklyGoals,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      duration: data.duration,
      priority: data.priority,
      status: data.status,
      weeklyGoals: data.weekly_goals,
      milestones: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 固定事件相关操作
export const fixedEventService = {
  async getAll(): Promise<FixedEvent[]> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('fixed_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      startTime: row.start_time,
      endTime: row.end_time,
      daysOfWeek: row.days_of_week,
      category: row.category,
      color: row.color,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })) || []
  },

  async create(event: Omit<FixedEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<FixedEvent> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('fixed_events')
      .insert({
        user_id: userId,
        title: event.title,
        description: event.description || null,
        start_time: event.startTime,
        end_time: event.endTime,
        days_of_week: event.daysOfWeek,
        category: event.category,
        color: event.color,
        is_active: event.isActive,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      startTime: data.start_time,
      endTime: data.end_time,
      daysOfWeek: data.days_of_week,
      category: data.category,
      color: data.color,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async update(id: string, updates: Partial<FixedEvent>): Promise<FixedEvent> {
    const { data, error } = await supabase
      .from('fixed_events')
      .update({
        title: updates.title,
        description: updates.description || null,
        start_time: updates.startTime,
        end_time: updates.endTime,
        days_of_week: updates.daysOfWeek,
        category: updates.category,
        color: updates.color,
        is_active: updates.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      startTime: data.start_time,
      endTime: data.end_time,
      daysOfWeek: data.days_of_week,
      category: data.category,
      color: data.color,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('fixed_events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 单独导出函数供store使用
export const getTasks = taskService.getAll
export const createTask = taskService.create
export const updateTask = taskService.update
export const deleteTask = taskService.delete

export const getProjects = projectService.getAll
export const createProject = projectService.create
export const updateProject = projectService.update
export const deleteProject = projectService.delete

export const getFixedEvents = fixedEventService.getAll
export const createFixedEvent = fixedEventService.create
export const updateFixedEvent = fixedEventService.update
export const deleteFixedEvent = fixedEventService.delete