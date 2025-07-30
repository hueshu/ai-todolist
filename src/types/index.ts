export interface Industry {
  id: string;
  name: string;
  description?: string;
  color: string; // 行业主题色
  icon: string; // 行业图标名称
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number; // 0-100
}

export interface Project {
  id: string;
  name: string;
  description: string;
  industryId?: string; // 所属行业ID
  duration: number; // 项目周期（天数）
  priority: 'small-earning' | 'small-potential' | 'small-hobby' | 'earning' | 'working-on-earning'; // 保留用于兼容
  projectSize?: 'small' | 'medium' | 'large'; // 项目大小
  profitStatus?: 'earning' | 'trying' | 'hobby'; // 是否赚钱
  difficulty?: 'easy' | 'normal' | 'hard'; // 难易度
  status: 'active' | 'completed' | 'archived';
  displayOrder?: number; // 显示顺序，用于自定义排序
  weeklyGoals: string[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours?: number;
  deadline?: Date;
  scheduledStartTime?: Date; // 计划开始时间
  timeSlot?: string; // 时间段信息，格式: "HH:mm-HH:mm"
  status: 'pool' | 'scheduled' | 'in-progress' | 'completed';
  tags: string[];
  dependencies?: string[];
  taskType: 'single' | 'daily' | 'weekly' | 'monthly'; // 任务类型：单次/每日/每周/每月
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskAnalysisRequest {
  task: string;
  context?: {
    currentProjects: Project[];
    recentTasks: Task[];
  };
}

export interface TaskAnalysisResponse {
  parsedTask: {
    title: string;
    estimatedHours: number;
    suggestedPriority: string;
    suggestedProject?: string;
    suggestedTags: string[];
  };
  reasoning: string;
}

export interface DailyPlanRequest {
  date: Date;
  startTime?: Date; // 计划开始时间
  startTimeString?: string; // 开始时间字符串，格式: "HH:mm"
  workEndTime?: string; // 停止工作时间，格式: "HH:mm"
  availableHours: number;
  existingTasks: (Task & { project?: Partial<Project> | null })[]; // 包含项目信息的任务
  projects: Project[]; // 所有项目信息
  fixedEvents: FixedEvent[]; // 固定事件
  taskFrequencyStats: { // 任务频次统计
    daily: number;
    weekly: number;
    monthly: number;
    single: number;
  };
  preferences: {
    workStyle: 'morning-person' | 'night-owl' | 'balanced';
    focusBlocks: number;
    breakFrequency: number;
  };
  userPreferences?: string; // 用户自定义偏好描述
  strictRequirements?: string; // 严格执行要求
}

export interface DailyPlanResponse {
  schedule: {
    timeSlot: string;
    task: Task;
    type: 'focus' | 'regular' | 'break';
    reason: string;
  }[];
  suggestions: string[];
  estimatedProductivity: number;
  projectAnalysis?: {
    highValueProjects: string;
    timeAllocation: string;
    riskWarning: string;
  };
}

export interface TaskCompletionFeedback {
  taskId: string;
  actualHours: number;
  completionQuality: 'excellent' | 'good' | 'rushed';
  blockers?: string[];
  notes?: string;
}

// 固定事件接口
export interface FixedEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // 格式: "HH:mm"
  endTime: string;   // 格式: "HH:mm"
  daysOfWeek: number[]; // 0-6, 0=周日, 1=周一, ..., 6=周六
  category: 'meal' | 'break' | 'exercise' | 'commute' | 'meeting' | 'personal' | 'other';
  color: string; // 颜色标识
  isActive: boolean; // 是否启用
  createdAt: Date;
  updatedAt: Date;
}