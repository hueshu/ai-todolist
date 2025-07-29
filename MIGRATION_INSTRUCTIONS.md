# 数据库迁移说明

## 执行步骤

1. 登录到你的 Supabase 项目控制台
2. 进入 SQL Editor
3. 复制 `run-migration.sql` 文件的内容
4. 在 SQL Editor 中粘贴并执行

## 迁移内容

这个迁移会为 `projects` 表添加三个新字段：
- `project_size`: 项目大小（small/medium/large）
- `profit_status`: 盈利状态（earning/trying/hobby）
- `difficulty`: 难易度（easy/normal/hard）

并且会根据现有的 `priority` 字段自动设置这些新字段的初始值。

## 注意事项

- 迁移是安全的，不会删除任何现有数据
- 新字段都有默认值，不会影响现有功能
- 执行后刷新页面即可使用新的项目编辑功能