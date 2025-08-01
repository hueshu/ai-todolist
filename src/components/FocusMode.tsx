"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Task } from '@/types'
import { X, Volume2, VolumeX, CheckCircle, Maximize2, Minimize2, Pause, Play } from 'lucide-react'
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
  // 移除了 audioRef，改用内联音频播放
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  
  // 包装 onClose，确保清除 localStorage
  const handleClose = () => {
    localStorage.removeItem(`focus-mode-${task.id}`)
    onClose()
  }

  // 初始化和清理
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    
    // 检查是否有保存的计时状态
    const savedState = localStorage.getItem(`focus-mode-${task.id}`)
    if (savedState) {
      try {
        const { startTime, pausedTime, isRunning: wasRunning, isPaused: wasPaused, totalTime: savedTotalTime } = JSON.parse(savedState)
        if (wasRunning && startTime) {
          // 恢复计时状态
          startTimeRef.current = startTime
          pausedTimeRef.current = pausedTime || 0
          setTotalTime(savedTotalTime || totalTime)
          setIsRunning(true)
          setIsPaused(wasPaused || false)
          
          // 计算已经过去的时间
          const elapsed = Date.now() - startTime - pausedTime
          const remaining = Math.max(0, (savedTotalTime || totalTime) * 1000 - elapsed)
          
          if (remaining > 0) {
            setTimeLeft(Math.ceil(remaining / 1000))
          } else {
            // 时间已到
            handleTimeUp()
            localStorage.removeItem(`focus-mode-${task.id}`)
          }
        } else {
          // 新开始计时
          startTimeRef.current = Date.now()
          pausedTimeRef.current = 0
          setIsRunning(true)
          setIsPaused(false)
        }
      } catch (e) {
        // 解析失败，重新开始
        startTimeRef.current = Date.now()
        pausedTimeRef.current = 0
        setIsRunning(true)
        setIsPaused(false)
      }
    } else {
      // 自动开始计时
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0
      setIsRunning(true)
      setIsPaused(false)
    }
    // 不改变任务状态，只是专注模式
    
    // 请求通知权限（作为备用方案）
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // 预加载音频上下文（解决首次播放延迟问题）
    const initAudioContext = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // 如果上下文被暂停，尝试恢复
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
        
        // 创建一个静音的短音来激活音频上下文
        const buffer = audioContext.createBuffer(1, 1, 22050)
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(audioContext.destination)
        source.start()
        
        console.log('音频上下文已初始化，状态:', audioContext.state)
      } catch (e) {
        console.log('音频上下文预加载失败:', e)
      }
    }
    
    // 立即尝试初始化
    initAudioContext()
    
    // 添加点击事件监听器，确保用户交互后能播放声音
    const handleFirstInteraction = () => {
      initAudioContext()
      // 移除监听器，只需要触发一次
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
    
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)
    
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
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      
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

  // 使用时间戳计算剩余时间，避免锁屏问题
  useEffect(() => {
    if (isRunning && !isPaused) {
      const updateTimer = () => {
        const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current
        const remaining = Math.max(0, totalTime * 1000 - elapsed)
        
        setTimeLeft(Math.ceil(remaining / 1000))
        
        if (remaining <= 0) {
          setIsRunning(false)
          setIsPaused(false)
          handleTimeUp()
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
      }
      
      // 立即更新一次
      updateTimer()
      
      // 每100ms更新一次，提供更流畅的体验
      intervalRef.current = setInterval(updateTimer, 100)
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
  }, [isRunning, isPaused, totalTime])
  
  // 保存计时器状态到 localStorage
  useEffect(() => {
    if (isRunning) {
      const saveState = () => {
        localStorage.setItem(`focus-mode-${task.id}`, JSON.stringify({
          startTime: startTimeRef.current,
          pausedTime: pausedTimeRef.current,
          isRunning: isRunning,
          isPaused: isPaused,
          totalTime: totalTime
        }))
      }
      
      // 立即保存一次
      saveState()
      
      // 每秒保存一次状态
      const saveInterval = setInterval(saveState, 1000)
      
      return () => {
        clearInterval(saveInterval)
      }
    } else {
      // 计时器停止时清除保存的状态
      localStorage.removeItem(`focus-mode-${task.id}`)
    }
  }, [isRunning, isPaused, totalTime, task.id])
  
  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && !isPaused) {
        // 页面重新可见时，立即更新时间
        const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current
        const remaining = Math.max(0, totalTime * 1000 - elapsed)
        setTimeLeft(Math.ceil(remaining / 1000))
        
        if (remaining <= 0) {
          setIsRunning(false)
          setIsPaused(false)
          handleTimeUp()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning, isPaused, totalTime])

  const playNotificationSound = () => {
    if (isMuted) return
    
    // 添加手机振动（如果支持）
    if ('vibrate' in navigator) {
      // 振动模式：震动200ms，停止100ms，再震动200ms
      navigator.vibrate([200, 100, 200])
      console.log('手机振动已触发')
    }
    
    // 使用多种方式尝试播放声音
    const playAudioWithMultipleMethods = async () => {
      // 方法1：创建新的 Audio 对象并立即播放
      try {
        const audio = new Audio()
        audio.src = 'data:audio/wav;base64,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'
        
        // 预先设置音量
        audio.volume = 0.5
        
        // 使用 Promise 来处理播放
        await audio.play()
        console.log('Base64音频播放成功')
        return true
      } catch (e) {
        console.log('Base64音频播放失败:', e)
      }
      
      // 方法2：使用 Web Audio API 生成提示音
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // 如果音频上下文被暂停，恢复它
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
        
        // 创建一个简单的提示音
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // 设置一个简单的蜂鸣声
        oscillator.frequency.value = 800 // Hz
        oscillator.type = 'sine'
        
        // 设置音量渐变
        const now = audioContext.currentTime
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1)
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2)
        
        // 播放声音
        oscillator.start(now)
        oscillator.stop(now + 0.2)
        
        // 播放三次短音
        setTimeout(() => {
          const osc2 = audioContext.createOscillator()
          const gain2 = audioContext.createGain()
          osc2.connect(gain2)
          gain2.connect(audioContext.destination)
          osc2.frequency.value = 800
          osc2.type = 'sine'
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
          gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)
          osc2.start()
          osc2.stop(audioContext.currentTime + 0.1)
        }, 250)
        
        setTimeout(() => {
          const osc3 = audioContext.createOscillator()
          const gain3 = audioContext.createGain()
          osc3.connect(gain3)
          gain3.connect(audioContext.destination)
          osc3.frequency.value = 800
          osc3.type = 'sine'
          gain3.gain.setValueAtTime(0.3, audioContext.currentTime)
          gain3.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)
          osc3.start()
          osc3.stop(audioContext.currentTime + 0.1)
        }, 500)
        
        console.log('Web Audio API 提示音播放成功')
        return true
      } catch (error) {
        console.error('Web Audio API 播放失败:', error)
      }
      
      // 方法3：显示系统通知
      try {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('任务时间到！', {
              body: '太棒了！继续保持这种专注力！🎉',
              icon: '/favicon.ico',
              requireInteraction: true, // 需要用户交互才会消失
              tag: 'timer-complete' // 防止重复通知
            })
            console.log('系统通知已显示')
          }
        }
      } catch (e) {
        console.error('系统通知失败:', e)
      }
    }
    
    // 执行播放
    playAudioWithMultipleMethods()
  }

  const handleTimeUp = () => {
    playNotificationSound()
    setShowCompletion(true)
    // 清除保存的状态
    localStorage.removeItem(`focus-mode-${task.id}`)
  }

  const handleStart = () => {
    startTimeRef.current = Date.now()
    pausedTimeRef.current = 0
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    if (isRunning && !isPaused) {
      // 记录暂停时已经过去的时间
      const elapsedBeforePause = Date.now() - startTimeRef.current - pausedTimeRef.current
      pausedTimeRef.current = elapsedBeforePause
      setIsPaused(true)
      console.log('暂停任务，已用时:', Math.floor(elapsedBeforePause / 1000), '秒')
    }
  }

  const handleResume = () => {
    if (isRunning && isPaused) {
      // 重新计算开始时间，减去已经暂停的时间
      startTimeRef.current = Date.now() - pausedTimeRef.current
      setIsPaused(false)
      console.log('继续任务')
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(totalTime)
    setShowCompletion(false)
    startTimeRef.current = 0
    pausedTimeRef.current = 0
  }

  const handleAddFiveMinutes = () => {
    const additionalTime = 300 // 5分钟
    setTotalTime((prev) => prev + additionalTime)
    setTimeLeft(additionalTime)
    setShowCompletion(false)
    startTimeRef.current = Date.now()
    pausedTimeRef.current = 0
    setIsRunning(true)
    setIsPaused(false)
  }

  const handleComplete = () => {
    // 清除保存的状态
    localStorage.removeItem(`focus-mode-${task.id}`)
    
    // 获取所有任务以检查分段情况
    const tasks = useStore.getState().tasks
    const completionTime = getBeijingTime()
    
    // 检查是否是分段任务
    if (task.originalTaskId && task.segmentIndex && task.totalSegments) {
      // 这是一个分段任务
      console.log(`完成分段任务: ${task.title} (${task.segmentIndex}/${task.totalSegments})`)
      
      // 只更新当前分段的状态
      updateTask(task.id, { status: 'completed', completedAt: completionTime })
      
      // 检查是否所有分段都已完成
      const allSegments = tasks.filter(t => 
        t.originalTaskId === task.originalTaskId && 
        t.id !== task.id // 排除当前任务
      )
      
      const allSegmentsCompleted = allSegments.every(t => t.status === 'completed')
      
      if (allSegmentsCompleted && task.segmentIndex === task.totalSegments) {
        // 如果这是最后一个分段且其他分段都已完成，更新原始任务
        const originalTask = tasks.find(t => t.id === task.originalTaskId)
        if (originalTask) {
          console.log(`所有分段已完成，更新原始任务: ${originalTask.title}`)
          updateTask(task.originalTaskId, { 
            status: 'completed', 
            completedAt: completionTime,
            actualHours: originalTask.estimatedHours
          })
        }
      }
    } else {
      // 普通任务，调用传入的完成回调
      onComplete()
    }
    
    handleClose()
  }

  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60)
    return `${totalMinutes}分钟`
  }
  
  // 计算进度百分比
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
  const showControls = progressPercent >= 50 // 时间过半后显示控制按钮

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


  // 只在客户端渲染
  if (!mounted) return null

  const focusModeContent = (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-gray-900 w-screen h-screen overflow-hidden">
      {/* 音频通过 Base64 和 Web Audio API 内联播放 */}

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
                  onClick={handleClose}
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
              {isPaused && (
                <p className="text-lg text-yellow-400 animate-pulse">⏸️ 已暂停</p>
              )}
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
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercent / 100)}`}
                  className="text-blue-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* 暂停/继续按钮 - 总是显示 */}
            <div className="flex justify-center gap-4">
              {!isPaused ? (
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-300 hover:bg-blue-900"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  暂停
                </Button>
              ) : (
                <Button
                  onClick={handleResume}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  继续
                </Button>
              )}
              
              {/* 完成和关闭按钮 - 时间过半后才显示 */}
              {showControls && (
                <>
                  <Button
                    onClick={handleClose}
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <X className="w-5 h-5 mr-2" />
                    关闭
                  </Button>
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    完成
                  </Button>
                </>
              )}
            </div>

            {/* 完成提示 */}
            {showCompletion && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 rounded-lg">
                <div className="text-center space-y-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                  <h3 className="text-2xl font-bold">时间到！</h3>
                  <p className="text-gray-400">太棒了！继续保持这种专注力！🎉</p>
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
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                {Math.round(progressPercent)}% 完成
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