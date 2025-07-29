-- Supabase数据库初始化脚本 - 分步执行版本
-- 如果一次性执行有问题，可以分步骤运行

-- ========================================
-- 第一步：创建项目表
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  priority TEXT NOT NULL DEFAULT 'small-potential' CHECK (priority IN ('small-earning', 'small-potential', 'small-hobby', 'earning', 'working-on-earning')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  weekly_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 第二步：创建任务表
-- ========================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  estimated_hours REAL NOT NULL DEFAULT 1,
  actual_hours REAL,
  deadline TIMESTAMPTZ,
  scheduled_start_time TIMESTAMPTZ,
  time_slot TEXT,
  status TEXT NOT NULL DEFAULT 'pool' CHECK (status IN ('pool', 'scheduled', 'in-progress', 'completed')),
  tags TEXT[] DEFAULT '{}',
  task_type TEXT NOT NULL DEFAULT 'single' CHECK (task_type IN ('single', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ========================================
-- 第三步：创建固定事件表
-- ========================================
CREATE TABLE IF NOT EXISTS fixed_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('meal', 'break', 'exercise', 'commute', 'meeting', 'personal', 'other')),
  color TEXT NOT NULL DEFAULT '#64748b',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 第四步：创建索引
-- ========================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_fixed_events_user_id ON fixed_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_events_is_active ON fixed_events(is_active);

-- ========================================
-- 第五步：启用行级安全性 (RLS)
-- ========================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;  
ALTER TABLE fixed_events ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 第六步：创建RLS策略
-- ========================================

-- 任务表策略
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (true);

-- 项目表策略  
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (true);

-- 固定事件表策略
CREATE POLICY "Users can view own fixed_events" ON fixed_events FOR SELECT USING (true);
CREATE POLICY "Users can insert own fixed_events" ON fixed_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own fixed_events" ON fixed_events FOR UPDATE USING (true);
CREATE POLICY "Users can delete own fixed_events" ON fixed_events FOR DELETE USING (true);