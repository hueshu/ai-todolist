#!/bin/bash
# Git仓库初始化脚本

echo "🔧 初始化Git仓库..."

# 检查是否已经是Git仓库
if [ -d ".git" ]; then
    echo "✅ 已经是Git仓库"
else
    echo "📝 初始化新的Git仓库"
    git init
fi

# 添加所有文件
echo "📂 添加所有文件到Git..."
git add .

# 检查是否有初始提交
if git log --oneline -1 2>/dev/null; then
    echo "✅ 已有提交历史"
else
    echo "📝 创建初始提交..."
    git commit -m "Initial commit: AI TodoList with Supabase integration"
fi

# 检查是否有远程仓库
if git remote get-url origin 2>/dev/null; then
    echo "✅ 已配置远程仓库"
    git remote -v
else
    echo "⚠️  需要配置GitHub远程仓库"
    echo "请按以下步骤操作："
    echo "1. 在GitHub上创建新仓库: https://github.com/new"
    echo "2. 复制仓库URL"
    echo "3. 运行: git remote add origin [你的仓库URL]"
    echo "4. 运行: git push -u origin main"
fi

echo "🎉 Git配置完成！"