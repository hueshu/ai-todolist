import { supabase } from './supabase'
import { Task, Project, FixedEvent, Industry, TaskCompletionHistory } from '@/types'
import { getBeijingTime, toUTCString, fromUTCString, isBeijingToday } from './timezone'

// 获取当前用户ID (简化版，后续可以换成真正的认证)
function getCurrentUserId(): string {
  // 只在客户端运行
  if (typeof window === 'undefined') {
    return 'default-user' // 服务器端返回默认ID
  }
  
  // 临时方案：使用固定用户ID实现跨设备数据同步
  // 所有用户共享同一个数据空间
  return 'shared-user-account'
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
      dependencies: row.dependencies || [],
      taskType: row.task_type,
      createdAt: fromUTCString(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      originalTaskId: row.original_task_id || undefined,
      segmentIndex: row.segment_index || undefined,
      totalSegments: row.total_segments || undefined,
    })) || []
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const userId = getCurrentUserId()
    console.log('Creating task for user:', userId, 'Task:', task.title)
    
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
        dependencies: task.dependencies || [],
        task_type: task.taskType,
        completed_at: task.completedAt?.toISOString() || null,
        original_task_id: task.originalTaskId || null,
        segment_index: task.segmentIndex || null,
        total_segments: task.totalSegments || null,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create task:', error)
      throw error
    }
    
    console.log('Task created successfully:', data.id)
    
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
      dependencies: data.dependencies || [],
      taskType: data.task_type,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      originalTaskId: data.original_task_id || undefined,
      segmentIndex: data.segment_index || undefined,
      totalSegments: data.total_segments || undefined,
    }
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const updateData: any = {}
    
    // 只更新提供的字段
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId || null
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours
    if (updates.actualHours !== undefined) updateData.actual_hours = updates.actualHours || null
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline?.toISOString() || null
    if (updates.scheduledStartTime !== undefined) updateData.scheduled_start_time = updates.scheduledStartTime?.toISOString() || null
    if (updates.timeSlot !== undefined) updateData.time_slot = updates.timeSlot || null
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.dependencies !== undefined) updateData.dependencies = updates.dependencies
    if (updates.taskType !== undefined) updateData.task_type = updates.taskType
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString() || null
    if (updates.originalTaskId !== undefined) updateData.original_task_id = updates.originalTaskId || null
    if (updates.segmentIndex !== undefined) updateData.segment_index = updates.segmentIndex || null
    if (updates.totalSegments !== undefined) updateData.total_segments = updates.totalSegments || null
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
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
      dependencies: data.dependencies || [],
      taskType: data.task_type,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      originalTaskId: data.original_task_id || undefined,
      segmentIndex: data.segment_index || undefined,
      totalSegments: data.total_segments || undefined,
    }
  },

  async delete(id: string): Promise<void> {
    console.log('Deleting task with ID:', id)
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Failed to delete task from database:', error)
      throw error
    }
    
    console.log('Task deleted successfully from database:', id)
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
      industryId: row.industry_id || undefined,
      duration: row.duration,
      priority: row.priority,
      projectSize: row.project_size || 'small',
      profitStatus: row.profit_status || 'hobby',
      difficulty: row.difficulty || 'normal',
      status: row.status,
      displayOrder: row.display_order,
      weeklyGoals: row.weekly_goals,
      milestones: [], // 暂时不支持
      createdAt: fromUTCString(row.created_at),
      updatedAt: fromUTCString(row.updated_at),
    })) || []
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const userId = getCurrentUserId()
    console.log('Creating project for user:', userId, 'Project:', project.name)
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: project.name,
        description: project.description || null,
        industry_id: project.industryId || null,
        duration: project.duration,
        priority: project.priority,
        project_size: project.projectSize || 'small',
        profit_status: project.profitStatus || 'hobby',
        difficulty: project.difficulty || 'normal',
        status: project.status,
        weekly_goals: project.weeklyGoals,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create project:', error)
      throw error
    }
    
    console.log('Project created successfully:', data.id)
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      industryId: data.industry_id || undefined,
      duration: data.duration,
      priority: data.priority,
      projectSize: data.project_size || 'small',
      profitStatus: data.profit_status || 'hobby',
      difficulty: data.difficulty || 'normal',
      status: data.status,
      weeklyGoals: data.weekly_goals,
      milestones: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const updateData: any = {
      updated_at: toUTCString(getBeijingTime()),
    }
    
    // 只更新提供的字段
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.industryId !== undefined) updateData.industry_id = updates.industryId || null
    if (updates.duration !== undefined) updateData.duration = updates.duration
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.projectSize !== undefined) updateData.project_size = updates.projectSize
    if (updates.profitStatus !== undefined) updateData.profit_status = updates.profitStatus
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.weeklyGoals !== undefined) updateData.weekly_goals = updates.weeklyGoals
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
    
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      industryId: data.industry_id || undefined,
      duration: data.duration,
      priority: data.priority,
      projectSize: data.project_size || 'small',
      profitStatus: data.profit_status || 'hobby',
      difficulty: data.difficulty || 'normal',
      status: data.status,
      displayOrder: data.display_order,
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
      createdAt: fromUTCString(row.created_at),
      updatedAt: fromUTCString(row.updated_at),
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
        updated_at: toUTCString(getBeijingTime()),
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

