import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Task, Project, Industry, FixedEvent } from '@/types'

interface AppState {
  tasks: Task[]
  projects: Project[]
  industries: Industry[]
  fixedEvents: FixedEvent[]
  selectedDate: Date
  preferences: {
    workStyle: 'morning-person' | 'night-owl' | 'balanced'
    focusBlocks: number
    breakFrequency: number
  }
  
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  addIndustry: (industry: Industry) => void
  updateIndustry: (id: string, updates: Partial<Industry>) => void
  deleteIndustry: (id: string) => void
  
  addFixedEvent: (event: FixedEvent) => void
  updateFixedEvent: (id: string, updates: Partial<FixedEvent>) => void
  deleteFixedEvent: (id: string) => void
  
  setSelectedDate: (date: Date) => void
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      industries: [],
      fixedEvents: [],
      selectedDate: new Date(),
      preferences: {
        workStyle: 'balanced',
        focusBlocks: 3,
        breakFrequency: 60,
      },
      
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        ),
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      })),
      
      addIndustry: (industry) => set((state) => ({ industries: [...state.industries, industry] })),
      
      updateIndustry: (id, updates) => set((state) => ({
        industries: state.industries.map((industry) =>
          industry.id === id ? { ...industry, ...updates } : industry
        ),
      })),
      
      deleteIndustry: (id) => set((state) => ({
        industries: state.industries.filter((industry) => industry.id !== id),
        // 同时清除相关项目的行业关联
        projects: state.projects.map((project) =>
          project.industryId === id ? { ...project, industryId: undefined } : project
        ),
      })),
      
      addFixedEvent: (event) => set((state) => ({ fixedEvents: [...state.fixedEvents, event] })),
      
      updateFixedEvent: (id, updates) => set((state) => ({
        fixedEvents: state.fixedEvents.map((event) =>
          event.id === id ? { ...event, ...updates } : event
        ),
      })),
      
      deleteFixedEvent: (id) => set((state) => ({
        fixedEvents: state.fixedEvents.filter((event) => event.id !== id),
      })),
      
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences },
      })),
    }),
    {
      name: 'ai-todo-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 迁移旧的项目数据结构
          const state = persistedState as any
          if (state.projects) {
            state.projects = state.projects.map((project: any) => {
              // 如果项目有旧的 deadline 字段，转换为 duration
              if (project.deadline && !project.duration) {
                const createdAt = new Date(project.createdAt || Date.now())
                const deadline = new Date(project.deadline)
                const duration = Math.max(1, Math.ceil((deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
                
                return {
                  ...project,
                  duration,
                  priority: project.priority === 'high' ? 'earning' : 
                           project.priority === 'medium' ? 'small-potential' : 
                           project.priority === 'low' ? 'small-hobby' : 'small-potential',
                  // 移除旧的 deadline 字段
                  deadline: undefined
                }
              }
              
              // 确保优先级字段正确
              if (project.priority && !['small-earning', 'small-potential', 'small-hobby', 'earning', 'working-on-earning'].includes(project.priority)) {
                project.priority = project.priority === 'high' ? 'earning' : 
                                 project.priority === 'medium' ? 'small-potential' : 
                                 'small-hobby'
              }
              
              return {
                ...project,
                duration: project.duration || 30,
                priority: project.priority || 'small-potential',
                milestones: project.milestones || [],
                weeklyGoals: project.weeklyGoals || []
              }
            })
          }
          
          // 迁移任务数据结构，添加 taskType 字段
          if (state.tasks) {
            state.tasks = state.tasks.map((task: any) => ({
              ...task,
              taskType: task.taskType || 'single' // 默认为单次任务
            }))
          }
          
          // 初始化固定事件数组
          if (!state.fixedEvents) {
            state.fixedEvents = []
          }
        }
        return persistedState
      },
    }
  )
)