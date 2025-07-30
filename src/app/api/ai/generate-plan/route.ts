import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
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

function getClaude() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is missing or empty')
  }
  return new Anthropic({
    apiKey: apiKey,
  })
}

async function callAI(prompt: string, provider: 'openai' | 'claude' = 'openai') {
  console.log(`Using AI provider: ${provider}`)
  
  if (provider === 'claude') {
    const claude = getClaude()
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
    console.log('Using Claude model:', modelName)
    
    const message = await claude.messages.create({
      model: modelName,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt + '\n\n重要：请直接返回JSON对象，不要使用markdown代码块（不要用```包裹），不要添加任何解释文字。'
      }],
    })
    
    // Claude 返回的是 content 数组，需要提取文本
    let content = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // 清理 Claude 返回的内容，去除可能的 markdown 代码块标记
    content = content.trim()
    if (content.startsWith('```json')) {
      content = content.slice(7) // 移除开头的 ```json
    }
    if (content.startsWith('```')) {
      content = content.slice(3) // 移除开头的 ```
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3) // 移除结尾的 ```
    }
    
    return content.trim()
  } else {
    const openai = getOpenAI()
    const aiModel = process.env.OPENAI_MODEL || 'gpt-4o'
    console.log('Using OpenAI model:', aiModel)
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: aiModel,
      response_format: { type: "json_object" },
    })
    
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }
    
    return completion.choices[0].message.content || ''
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
    
    // 调试：打印任务的预估时间
    console.log('[调试] 任务预估时间:', tasksWithFullInfo.map(t => ({
      title: t.title,
      estimatedHours: t.estimatedHours
    })))
    
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
    
    // 优化后的提示词，更简洁清晰
    const prompt = `作为时间管理专家，为用户生成今日工作计划。

时间安排：
- 开始时间：${actualStartTime}
- 结束时间：${workEndTime}
- 番茄工作法：25-30分钟工作 + 5分钟休息

${todayFixedEvents.length > 0 ? `🚫 固定事件（必须避开，不可占用）：
${todayFixedEvents.map(e => `${e.startTime}-${e.endTime}: ${e.title}`).join('\n')}
` : ''}
${todayFixedEvents.length === 0 ? '提示：未设置固定事件。建议添加午餐（12:00-13:00）、晚餐（18:00-19:00）等固定时间\n' : ''}

待安排任务（共${body.existingTasks.length}个）：
${tasksWithFullInfo.slice(0, 20).map(t => 
  `- [ID: ${t.id}] ${t.title} (${t.estimatedHours}h, ${t.priority}优先级${t.project ? `, 项目:${t.project.name}` : ''}${t.dependencies.length > 0 ? `, 依赖其他任务` : ''})`
).join('\n')}${tasksWithFullInfo.length > 20 ? `\n...还有${tasksWithFullInfo.length - 20}个任务` : ''}

${body.userPreferences ? `用户偏好：${body.userPreferences}\n` : ''}
${body.strictRequirements ? `⚠️ 严格执行要求（必须遵守）：${body.strictRequirements}\n` : ''}

核心规则（违反任何一条都不可接受）：
1. 🚫 固定事件（吃饭时间等）绝对不能被占用或删除
2. ⏱️ 任务时长必须严格等于estimatedHours：
   - 1小时任务 = 必须安排满1小时（可以是2个30分钟）
   - 3小时任务 = 必须安排满3小时（可以分段如1.5h+1.5h或1h+1h+1h）
   - 不允许缩短或延长任务时间
3. 📊 优先级综合考虑（都很重要）：
   - 任务优先级：urgent > high > medium > low
   - 项目优先级：考虑项目的重要性和displayOrder
   - 两者结合：高优先级项目的任务应优先安排

安排策略：
1. 先确保所有固定事件时间被保护
2. 优先安排紧急(urgent)和高优先级(high)任务
3. 重要项目的任务优先获得好的时间段
4. 每个任务必须获得其完整的estimatedHours时间
5. 可以将任务分成30分钟的番茄钟，但总时长不变

⚠️ 最后检查：
- 每个固定事件都被保留了吗？
- 每个任务都获得了完整的预估时间吗？
- 优先级高的任务和项目是否被优先安排？

返回JSON格式要求：
1. taskId必须使用上面任务列表中的实际ID（方括号内的ID值）
2. 不要使用任务标题作为taskId
3. 休息时间的taskId固定为"break"

示例返回格式（注意任务时长的安排）：
{
  "schedule": [
    {"timeSlot": "09:00-09:30", "taskId": "task-id-1", "type": "focus", "reason": "高优先级任务-第1部分(0.5h)"},
    {"timeSlot": "09:30-10:00", "taskId": "task-id-1", "type": "focus", "reason": "高优先级任务-第2部分(0.5h)"}, 
    {"timeSlot": "10:00-10:05", "taskId": "break", "type": "break", "reason": "休息5分钟"},
    {"timeSlot": "10:05-11:05", "taskId": "task-id-2", "type": "regular", "reason": "1小时任务完整安排"},
    {"timeSlot": "11:05-11:10", "taskId": "break", "type": "break", "reason": "休息5分钟"},
    {"timeSlot": "11:10-12:00", "taskId": "task-id-3", "type": "regular", "reason": "项目A的任务(0.83h)"},
    {"timeSlot": "12:00-13:00", "taskId": "lunch", "type": "break", "reason": "午餐时间-固定事件"}
  ],
  "suggestions": ["记住：每个任务的总时长必须等于其estimatedHours"],
  "estimatedProductivity": 85,
  "projectAnalysis": {
    "highValueProjects": "重点关注的高优先级项目",
    "timeAllocation": "根据任务和项目优先级分配时间",
    "riskWarning": "检查是否所有任务都获得了足够时间"
  }
}`

    console.log('Sending to AI with prompt length:', prompt.length)
    
    // 获取 AI 提供商选择，默认使用 OpenAI
    const aiProvider = body.aiProvider || 'openai'
    
    const messageContent = await callAI(prompt, aiProvider)
    
    console.log('AI response received')
    
    if (!messageContent) {
      throw new Error('Empty response from AI')
    }
    
    const result = JSON.parse(messageContent)
    console.log('[AI响应] 原始结果:', JSON.stringify(result, null, 2))
    console.log('[AI响应] 计划项数量:', result.schedule?.length || 0)
    console.log('[AI响应] 计划项详情:', result.schedule?.map((item: any) => ({
      taskId: item.taskId,
      type: item.type,
      timeSlot: item.timeSlot
    })))
    
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
    console.log('[任务映射] 开始处理计划项，总数:', correctedSchedule.length)
    console.log('[任务映射] 可用任务ID列表:', body.existingTasks.map(t => t.id))
    
    const scheduleItems = correctedSchedule.map((item: any, index: number) => {
      console.log(`[任务映射] 处理第${index + 1}项:`, item)
      
      // 如果是休息时间，创建一个休息任务
      if (item.type === 'break' || item.taskId === 'break') {
        console.log('[任务映射] 识别为休息时间')
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
        console.error(`[任务映射] 未找到任务 ID: ${item.taskId}`)
        console.log('[任务映射] 任务类型:', item.type)
        console.log('[任务映射] 原因:', item.reason)
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