// 行业相关操作
export const industryService = {
  async getAll(): Promise<Industry[]> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      icon: row.icon,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) || []
  },

  async create(industry: Omit<Industry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Industry> {
    const userId = getCurrentUserId()
    console.log('Creating industry with userId:', userId, 'data:', industry)
    
    const { data, error } = await supabase
      .from('industries')
      .insert({
        user_id: userId,
        name: industry.name,
        description: industry.description || null,
        color: industry.color,
        icon: industry.icon
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create industry:', error)
      throw error
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  },

  async update(id: string, updates: Partial<Industry>): Promise<Industry> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('industries')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color,
        icon: updates.icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  },

  async delete(id: string): Promise<void> {
    const userId = getCurrentUserId()
    const { error } = await supabase
      .from('industries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) throw error
  }
}

export const getIndustries = industryService.getAll
export const createIndustry = industryService.create
export const updateIndustry = industryService.update
export const deleteIndustry = industryService.delete

// 任务完成历史操作
export const taskCompletionHistoryService = {
  async create(history: Omit<TaskCompletionHistory, 'id' | 'createdAt'>): Promise<TaskCompletionHistory> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('task_completion_history')
      .insert({
        user_id: userId,
        task_id: history.taskId,
        task_title: history.taskTitle,
        task_type: history.taskType,
        project_id: history.projectId || null,
        completed_at: history.completedAt.toISOString(),
        estimated_hours: history.estimatedHours,
        actual_hours: history.actualHours || null
      })
      .select()
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      taskId: data.task_id,
      taskTitle: data.task_title,
      taskType: data.task_type,
      projectId: data.project_id || undefined,
      completedAt: new Date(data.completed_at),
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours || undefined,
      userId: data.user_id,
      createdAt: new Date(data.created_at)
    }
  },

  async getByTaskId(taskId: string): Promise<TaskCompletionHistory[]> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('task_completion_history')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data?.map(row => ({
      id: row.id,
      taskId: row.task_id,
      taskTitle: row.task_title,
      taskType: row.task_type,
      projectId: row.project_id || undefined,
      completedAt: new Date(row.completed_at),
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours || undefined,
      userId: row.user_id,
      createdAt: new Date(row.created_at)
    })) || []
  },

  async getByDateRange(startDate: Date, endDate: Date): Promise<TaskCompletionHistory[]> {
    const userId = getCurrentUserId()
    const { data, error } = await supabase
      .from('task_completion_history')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data?.map(row => ({
      id: row.id,
      taskId: row.task_id,
      taskTitle: row.task_title,
      taskType: row.task_type,
      projectId: row.project_id || undefined,
      completedAt: new Date(row.completed_at),
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours || undefined,
      userId: row.user_id,
      createdAt: new Date(row.created_at)
    })) || []
  }
}

// 每日任务重置功能
export async function resetDailyTasks(): Promise<void> {
  const userId = getCurrentUserId()
  const now = getBeijingTime()
  
  // 获取所有需要重置的任务（每日、每周、每月）
  const { data: tasksToReset, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .in('task_type', ['daily', 'weekly', 'monthly'])
    .eq('status', 'completed')
  
  if (fetchError) throw fetchError
  
  // 为每个完成的任务创建历史记录
  for (const task of tasksToReset || []) {
    // 根据任务类型判断是否需要重置
    let shouldReset = false
    const completedAt = new Date(task.completed_at)
    
    if (task.task_type === 'daily') {
      // 每日任务：如果完成时间不是今天，则重置
      shouldReset = !isBeijingToday(completedAt)
    } else if (task.task_type === 'weekly') {
      // 每周任务：如果完成时间超过7天，则重置
      const daysDiff = Math.floor((now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24))
      shouldReset = daysDiff >= 7
    } else if (task.task_type === 'monthly') {
      // 每月任务：如果完成时间不是本月，则重置
      const nowMonth = now.getMonth()
      const nowYear = now.getFullYear()
      const completedMonth = completedAt.getMonth()
      const completedYear = completedAt.getFullYear()
      shouldReset = nowMonth !== completedMonth || nowYear !== completedYear
    }
    
    if (shouldReset) {
      // 创建完成历史记录
      await taskCompletionHistoryService.create({
        taskId: task.id,
        taskTitle: task.title,
        taskType: task.task_type,
        projectId: task.project_id || undefined,
        completedAt: completedAt,
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours || undefined,
        userId: userId
      })
      
      // 重置任务状态
      await supabase
        .from('tasks')
        .update({
          status: 'pool',
          completed_at: null,
          actual_hours: null,
          time_slot: null,
          scheduled_start_time: null,
          deadline: null
        })
        .eq('id', task.id)
    }
  }
}

export const createTaskCompletionHistory = taskCompletionHistoryService.create
export const getTaskCompletionHistoryByTaskId = taskCompletionHistoryService.getByTaskId
export const getTaskCompletionHistoryByDateRange = taskCompletionHistoryService.getByDateRange