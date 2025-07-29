// 时区工具函数 - 统一使用东八区（北京时间）

/**
 * 获取当前北京时间
 */
export function getBeijingTime(): Date {
  const now = new Date()
  // 获取UTC时间然后加8小时
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const beijingTime = new Date(utc + (8 * 3600000))
  return beijingTime
}

/**
 * 将UTC时间转换为北京时间显示
 */
export function toBeijingTime(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  // 如果已经是北京时间格式，直接返回
  return inputDate
}

/**
 * 格式化北京时间为字符串
 */
export function formatBeijingTime(date: Date | string, format: 'date' | 'datetime' | 'time' = 'datetime'): string {
  const beijingDate = toBeijingTime(date)
  
  const year = beijingDate.getFullYear()
  const month = String(beijingDate.getMonth() + 1).padStart(2, '0')
  const day = String(beijingDate.getDate()).padStart(2, '0')
  const hours = String(beijingDate.getHours()).padStart(2, '0')
  const minutes = String(beijingDate.getMinutes()).padStart(2, '0')
  const seconds = String(beijingDate.getSeconds()).padStart(2, '0')
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}`
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

/**
 * 获取北京时间的今天开始时间 (00:00:00)
 */
export function getBeijingTodayStart(): Date {
  const beijing = getBeijingTime()
  return new Date(beijing.getFullYear(), beijing.getMonth(), beijing.getDate(), 0, 0, 0, 0)
}

/**
 * 获取北京时间的今天结束时间 (23:59:59)
 */
export function getBeijingTodayEnd(): Date {
  const beijing = getBeijingTime()
  return new Date(beijing.getFullYear(), beijing.getMonth(), beijing.getDate(), 23, 59, 59, 999)
}

/**
 * 检查日期是否为北京时间的今天
 */
export function isBeijingToday(date: Date | string): boolean {
  const targetDate = toBeijingTime(date)
  const today = getBeijingTime()
  
  return targetDate.getFullYear() === today.getFullYear() &&
         targetDate.getMonth() === today.getMonth() &&
         targetDate.getDate() === today.getDate()
}

/**
 * 将本地时间转换为UTC时间字符串（用于数据库存储）
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
  const beijingTime = new Date(utcDate.getTime() + (8 * 3600000))
  return beijingTime
}