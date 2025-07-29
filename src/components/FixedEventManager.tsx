"use client"

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FixedEvent } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Edit2, Trash2, Clock, Calendar, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryOptions = [
  { value: 'meal', label: '🍽️ 用餐', color: '#f97316' },
  { value: 'break', label: '☕ 休息', color: '#06b6d4' },
  { value: 'exercise', label: '🏃 运动', color: '#10b981' },
  { value: 'commute', label: '🚗 通勤', color: '#6b7280' },
  { value: 'meeting', label: '👥 会议', color: '#8b5cf6' },
  { value: 'personal', label: '🏠 个人', color: '#ec4899' },
  { value: 'other', label: '📌 其他', color: '#64748b' },
]

const presetEvents = [
  {
    title: '午餐时间',
    startTime: '12:00',
    endTime: '13:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    category: 'meal' as const,
    description: '午餐及休息时间'
  },
  {
    title: '午休',
    startTime: '13:00',
    endTime: '14:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    category: 'break' as const,
    description: '午饭后休息时间'
  },
  {
    title: '早餐时间',
    startTime: '08:00',
    endTime: '09:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    category: 'meal' as const,
    description: '早餐时间'
  },
  {
    title: '晚餐时间',
    startTime: '18:00',
    endTime: '19:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    category: 'meal' as const,
    description: '晚餐时间'
  }
]

const weekDayOptions = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
]

