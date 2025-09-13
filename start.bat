@echo off
echo 🚀 Starting E-Commerce Admin Panel...

echo 📦 Installing backend dependencies...
cd backend
call npm install

echo 🎨 Installing frontend dependencies...
cd ..\frontend
call npm install

echo 🗄️ Setting up database...
cd ..\backend

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file...
    echo USE_SQLITE=true > .env
    echo JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production >> .env
    echo JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-change-this-in-production >> .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
)

echo 🔥 Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo ⚡ Starting frontend development server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Setup complete!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000
echo 📚 API Documentation: http://localhost:5000/api/docs
echo.
echo 📖 For detailed setup instructions, see DATABASE_SETUP.md
echo 📊 For project status and features, see PROJECT_STATUS.md

pause