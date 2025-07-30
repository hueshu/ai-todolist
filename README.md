# AI 智能任务管理系统

基于 Next.js 的智能任务管理系统，支持 OpenAI GPT 和 Anthropic Claude，帮助自由职业者高效管理项目和任务。

## 功能特点

- 📝 快速添加任务到任务池
- 🤖 AI 自动分析任务属性（支持 OpenAI GPT 和 Claude）
- 📅 智能生成每日工作计划
- 📊 任务进度可视化
- ⚡ 实时任务状态更新
- 🎯 严格执行要求支持
- 🔄 多 AI 模型切换

## 本地运行

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 导入 GitHub 仓库
4. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`（如果使用 OpenAI）
   - `ANTHROPIC_API_KEY`（如果使用 Claude）
5. 点击部署

## 部署到 VPS

```bash
# 构建项目
npm run build

# 使用 PM2 运行
pm2 start npm --name "todo-app" -- start
```

## 环境变量

创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI 配置（至少配置一个）
# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o  # 可选，默认 gpt-4o

# Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-opus-20240229  # 可选，默认 claude-3-opus
```

### AI 模型支持

- **OpenAI GPT**: 支持 GPT-4、GPT-3.5 等模型
- **Anthropic Claude**: 支持 Claude 3 Opus、Sonnet、Haiku 等模型

在应用中可以随时切换使用不同的 AI 模型。

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Zustand (状态管理)
