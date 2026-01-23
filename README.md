# 🚚 택배 라우트 분석기

네이버 지도 캡처와 AI를 활용한 택배 라우트 수익성 분석 서비스

## 📋 주요 기능

- **📷 지도 이미지 분석**: 네이버 지도 캡처를 업로드하여 지역 정보 자동 추출
- **☕ 카페 글 분석**: 카페/상점 가격 정보를 통한 지역 경제 수준 분석
- **💰 수익 예상**: AI 기반 월간 택배 수익 예상 계산
- **🗺️ 인터랙티브 지도**: 네이버 지도 API를 통한 실시간 지역 정보 표시
- **📊 상세 분석**: 지역 특성, 경쟁 상황, 접근성 등 종합 분석

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**

### Backend
- **FastAPI** (Python)
- **OpenAI GPT-4 Vision API**
- **Pydantic**
- **Uvicorn**

### APIs
- **Google Gemini 2.0 Flash API** (이미지/텍스트 분석)
- **네이버 지도 API** (지도 표시)

## 🚀 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

**Next.js (이미 완료):**
- ✅ 설치 완료 및 실행 중 (http://localhost:3000)

**Python 백엔드 설치:**

**방법 A: 자동 설치 (권장)**
```cmd
# Command Prompt에서 실행
simple_install.cmd
```

**방법 B: 수동 설치**
```bash
pip install fastapi==0.104.1
pip install "uvicorn[standard]==0.24.0"
pip install google-generativeai==0.8.3
pip install Pillow==10.1.0
pip install python-multipart==0.0.6
pip install pydantic==2.5.0
pip install python-dotenv==1.0.0
```

**⚠️ 주의**: PowerShell에서 인코딩 문제가 있으니 Command Prompt (cmd) 사용 권장

### 2. 환경변수 설정

```bash
# 루트 디렉토리에 .env 파일 생성
cp env.example .env
```

`.env` 파일에 다음 정보를 입력:

```env
# Gemini API 키는 코드에 직접 설정되어 있습니다
# GEMINI_API_KEY=AIzaSyDsDYnMtzsBZwD1zosmbSLQopT2NsO_J5M

# 네이버 지도 API 클라이언트 ID (선택사항)
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id_here
```

### 3. 서버 실행

#### Python 백엔드 서버 실행
```bash
cd python_backend
python run.py
```

#### Next.js 프론트엔드 서버 실행 (새 터미널)
```bash
npm run dev
```

### 4. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 📖 사용 방법

### 1. 네이버 지도 캡처 업로드
- 분석하고 싶은 지역의 네이버 지도를 캡처
- 이미지 업로드 영역에 드래그 앤 드롭 또는 클릭하여 업로드

### 2. 카페 글 정보 입력
- 해당 지역 카페나 상점의 가격 정보가 포함된 글을 복사
- 텍스트 입력 영역에 붙여넣기

### 3. 분석 실행
- "🔍 라우트 분석 시작" 버튼 클릭
- AI가 이미지와 텍스트를 분석하여 결과 제공

### 4. 결과 확인
- **지역 분석**: 인구 밀도, 상권 밀도, 접근성 등
- **수익 예상**: 일일/월간 예상 수익
- **추천 사항**: 배송 최적화 팁
- **인터랙티브 지도**: 주요 지점 표시

## 🎯 분석 항목

### 지역 특성 분석
- **지역 유형**: 주거지역/상업지역/혼합지역
- **인구 밀도**: 배송 수요와 직결되는 인구 분포
- **상권 밀도**: 카페, 상점 등 배송 대상 업체 수
- **교통 접근성**: 배송 효율성에 영향을 미치는 교통 상황

### 수익성 분석
- **기본 수익 모델**: 지역별 평균 배송 단가 기반
- **지역 가중치**: 상업지역, 고소득층 지역 등 프리미엄 적용
- **수요 예측**: 카페 가격대를 통한 지역 경제력 추정
- **경쟁 상황**: 기존 배송업체 포화도 분석

### 추천 시스템
- **최적 배송 시간대**: 지역 특성에 맞는 배송 스케줄
- **특화 서비스**: 음료 배송, 프리미엄 배송 등
- **시장 진입 전략**: 경쟁 상황에 따른 차별화 방안

## 🔧 API 엔드포인트

### POST /api/analyze
택배 라우트 분석 요청

**Request:**
```typescript
FormData {
  mapImage: File,    // 네이버 지도 캡처 이미지
  cafeText: string   // 카페 글 텍스트
}
```

**Response:**
```typescript
{
  location: {
    name: string,
    address: string,
    coordinates: { lat: number, lng: number }
  },
  analysis: {
    areaType: string,
    population: string,
    businessDensity: string,
    accessibility: string,
    competition: string
  },
  revenue: {
    dailyEstimate: number,
    monthlyEstimate: number,
    factors: string[]
  },
  recommendations: string[],
  markers: Array<{
    lat: number,
    lng: number,
    title: string,
    type: string
  }>
}
```

## 🔒 보안 고려사항

- 업로드된 이미지는 분석 후 자동 삭제
- API 키는 환경변수로 관리
- CORS 설정으로 허용된 도메인만 접근 가능
- 파일 크기 제한 (10MB)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 이슈를 생성해주세요.

---

**⚠️ 주의사항:**
- Google Gemini API 사용량에 따른 비용이 발생할 수 있습니다.
- 네이버 지도 API는 일일 호출 제한이 있습니다.
- 분석 결과는 참고용이며, 실제 수익을 보장하지 않습니다.
