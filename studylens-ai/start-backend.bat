@echo off
cd backend
if not exist node_modules npm install
npm run dev
pause
