"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Task, TaskCompletionFeedback } from '@/types'
import { X, CheckCircle } from 'lucide-react'

interface TaskCompletionDialogProps {
  task: Task
  onClose: () => void
  onSubmit: (feedback: TaskCompletionFeedback) => void
}

export function TaskCompletionDialog({ task, onClose, onSubmit }: TaskCompletionDialogProps) {
  const [actualHours, setActualHours] = useState(task.estimatedHours)
  const [quality, setQuality] = useState<TaskCompletionFeedback['completionQuality']>('good')
  const [blockers, setBlockers] = useState('')
  const [notes, setNotes] = useState('')
  
  const handleSubmit = () => {
    const feedback: TaskCompletionFeedback = {
      taskId: task.id,
      actualHours,
      completionQuality: quality,
      blockers: blockers.trim() ? blockers.split(',').map(b => b.trim()) : undefined,
      notes: notes.trim() || undefined
    }
    
    onSubmit(feedback)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            任务完成反馈
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">{task.title}</p>
            <p className="text-sm text-muted-foreground">
              预估时间：{task.estimatedHours} 小时
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">实际用时（小时）</label>
            <Input
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(Number(e.target.value))}
              className="mt-1"
              min="0.5"
              step="0.5"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">完成质量</label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={quality === 'excellent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuality('excellent')}
              >
                优秀
              </Button>
              <Button
                variant={quality === 'good' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuality('good')}
              >
                良好
              </Button>
              <Button
                variant={quality === 'rushed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuality('rushed')}
              >
                匆忙
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">遇到的阻碍（用逗号分隔）</label>
            <Input
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="mt-1"
              placeholder="如：需求不清晰, 技术难点"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full min-h-[80px] p-2 border rounded-md"
              placeholder="其他想要记录的内容..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              跳过
            </Button>
            <Button onClick={handleSubmit}>
              提交反馈
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}