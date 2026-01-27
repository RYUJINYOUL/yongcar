@echo off
chcp 65001 > nul
echo 🚀 택배 라우트 분석기 Python 패키지 설치
echo.

echo [1/7] FastAPI 설치 중...
pip install fastapi==0.104.1
echo.

echo [2/7] Uvicorn 설치 중...
pip install "uvicorn[standard]==0.24.0"
echo.

echo [3/7] Google Generative AI 설치 중...
pip install google-generativeai==0.8.3
echo.

echo [4/7] Pillow 설치 중...
pip install Pillow==10.1.0
echo.

echo [5/7] Python Multipart 설치 중...
pip install python-multipart==0.0.6
echo.

echo [6/7] Pydantic 설치 중...
pip install pydantic==2.5.0
echo.

echo [7/7] Python Dotenv 설치 중...
pip install python-dotenv==1.0.0
echo.

echo ✅ 설치 완료!
echo.
echo 📋 설치 확인:
python check_dependencies.py
echo.
echo 💡 이제 start.bat을 실행하여 서버를 시작할 수 있습니다.
pause








