@echo off
cd extension
if not exist node_modules npm install
npm run build
pause
