"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getTasks, createTask } from '@/lib/database'

export function DatabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('正在测试连接...')
    
    try {
      // 测试基础连接
      const { data, error, count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        setTestResult(`❌ 数据库连接失败: ${error.message}`)
      } else {
        setTestResult(`✅ 数据库连接成功! 表存在，当前有 ${count || 0} 条任务记录`)
        
        // 测试插入一条数据
        const testUserId = 'test-user-' + Date.now()
        const { data: insertData, error: insertError } = await supabase
          .from('tasks')
          .insert({
            user_id: testUserId,
            title: '测试任务',
            priority: 'medium',
            estimated_hours: 1,
            status: 'pool',
            tags: [],
            task_type: 'single'
          })
          .select()
          .single()
        
        if (insertError) {
          setTestResult(prev => prev + `\n❌ 插入测试失败: ${insertError.message}`)
        } else {
          setTestResult(prev => prev + `\n✅ 插入测试成功! 任务ID: ${insertData.id}`)
          
          // 清理测试数据
          await supabase.from('tasks').delete().eq('id', insertData.id)
          setTestResult(prev => prev + `\n🧹 测试数据已清理`)
        }
      }
    } catch (error) {
      setTestResult(`❌ 连接异常: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEnvVars = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const isUrlValid = url && url !== 'https://placeholder.supabase.co'
    const isKeyValid = key && key !== 'placeholder-key'
    
    setTestResult(`环境变量检查:
    
SUPABASE_URL: ${url ? (isUrlValid ? '✅ 已正确配置' : '❌ 使用占位符值') : '❌ 未配置'}
实际值: ${url || '未设置'}

SUPABASE_KEY: ${key ? (isKeyValid ? '✅ 已正确配置' : '❌ 使用占位符值') : '❌ 未配置'}
实际值: ${key ? key.substring(0, 20) + '...' : '未设置'}

${!isUrlValid || !isKeyValid ? '\n⚠️  请检查Vercel环境变量配置！' : ''}`)
  }

  const testRealCRUD = async () => {
    setIsLoading(true)
    setTestResult('正在测试真实的CRUD操作...')
    
    try {
      // 测试获取任务
      const existingTasks = await getTasks()
      setTestResult(`✅ 获取任务成功! 当前有 ${existingTasks.length} 个任务`)
      
      // 测试创建任务
      const newTaskData = {
        title: '真实CRUD测试任务',
        priority: 'medium' as const,
        estimatedHours: 1,
        status: 'pool' as const,
        tags: [],
        taskType: 'single' as const,
      }
      
      const createdTask = await createTask(newTaskData)
      setTestResult(prev => prev + `\n✅ 创建任务成功! ID: ${createdTask.id}`)
      
      // 再次获取任务确认创建成功
      const updatedTasks = await getTasks()
      setTestResult(prev => prev + `\n✅ 确认创建成功! 现在有 ${updatedTasks.length} 个任务`)
      
      // 清理测试任务
      await supabase.from('tasks').delete().eq('id', createdTask.id)
      setTestResult(prev => prev + `\n🧹 测试任务已清理`)
      
    } catch (error) {
      setTestResult(prev => prev + `\n❌ CRUD操作失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-3">🔧 数据库连接测试</h3>
      
      <div className="space-x-2 mb-3">
        <Button 
          onClick={testEnvVars}
          variant="outline"
          size="sm"
        >
          检查环境变量
        </Button>
        
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? '测试中...' : '测试数据库连接'}
        </Button>
        
        <Button 
          onClick={testRealCRUD} 
          disabled={isLoading}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isLoading ? '测试中...' : '测试真实CRUD'}
        </Button>
      </div>
      
      {testResult && (
        <pre className="text-sm bg-white p-2 rounded border whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
    </div>
  )
}