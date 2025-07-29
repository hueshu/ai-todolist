import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { TaskAnalysisRequest, TaskAnalysisResponse } from '@/types'

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is missing or empty')
  }
  return new OpenAI({
    apiKey: apiKey,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: TaskAnalysisRequest = await request.json()
    
    const prompt = `你是一个专业的任务管理助手。用户输入了一个任务描述："${body.task}"

当前项目背景：
${body.context?.currentProjects?.map(p => {
    const priorityMap: Record<string, string> = {
      'small-earning': '小项目在赚钱',
      'small-potential': '小项目可能赚钱',
      'small-hobby': '小项目是爱好',
      'earning': '项目赚钱',
      'working-on-earning': '项目正在努力实现赚钱'
    }
    return `- ${p.name} (${priorityMap[p.priority as string] || p.priority}): ${p.description}`
  }).join('\n') || '暂无项目'}

请分析这个任务并返回：
1. 清晰的任务标题
2. 预估所需时间（小时）
3. 建议的优先级（urgent/high/medium/low）
4. 可能关联的项目
5. 建议的标签

以JSON格式返回结果。`

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    
    const response: TaskAnalysisResponse = {
      parsedTask: {
        title: result.title || body.task,
        estimatedHours: result.estimatedHours || 1,
        suggestedPriority: result.priority || 'medium',
        suggestedProject: result.project,
        suggestedTags: result.tags || [],
      },
      reasoning: result.reasoning || '',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze task' },
      { status: 500 }
    )
  }
}