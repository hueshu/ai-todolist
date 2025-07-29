"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

export function CalendarView() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [dragOverPool, setDragOverPool] = useState(false)
  const tasks = useStore((state) => state.tasks)
  const fixedEvents = useStore((state) => state.fixedEvents)
  const updateTask = useStore((state) => state.updateTask)
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => 
      task.status === 'scheduled' && 
      task.deadline && 
      isSameDay(new Date(task.deadline), date)
    )
  }
  
  const getFixedEventsForDay = (date: Date) => {
    const dayOfWeek = date.getDay()
    return fixedEvents.filter(event => 
      event.isActive && event.daysOfWeek.includes(dayOfWeek)
    )
  }
  
  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      updateTask(taskId, {
        status: 'scheduled',
        deadline: date
      })
    }
  }
  
  const handleDropToPool = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverPool(false)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      updateTask(taskId, {
        status: 'pool',
        deadline: undefined
      })
    }
  }
  
  const handleDragEnterPool = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverPool(true)
  }
  
  const handleDragLeavePool = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverPool(false)
  }
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">日历视图</h2>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium">
            {format(weekStart, 'yyyy年MM月dd日', { locale: zhCN })} - 
            {format(addDays(weekStart, 6), 'MM月dd日', { locale: zhCN })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day)
          const isToday = isSameDay(day, new Date())
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[300px] border rounded-lg p-3",
                isToday && "bg-blue-50 border-blue-300"
              )}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
            >
              <div className="mb-2">
                <div className="text-sm font-medium">
                  {format(day, 'EEEE', { locale: zhCN })}
                </div>
                <div className={cn(
                  "text-lg font-bold",
                  isToday && "text-blue-600"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="space-y-1">
                {/* 显示固定事件 */}
                {getFixedEventsForDay(day).map((event) => (
                  <Card
                    key={event.id}
                    className="border-l-4 bg-gray-50 opacity-75"
                    style={{ borderLeftColor: event.color }}
                  >
                    <CardContent className="p-2">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.startTime} - {event.endTime}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                {/* 显示任务 */}
                {dayTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-move hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-2">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.estimatedHours}h
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      <div 
        className={cn(
          "mt-6 p-4 rounded-lg border-2 border-dashed transition-all",
          dragOverPool 
            ? "bg-blue-50 border-blue-400 border-solid" 
            : "bg-gray-100 border-gray-300 hover:border-blue-400"
        )}
        onDrop={handleDropToPool}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnterPool}
        onDragLeave={handleDragLeavePool}
      >
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <span>待安排任务</span>
          <span className="text-xs text-muted-foreground">（拖拽任务到此区域取消安排，或拖拽到日历安排）</span>
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[60px] items-start">
          {tasks.filter(task => task.status === 'pool').length === 0 ? (
            <div className="flex items-center justify-center w-full py-4 text-muted-foreground text-sm">
              {dragOverPool ? '松开以取消任务安排' : '暂无待安排任务，从日历拖拽任务到此处可取消安排'}
            </div>
          ) : (
            tasks
              .filter(task => task.status === 'pool')
              .map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-2">
                    <p className="text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.estimatedHours}h
                    </p>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  )
}