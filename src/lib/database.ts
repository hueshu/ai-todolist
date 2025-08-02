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
  
  console.log('[重置任务] 开始执行，用户ID:', userId, '当前时间:', now.toLocaleString('zh-CN'))
  
  // 获取所有需要重置的任务（每日、每周、每月）
  const { data: tasksToReset, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .in('task_type', ['daily', 'weekly', 'monthly'])
    .eq('status', 'completed')
  
  if (fetchError) {
    console.error('[重置任务] 获取任务失败:', fetchError)
    throw fetchError
  }
  
  console.log('[重置任务] 找到已完成的周期性任务数量:', tasksToReset?.length || 0)
  
  let resetCount = 0
  // 为每个完成的任务创建历史记录
  for (const task of tasksToReset || []) {
    // 根据任务类型判断是否需要重置
    let shouldReset = false
    const completedAt = new Date(task.completed_at)
    
    console.log(`[重置任务] 检查任务: ${task.title}, 类型: ${task.task_type}, 完成时间: ${completedAt.toLocaleString('zh-CN')}`)
    
    if (task.task_type === 'daily') {
      // 每日任务：如果完成时间不是今天，则重置
      shouldReset = !isBeijingToday(completedAt)
      console.log(`[重置任务] 每日任务，是否是今天: ${isBeijingToday(completedAt)}, 需要重置: ${shouldReset}`)
    } else if (task.task_type === 'weekly') {
      // 每周任务：如果完成时间超过7天，则重置
      const daysDiff = Math.floor((now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24))
      shouldReset = daysDiff >= 7
      console.log(`[重置任务] 每周任务，距今天数: ${daysDiff}, 需要重置: ${shouldReset}`)
    } else if (task.task_type === 'monthly') {
      // 每月任务：如果完成时间不是本月，则重置
      const nowMonth = now.getMonth()
      const nowYear = now.getFullYear()
      const completedMonth = completedAt.getMonth()
      const completedYear = completedAt.getFullYear()
      shouldReset = nowMonth !== completedMonth || nowYear !== completedYear
      console.log(`[重置任务] 每月任务，当前: ${nowYear}-${nowMonth+1}, 完成: ${completedYear}-${completedMonth+1}, 需要重置: ${shouldReset}`)
    }
    
    if (shouldReset) {
      try {
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
        console.log(`[重置任务] 已创建历史记录: ${task.title}`)
      } catch (historyError) {
        console.error(`[重置任务] 创建历史记录失败: ${task.title}`, historyError)
        // 继续执行，不影响任务重置
      }
      
      // 重置任务状态
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'pool',
          completed_at: null,
          actual_hours: null,
          time_slot: null,
          scheduled_start_time: null,
          deadline: null,
          original_task_id: null,
          segment_index: null,
          total_segments: null
        })
        .eq('id', task.id)
        .eq('user_id', userId)
      
      if (updateError) {
        console.error(`[重置任务] 更新任务状态失败: ${task.title}`, updateError)
      } else {
        console.log(`[重置任务] 成功重置任务: ${task.title}`)
        resetCount++
      }
    }
  }
  
  console.log(`[重置任务] 完成，共重置 ${resetCount} 个任务`)
}

// 清空今日任务功能（只清除时间安排，不改变任务池状态）
export async function clearTodayTasks(): Promise<void> {
  const userId = getCurrentUserId()
  
  console.log('[清空今日任务] 开始执行，用户ID:', userId)
  
  // 获取所有有时间安排的任务（scheduled或in-progress状态，且有timeSlot）
  const { data: todayTasks, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['scheduled', 'in-progress'])
    .not('time_slot', 'is', null)
  
  if (fetchError) {
    console.error('[清空今日任务] 获取任务失败:', fetchError)
    throw fetchError
  }
  
  console.log('[清空今日任务] 找到待清空的任务数量:', todayTasks?.length || 0)
  
  let clearedCount = 0
  let deletedSegments = 0
  
  for (const task of todayTasks || []) {
    console.log(`[清空今日任务] 处理任务: ${task.title}, 是否分段: ${!!task.original_task_id}`)
    
    // 如果是分段任务，直接删除
    if (task.original_task_id) {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .eq('user_id', userId)
      
      if (deleteError) {
        console.error(`[清空今日任务] 删除分段任务失败: ${task.title}`, deleteError)
      } else {
        console.log(`[清空今日任务] 已删除分段任务: ${task.title}`)
        deletedSegments++
      }
    } else {
      // 普通任务，只清除时间相关信息，保持在任务池
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'pool',
          time_slot: null,
          scheduled_start_time: null
        })
        .eq('id', task.id)
        .eq('user_id', userId)
      
      if (updateError) {
        console.error(`[清空今日任务] 清除任务时间安排失败: ${task.title}`, updateError)
      } else {
        console.log(`[清空今日任务] 已清除任务时间安排: ${task.title}`)
        clearedCount++
      }
    }
  }
  
  console.log(`[清空今日任务] 完成，清空 ${clearedCount} 个任务，删除 ${deletedSegments} 个分段`)
}

