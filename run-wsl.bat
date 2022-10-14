REM Ensure vmcompute.exe is running
wsl.exe --shutdown
wsl.exe -e true
REM Listen for and Intercept utility vm creation
start Windbgx.exe -pn vmcompute.exe -c "$$<attach.wdbg;g"
REM Ensure WSL Utility VM is not running (hopefully windb starts up fast enough...)
net stop LxssManager
net start LxssManager
echo "Press Enter if the debugger is running"
pause
REM Start WSL
start wsl.exe
echo "Detach debugger from process, check if you have kvm support using kvm-ok command"