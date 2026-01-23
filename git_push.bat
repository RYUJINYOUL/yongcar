@echo off
echo "=== Git 상태 확인 ==="
git status

echo.
echo "=== 새 파일들 추가 ==="
git add .

echo.
echo "=== 커밋 생성 ==="
git commit -m "Fix timeline API and cleanup Python files - Next.js only"

echo.
echo "=== GitHub에 푸시 ==="
git push origin main

echo.
echo "완료!"
pause