export function FixedEventManager() {
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<FixedEvent | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<FixedEvent>>({
    title: '',
    description: '',
    startTime: '12:00',
    endTime: '13:00',
    daysOfWeek: [1, 2, 3, 4, 5], // 默认工作日
    category: 'meal',
    color: '#f97316',
    isActive: true,
  })

  const fixedEvents = useStore((state) => state.fixedEvents)
  const addFixedEvent = useStore((state) => state.addFixedEvent)
  const updateFixedEvent = useStore((state) => state.updateFixedEvent)
  const deleteFixedEvent = useStore((state) => state.deleteFixedEvent)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title?.trim()) return

    if (editingEvent) {
      updateFixedEvent(editingEvent.id, {
        ...newEvent,
        updatedAt: new Date(),
      } as Partial<FixedEvent>)
      setEditingEvent(null)
    } else {
      const event: FixedEvent = {
        id: uuidv4(),
        title: newEvent.title,
        description: newEvent.description,
        startTime: newEvent.startTime!,
        endTime: newEvent.endTime!,
        daysOfWeek: newEvent.daysOfWeek!,
        category: newEvent.category!,
        color: newEvent.color!,
        isActive: newEvent.isActive!,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addFixedEvent(event)
      setIsAddingEvent(false)
    }

    resetForm()
  }

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      startTime: '12:00',
      endTime: '13:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      category: 'meal',
      color: '#f97316',
      isActive: true,
    })
  }

  const handleEdit = (event: FixedEvent) => {
    setEditingEvent(event)
    setNewEvent(event)
    setIsAddingEvent(true)
  }

  const handleCancel = () => {
    setIsAddingEvent(false)
    setEditingEvent(null)
    resetForm()
  }

  const toggleEventActive = (eventId: string) => {
    const event = fixedEvents.find(e => e.id === eventId)
    if (event) {
      updateFixedEvent(eventId, { isActive: !event.isActive })
    }
  }

  const handleDayToggle = (day: number) => {
    const currentDays = newEvent.daysOfWeek || []
    if (currentDays.includes(day)) {
      setNewEvent({
        ...newEvent,
        daysOfWeek: currentDays.filter(d => d !== day)
      })
    } else {
      setNewEvent({
        ...newEvent,
        daysOfWeek: [...currentDays, day].sort((a, b) => a - b)
      })
    }
  }

  const formatTime = (time: string) => {
    return time
  }

  const formatDays = (days: number[]) => {
    return days.map(d => weekDayOptions.find(opt => opt.value === d)?.label).join('、')
  }

  const getCategoryInfo = (category: string) => {
    return categoryOptions.find(cat => cat.value === category) || categoryOptions[categoryOptions.length - 1]
  }
  
  const addPresetEvent = (preset: typeof presetEvents[0]) => {
    const categoryInfo = getCategoryInfo(preset.category)
    const event: FixedEvent = {
      id: uuidv4(),
      title: preset.title,
      description: preset.description,
      startTime: preset.startTime,
      endTime: preset.endTime,
      daysOfWeek: preset.daysOfWeek,
      category: preset.category,
      color: categoryInfo.color,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    addFixedEvent(event)
  }

  return (
    <div className="space-y-3 md:space-y-4 p-2 md:p-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">固定事件管理</span>
          <span className="sm:hidden">固定事件</span>
        </h2>
        <Button
          onClick={() => setIsAddingEvent(true)}
          disabled={isAddingEvent}
          size="sm"
          className="h-8 md:h-10 px-2 md:px-4"
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">添加固定事件</span>
          <span className="sm:hidden">添加</span>
        </Button>
      </div>

      {isAddingEvent && (
        <Card className="mx-1 md:mx-0">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">
              {editingEvent ? '编辑固定事件' : '添加新的固定事件'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">事件名称</label>
                  <Input
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="例如：午餐时间"
                    required
                    className="h-8 md:h-10 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">类别</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => {
                      const category = e.target.value as FixedEvent['category']
                      const categoryInfo = getCategoryInfo(category)
                      setNewEvent({ 
                        ...newEvent, 
                        category,
                        color: categoryInfo.color
                      })
                    }}
                    className="w-full h-8 md:h-10 px-2 md:px-3 rounded-md border border-input bg-background text-xs md:text-sm"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">描述（可选）</label>
                <Input
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="添加详细描述..."
                  className="h-8 md:h-10 text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">开始时间</label>
                  <Input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    required
                    className="h-8 md:h-10 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">结束时间</label>
                  <Input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    required
                    className="h-8 md:h-10 text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">重复日期</label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {weekDayOptions.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={cn(
                        "px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md border transition-colors min-w-[40px] md:min-w-[auto] flex items-center justify-center",
                        (newEvent.daysOfWeek || []).includes(day.value)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white hover:bg-gray-50 border-gray-300"
                      )}
                    >
                      <span className="md:hidden">{day.label.replace('周', '')}</span>
                      <span className="hidden md:inline">{day.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" className="flex-1 md:flex-none h-8 md:h-10 text-xs md:text-sm">
                  {editingEvent ? '保存更改' : '添加事件'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} size="sm" className="flex-1 md:flex-none h-8 md:h-10 text-xs md:text-sm">
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {fixedEvents.length === 0 ? (
          <div className="space-y-3 md:space-y-4 mx-1 md:mx-0">
            <Card>
              <CardContent className="p-4 md:p-8 text-center">
                <Clock className="w-8 h-8 md:w-12 md:h-12 mx-auto text-muted-foreground mb-2 md:mb-3" />
                <p className="text-sm md:text-base text-muted-foreground">暂无固定事件</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  添加固定事件如用餐、休息时间，让AI生成计划时自动避开这些时段
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg">快速添加常用固定事件</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {presetEvents.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-2 md:p-3 text-left justify-start"
                      onClick={() => addPresetEvent(preset)}
                    >
                      <div className="w-full">
                        <div className="font-medium text-sm md:text-base">{preset.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 md:mt-1">
                          {preset.startTime} - {preset.endTime} · 
                          <span className="hidden sm:inline"> {formatDays(preset.daysOfWeek)}</span>
                          <span className="sm:hidden"> 工作日</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          fixedEvents.map((event) => {
            const categoryInfo = getCategoryInfo(event.category)
            return (
              <Card key={event.id} className={cn(
                "transition-all mx-1 md:mx-0",
                !event.isActive && "opacity-50"
              )}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm md:text-base truncate">{event.title}</h3>
                            <span className="text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                              <span className="hidden sm:inline">{categoryInfo.label}</span>
                              <span className="sm:hidden">{categoryInfo.label.replace(/^[^\s]+ /, '')}</span>
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="hidden sm:inline">{formatDays(event.daysOfWeek)}</span>
                              <span className="sm:hidden">
                                {event.daysOfWeek.length === 7 ? '每天' : 
                                 event.daysOfWeek.length === 5 && event.daysOfWeek.every(d => d >= 1 && d <= 5) ? '工作日' :
                                 event.daysOfWeek.length === 2 && event.daysOfWeek.includes(0) && event.daysOfWeek.includes(6) ? '周末' :
                                 `${event.daysOfWeek.length}天`}
                              </span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleEventActive(event.id)}
                            title={event.isActive ? '禁用' : '启用'}
                            className="h-7 w-7 md:h-8 md:w-8"
                          >
                            {event.isActive ? (
                              <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            ) : (
                              <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(event)}
                            className="h-7 w-7 md:h-8 md:w-8"
                          >
                            <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm(`确定要删除固定事件"${event.title}"吗？`)) {
                                deleteFixedEvent(event.id)
                              }
                            }}
                            className="text-destructive hover:text-destructive h-7 w-7 md:h-8 md:w-8"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}