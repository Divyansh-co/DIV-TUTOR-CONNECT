#!/bin/bash
# ========================================================
# TutorConnect - GitHub Repository Setup & Push Helper
# Author: Divyansh Mishra
# ========================================================

set -e

echo ""
echo "========================================================"
echo "  TutorConnect - Git & GitHub Deployment Assistant"
echo "========================================================"
echo ""

cd "$(dirname "$0")"

if ! command -v git &> /dev/null; then
    echo "[ERROR] Git is not installed. Please install Git first."
    exit 1
fi

if [ ! -d ".git" ]; then
    git init
    git branch -M main
    echo "Initialized git repository on branch 'main'."
else
    echo "Git repository already initialized."
fi

git add .

read -p "Enter commit message (Press Enter for default: 'Initial commit: TutorConnect Full-Stack Marketplace'): " commit_msg
commit_msg=${commit_msg:-"Initial commit: TutorConnect Full-Stack Marketplace"}

git commit -m "$commit_msg"

echo ""
read -p "Enter GitHub Repository URL (or press Enter to skip): " remote_url

if [ -n "$remote_url" ]; then
    git remote remove origin 2>/dev/null || true
    git remote add origin "$remote_url"
    echo "Pushing to $remote_url..."
    git push -u origin main
    echo "[SUCCESS] Pushed to GitHub!"
else
    echo "Skipped remote push. You can push manually using:"
    echo "  git remote add origin <URL>"
    echo "  git push -u origin main"
fi
