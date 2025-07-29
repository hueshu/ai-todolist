import { create } from 'zustand'
import { Task, Project, Industry, FixedEvent } from '@/types'
import { 
  getTasks, 
  createTask, 
  updateTask as dbUpdateTask, 
  deleteTask as dbDeleteTask,
  getProjects,
  createProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  getFixedEvents,
  createFixedEvent,
  updateFixedEvent as dbUpdateFixedEvent,
  deleteFixedEvent as dbDeleteFixedEvent
} from './database'

interface AppState {
  tasks: Task[]
  projects: Project[]
  industries: Industry[]
  fixedEvents: FixedEvent[]
  selectedDate: Date
  isLoading: boolean
  preferences: {
    workStyle: 'morning-person' | 'night-owl' | 'balanced'
    focusBlocks: number
    breakFrequency: number
  }
  
  // 数据加载
  loadTasks: () => Promise<void>
  loadProjects: () => Promise<void>
  loadFixedEvents: () => Promise<void>
  loadAll: () => Promise<void>
  
  // 任务操作
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  // 项目操作
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  // 行业操作（本地保存）
  addIndustry: (industry: Industry) => void
  updateIndustry: (id: string, updates: Partial<Industry>) => void
  deleteIndustry: (id: string) => void
  
  // 固定事件操作
  addFixedEvent: (event: Omit<FixedEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateFixedEvent: (id: string, updates: Partial<FixedEvent>) => Promise<void>
  deleteFixedEvent: (id: string) => Promise<void>
  
  // UI状态
  setSelectedDate: (date: Date) => void
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  projects: [],
  industries: [],
  fixedEvents: [],
  selectedDate: new Date(),
  isLoading: false,
  preferences: {
    workStyle: 'balanced',
    focusBlocks: 3,
    breakFrequency: 60,
  },
  
  // 数据加载
  loadTasks: async () => {
    try {
      set({ isLoading: true })
      const tasks = await getTasks()
      set({ tasks })
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  loadProjects: async () => {
    try {
      set({ isLoading: true })
      const projects = await getProjects()
      set({ projects })
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  loadFixedEvents: async () => {
    try {
      set({ isLoading: true })
      const fixedEvents = await getFixedEvents()
      set({ fixedEvents })
    } catch (error) {
      console.error('Failed to load fixed events:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  loadAll: async () => {
    const { loadTasks, loadProjects, loadFixedEvents } = get()
    await Promise.all([
      loadTasks(),
      loadProjects(), 
      loadFixedEvents()
    ])
  },
  
  // 任务操作
  addTask: async (taskData) => {
    try {
      const newTask = await createTask(taskData)
      set((state) => ({ 
        tasks: [...state.tasks, newTask],
        isLoading: false 
      }))
    } catch (error) {
      console.error('Failed to add task:', error)
      set({ isLoading: false })
      throw error
    }
  },
  
  updateTask: async (id, updates) => {
    try {
      const updatedTask = await dbUpdateTask(id, updates)
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }))
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  },
  
  deleteTask: async (id) => {
    try {
      await dbDeleteTask(id)
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  },
  
  // 项目操作
  addProject: async (projectData) => {
    try {
      const newProject = await createProject(projectData)
      set((state) => ({ projects: [...state.projects, newProject] }))
    } catch (error) {
      console.error('Failed to add project:', error)
      throw error
    }
  },
  
  updateProject: async (id, updates) => {
    try {
      const updatedProject = await dbUpdateProject(id, updates)
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? updatedProject : project
        ),
      }))
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  },
  
  deleteProject: async (id) => {
    try {
      await dbDeleteProject(id)
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  },
  
  // 行业操作（本地保存）
  addIndustry: (industry) => set((state) => ({ 
    industries: [...state.industries, industry] 
  })),
  
  updateIndustry: (id, updates) => set((state) => ({
    industries: state.industries.map((industry) =>
      industry.id === id ? { ...industry, ...updates } : industry
    ),
  })),
  
  deleteIndustry: (id) => set((state) => ({
    industries: state.industries.filter((industry) => industry.id !== id),
    projects: state.projects.map((project) =>
      project.industryId === id ? { ...project, industryId: undefined } : project
    ),
  })),
  
  // 固定事件操作
  addFixedEvent: async (eventData) => {
    try {
      const newEvent = await createFixedEvent(eventData)
      set((state) => ({ fixedEvents: [...state.fixedEvents, newEvent] }))
    } catch (error) {
      console.error('Failed to add fixed event:', error)
      throw error
    }
  },
  
  updateFixedEvent: async (id, updates) => {
    try {
      const updatedEvent = await dbUpdateFixedEvent(id, updates)
      set((state) => ({
        fixedEvents: state.fixedEvents.map((event) =>
          event.id === id ? updatedEvent : event
        ),
      }))
    } catch (error) {
      console.error('Failed to update fixed event:', error)
      throw error
    }
  },
  
  deleteFixedEvent: async (id) => {
    try {
      await dbDeleteFixedEvent(id)
      set((state) => ({
        fixedEvents: state.fixedEvents.filter((event) => event.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete fixed event:', error)
      throw error
    }
  },
  
  // UI状态
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  updatePreferences: (preferences) => set((state) => ({
    preferences: { ...state.preferences, ...preferences },
  })),
}))

// 在应用启动时加载数据（只在客户端）
if (typeof window !== 'undefined') {
  // 使用更可靠的初始化方式
  const initializeData = () => {
    const store = useStore.getState()
    if (store.tasks.length === 0) {
      store.loadAll().catch(console.error)
    }
  }
  
  // 多种方式确保数据加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeData)
  } else {
    initializeData()
  }
  
  // 备用方案：延迟加载
  setTimeout(initializeData, 500)
}