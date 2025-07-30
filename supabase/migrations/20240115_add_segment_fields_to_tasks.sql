-- 为tasks表添加分段任务相关字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS original_task_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS segment_index INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS total_segments INTEGER;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_original_task_id ON tasks(original_task_id);

-- 添加注释
COMMENT ON COLUMN tasks.original_task_id IS '原始任务ID（用于分段任务）';
COMMENT ON COLUMN tasks.segment_index IS '分段索引（例如：第1段、第2段）';
COMMENT ON COLUMN tasks.total_segments IS '总分段数';