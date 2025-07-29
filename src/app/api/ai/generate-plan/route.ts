import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DailyPlanRequest, DailyPlanResponse, Task } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getBeijingTime, formatBeijingTime } from '@/lib/timezone'

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is missing or empty')
  }
  return new OpenAI({
    apiKey: apiKey,
  })
}

function getWorkingHours(workStyle: string) {
  switch (workStyle) {
    case 'morning-person':
      return { start: 8, peak: [9, 12] }
    case 'night-owl':
      return { start: 10, peak: [14, 18] }
    default:
      return { start: 9, peak: [10, 12, 14, 16] }
  }
}

function formatFixedEventsForPrompt(fixedEvents: any[], date: Date) {
  // 确保 date 是 Date 对象
  const targetDate = date instanceof Date ? date : new Date(date)
  
  // 获取今天是星期几 (0=周日, 1=周一, ..., 6=周六)
  const dayOfWeek = targetDate.getDay()
  
  // 筛选出今天应该发生的固定事件
  const todayEvents = fixedEvents.filter(event => 
    event.isActive && Array.isArray(event.daysOfWeek) && event.daysOfWeek.includes(dayOfWeek)
  )
  
  return todayEvents.map(event => ({
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    category: event.category,
    description: event.description
  }))
}

export async function POST(request: NextRequest) {
  try {
    console.log('Generate plan API called')
    const body: DailyPlanRequest = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const workHours = getWorkingHours(body.preferences.workStyle)
    
    // 分析项目优先级分布
    const projectPriorityMap: Record<string, string> = {
      'earning': '赚钱项目（最高优先级）',
      'working-on-earning': '努力赚钱项目（高优先级）',
      'small-earning': '小项目在赚钱（中高优先级）',
      'small-potential': '小项目可能赚钱（中等优先级）',
      'small-hobby': '小项目是爱好（低优先级）'
    }
    
    // 构建包含完整项目信息的任务列表
    const tasksWithFullInfo = body.existingTasks.map(task => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      tags: task.tags,
      deadline: task.deadline,
      taskType: task.taskType,
      project: task.project ? {
        name: task.project.name,
        duration: task.project.duration,
        priority: task.project.priority,
        priorityDescription: projectPriorityMap[task.project.priority || ''] || '未知优先级',
        weeklyGoals: task.project.weeklyGoals
      } : null
    }))
    
    // 将字符串日期转换为 Date 对象
    const requestDate = new Date(body.date)
    console.log('Converted date:', requestDate)
    
    // 处理固定事件
    const todayFixedEvents = formatFixedEventsForPrompt(body.fixedEvents || [], requestDate)
    
    // 获取当前时间或指定的开始时间
    const startTime = body.startTime ? new Date(body.startTime) : getBeijingTime()
    const currentHour = startTime.getHours()
    const currentMinute = startTime.getMinutes()
    const actualStartTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    console.log('=== 时间调试信息 ===')
    console.log('传入的body.startTime:', body.startTime)
    console.log('解析后的startTime对象:', startTime)
    console.log('提取的小时和分钟:', currentHour, currentMinute)
    console.log('最终actualStartTime:', actualStartTime)
    console.log('当前服务器北京时间:', getBeijingTime())
    console.log('================')
    
    // 简化版提示词，避免长度过长导致API失败
    const prompt = `作为时间管理专家，生成今日工作计划。

基本信息：
- 可用时间：${body.availableHours}小时，从${actualStartTime}开始
- 工作风格：${body.preferences.workStyle}
- 深度工作块：${body.preferences.focusBlocks}个，每${body.preferences.breakFrequency}分钟休息

固定事件（必须避开）：
${JSON.stringify(todayFixedEvents, null, 2)}

项目概况：总${body.projects.length}个，活跃${body.projects.filter(p => p.status === 'active').length}个
任务频次：每日${body.taskFrequencyStats.daily}个，每周${body.taskFrequencyStats.weekly}个，每月${body.taskFrequencyStats.monthly}个，单次${body.taskFrequencyStats.single}个

待安排任务（限制前15个以避免过长）：
${JSON.stringify(tasksWithFullInfo.slice(0, 15), null, 2)}${tasksWithFullInfo.length > 15 ? `\n...等共${tasksWithFullInfo.length}个任务` : ''}

要求：
1. 使用实际taskId，不要创造新ID
2. 从${actualStartTime}开始连续安排
3. 避开固定事件时间
4. daily任务优先，earning项目优先
5. 高优先级任务在精力充沛时段

返回JSON：
{
  "schedule": [{"timeSlot": "HH:mm-HH:mm", "taskId": "实际ID", "type": "focus|regular|break", "reason": "原因"}],
  "suggestions": ["建议1", "建议2"],
  "estimatedProductivity": 85,
  "projectAnalysis": {"highValueProjects": "重点项目", "timeAllocation": "时间策略", "riskWarning": "风险提醒"}
}`

    console.log('Sending to OpenAI with prompt length:', prompt.length)
    
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    })

    console.log('OpenAI response received')
    
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }
    
    const messageContent = completion.choices[0].message.content
    if (!messageContent) {
      throw new Error('Empty response from OpenAI')
    }
    
    const result = JSON.parse(messageContent)
    console.log('Parsed result:', JSON.stringify(result, null, 2))
    
    if (!result.schedule || !Array.isArray(result.schedule)) {
      throw new Error('Invalid response format: missing or invalid schedule')
    }
    
    // 处理返回的数据，确保taskId正确映射到任务
    const response: DailyPlanResponse = {
      schedule: result.schedule?.map((item: any) => {
        // 如果是休息时间，创建一个休息任务
        if (item.type === 'break' || item.taskId === 'break') {
          return {
            timeSlot: item.timeSlot,
            task: {
              id: 'break',
              title: '休息时间',
              priority: 'low' as const,
              estimatedHours: 0.25,
              status: 'scheduled' as const,
              tags: ['休息'],
              taskType: 'single' as const,
              createdAt: getBeijingTime()
            } as Task,
            type: 'break' as const,
            reason: item.reason
          }
        }
        
        // 查找实际任务
        const task = body.existingTasks.find(t => t.id === item.taskId)
        if (!task) {
          console.warn(`Task not found: ${item.taskId}`)
          return null
        }
        
        return {
          timeSlot: item.timeSlot,
          task: task,
          type: item.type as 'focus' | 'regular' | 'break',
          reason: item.reason
        }
      }).filter(Boolean) || [],
      suggestions: result.suggestions || [],
      estimatedProductivity: result.estimatedProductivity || 75,
      projectAnalysis: result.projectAnalysis || {
        highValueProjects: '暂无项目分析',
        timeAllocation: '标准时间分配',
        riskWarning: '暂无风险提醒'
      }
    }

    console.log('Final response:', JSON.stringify(response, null, 2))
    return NextResponse.json(response)
  } catch (error) {
    console.error('Plan generation error:', error)
    
    let errorMessage = 'Failed to generate plan'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    )
  }
}