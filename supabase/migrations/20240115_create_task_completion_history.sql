-- 创建任务完成历史表
CREATE TABLE IF NOT EXISTS task_completion_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id UUID NOT NULL,
  task_title TEXT NOT NULL,
  task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('single', 'daily', 'weekly', 'monthly')),
  project_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_hours DECIMAL(4,2) NOT NULL,
  actual_hours DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_task_completion_history_user_id ON task_completion_history(user_id);
CREATE INDEX idx_task_completion_history_task_id ON task_completion_history(task_id);
CREATE INDEX idx_task_completion_history_completed_at ON task_completion_history(completed_at);
CREATE INDEX idx_task_completion_history_project_id ON task_completion_history(project_id);

-- 添加行级安全策略
ALTER TABLE task_completion_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的记录
CREATE POLICY "Users can view own task completion history" ON task_completion_history
  FOR SELECT USING (user_id = 'shared-user-account');

-- 创建策略：用户只能插入自己的记录
CREATE POLICY "Users can insert own task completion history" ON task_completion_history
  FOR INSERT WITH CHECK (user_id = 'shared-user-account');

-- 添加注释
COMMENT ON TABLE task_completion_history IS '任务完成历史记录表，用于统计和分析';
COMMENT ON COLUMN task_completion_history.task_id IS '关联的任务ID';
COMMENT ON COLUMN task_completion_history.task_title IS '任务标题（冗余存储，方便查询）';
COMMENT ON COLUMN task_completion_history.task_type IS '任务类型：single-单次, daily-每日, weekly-每周, monthly-每月';
COMMENT ON COLUMN task_completion_history.completed_at IS '任务完成时间';
COMMENT ON COLUMN task_completion_history.estimated_hours IS '预估时间（小时）';
COMMENT ON COLUMN task_completion_history.actual_hours IS '实际时间（小时）';