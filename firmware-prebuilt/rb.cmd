@echo off
setlocal
set "HERE=%~dp0"
set "EXE=%HERE%rbdev\windows\rbdev.exe"
if not exist "%EXE%" (
  echo missing %EXE% - ask instructor or rebuild rbdev 1>&2
  exit /b 1
)
"%EXE%" %*
exit /b %ERRORLEVEL%
