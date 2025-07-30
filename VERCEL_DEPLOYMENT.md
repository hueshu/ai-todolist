# Vercel 部署指南

## 环境变量配置

在 Vercel 项目设置中，需要配置以下环境变量：

### 1. Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 2. OpenAI 配置
```
OPENAI_API_KEY=你的OpenAI API密钥
```

### 3. 可选配置
```
OPENAI_MODEL=gpt-4o  # 可选，默认使用 gpt-4o
```

## 部署步骤

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "部署到 Vercel"
   git push origin main
   ```

2. **在 Vercel 中导入项目**
   - 登录 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 选择 Next.js 框架（会自动检测）

3. **配置环境变量**
   - 在项目设置中，进入 "Environment Variables"
   - 添加上述所有环境变量
   - 注意：`NEXT_PUBLIC_` 开头的变量会暴露给客户端

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

## 注意事项

1. **API 密钥安全**
   - 不要将 API 密钥提交到 Git
   - 使用 Vercel 的环境变量管理

2. **区域选择**
   - 项目已配置为部署到新加坡区域 (sin1)
   - 可在 vercel.json 中修改

3. **构建优化**
   - 确保所有依赖都在 package.json 中声明
   - 检查 TypeScript 类型错误

4. **数据库迁移**
   - 首次部署后，需要在 Supabase 中运行数据库迁移脚本
   - 迁移脚本位于 `/home/hueshu/projects/todolist/supabase/migrations/`

## 常见问题

### 1. 构建失败
- 检查 TypeScript 错误
- 确保所有环境变量都已配置
- 查看 Vercel 构建日志

### 2. API 调用失败
- 确认 OpenAI API 密钥有效
- 检查 API 配额限制
- 查看函数日志

### 3. 数据库连接失败
- 确认 Supabase URL 和密钥正确
- 检查 Supabase 项目是否启用
- 确认数据库表已创建

## 监控和日志

1. **函数日志**
   - Vercel Dashboard > Functions > Logs
   - 可查看 API 路由的执行日志

2. **错误追踪**
   - 使用 Vercel Analytics 监控性能
   - 设置错误告警

## 更新部署

1. **自动部署**
   - 推送到 main 分支会自动触发部署
   
2. **手动部署**
   - 在 Vercel Dashboard 中点击 "Redeploy"

## 环境管理

1. **开发环境**
   - 使用 `.env.local` 文件
   
2. **预览环境**
   - Pull Request 会自动创建预览部署
   
3. **生产环境**
   - main 分支对应生产环境