# 🚀 빠른 설치 가이드

## ⚠️ PowerShell 문제 해결

현재 PowerShell에서 인코딩 문제가 발생하고 있습니다. 다음 방법 중 하나를 선택해서 설치해주세요:

## 방법 1: Command Prompt 사용 (권장)

1. **Windows 키 + R** 누르기
2. **cmd** 입력하고 Enter
3. 프로젝트 폴더로 이동:
   ```cmd
   cd "C:\Users\Administrator\Desktop\라우트분석"
   ```
4. 설치 스크립트 실행:
   ```cmd
   install_dependencies.bat
   ```

## 방법 2: 파일 탐색기에서 직접 실행

1. **파일 탐색기**에서 `C:\Users\Administrator\Desktop\라우트분석` 폴더 열기
2. **install_dependencies.bat** 파일을 **더블클릭**
3. 설치가 자동으로 진행됩니다

## 방법 3: 수동 설치 (Command Prompt)

Command Prompt에서 다음 명령어들을 하나씩 실행:

```cmd
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install google-generativeai==0.8.3
pip install Pillow==10.1.0
pip install python-multipart==0.0.6
pip install pydantic==2.5.0
pip install python-dotenv==1.0.0
```

## 설치 확인

설치가 완료되면:
```cmd
python check_dependencies.py
```

## 서버 실행

설치 완료 후:
```cmd
start.bat
```

또는 수동으로:
```cmd
# 터미널 1: Python 백엔드
cd python_backend
python run.py

# 터미널 2: Next.js (이미 실행 중)
# http://localhost:3000 접속
```

## 📍 접속 주소

- **메인 앱**: http://localhost:3000
- **API 문서**: http://localhost:8000/docs

---

**💡 팁**: PowerShell 대신 Command Prompt (cmd)를 사용하면 문제없이 설치됩니다!








