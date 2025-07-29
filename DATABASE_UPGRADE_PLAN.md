# 数据库升级方案

## 技术栈选择

### 选项A：SQLite + Prisma (推荐轻量级)
```
- 数据库：SQLite (本地文件数据库)
- ORM：Prisma
- 优点：简单部署，无需额外数据库服务器
- 适用：个人或小团队使用
```

### 选项B：PostgreSQL + Prisma (推荐企业级)
```
- 数据库：PostgreSQL 
- ORM：Prisma
- 优点：功能强大，支持高并发
- 适用：多用户生产环境
```

### 选项C：MongoDB + Mongoose
```
- 数据库：MongoDB
- ODM：Mongoose
- 优点：灵活的文档结构
- 适用：快速迭代的项目
```

## 实施步骤

### 第一步：数据库设计
```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  priority TEXT,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 任务表
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  estimated_hours REAL,
  actual_hours REAL,
  deadline DATETIME,
  scheduled_start_time DATETIME,
  time_slot TEXT,
  status TEXT,
  task_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 固定事件表
CREATE TABLE fixed_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  days_of_week TEXT, -- JSON字符串
  category TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 第二步：API路由设计
```
GET    /api/tasks         - 获取任务列表
POST   /api/tasks         - 创建任务
PUT    /api/tasks/:id     - 更新任务
DELETE /api/tasks/:id     - 删除任务

GET    /api/projects      - 获取项目列表
POST   /api/projects      - 创建项目
PUT    /api/projects/:id  - 更新项目
DELETE /api/projects/:id  - 删除项目

GET    /api/fixed-events  - 获取固定事件
POST   /api/fixed-events  - 创建固定事件
PUT    /api/fixed-events/:id  - 更新固定事件
DELETE /api/fixed-events/:id  - 删除固定事件
```

### 第三步：认证系统
```
- NextAuth.js (推荐)
- 支持Google、GitHub等OAuth登录
- 或简单的邮箱+密码登录
```