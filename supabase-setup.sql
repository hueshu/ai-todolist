-- Supabase数据库初始化脚本
-- 在Supabase Dashboard的SQL Editor中运行此脚本

-- 创建项目表 (必须先创建，因为tasks表会引用它)
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

-- 创建任务表 (引用projects表，所以要在projects之后创建)
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

-- 创建固定事件表
CREATE TABLE IF NOT EXISTS fixed_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL, -- 格式: "HH:mm"  
  end_time TEXT NOT NULL,   -- 格式: "HH:mm"
  days_of_week INTEGER[] NOT NULL, -- 0-6数组
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('meal', 'break', 'exercise', 'commute', 'meeting', 'personal', 'other')),
  color TEXT NOT NULL DEFAULT '#64748b',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_fixed_events_user_id ON fixed_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_events_is_active ON fixed_events(is_active);

-- 启用行级安全性 (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;  
ALTER TABLE fixed_events ENABLE ROW LEVEL SECURITY;

-- 创建简单的RLS策略 (基于user_id)
-- 注意：这是简化版策略，生产环境应该使用proper authentication

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

-- 插入一些示例数据 (可选)
-- 注意：将 'your-device-id' 替换为实际的设备ID
/*
INSERT INTO projects (user_id, name, description, priority, duration) VALUES
('your-device-id', 'TodoList应用', '智能任务管理系统开发', 'earning', 30);

INSERT INTO tasks (user_id, title, description, priority, estimated_hours, status, tags, task_type) VALUES
('your-device-id', '完成项目文档', '整理项目的技术文档和用户手册', 'high', 3, 'pool', ARRAY['文档', '项目'], 'single'),
('your-device-id', '代码review', '检查新功能的代码质量', 'medium', 2, 'pool', ARRAY['开发', '质量'], 'single'),
('your-device-id', '每日站会', '团队每日同步会议', 'medium', 0.5, 'pool', ARRAY['会议'], 'daily');

INSERT INTO fixed_events (user_id, title, start_time, end_time, days_of_week, category, color) VALUES  
('your-device-id', '午餐时间', '12:00', '13:00', ARRAY[1,2,3,4,5], 'meal', '#f97316'),
('your-device-id', '晚餐时间', '18:00', '19:00', ARRAY[1,2,3,4,5,6,0], 'meal', '#f97316');
*/