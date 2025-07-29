import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function useDataLoader() {
  const tasks = useStore((state) => state.tasks)
  const projects = useStore((state) => state.projects)
  const fixedEvents = useStore((state) => state.fixedEvents)
  const loadAll = useStore((state) => state.loadAll)
  const isLoading = useStore((state) => state.isLoading)

  useEffect(() => {
    // 每次页面加载时都从数据库重新加载数据
    console.log('Loading data from database...')
    loadAll().catch(console.error)
  }, []) // 只在组件挂载时运行一次

  return {
    tasks,
    projects, 
    fixedEvents,
    isLoading,
    hasData: tasks.length > 0 || projects.length > 0 || fixedEvents.length > 0
  }
}