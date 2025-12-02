@echo off
echo Setting environment variable to fix OpenMP conflict...
setx KMP_DUPLICATE_LIB_OK TRUE
echo.
echo Environment variable set successfully!
echo Please close this window and restart your backend server.
echo.
pause
