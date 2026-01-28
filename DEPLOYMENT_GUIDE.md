# 🚀 배포 가이드

## 현재 상황
- ✅ **Frontend**: Firebase Hosting에 배포 완료
- ❌ **Backend**: 아직 로컬에서만 실행 중 (`localhost:8000`)

## 문제점
배포된 사이트에서 `localhost:8000`으로 API 요청을 보내고 있어서 작동하지 않습니다.

## 해결 방법

### 방법 1: Railway 배포 (추천 - 가장 간단)

1. **Railway 계정 생성**
   ```bash
   # Railway CLI 설치
   npm install -g @railway/cli
   
   # 로그인
   railway login
   ```

2. **프로젝트 배포**
   ```bash
   # 프로젝트 루트에서
   railway init
   railway up
   ```

3. **환경 변수 설정**
   - Railway 대시보드에서 `GEMINI_API_KEY` 설정
   - 배포된 URL 확인 (예: `https://your-app.railway.app`)

4. **Frontend 환경 변수 업데이트**
   ```bash
   # .env 파일에 추가
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```

5. **Frontend 재배포**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### 방법 2: Vercel 배포

1. **Vercel 계정으로 배포**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **환경 변수 설정**
   - Vercel 대시보드에서 `GEMINI_API_KEY` 설정

### 방법 3: Render 배포

1. **Render.com에서 Web Service 생성**
   - Repository 연결
   - Build Command: `cd python_backend && pip install -r requirements.txt`
   - Start Command: `cd python_backend && python run.py`

## 배포 후 확인사항

1. **백엔드 헬스체크**
   ```
   https://your-backend-url.com/health
   ```

2. **API 테스트**
   ```
   https://your-backend-url.com/analyze
   ```

3. **Frontend에서 API 연결 확인**
   - 이미지 업로드 및 분석 테스트

## 현재 UI 개선사항 ✅

- ✅ 검정 테마로 변경
- ✅ 용카 로고 추가
- ✅ 사이트명 변경: "용카 - 택배 라우트 AI분석"
- ✅ 모든 컴포넌트 다크 테마 적용

## 다음 단계

1. 위 방법 중 하나로 Python 백엔드 배포
2. 환경 변수 설정
3. Frontend 재배포
4. 전체 기능 테스트










