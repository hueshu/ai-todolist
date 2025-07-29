"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export function DatabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('正在测试连接...')
    
    try {
      // 测试基础连接
      const { data, error } = await supabase
        .from('tasks')
        .select('count(*)', { count: 'exact' })
        .limit(1)
      
      if (error) {
        setTestResult(`❌ 数据库连接失败: ${error.message}`)
      } else {
        setTestResult(`✅ 数据库连接成功! 当前有 ${data?.length || 0} 条记录`)
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
      </div>
      
      {testResult && (
        <pre className="text-sm bg-white p-2 rounded border whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
    </div>
  )
}