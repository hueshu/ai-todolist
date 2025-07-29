import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表结构类型
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          project_id: string | null
          priority: 'urgent' | 'high' | 'medium' | 'low'
          estimated_hours: number
          actual_hours: number | null
          deadline: string | null
          scheduled_start_time: string | null
          time_slot: string | null
          status: 'pool' | 'scheduled' | 'in-progress' | 'completed'
          tags: string[]
          task_type: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          project_id?: string | null
          priority?: 'urgent' | 'high' | 'medium' | 'low'
          estimated_hours?: number
          actual_hours?: number | null
          deadline?: string | null
          scheduled_start_time?: string | null
          time_slot?: string | null
          status?: 'pool' | 'scheduled' | 'in-progress' | 'completed'
          tags?: string[]
          task_type?: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          project_id?: string | null
          priority?: 'urgent' | 'high' | 'medium' | 'low'
          estimated_hours?: number
          actual_hours?: number | null
          deadline?: string | null
          scheduled_start_time?: string | null
          time_slot?: string | null
          status?: 'pool' | 'scheduled' | 'in-progress' | 'completed'
          tags?: string[]
          task_type?: 'single' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
          completed_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          duration: number
          priority: 'small-earning' | 'small-potential' | 'small-hobby' | 'earning' | 'working-on-earning'
          status: 'active' | 'completed' | 'archived'
          weekly_goals: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          duration?: number
          priority?: 'small-earning' | 'small-potential' | 'small-hobby' | 'earning' | 'working-on-earning'
          status?: 'active' | 'completed' | 'archived'
          weekly_goals?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          duration?: number
          priority?: 'small-earning' | 'small-potential' | 'small-hobby' | 'earning' | 'working-on-earning'
          status?: 'active' | 'completed' | 'archived'
          weekly_goals?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      fixed_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          days_of_week: number[]
          category: 'meal' | 'break' | 'exercise' | 'commute' | 'meeting' | 'personal' | 'other'
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          days_of_week: number[]
          category?: 'meal' | 'break' | 'exercise' | 'commute' | 'meeting' | 'personal' | 'other'
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          days_of_week?: number[]
          category?: 'meal' | 'break' | 'exercise' | 'commute' | 'meeting' | 'personal' | 'other'
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}