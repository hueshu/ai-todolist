import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DailyPlanRequest, DailyPlanResponse, Task } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getBeijingTime, formatBeijingTime, getBeijingHourMinute } from '@/lib/timezone'

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is missing or empty')
  }
  return new OpenAI({
    apiKey: apiKey,
  })
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
      dependencies: task.dependencies || [],
      project: task.project ? {
        name: task.project.name,
        duration: task.project.duration,
        priority: task.project.priority,
        priorityDescription: projectPriorityMap[task.project.priority || ''] || '未知优先级',
        displayOrder: task.project.displayOrder, // 用户自定义的排序顺序
        weeklyGoals: task.project.weeklyGoals
      } : null
    }))
    
    // 将字符串日期转换为 Date 对象
    const requestDate = new Date(body.date)
    console.log('Converted date:', requestDate)
    
    // 处理固定事件
    const todayFixedEvents = formatFixedEventsForPrompt(body.fixedEvents || [], requestDate)
    
    // 优先使用直接传递的时间字符串
    let actualStartTime: string
    let startTime: Date
    
    if (body.startTimeString) {
      // 使用前端传递的时间字符串
      actualStartTime = body.startTimeString
      const [hours, minutes] = actualStartTime.split(':').map(Number)
      startTime = new Date()
      startTime.setHours(hours, minutes, 0, 0)
      console.log('[时间处理] 使用前端传递的时间字符串:', actualStartTime)
    } else if (body.startTime) {
      // 回退到Date对象处理
      startTime = new Date(body.startTime)
      const currentHour = startTime.getHours()
      const currentMinute = startTime.getMinutes()
      actualStartTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      console.log('[时间处理] 使用Date对象处理，结果:', actualStartTime)
    } else {
      // 使用服务器当前北京时间
      const { hour: currentHour, minute: currentMinute } = getBeijingHourMinute()
      actualStartTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      startTime = new Date()
      startTime.setHours(currentHour, currentMinute, 0, 0)
      console.log('[时间处理] 使用服务器当前北京时间:', actualStartTime)
    }
    
    // 解析停止工作时间
    const workEndTime = body.workEndTime || '18:00'
    
    // 添加时区调试信息
    console.log('[时区信息] 服务器当前时间:', new Date().toString())
    console.log('[时区信息] 服务器时区偏移:', new Date().getTimezoneOffset())
    console.log('[时区信息] 最终使用的开始时间:', actualStartTime)
    console.log('[时区信息] 停止工作时间:', workEndTime)
    
    // 简化版提示词，避免长度过长导致API失败
    const prompt = `作为时间管理专家，生成今日工作计划。注意：所有时间都是北京时间（UTC+8）。

基本信息：
- 当前北京时间：${actualStartTime}
- 停止工作时间：${workEndTime}（北京时间，请确保所有任务在此时间前完成）
- 使用番茄工作法：每工作30分钟，休息5分钟

固定事件（必须避开）：
${JSON.stringify(todayFixedEvents, null, 2)}

项目概况：
- 总项目数：${body.projects.length}个，活跃${body.projects.filter(p => p.status === 'active').length}个
- 用户自定义项目优先级（displayOrder）：${body.projects.filter(p => p.displayOrder !== undefined).sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999)).slice(0, 5).map(p => `${p.name}(顺序:${p.displayOrder || '未设置'})`).join('、')}${body.projects.filter(p => p.displayOrder !== undefined).length > 5 ? '等' : ''}
任务频次：每日${body.taskFrequencyStats.daily}个，每周${body.taskFrequencyStats.weekly}个，每月${body.taskFrequencyStats.monthly}个，单次${body.taskFrequencyStats.single}个

${body.userPreferences ? `用户今日偏好（仅供参考，灵活处理）：
${body.userPreferences}
` : ''}
待安排任务（限制前15个以避免过长）：
${JSON.stringify(tasksWithFullInfo.slice(0, 15), null, 2)}${tasksWithFullInfo.length > 15 ? `\n...等共${tasksWithFullInfo.length}个任务` : ''}

要求：
1. 使用实际taskId，不要创造新ID
2. **重要**：第一个时间段必须从${actualStartTime}开始，后续时间段连续安排
3. **重要**：所有任务必须在${workEndTime}前结束，不要安排超过此时间的任务
4. 避开固定事件时间
5. **优先级参考（非强制）**：
   - daily/weekly等重复任务应优先安排
   - 考虑用户自定义的项目优先级（displayOrder），但这只是参考，你可以根据任务紧急度、截止日期、依赖关系等因素灵活调整
   - 如果用户给某个项目设置了较高的displayOrder（数字越小优先级越高），可以适当倾斜时间分配，但不必严格遵守
   - 用户今日偏好（userPreferences）也是参考因素，理解用户意图但要保持计划的合理性
   - 最终目标是制定一个合理高效的计划，综合考虑各种因素，而不是机械地执行某一条规则
6. 高优先级任务在精力充沛时段
7. **番茄工作法**：尽量将任务安排为30分钟的工作块，每个工作块后安排5分钟休息
   - 如果任务需要1小时，可以拆分为2个30分钟的番茄钟
   - 休息时间请明确标注为"break"类型
8. **任务依赖**：注意任务的dependencies字段，被依赖的任务必须先完成
   - 如果任务A依赖任务B（A.dependencies包含B的ID），则B必须在A之前安排
   - 确保依赖链的正确顺序

返回JSON格式（timeSlot格式必须是HH:mm-HH:mm）：
{
  "schedule": [
    {"timeSlot": "${actualStartTime}-HH:mm", "taskId": "实际ID", "type": "focus|regular|break", "reason": "原因"},
    {"timeSlot": "HH:mm-HH:mm", "taskId": "实际ID", "type": "focus|regular|break", "reason": "原因"}
  ],
  "suggestions": ["建议1", "建议2"],
  "estimatedProductivity": 85,
  "projectAnalysis": {"highValueProjects": "重点项目", "timeAllocation": "时间策略", "riskWarning": "风险提醒"}
}`

    console.log('Sending to OpenAI with prompt length:', prompt.length)
    
    const openai = getOpenAI()
    // 支持通过环境变量配置模型，默认使用gpt-4o
    const aiModel = process.env.OPENAI_MODEL || 'gpt-4o'
    console.log('Using AI model:', aiModel)
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: aiModel,
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
    
    
    // 计算时长的辅助函数
    const calculateDuration = (originalTimeSlot: string, type: string) => {
      // 从原时间段提取时长，或根据类型设置默认时长
      if (originalTimeSlot && originalTimeSlot.includes('-')) {
        const [start, end] = originalTimeSlot.split('-')
        const startMinutes = timeToMinutes(start)
        const endMinutes = timeToMinutes(end)
        return endMinutes - startMinutes
      }
      
      // 默认时长（符合番茄工作法）
      if (type === 'break') return 5  // 休息5分钟
      if (type === 'focus') return 30 // 专注工作30分钟
      return 30 // regular也是30分钟
    }
    
    
    // 时间字符串转分钟数
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    // 创建停止工作时间的Date对象
    const [endHour, endMin] = workEndTime.split(':').map(Number)
    const workEndDate = new Date()
    workEndDate.setHours(endHour, endMin, 0, 0)
    
    // 创建基于北京时间的开始时间
    const [startHour, startMin] = actualStartTime.split(':').map(Number)
    const beijingStartTime = new Date()
    beijingStartTime.setHours(startHour, startMin, 0, 0)
    
    // 校正时间安排 - 基于字符串处理，确保正确
    let currentTimeInMinutes = timeToMinutes(actualStartTime)
    const endTimeInMinutes = timeToMinutes(workEndTime)
    
    console.log('[时间校正] 开始时间:', actualStartTime, '(', currentTimeInMinutes, '分钟)')
    console.log('[时间校正] 结束时间:', workEndTime, '(', endTimeInMinutes, '分钟)')
    
    const correctedSchedule = (result.schedule || []).map((item: any, index: number) => {
      // 计算任务时长
      const duration = calculateDuration(item.timeSlot, item.type)
      
      // 如果当前时间加上任务时长超过结束时间，则跳过
      if (currentTimeInMinutes + duration > endTimeInMinutes) {
        console.log('[时间校正] 任务超出工作时间，跳过:', item.taskId)
        return null
      }
      
      // 计算任务的开始和结束时间
      const startHour = Math.floor(currentTimeInMinutes / 60)
      const startMin = currentTimeInMinutes % 60
      const taskEndTimeInMinutes = currentTimeInMinutes + duration
      const endHour = Math.floor(taskEndTimeInMinutes / 60)
      const endMin = taskEndTimeInMinutes % 60
      
      const correctedTimeSlot = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}-${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
      
      console.log('[时间校正] 任务', index + 1, ':', item.taskId, '原时间:', item.timeSlot, '校正后:', correctedTimeSlot)
      
      // 更新当前时间为任务结束时间
      currentTimeInMinutes = taskEndTimeInMinutes
      
      return {
        ...item,
        timeSlot: correctedTimeSlot
      }
    }).filter((item: any) => item !== null)
    
    // 处理返回的数据，确保taskId正确映射到任务
    const scheduleItems = correctedSchedule.map((item: any) => {
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
          reason: item.reason || '休息时间'
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
        reason: item.reason || '工作任务'
      }
    }).filter((item: any): item is NonNullable<typeof item> => item !== null)

    const response: DailyPlanResponse = {
      schedule: scheduleItems,
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