#!/bin/bash

# EduSphere Deployment Script
# Usage: ./deploy.sh [local|docker|production]

set -e

DEPLOYMENT_TYPE=${1:-local}
PROJECT_NAME="edusphere"

echo "🚀 Deploying EduSphere ($DEPLOYMENT_TYPE)..."

case $DEPLOYMENT_TYPE in
    "local")
        echo "📦 Local Development Setup"
        
        # Install backend dependencies
        echo "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        
        # Install frontend dependencies
        echo "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        
        # Start services
        echo "Starting services..."
        echo "Backend will run on http://localhost:5000"
        echo "Frontend will run on http://localhost:3000"
        echo ""
        echo "To start:"
        echo "  Terminal 1: cd backend && npm run dev"
        echo "  Terminal 2: cd frontend && npm start"
        echo ""
        echo "Make sure MongoDB is running on localhost:27017"
        ;;
        
    "docker")
        echo "🐳 Docker Deployment"
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        fi
        
        # Build and start containers
        echo "Building Docker images..."
        docker-compose build
        
        echo "Starting containers..."
        docker-compose up -d
        
        echo "✅ Deployment completed!"
        echo "Application is running on http://localhost:5000"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        echo "To restart: docker-compose restart"
        ;;
        
    "production")
        echo "🌐 Production Build"
        
        # Check if Node.js is installed
        if ! command -v node &> /dev/null; then
            echo "❌ Node.js is not installed. Please install Node.js first."
            exit 1
        fi
        
        # Run build script
        echo "Building for production..."
        node build.js
        
        echo "✅ Production build completed!"
        echo "Production files are in ./production directory"
        echo ""
        echo "Next steps:"
        echo "1. Copy ./production to your server"
        echo "2. Configure .env file with production settings"
        echo "3. Run: ./start.sh (or npm install && npm start)"
        echo "4. Set up reverse proxy (nginx/apache)"
        echo "5. Configure SSL certificate"
        ;;
        
    *)
        echo "❌ Invalid deployment type: $DEPLOYMENT_TYPE"
        echo "Usage: ./deploy.sh [local|docker|production]"
        echo ""
        echo "Options:"
        echo "  local     - Set up for local development"
        echo "  docker    - Deploy with Docker containers"
        echo "  production - Build for production deployment"
        exit 1
        ;;
esac

echo "🎉 EduSphere deployment setup completed!"
