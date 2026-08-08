@echo off
chcp 65001 >nul
set "DIR=%~dp0"
set "DIRF=%DIR:\=/%"
set "URL=file:///%DIRF%standalone.html"
start "" chrome --app="%URL%" --new-window 2>nul
if errorlevel 1 (
  start "" msedge --app="%URL%" --new-window 2>nul
  if errorlevel 1 (
    echo 没有找到 Chrome 或 Edge，请先安装浏览器后重试。
    pause
  )
)
