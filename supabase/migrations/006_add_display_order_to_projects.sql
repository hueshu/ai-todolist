-- 添加 display_order 字段到 projects 表
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- 为现有项目设置默认的 display_order
UPDATE projects 
SET display_order = (
  SELECT COUNT(*) 
  FROM projects p2 
  WHERE p2.user_id = projects.user_id 
    AND p2.status = projects.status
    AND (
      CASE p2.priority
        WHEN 'earning' THEN 0
        WHEN 'working-on-earning' THEN 1
        WHEN 'small-earning' THEN 2
        WHEN 'small-potential' THEN 3
        WHEN 'small-hobby' THEN 4
      END < 
      CASE projects.priority
        WHEN 'earning' THEN 0
        WHEN 'working-on-earning' THEN 1
        WHEN 'small-earning' THEN 2
        WHEN 'small-potential' THEN 3
        WHEN 'small-hobby' THEN 4
      END
      OR (
        CASE p2.priority
          WHEN 'earning' THEN 0
          WHEN 'working-on-earning' THEN 1
          WHEN 'small-earning' THEN 2
          WHEN 'small-potential' THEN 3
          WHEN 'small-hobby' THEN 4
        END = 
        CASE projects.priority
          WHEN 'earning' THEN 0
          WHEN 'working-on-earning' THEN 1
          WHEN 'small-earning' THEN 2
          WHEN 'small-potential' THEN 3
          WHEN 'small-hobby' THEN 4
        END
        AND p2.created_at < projects.created_at
      )
    )
)
WHERE display_order IS NULL;