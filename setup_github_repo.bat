@echo off
REM ========================================================
REM TutorConnect - GitHub Repository Setup & Push Helper
REM Author: Divyansh Mishra
REM ========================================================

echo.
echo ========================================================
echo   TutorConnect - Git & GitHub Deployment Assistant
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [2/4] Initializing Git repository...
if not exist ".git" (
    git init
    git branch -M main
    echo Repository initialized with default branch 'main'.
) else (
    echo Git repository already initialized.
)

echo.
echo [3/4] Staging all files...
git add .

echo.
set /p commit_msg="Enter commit message (Press Enter for default: 'Initial commit: TutorConnect Full-Stack Marketplace'): "
if "%commit_msg%"=="" set commit_msg=Initial commit: TutorConnect Full-Stack Marketplace

git commit -m "%commit_msg%"

echo.
echo [4/4] Configure GitHub Remote:
echo If you have already created a repository on GitHub (e.g. https://github.com/Divyansh-co/TutorConnect.git),
echo enter the remote URL below, or press Enter to skip.
echo.
set /p remote_url="GitHub Repository URL: "

if not "%remote_url%"=="" (
    git remote remove origin >nul 2>&1
    git remote add origin %remote_url%
    echo Pushing to GitHub...
    git push -u origin main
    echo.
    echo [SUCCESS] Code successfully pushed to GitHub!
) else (
    echo.
    echo Remote configuration skipped.
    echo When ready, run:
    echo   git remote add origin https://github.com/your-username/TutorConnect.git
    echo   git push -u origin main
)

echo.
echo ========================================================
echo   Done! TutorConnect is ready for GitHub & deployment.
echo ========================================================
echo.
pause
