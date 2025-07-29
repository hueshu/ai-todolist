# AI 智能任务管理系统

基于 Next.js 和 OpenAI 的智能任务管理系统，帮助自由职业者高效管理项目和任务。

## 功能特点

- 📝 快速添加任务到任务池
- 🤖 AI 自动分析任务属性
- 📅 智能生成每日工作计划
- 📊 任务进度可视化
- ⚡ 实时任务状态更新

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
4. 添加环境变量 `OPENAI_API_KEY`
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

```
OPENAI_API_KEY=your-api-key-here
```

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Zustand (状态管理)