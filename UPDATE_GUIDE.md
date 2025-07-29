# 📱 代码更新到线上指南

## 🚀 快速更新 (30秒)

### 方法1：使用部署脚本 (推荐)
```bash
./deploy.sh
```
就这么简单！脚本会自动处理一切。

### 方法2：手动命令
```bash
git add .
git commit -m "你的更新描述"
git push origin main
```

## 📊 完整更新流程

### 第一步：本地测试
```bash
# 确保代码在本地运行正常
npm run dev

# 检查构建是否成功
npm run build
```

### 第二步：提交代码
```bash
# 查看修改了哪些文件
git status

# 添加所有更改
git add .

# 提交更改 (写清楚改了什么)
git commit -m "feat: 新增AI计划生成功能优化"

# 推送到GitHub
git push origin main
```

### 第三步：监控部署
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 查看 "Deployments" 页面
4. 等待状态变成 ✅ "Ready"

### 第四步：验证更新
1. 访问你的线上URL
2. 检查新功能是否正常工作
3. 在不同设备上测试

## 🔄 Vercel自动部署原理

```mermaid
graph LR
    A[本地修改代码] --> B[git push]
    B --> C[GitHub仓库更新]
    C --> D[Vercel检测到更改]
    D --> E[自动构建&部署]
    E --> F[线上版本更新]
```

**时间线：**
- 🕐 0分钟：push代码到GitHub
- 🕐 1分钟：Vercel开始构建
- 🕐 2-3分钟：构建完成，开始部署
- 🕐 3-4分钟：全球CDN更新完成
- ✅ 完成：所有用户看到新版本

## 📋 常用更新场景

### 场景1：修复Bug
```bash
git add .
git commit -m "fix: 修复AI生成计划时的时间计算错误"
git push origin main
```

### 场景2：新增功能
```bash
git add .
git commit -m "feat: 添加任务批量导出功能"
git push origin main
```

### 场景3：样式调整
```bash
git add .
git commit -m "style: 优化移动端界面布局"
git push origin main
```

### 场景4：性能优化
```bash
git add .
git commit -m "perf: 优化数据库查询性能"
git push origin main
```

## 🚨 回滚操作

如果新版本有问题，可以快速回滚：

### 方法1：Vercel Dashboard回滚
1. 登录Vercel Dashboard
2. 进入项目的Deployments页面
3. 找到上一个正常的版本
4. 点击 "..." → "Promote to Production"

### 方法2：Git回滚
```bash
# 查看提交历史
git log --oneline

# 回滚到指定提交
git revert HEAD

# 推送回滚
git push origin main
```

## 📊 部署状态检查

### 检查命令
```bash
# 检查Git状态
git status

# 检查远程分支
git remote -v

# 查看最近提交
git log --oneline -5
```

### Vercel CLI (可选安装)
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 查看部署状态
vercel ls

# 手动部署
vercel --prod
```

## 🎯 最佳实践

### ✅ 推荐做法
- 📝 **清晰的提交信息**：说明改了什么和为什么
- 🧪 **本地测试**：确保代码运行正常再推送
- 📱 **多设备验证**：在手机、电脑上都测试一下
- 🔄 **小步快跑**：频繁小改动比一次大改动更安全

### ❌ 避免做法
- 🚫 不要直接在线上环境测试
- 🚫 不要推送未测试的代码
- 🚫 不要使用无意义的提交信息如 "update"
- 🚫 不要忘记推送重要的环境变量更新

## 📞 需要帮助时

如果遇到问题：
1. 检查Vercel Dashboard的错误日志
2. 确认环境变量是否正确配置
3. 验证Supabase连接是否正常
4. 查看浏览器控制台是否有错误

## 🎉 享受你的跨设备TodoList！

现在你可以：
- 💻 在电脑上添加任务
- 📱 在手机上查看和完成
- ⏰ 使用AI生成智能计划
- 🔄 数据实时同步到所有设备