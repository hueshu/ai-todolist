-- 添加任务依赖关系字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}';

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_dependencies ON tasks USING GIN (dependencies);

-- 添加注释
COMMENT ON COLUMN tasks.dependencies IS '依赖的任务ID列表';