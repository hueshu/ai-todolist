// 时区工具函数 - 统一使用东八区（北京时间 UTC+8）

/**
 * 获取当前北京时间
 * 使用最简单直接的方法确保准确性
 */
export function getBeijingTime(): Date {
  // 获取当前时间
  const now = new Date()
  
  // 获取本地时间与UTC的差值（分钟）
  const offset = now.getTimezoneOffset()
  // 北京时间是UTC+8，即480分钟
  const beijingOffset = -480
  // 计算需要调整的分钟数
  const diff = beijingOffset - (-offset)
  
  // 如果已经是北京时间，直接返回
  if (diff === 0) {
    return now
  }
  
  // 调整时间
  return new Date(now.getTime() + diff * 60000)
}

/**
 * 将任意日期转换为北京时间显示
 */
export function toBeijingTime(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  return new Date(inputDate.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
}

/**
 * 格式化北京时间为字符串
 */
export function formatBeijingTime(date: Date | string, format: 'date' | 'datetime' | 'time' = 'datetime'): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  
  // 使用北京时区格式化
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Shanghai',
    hour12: false
  }
  
  switch (format) {
    case 'date':
      return inputDate.toLocaleDateString('zh-CN', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' })
    case 'time':
      return inputDate.toLocaleTimeString('zh-CN', { ...options, hour: '2-digit', minute: '2-digit' })
    case 'datetime':
    default:
      return inputDate.toLocaleString('zh-CN', { 
        ...options, 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
  }
}

/**
 * 获取北京时间的今天开始时间 (00:00:00)
 */
export function getBeijingTodayStart(): Date {
  const beijing = getBeijingTime()
  const start = new Date(beijing)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * 获取北京时间的今天结束时间 (23:59:59)
 */
export function getBeijingTodayEnd(): Date {
  const beijing = getBeijingTime()
  const end = new Date(beijing)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * 检查日期是否为北京时间的今天
 */
export function isBeijingToday(date: Date | string): boolean {
  if (!date) return false
  
  const inputDate = typeof date === 'string' ? new Date(date) : date
  const today = getBeijingTime()
  
  // 在北京时区比较年月日
  const inputBeijing = new Date(inputDate.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
  const todayBeijing = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
  
  return inputBeijing.getFullYear() === todayBeijing.getFullYear() &&
         inputBeijing.getMonth() === todayBeijing.getMonth() &&
         inputBeijing.getDate() === todayBeijing.getDate()
}

/**
 * 将北京时间转换为UTC时间字符串（用于数据库存储）
 */
export function toUTCString(beijingDate: Date): string {
  // 北京时间减去8小时得到UTC时间
  const utcTime = new Date(beijingDate.getTime() - (8 * 3600000))
  return utcTime.toISOString()
}

/**
 * 从UTC字符串创建北京时间Date对象
 */
export function fromUTCString(utcString: string): Date {
  const utcDate = new Date(utcString)
  // UTC时间加8小时得到北京时间
  return new Date(utcDate.getTime() + (8 * 3600000))
}

/**
 * 获取北京时间字符串（用于显示）
 */
export function getBeijingTimeString(): string {
  return new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * 获取北京时间的时和分
 */
export function getBeijingHourMinute(): { hour: number; minute: number } {
  const beijingTimeStr = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const [hour, minute] = beijingTimeStr.split(':').map(Number)
  return { hour, minute }
}