// 重置今日任务功能（每天凌晨清理前一天的任务）
export async function resetTodayTasks(): Promise<void> {
  const userId = getCurrentUserId()
  const now = getBeijingTime()
  
  console.log('[重置今日任务] 开始执行，用户ID:', userId, '当前北京时间:', now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
  
  // 获取所有有时间安排的任务（今日任务）
  const { data: scheduledTasks, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .or('time_slot.not.is.null,scheduled_start_time.not.is.null')
  
  if (fetchError) {
    console.error('[重置今日任务] 获取任务失败:', fetchError)
    throw fetchError
  }
  
  console.log('[重置今日任务] 找到有时间安排的任务数量:', scheduledTasks?.length || 0)
  
  let resetCount = 0
  let returnToPoolCount = 0
  let deletedSegments = 0
  
  for (const task of scheduledTasks || []) {
    console.log(`[重置今日任务] 检查任务: ${task.title}, 状态: ${task.status}, 类型: ${task.task_type}`)
    
    // 根据任务状态处理
    if (task.status === 'completed') {
      // 已完成的任务：如果是单次任务，清除今日相关信息但保持completed状态
      if (task.task_type === 'single') {
        // 单次任务完成后，清除今日相关信息但保持completed状态
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            time_slot: null,
            scheduled_start_time: null
          })
          .eq('id', task.id)
          .eq('user_id', userId)
        
        if (updateError) {
          console.error(`[重置今日任务] 更新已完成任务失败: ${task.title}`, updateError)
        } else {
          console.log(`[重置今日任务] 清理已完成单次任务的今日信息: ${task.title}`)
          resetCount++
        }
      } else {
        // 周期性任务由resetDailyTasks处理，这里只记录日志
        console.log(`[重置今日任务] 跳过已完成的周期性任务（由周期任务重置处理）: ${task.title}`)
      }
    } else if (task.status === 'scheduled' || task.status === 'in-progress') {
      // 如果是分段任务，无论什么时候生成的都删除（分段任务是临时的）
      if (task.original_task_id) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', task.id)
          .eq('user_id', userId)
        
        if (deleteError) {
          console.error(`[重置今日任务] 删除分段任务失败: ${task.title}`, deleteError)
        } else {
          console.log(`[重置今日任务] 已删除分段任务: ${task.title}`)
          deletedSegments++
        }
      } else {
        // 普通任务：检查是否是今天生成的
        let isToday = false
        
        // 使用scheduled_start_time判断（AI生成任务时会设置这个时间）
        if (task.scheduled_start_time) {
          isToday = isBeijingToday(new Date(task.scheduled_start_time))
          console.log(`[重置今日任务] 任务 "${task.title}" scheduled_start_time: ${task.scheduled_start_time}, 是今天: ${isToday}`)
        } else if (task.created_at) {
          // 如果没有scheduled_start_time，使用创建时间判断
          isToday = isBeijingToday(new Date(task.created_at))
          console.log(`[重置今日任务] 任务 "${task.title}" 使用created_at判断: ${task.created_at}, 是今天: ${isToday}`)
        }
        
        // 如果不是今天的任务，清除时间安排（不改变status，任务还在任务池）
        if (!isToday) {
          const { error: updateError } = await supabase
            .from('tasks')
            .update({
              time_slot: null,
              scheduled_start_time: null
            })
            .eq('id', task.id)
            .eq('user_id', userId)
          
          if (updateError) {
            console.error(`[重置今日任务] 清除任务时间安排失败: ${task.title}`, updateError)
          } else {
            console.log(`[重置今日任务] 已清除非今日任务的时间安排: ${task.title}`)
            returnToPoolCount++
          }
        } else {
          console.log(`[重置今日任务] 保留今日任务: ${task.title}`)
        }
      }
    }
  }
  
  console.log(`[重置今日任务] 完成，清理 ${resetCount} 个已完成任务，退回 ${returnToPoolCount} 个未完成任务，删除 ${deletedSegments} 个过期分段`)
}

export const createTaskCompletionHistory = taskCompletionHistoryService.create
export const getTaskCompletionHistoryByTaskId = taskCompletionHistoryService.getByTaskId
export const getTaskCompletionHistoryByDateRange = taskCompletionHistoryService.getByDateRange