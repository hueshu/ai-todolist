"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { Project } from '@/types'
import { ArrowLeft, Save, GripVertical, Hash } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProjectPrioritySortProps {
  onBack: () => void
}

interface SortableProjectItemProps {
  project: Project
  index: number
  onOrderChange: (projectId: string, newOrder: number) => void
}

function SortableProjectItem({ project, index, onOrderChange }: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityLabels = {
    'small-earning': '小项目在赚钱',
    'small-potential': '小项目可能赚钱',
    'small-hobby': '小项目是爱好',
    'earning': '项目赚钱',
    'working-on-earning': '项目正在努力实现赚钱'
  }

  const priorityColors = {
    'small-earning': 'bg-green-100 text-green-800',
    'small-potential': 'bg-blue-100 text-blue-800',
    'small-hobby': 'bg-purple-100 text-purple-800',
    'earning': 'bg-emerald-100 text-emerald-800',
    'working-on-earning': 'bg-orange-100 text-orange-800'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-4">
        {/* 拖拽手柄图标 */}
        <GripVertical className="w-5 h-5 text-gray-400" />

        {/* 序号显示 */}
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="w-8 text-center font-medium text-gray-700">{index + 1}</span>
        </div>

        {/* 项目信息 */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <span className={`text-xs px-2 py-1 rounded ${priorityColors[project.priority]}`}>
              {priorityLabels[project.priority]}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProjectPrioritySort({ onBack }: ProjectPrioritySortProps) {
  const projects = useStore((state) => state.projects)
  const updateProject = useStore((state) => state.updateProject)
  
  // 只显示活跃项目，并创建本地排序状态
  const [sortedProjects, setSortedProjects] = useState<Project[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 只在初始化时设置排序
    if (!isInitialized) {
      const activeProjects = projects
        .filter(p => p.status === 'active')
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
      setSortedProjects(activeProjects)
      setIsInitialized(true)
    }
  }, [projects, isInitialized])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sortedProjects.findIndex((i) => i.id === active.id)
      const newIndex = sortedProjects.findIndex((i) => i.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(sortedProjects, oldIndex, newIndex)
        setSortedProjects(newOrder)
        
        // 立即保存新的顺序
        for (let i = 0; i < newOrder.length; i++) {
          const project = newOrder[i]
          if (project.displayOrder !== i) {
            await updateProject(project.id, { displayOrder: i })
          }
        }
      }
    }
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h2 className="text-xl font-semibold">项目优先级排序</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">排序说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 拖拽项目卡片来调整显示顺序</p>
            <p>• 拖拽后会自动保存新的顺序</p>
            <p>• <strong>注意：</strong>这只会改变项目的显示顺序，不会改变项目类型</p>
            <p>• 项目类型保持不变：</p>
            <div className="ml-4 space-y-1 text-xs">
              <p>- 项目赚钱</p>
              <p>- 项目正在努力实现赚钱</p>
              <p>- 小项目在赚钱</p>
              <p>- 小项目可能赚钱</p>
              <p>- 小项目是爱好</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 rounded-lg p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedProjects.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedProjects.map((project, index) => (
              <SortableProjectItem
                key={project.id}
                project={project}
                index={index}
                onOrderChange={() => {}}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无活跃项目
        </div>
      )}
    </div>
  )
}