@echo off
REM University Timetable Portal - Quick Start Script for Windows

echo.
echo 🚀 University Timetable Management Portal
echo =========================================
echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo ✅ Installation complete!
echo.
echo 🎬 Starting development server...
echo.
echo 📱 The app will open at http://localhost:5173
echo.
echo 💡 Tips:
echo   - Select a role to view the system
echo   - Check README.md for full documentation
echo   - See PROJECT_COMPLETE.md for what was built
echo.

call npm run dev
pause
