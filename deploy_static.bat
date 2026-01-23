@echo off
chcp 65001 > nul
echo 🌐 정적 사이트로 Firebase 배포
echo.

echo 📝 Next.js 설정을 정적 배포용으로 변경 중...

REM next.config.js를 정적 배포용으로 수정
echo /** @type {import('next').NextConfig} */ > next.config.js.tmp
echo const nextConfig = { >> next.config.js.tmp
echo   output: 'export', >> next.config.js.tmp
echo   trailingSlash: true, >> next.config.js.tmp
echo   images: { >> next.config.js.tmp
echo     unoptimized: true >> next.config.js.tmp
echo   } >> next.config.js.tmp
echo } >> next.config.js.tmp
echo. >> next.config.js.tmp
echo module.exports = nextConfig >> next.config.js.tmp

move next.config.js.tmp next.config.js

REM firebase.json을 정적 호스팅용으로 수정
echo { > firebase.json.tmp
echo   "firestore": { >> firebase.json.tmp
echo     "database": "(default)", >> firebase.json.tmp
echo     "location": "asia-northeast3", >> firebase.json.tmp
echo     "rules": "firestore.rules", >> firebase.json.tmp
echo     "indexes": "firestore.indexes.json" >> firebase.json.tmp
echo   }, >> firebase.json.tmp
echo   "hosting": { >> firebase.json.tmp
echo     "public": "out", >> firebase.json.tmp
echo     "ignore": [ >> firebase.json.tmp
echo       "firebase.json", >> firebase.json.tmp
echo       "**/.*", >> firebase.json.tmp
echo       "**/node_modules/**" >> firebase.json.tmp
echo     ], >> firebase.json.tmp
echo     "rewrites": [ >> firebase.json.tmp
echo       { >> firebase.json.tmp
echo         "source": "**", >> firebase.json.tmp
echo         "destination": "/index.html" >> firebase.json.tmp
echo       } >> firebase.json.tmp
echo     ] >> firebase.json.tmp
echo   }, >> firebase.json.tmp
echo   "storage": { >> firebase.json.tmp
echo     "rules": "storage.rules" >> firebase.json.tmp
echo   } >> firebase.json.tmp
echo } >> firebase.json.tmp

move firebase.json.tmp firebase.json

echo ✅ 설정 변경 완료
echo.

echo 🛠️ Next.js 정적 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 빌드 실패
    pause
    exit /b 1
)

echo.
echo 🚀 Firebase Hosting에 배포 중...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ❌ 배포 실패
    pause
    exit /b 1
)

echo.
echo 🎉 정적 사이트 배포 완료!
echo ⚠️  주의: API 기능(/api/analyze)은 작동하지 않습니다.
echo 💡 완전한 기능을 위해서는 Firebase Functions 활성화가 필요합니다.
echo.
pause



