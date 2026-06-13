@echo off
echo ========================================
echo 影视聚合网站 - 启动脚本
echo ========================================
echo.

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo Node.js环境正常

echo.
echo [2/3] 安装依赖...
call npm install
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [3/3] 启动项目...
echo.
echo 项目启动后请访问: http://localhost:3000
echo 管理后台地址: http://localhost:3000/admin
echo 默认管理员账号: admin / admin123
echo.
echo 按 Ctrl+C 停止项目
echo ========================================
echo.

call npm run dev