"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { Clock } from 'lucide-react'

export function TestResetButton() {
  const [isUpdating, setIsUpdating] = useState(false)
  const tasks = useStore((state) => state.tasks)
  const loadTasks = useStore((state) => state.loadTasks)
  
  const handleSetYesterday = async () => {
    const completedPeriodicTasks = tasks.filter(task => 
      task.status === 'completed' && 
      ['daily', 'weekly', 'monthly'].includes(task.taskType)
    )
    
    if (completedPeriodicTasks.length === 0) {
      alert('没有已完成的周期性任务')
      return
    }
    
    if (!confirm(`将 ${completedPeriodicTasks.length} 个已完成的周期性任务的完成时间设置为昨天？\n\n这仅用于测试重置功能。`)) {
      return
    }
    
    setIsUpdating(true)
    try {
      // 设置为昨天的时间
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(10, 0, 0, 0) // 设置为昨天上午10点
      
      let updateCount = 0
      for (const task of completedPeriodicTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({
            completed_at: yesterday.toISOString()
          })
          .eq('id', task.id)
          .eq('user_id', 'shared-user-account')
        
        if (error) {
          console.error(`更新任务失败: ${task.title}`, error)
        } else {
          console.log(`已将任务 "${task.title}" 的完成时间设置为昨天`)
          updateCount++
        }
      }
      
      await loadTasks() // 重新加载任务列表
      alert(`成功更新 ${updateCount} 个任务的完成时间为昨天！\n\n现在可以测试重置功能了。`)
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请查看控制台')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleSetLastWeek = async () => {
    const weeklyTasks = tasks.filter(task => 
      task.status === 'completed' && 
      task.taskType === 'weekly'
    )
    
    if (weeklyTasks.length === 0) {
      alert('没有已完成的每周任务')
      return
    }
    
    if (!confirm(`将 ${weeklyTasks.length} 个已完成的每周任务的完成时间设置为8天前？`)) {
      return
    }
    
    setIsUpdating(true)
    try {
      // 设置为8天前
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 8)
      lastWeek.setHours(10, 0, 0, 0)
      
      let updateCount = 0
      for (const task of weeklyTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({
            completed_at: lastWeek.toISOString()
          })
          .eq('id', task.id)
          .eq('user_id', 'shared-user-account')
        
        if (error) {
          console.error(`更新任务失败: ${task.title}`, error)
        } else {
          console.log(`已将任务 "${task.title}" 的完成时间设置为8天前`)
          updateCount++
        }
      }
      
      await loadTasks()
      alert(`成功更新 ${updateCount} 个每周任务的完成时间！`)
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请查看控制台')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleSetLastMonth = async () => {
    const monthlyTasks = tasks.filter(task => 
      task.status === 'completed' && 
      task.taskType === 'monthly'
    )
    
    if (monthlyTasks.length === 0) {
      alert('没有已完成的每月任务')
      return
    }
    
    if (!confirm(`将 ${monthlyTasks.length} 个已完成的每月任务的完成时间设置为上个月？`)) {
      return
    }
    
    setIsUpdating(true)
    try {
      // 设置为上个月
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      lastMonth.setDate(15) // 设置为上个月15号
      lastMonth.setHours(10, 0, 0, 0)
      
      let updateCount = 0
      for (const task of monthlyTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({
            completed_at: lastMonth.toISOString()
          })
          .eq('id', task.id)
          .eq('user_id', 'shared-user-account')
        
        if (error) {
          console.error(`更新任务失败: ${task.title}`, error)
        } else {
          console.log(`已将任务 "${task.title}" 的完成时间设置为上个月`)
          updateCount++
        }
      }
      
      await loadTasks()
      alert(`成功更新 ${updateCount} 个每月任务的完成时间！`)
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请查看控制台')
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="w-full text-sm font-medium text-yellow-800 mb-2">
        测试工具：修改任务完成时间
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSetYesterday}
        disabled={isUpdating}
        className="text-xs"
      >
        <Clock className="w-3 h-3 mr-1" />
        设为昨天（每日任务）
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSetLastWeek}
        disabled={isUpdating}
        className="text-xs"
      >
        <Clock className="w-3 h-3 mr-1" />
        设为8天前（每周任务）
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSetLastMonth}
        disabled={isUpdating}
        className="text-xs"
      >
        <Clock className="w-3 h-3 mr-1" />
        设为上月（每月任务）
      </Button>
    </div>
  )
}