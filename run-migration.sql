-- 这是一个临时SQL脚本，需要在Supabase SQL Editor中手动运行
-- 添加项目属性字段
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_size TEXT DEFAULT 'small' CHECK (project_size IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS profit_status TEXT DEFAULT 'hobby' CHECK (profit_status IN ('earning', 'trying', 'hobby')),
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard'));

-- 更新现有数据，根据priority字段设置新字段的初始值
UPDATE projects
SET 
  project_size = CASE 
    WHEN priority IN ('small-earning', 'small-potential', 'small-hobby') THEN 'small'
    ELSE 'medium'
  END,
  profit_status = CASE 
    WHEN priority IN ('small-earning', 'earning') THEN 'earning'
    WHEN priority IN ('small-potential', 'working-on-earning') THEN 'trying'
    ELSE 'hobby'
  END,
  difficulty = 'normal'
WHERE project_size IS NULL OR profit_status IS NULL OR difficulty IS NULL;