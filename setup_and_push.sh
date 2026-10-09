#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Setting up Campus 3D Repository"
echo "=========================================="

cd "$(dirname "$0")"

# 1. Remove old git tracking & submodules
echo "🧹 Cleaning old git configuration..."
rm -rf .git
rm -f .gitmodules
rm -rf web-platform/.git

# 2. Initialize fresh git repository
echo "📦 Initializing fresh Git repository..."
git init
git branch -M main

# 3. Add origin remote
echo "🔗 Adding remote: https://github.com/Chinmayjoshi2005/campus-3d.git"
git remote add origin https://github.com/Chinmayjoshi2005/campus-3d.git

# 4. Add all project files (web-platform, UnityWebGL, data, docs, etc.)
echo "➕ Staging all project files..."
git add .

# 5. Commit
echo "💾 Committing files..."
git commit -m "Initial commit: Complete Campus Guide 3D with Unity WebGL & Next.js"

# 6. Push to GitHub
echo "⬆️ Pushing to GitHub (main branch)..."
git push -u origin main --force

echo ""
echo "=========================================="
echo "✅ SUCCESS! Entire project is live on:"
echo "👉 https://github.com/Chinmayjoshi2005/campus-3d"
echo "=========================================="
