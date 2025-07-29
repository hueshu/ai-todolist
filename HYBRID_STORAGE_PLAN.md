# 混合存储方案

## 设计思路
localStorage + 云端数据库 + 自动同步

## 优点
✅ 离线可用
✅ 云端备份  
✅ 多设备同步
✅ 渐进式升级

## 实现步骤

### 1. 修改Store结构
```typescript
interface AppState {
  // 现有状态...
  
  // 新增同步状态
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  hasUnsyncedChanges: boolean;
  
  // 同步方法
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  markAsChanged: () => void;
}
```

### 2. 自动同步策略
```typescript
// 数据变更时标记
const addTask = (task: Task) => {
  set((state) => ({ 
    tasks: [...state.tasks, task],
    hasUnsyncedChanges: true 
  }));
  
  // 延迟同步（防抖）
  debounceSync();
};

// 定期同步
setInterval(() => {
  if (navigator.onLine && hasUnsyncedChanges) {
    syncToCloud();
  }
}, 30000); // 30秒检查一次
```

### 3. 冲突解决
```typescript
const resolveConflicts = (local: Task[], remote: Task[]) => {
  // 策略1：最后修改时间优先
  // 策略2：用户手动选择
  // 策略3：合并不冲突的更改
};
```