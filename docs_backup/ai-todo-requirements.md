# AI智能任务管理系统 - 需求文档

## 1. 项目概述

### 1.1 背景
自由职业者在处理多个项目时，面临任务管理混乱、优先级不清、时间分配不合理等问题。需要一个智能系统来自动分析任务、合理安排每日工作计划。

### 1.2 核心价值
- **智能规划**：基于AI分析任务属性，自动生成每日计划
- **动态调整**：根据实际完成情况和突发任务，实时优化安排
- **效率提升**：减少决策疲劳，专注于执行

### 1.3 技术栈建议
- **前端**：React + TypeScript + Tailwind CSS
- **后端**：Node.js + Express / Next.js API Routes
- **数据库**：PostgreSQL / MongoDB
- **AI接口**：Claude API / OpenAI API
- **部署**：Vercel / Railway

## 2. 功能需求

### 2.1 项目管理
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'archived';
  weeklyGoals: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**功能要求**：
- 创建、编辑、删除项目
- 设置周目标和里程碑
- 项目进度可视化
- 项目归档功能

### 2.2 任务池管理
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours?: number;
  deadline?: Date;
  status: 'pool' | 'scheduled' | 'in-progress' | 'completed';
  tags: string[];
  dependencies?: string[]; // 其他任务的ID
  createdAt: Date;
  completedAt?: Date;
}
```

**功能要求**：
- 快速添加任务（支持自然语言输入）
- 任务可以不立即分配到具体日期
- 支持任务依赖关系设置
- 批量操作功能

### 2.3 AI智能分析与规划

#### 2.3.1 任务分析API
```typescript
interface TaskAnalysisRequest {
  task: string; // 用户输入的任务描述
  context?: {
    currentProjects: Project[];
    recentTasks: Task[];
  };
}

interface TaskAnalysisResponse {
  parsedTask: {
    title: string;
    estimatedHours: number;
    suggestedPriority: string;
    suggestedProject?: string;
    suggestedTags: string[];
  };
  reasoning: string;
}
```

#### 2.3.2 每日规划生成
```typescript
interface DailyPlanRequest {
  date: Date;
  availableHours: number;
  existingTasks: Task[];
  preferences: {
    workStyle: 'morning-person' | 'night-owl' | 'balanced';
    focusBlocks: number; // 每天希望的深度工作块数
    breakFrequency: number; // 休息频率（分钟）
  };
}

interface DailyPlanResponse {
  schedule: {
    timeSlot: string; // "09:00-11:00"
    task: Task;
    type: 'focus' | 'regular' | 'break';
    reason: string;
  }[];
  suggestions: string[];
  estimatedProductivity: number; // 0-100
}
```

### 2.4 实时调整功能

#### 2.4.1 任务完成反馈
```typescript
interface TaskCompletionFeedback {
  taskId: string;
  actualHours: number;
  completionQuality: 'excellent' | 'good' | 'rushed';
  blockers?: string[];
  notes?: string;
}
```

#### 2.4.2 动态重规划
- 当任务延期时，自动调整后续安排
- 新增紧急任务时，重新平衡当天计划
- 学习用户的实际工作模式

### 2.5 数据分析与洞察

#### 2.5.1 效率分析
- 预估时间 vs 实际时间对比
- 不同类型任务的效率曲线
- 最佳工作时段识别

#### 2.5.2 项目健康度
- 项目进度追踪
- 风险预警（deadline临近但进度落后）
- 资源分配建议

## 3. 用户界面设计

### 3.1 主要页面

#### 3.1.1 仪表板（Dashboard）
- 今日计划概览
- 任务池快速预览
- 项目进度条
- AI建议卡片

#### 3.1.2 任务池（Task Pool）
- 列表/看板视图切换
- 拖拽排序
- 快速筛选和搜索
- 批量操作工具栏

#### 3.1.3 日历视图（Calendar）
- 月/周/日视图
- 拖拽调整任务
- 时间块可视化
- 冲突提示

#### 3.1.4 AI助手对话（AI Assistant）
- 自然语言输入任务
- 询问建议和分析
- 查看AI决策理由

### 3.2 交互设计原则
- **快速输入**：支持快捷键和命令式输入
- **最小打扰**：自动保存，无需手动确认
- **视觉反馈**：拖拽、完成等操作有明确反馈
- **移动适配**：响应式设计，支持移动端使用

## 4. API设计

### 4.1 核心API端点

```typescript
// 项目相关
POST   /api/projects          // 创建项目
GET    /api/projects          // 获取项目列表
PUT    /api/projects/:id      // 更新项目
DELETE /api/projects/:id      // 删除项目

// 任务相关
POST   /api/tasks             // 创建任务
GET    /api/tasks             // 获取任务列表
PUT    /api/tasks/:id         // 更新任务
DELETE /api/tasks/:id         // 删除任务
POST   /api/tasks/batch       // 批量操作

// AI相关
POST   /api/ai/analyze-task   // 分析任务
POST   /api/ai/generate-plan  // 生成日计划
POST   /api/ai/replan         // 重新规划
GET    /api/ai/insights       // 获取洞察

// 用户设置
GET    /api/settings          // 获取设置
PUT    /api/settings          // 更新设置
```

### 4.2 AI提示词模板

#### 任务分析提示词
```
你是一个专业的任务管理助手。用户输入了一个任务描述："{userInput}"

当前项目背景：
{projectsContext}

请分析这个任务并返回：
1. 清晰的任务标题
2. 预估所需时间（小时）
3. 建议的优先级（urgent/high/medium/low）
4. 可能关联的项目
5. 建议的标签

以JSON格式返回结果。
```

#### 日程规划提示词
```
作为一个时间管理专家，请为用户生成今日工作计划。

用户信息：
- 可用工作时间：{availableHours}小时
- 工作风格：{workStyle}
- 期望深度工作块：{focusBlocks}个

待安排任务：
{tasksJson}

请生成一个合理的日程安排，考虑：
1. 高优先级任务优先
2. 相似任务批量处理
3. 合理的休息时间
4. 任务依赖关系

返回详细的时间安排和理由。
```

## 5. 数据模型设计

### 5.1 数据库架构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE,
  priority VARCHAR(20),
  status VARCHAR(20),
  weekly_goals JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20),
  estimated_hours DECIMAL(4,2),
  actual_hours DECIMAL(4,2),
  deadline DATE,
  status VARCHAR(20),
  tags TEXT[],
  dependencies UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- AI交互记录表
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'task_analysis', 'plan_generation', etc.
  request JSONB,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 任务执行记录表
CREATE TABLE task_logs (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50), -- 'started', 'paused', 'completed', etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 6. 实现优先级

### Phase 1：核心功能（2周）
1. 基础项目和任务CRUD
2. 简单的任务池界面
3. 手动拖拽安排任务到日历

### Phase 2：AI集成（2周）
1. 接入GPT API （用gpt 4o mini）
	apikey：[在.env.local中配置]
2. 实现任务自然语言解析
3. 基础的每日计划生成

### Phase 3：智能优化（2周）
1. 任务完成反馈机制
2. 动态重规划功能
3. 个人工作模式学习

### Phase 4：数据分析（1周）
1. 效率统计仪表板
2. 项目健康度分析
3. 个性化建议生成

