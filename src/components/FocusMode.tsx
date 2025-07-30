"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Task } from '@/types'
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Maximize2, Minimize2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getBeijingTime } from '@/lib/timezone'

interface FocusModeProps {
  task: Task
  onClose: () => void
  onComplete: () => void
}

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const updateTask = useStore((state) => state.updateTask)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 初始化和清理
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    
    // 全屏变化监听
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenchange', handleFullscreenChange)
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenchange', handleFullscreenChange)
      
      // 退出全屏
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  // 计算任务时长（分钟）
  const calculateDuration = () => {
    if (task.timeSlot) {
      const [start, end] = task.timeSlot.split('-')
      const [startHour, startMin] = start.split(':').map(Number)
      const [endHour, endMin] = end.split(':').map(Number)
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
      return duration * 60 // 转换为秒
    }
    return task.estimatedHours * 60 * 60 // 预估小时转换为秒
  }

  useEffect(() => {
    const duration = calculateDuration()
    setTotalTime(duration)
    setTimeLeft(duration)
  }, [task])

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsPaused(false)
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, timeLeft])

  const playNotificationSound = () => {
    if (isMuted) return
    
    // 尝试播放音频文件
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // 如果播放失败，使用Web Audio API生成提示音
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = 800 // 频率
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
        } catch (error) {
          console.error('无法播放提示音:', error)
        }
      })
    }
  }

  const handleTimeUp = () => {
    playNotificationSound()
    setShowCompletion(true)
  }

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
    // 更新任务状态为进行中
    updateTask(task.id, { status: 'in-progress' })
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(totalTime)
    setShowCompletion(false)
  }

  const handleAddFiveMinutes = () => {
    setTimeLeft((prev) => prev + 300) // 添加5分钟（300秒）
    setShowCompletion(false)
    setIsRunning(true)
    setIsPaused(false)
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60)
    return `${totalMinutes}分钟`
  }

  // 全屏功能
  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    
    try {
      if (!document.fullscreenElement) {
        // 进入全屏
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen()
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen()
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen()
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.error('全屏切换失败:', error)
    }
  }

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  // 只在客户端渲染
  if (!mounted) return null

  const focusModeContent = (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-gray-900 w-screen h-screen overflow-hidden">
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
        <source src="/notification.ogg" type="audio/ogg" />
      </audio>

      <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-auto">
        <div className="w-full max-w-md mx-auto text-white">
          <div className="space-y-6">
            {/* 头部 */}
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-gray-400 hover:text-white"
                  title={isMuted ? "开启声音" : "静音"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-gray-400 hover:text-white"
                  title={isFullscreen ? "退出全屏" : "全屏"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* 任务信息 */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold">{task.title}</h3>
            </div>

            {/* 进度环 */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  className="text-blue-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  开始
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={handleResume}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  继续
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  暂停
                </Button>
              )}
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                重置
              </Button>
            </div>

            {/* 完成提示 */}
            {showCompletion && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 rounded-lg">
                <div className="text-center space-y-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                  <h3 className="text-2xl font-bold">时间到！</h3>
                  <p className="text-gray-400">您已完成本次专注</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleAddFiveMinutes}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      再做5分钟
                    </Button>
                    <Button
                      onClick={handleComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      完成任务
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 进度条（移动端） */}
            <div className="sm:hidden">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                {Math.round(progress)}% 完成
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 使用 Portal 渲染到 body
  return createPortal(focusModeContent, document.body)
}