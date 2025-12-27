@echo off
REM Quick test script for SBERT service on Windows

echo.
echo ========================================
echo  SBERT Grading Service Quick Test
echo ========================================
echo.

echo Checking if SBERT service is running...
curl -s http://localhost:5002/health >nul 2>&1

if %errorlevel% neq 0 (
    echo [ERROR] SBERT service is not running!
    echo.
    echo Please start the service first:
    echo   1. Using Docker: docker-compose up -d sbert-service
    echo   2. Using Python: cd sbert-service ^&^& python app.py
    echo.
    pause
    exit /b 1
)

echo [OK] SBERT service is running!
echo.

echo Testing health endpoint...
curl -s http://localhost:5002/health
echo.
echo.

echo Testing exact match grading...
curl -s -X POST http://localhost:5002/grade ^
  -H "Content-Type: application/json" ^
  -d "{\"questionText\":\"What is the capital of France?\",\"studentAnswer\":\"Paris\",\"correctAnswer\":\"Paris\",\"threshold\":0.85}"
echo.
echo.

echo Testing semantic similarity...
curl -s -X POST http://localhost:5002/grade ^
  -H "Content-Type: application/json" ^
  -d "{\"questionText\":\"What is photosynthesis?\",\"studentAnswer\":\"process where plants make food from sunlight\",\"correctAnswer\":\"process by which plants convert light energy into chemical energy\",\"threshold\":0.70}"
echo.
echo.

echo Testing medical terminology...
curl -s -X POST http://localhost:5002/grade ^
  -H "Content-Type: application/json" ^
  -d "{\"questionText\":\"What is ECG?\",\"studentAnswer\":\"electrical signal generated from the heart\",\"correctAnswer\":\"electrocardiogram\",\"threshold\":0.70}"
echo.
echo.

echo ========================================
echo  Tests Complete!
echo ========================================
echo.
echo If you see JSON responses above with
echo 'isCorrect' and 'similarityScore' fields,
echo then SBERT is working correctly!
echo.

pause
