# 🚀 TodoList跨设备部署指南

## 第一步：设置Supabase (5分钟)

### 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project" 
3. 登录GitHub账号
4. 点击 "New project"
5. 选择组织，输入项目名称 (如: `ai-todolist`)
6. 输入数据库密码（记住这个密码！）
7. 选择地区（建议选择离你最近的）
8. 点击 "Create new project"

### 2. 获取API密钥
项目创建完成后：
1. 进入项目Dashboard
2. 点击左侧 "Settings" → "API"  
3. 复制以下信息：
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. 初始化数据库
1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴 `supabase-setup.sql` 文件的全部内容
4. 点击 "Run" 执行

## 第二步：配置环境变量 (2分钟)

在项目根目录创建 `.env.local` 文件，添加：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key

# OpenAI配置 (保持不变)
OPENAI_API_KEY=你的OpenAI key
```

## 第三步：部署到Vercel (5分钟)

### 1. 推送代码到GitHub
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### 2. 部署到Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 登录GitHub账号
3. 点击 "New Project"
4. 导入你的GitHub仓库
5. 在环境变量中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `OPENAI_API_KEY`
6. 点击 "Deploy"

### 3. 获取部署URL
部署完成后，Vercel会提供一个URL，如：
`https://your-app-name.vercel.app`

## 第四步：测试跨设备访问 (3分钟)

1. 在电脑上访问部署URL
2. 添加一些任务和项目
3. 在手机上访问相同URL
4. 检查数据是否同步显示

## 🎉 完成！

现在你的TodoList应用已经支持：
✅ 跨设备同步
✅ 数据持久化存储
✅ 全球CDN加速访问
✅ 自动备份

## 📱 访问方式

- **电脑**: 通过浏览器访问 Vercel URL
- **手机**: 通过浏览器访问 Vercel URL  
- **平板**: 通过浏览器访问 Vercel URL
- **其他设备**: 任何有浏览器的设备都可以访问

## 🔧 注意事项

1. **数据隔离**: 每个设备会自动生成唯一ID，数据不会混乱
2. **实时同步**: 数据会自动同步，无需手动刷新
3. **离线支持**: 虽然数据存储在云端，但界面仍可离线使用
4. **成本**: Supabase和Vercel都有免费额度，个人使用完全够用

## 🚨 如遇问题

1. **部署失败**: 检查环境变量是否正确配置
2. **数据不同步**: 检查Supabase连接是否正常
3. **访问被拒绝**: 检查RLS策略是否正确设置