#!/bin/bash

# E-Commerce Admin Panel - Quick Start Script

echo "🚀 Starting E-Commerce Admin Panel..."

# Check if we're on Windows (PowerShell/CMD) or Unix (bash)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "📦 Installing backend dependencies..."
    cd backend && npm install
    
    echo "🎨 Installing frontend dependencies..."
    cd ../frontend && npm install
    
    echo "🗄️ Setting up database..."
    cd ../backend
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cp .env.example .env 2>/dev/null || echo "USE_SQLITE=true" > .env
    fi
    
    echo "🔥 Starting backend server..."
    start cmd /k "npm run dev"
    
    echo "⚡ Starting frontend development server..."
    cd ../frontend
    start cmd /k "npm run dev"
    
else
    # Unix/Linux/macOS
    echo "📦 Installing backend dependencies..."
    cd backend && npm install
    
    echo "🎨 Installing frontend dependencies..."
    cd ../frontend && npm install
    
    echo "🗄️ Setting up database..."
    cd ../backend
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cp .env.example .env 2>/dev/null || echo "USE_SQLITE=true" > .env
    fi
    
    echo "🔥 Starting backend server..."
    gnome-terminal -- npm run dev 2>/dev/null || open -a Terminal npm run dev 2>/dev/null || npm run dev &
    
    echo "⚡ Starting frontend development server..."
    cd ../frontend
    gnome-terminal -- npm run dev 2>/dev/null || open -a Terminal npm run dev 2>/dev/null || npm run dev &
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/api/docs"
echo ""
echo "📖 For detailed setup instructions, see DATABASE_SETUP.md"
echo "📊 For project status and features, see PROJECT_STATUS.md"