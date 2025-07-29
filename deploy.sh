#!/bin/bash
# TodoList 应用部署脚本

echo "🚀 开始部署 TodoList 应用..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    
    # 提示用户输入提交信息
    echo "请输入提交信息 (或按回车使用默认信息):"
    read commit_message
    
    # 如果没有输入，使用默认信息
    if [ -z "$commit_message" ]; then
        commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # 添加所有更改
    git add .
    
    # 提交更改
    git commit -m "$commit_message"
else
    echo "✅ 没有新的更改需要提交"
fi

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 代码已成功推送到GitHub"
    echo "🔄 Vercel将在2-3分钟内自动部署"
    echo "📱 你可以在以下地址查看部署状态："
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "🎉 部署完成后，所有设备都会看到最新版本！"
else
    echo "❌ 推送失败，请检查网络连接或Git配置"
fi