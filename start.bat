@echo off
echo 🚚 택배 라우트 분석기 시작 스크립트
echo.

echo 📋 환경 확인 중...
if not exist ".env" (
    echo ❌ .env 파일이 없습니다.
    echo 💡 env.example을 복사하여 .env 파일을 생성하고 API 키를 설정해주세요.
    pause
    exit /b 1
)

echo ✅ 환경 설정 완료

echo.
echo 🐍 Python 백엔드 서버 시작 중...
start "Python Backend" cmd /k "pushd python_backend && python run.py && popd"

echo.
echo ⏳ 백엔드 서버 시작 대기 중... (5초)
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Next.js 프론트엔드 서버 시작 중...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo 🎉 서버 시작 완료!
echo.
echo 📍 프론트엔드: http://localhost:3000
echo 📍 백엔드 API: http://localhost:8000
echo 📍 API 문서: http://localhost:8000/docs
echo.
echo 💡 브라우저에서 http://localhost:3000 에 접속하세요.
echo.
pause
