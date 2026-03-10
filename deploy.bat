@echo off
REM EduSphere Deployment Script for Windows
REM Usage: deploy.bat [local|docker|production]

setlocal enabledelayedexpansion

set DEPLOYMENT_TYPE=%1
if "%DEPLOYMENT_TYPE%"=="" set DEPLOYMENT_TYPE=local

echo 🚀 Deploying EduSphere (%DEPLOYMENT_TYPE%)...

if "%DEPLOYMENT_TYPE%"=="local" (
    echo 📦 Local Development Setup
    
    REM Install backend dependencies
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    
    REM Install frontend dependencies
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    
    echo.
    echo ✅ Local setup completed!
    echo Backend will run on http://localhost:5000
    echo Frontend will run on http://localhost:3000
    echo.
    echo To start:
    echo   Terminal 1: cd backend && npm run dev
    echo   Terminal 2: cd frontend && npm start
    echo.
    echo Make sure MongoDB is running on localhost:27017
    
) else if "%DEPLOYMENT_TYPE%"=="docker" (
    echo 🐳 Docker Deployment
    
    REM Check if Docker is installed
    docker --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker is not installed. Please install Docker first.
        exit /b 1
    )
    
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed. Please install Docker Compose first.
        exit /b 1
    )
    
    REM Build and start containers
    echo Building Docker images...
    docker-compose build
    
    echo Starting containers...
    docker-compose up -d
    
    echo.
    echo ✅ Deployment completed!
    echo Application is running on http://localhost:5000
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop: docker-compose down
    echo To restart: docker-compose restart
    
) else if "%DEPLOYMENT_TYPE%"=="production" (
    echo 🌐 Production Build
    
    REM Check if Node.js is installed
    node --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Node.js is not installed. Please install Node.js first.
        exit /b 1
    )
    
    REM Run build script
    echo Building for production...
    node build.js
    
    echo.
    echo ✅ Production build completed!
    echo Production files are in .\production directory
    echo.
    echo Next steps:
    echo 1. Copy .\production to your server
    echo 2. Configure .env file with production settings
    echo 3. Run: start.bat (or npm install && npm start)
    echo 4. Set up reverse proxy (nginx/apache)
    echo 5. Configure SSL certificate
    
) else (
    echo ❌ Invalid deployment type: %DEPLOYMENT_TYPE%
    echo Usage: deploy.bat [local|docker|production]
    echo.
    echo Options:
    echo   local     - Set up for local development
    echo   docker    - Deploy with Docker containers
    echo   production - Build for production deployment
    exit /b 1
)

echo.
echo 🎉 EduSphere deployment setup completed!
pause
