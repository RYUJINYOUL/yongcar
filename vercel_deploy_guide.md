# 🚀 Vercel 웹 배포 가이드

## CLI 오류 발생 시 웹 배포 방법

### 1단계: GitHub Repository 생성
1. https://github.com 접속
2. "New repository" 클릭
3. Repository name: `yongka-route-analyzer`
4. Public으로 설정
5. "Create repository" 클릭

### 2단계: 코드 업로드
1. 생성된 Repository 페이지에서 "uploading an existing file" 클릭
2. 프로젝트 폴더의 모든 파일을 드래그 앤 드롭
3. Commit message: "Initial commit"
4. "Commit changes" 클릭

### 3단계: Vercel 배포
1. https://vercel.com 접속
2. "Add New" → "Project" 클릭
3. "Import Git Repository" 섹션에서 GitHub 연결
4. `yongka-route-analyzer` Repository 선택
5. "Import" 클릭

### 4단계: 환경 변수 설정
1. 배포 완료 후 Project Dashboard 이동
2. "Settings" 탭 클릭
3. "Environment Variables" 클릭
4. 다음 변수 추가:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyDsDYnMtzsBZwD1zosmbSLQopT2NsO_J5M`
   - Environment: Production
5. "Save" 클릭

### 5단계: 재배포
1. "Deployments" 탭 이동
2. 최신 배포의 "..." 메뉴 클릭
3. "Redeploy" 선택

## 배포 완료 후 테스트
- 메인 페이지: https://your-app.vercel.app
- API 테스트: https://your-app.vercel.app/api/health










