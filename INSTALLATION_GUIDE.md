# 🚀 택배 라우트 분석기 설치 가이드

## 📋 현재 설치 상태

### ✅ Next.js 프론트엔드 (완료)
- **상태**: 설치 완료 및 실행 중
- **포트**: http://localhost:3000
- **설치된 패키지**:
  - Next.js 14.0.4
  - React 18.3.1
  - TypeScript 5.9.3
  - Tailwind CSS 3.4.19
  - 기타 개발 도구들 (300개 패키지)

### ⏳ Python 백엔드 (설치 필요)
- **상태**: 설치 필요
- **필요한 패키지**:
  - FastAPI 0.104.1
  - Uvicorn 0.24.0
  - Google Generative AI 0.8.3
  - Pillow 10.1.0
  - Python Multipart 0.0.6
  - Pydantic 2.5.0
  - Python Dotenv 1.0.0

## 🛠️ 설치 방법

### 방법 1: 자동 설치 스크립트 (권장)

**Windows:**
```cmd
install_dependencies.bat
```

**Linux/Mac:**
```bash
chmod +x install_dependencies.sh
./install_dependencies.sh
```

### 방법 2: 수동 설치

**Python 패키지 설치:**
```bash
pip install fastapi==0.104.1
pip install "uvicorn[standard]==0.24.0"
pip install google-generativeai==0.8.3
pip install Pillow==10.1.0
pip install python-multipart==0.0.6
pip install pydantic==2.5.0
pip install python-dotenv==1.0.0
```

**또는 requirements.txt 사용:**
```bash
cd python_backend
pip install -r requirements.txt
```

### 방법 3: 의존성 확인

설치 상태를 확인하려면:
```bash
python check_dependencies.py
```

## 🚀 서버 실행

### 자동 실행 (권장)

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
./start.sh
```

### 수동 실행

**1. Python 백엔드 서버 (터미널 1):**
```bash
cd python_backend
python run.py
```

**2. Next.js 프론트엔드 서버 (터미널 2):**
```bash
npm run dev
```

## 📍 접속 주소

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **헬스 체크**: http://localhost:8000/health

## 🔧 문제 해결

### PowerShell 오류 발생 시
현재 PowerShell에서 인코딩 문제가 발생하고 있습니다. 다음 방법을 시도해보세요:

1. **Command Prompt 사용**: PowerShell 대신 cmd 사용
2. **배치 파일 실행**: `install_dependencies.bat` 더블클릭
3. **수동 설치**: 위의 수동 설치 방법 사용

### Python 패키지 설치 오류 시
```bash
# pip 업그레이드
python -m pip install --upgrade pip

# 가상환경 사용 (권장)
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 패키지 설치
pip install -r python_backend/requirements.txt
```

### Node.js 패키지 설치 오류 시
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## ⚠️ 주의사항

1. **API 키**: Gemini API 키가 코드에 직접 설정되어 있습니다
2. **포트 충돌**: 3000번, 8000번 포트가 사용 중이지 않은지 확인
3. **Python 버전**: Python 3.8 이상 권장
4. **Node.js 버전**: Node.js 18 이상 권장

## 📞 도움이 필요하시면

1. `check_dependencies.py` 실행하여 설치 상태 확인
2. 오류 메시지와 함께 문의
3. 시스템 환경 정보 제공 (OS, Python/Node.js 버전)

---

**현재 상태**: Next.js는 실행 중, Python 백엔드 설치 필요











