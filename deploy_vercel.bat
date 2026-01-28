@echo off
echo 🚀 Vercel 배포 시작...

echo.
echo 📦 의존성 설치 중...
call npm install

echo.
echo 🔧 프로젝트 빌드 중...
call npm run build

echo.
echo 🌐 Vercel에 배포 중...
call npx vercel --prod

echo.
echo ✅ 배포 완료!
echo.
echo 📋 다음 단계:
echo 1. Vercel 대시보드에서 환경 변수 설정:
echo    - GEMINI_API_KEY = AIzaSyDsDYnMtzsBZwD1zosmbSLQopT2NsO_J5M
echo.
echo 2. 배포된 URL에서 테스트:
echo    - 메인 페이지: https://your-app.vercel.app
echo    - API 헬스체크: https://your-app.vercel.app/api/health
echo.
pause










