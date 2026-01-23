import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Firebase 초기화 (서버 사이드)
const firebaseConfig = {
  apiKey: "AIzaSyDrdm9iLABioN9GE7yRi_8M7jgYP0DSVxU",
  authDomain: "route-test-fe6fc.firebaseapp.com",
  projectId: "route-test-fe6fc",
  storageBucket: "route-test-fe6fc.firebasestorage.app",
  messagingSenderId: "790621700166",
  appId: "1:790621700166:web:4527fd2fa01d5bb1504a47"
}

// Firebase 초기화 함수
function getFirebaseApp() {
  try {
    if (getApps().length === 0) {
      return initializeApp(firebaseConfig)
    } else {
      return getApps()[0]
    }
  } catch (error) {
    console.error('Firebase 초기화 오류:', error)
    throw error
  }
}

function getFirestoreDB() {
  try {
    const app = getFirebaseApp()
    return getFirestore(app)
  } catch (error) {
    console.error('Firestore 초기화 오류:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // 다중 이미지 처리
    const mapImages: File[] = []
    for (let i = 0; i < 3; i++) {
      const image = formData.get(`mapImage${i}`) as File
      if (image) {
        mapImages.push(image)
      }
    }
    
    // 단일 이미지 호환성
    const singleImage = formData.get('mapImage') as File
    if (singleImage && mapImages.length === 0) {
      mapImages.push(singleImage)
    }
    
    const cafeText = formData.get('cafeText') as string

    console.log('받은 데이터:', { 이미지수: mapImages.length, 텍스트길이: cafeText?.length })

    if (mapImages.length === 0 || !cafeText) {
      return NextResponse.json(
        { error: '지도 이미지와 카페 텍스트가 필요합니다.' },
        { status: 400 }
      )
    }

    try {
      // 이미지를 Gemini에 전달할 형식으로 변환
      const imageParts = await Promise.all(
        mapImages.map(async (image) => {
          const bytes = await image.arrayBuffer()
          return {
            inlineData: {
              data: Buffer.from(bytes).toString('base64'),
              mimeType: image.type
            }
          }
        })
      )

      // Gemini 모델 초기화
      const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

      // 개선된 족집게 분석 프롬프트
      const prompt = `
당신은 택배 기사님과 대리점 소장님 사이를 조율하는 '스마트 배송 컨설턴트'이자 15년 경력의 베테랑입니다.

제공된 구인글과 지도 이미지를 바탕으로, 기사님께는 실질적인 정보를 제공하고 소장님께는 최적의 인재 매칭을 돕는 리포트를 작성하세요.

**작성 가이드 (소장님 배려):**
- '지옥, 빡셈' 같은 부정적 단어 대신 '체력 요구도 높음', '숙련자 추천' 등 전문적인 용어를 사용하세요.
- 구역의 단점만 적지 말고, 해당 구역에서 수익을 극대화할 수 있는 '전략'을 제시하세요.

**1단계: 데이터 분석**
- [구인글]: ${cafeText}에서 지역명, 노선, 물량, 수익 정보를 추출하세요.
- [지도분석]: 좁은 골목, 계단, 주차장 층고를 분석하되, 이를 '준비물(카트 필수 등)' 관점으로 해석하세요.

**2단계: 집화(수거) 업체 발굴 (현장 경험 기반)**
- 지도 상에 보이는 실제 지형물과 상권 데이터를 기반으로 '박스 물량이 나올 법한' 곳을 구체적으로 짚으세요.
- **추천 방식:** '온라인 쇼핑몰' 대신 '3PL 업체', '스마트스토어 창고', '공방', '인쇄소' 등 구체적인 업종을 언급하세요.
- **단서 활용:** "지도 상 건물의 1층이 주차장이 넓은 필로티 구조라면 집화 차량 대기가 편함", "먹자골목보다는 빌라촌 1층 상가에 쇼핑몰 사무실이 많음" 같은 논리를 넣으세요.
- **현장 팁:** 실제 기사님들이 바로 써먹을 수 있는 구체적인 영업 포인트를 제시하세요.

**JSON 응답 형식 (엄격 준수):**
{
  "location": { "name": "...", "address": "..." },
  "routeGrade": {
    "overall": "초보가능/보통/숙련자추천/체력왕챌린지",
    "fatigueScore": 0,
    "reason": "소장님이 읽어도 고개를 끄덕일만한 구역 특성 설명"
  },
  "vehicleInfo": {
    "parkingHeight": "지하주차장 층고 추정치",
    "highTopWarning": "고탑 진입 가능 여부 및 권장 차종",
    "alleyLevel": "탑차 진입 난이도 및 효율적인 배송 도구 제안"
  },
  "realIncome": {
    "daily": "일 평균 약 00만원 (지출 공제 후)",
    "monthly": "월 약 00만원 (공고 기반)"
  },
  "pickupTargets": [
    { "target": "빌라촌 1층 반지하/상가 사무실", "reason": "지도상 탑동 00공원 근처 빌라 1층은 임대료가 싸서 쇼핑몰 사무실이 밀집된 구역입니다.", "tip": "입구에 택배 박스가 5개 이상 쌓여있는 빌라가 보이면 즉시 명함을 넣으세요." },
    { "target": "지하철역 근처 지식산업센터/오피스텔", "reason": "고층 오피스텔은 위탁 판매를 하는 1인 셀러들이 숨어있는 보물창고입니다.", "tip": "경비실 근처에 송장이 붙지 않은 박스 뭉치가 보인다면 그 집 호수를 체크하세요." },
    { "target": "자동차 튜닝/부품샵", "reason": "수원 역전 인근이나 탑동 변두리에는 부품 업체가 많아 집화 단가가 높습니다.", "tip": "박스가 무겁지만 개당 수익이 좋으니 카트를 꼭 챙기세요." }
  ],
  "warningPoints": [
    "안전 운행 주의 구간",
    "효율적인 배송을 위한 동선 팁",
    "주차 협조가 필요한 구역"
  ],
  "oneLiner": "소장님과 기사님 모두가 공감할 따뜻하고 날카로운 한줄평"
}
`

      // AI 분석 실행
      const result = await model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const text = response.text()

      console.log('AI 응답:', text)

      // JSON 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      const aiResult = JSON.parse(jsonMatch[0])
      
      // 기존 컴포넌트와 호환되도록 데이터 구조 변환
      const analysisResult = {
        location: aiResult.location,
        routeGrade: {
          overall: aiResult.routeGrade.overall,
          fatigueScore: aiResult.routeGrade.fatigueScore.toString()
        },
        warningPoints: {
          narrowAlley: aiResult.warningPoints[0] || "분석 중...",
          deadEnd: aiResult.warningPoints[1] || "분석 중...",
          noElevator: aiResult.warningPoints[2] || "분석 중..."
        },
        parkingIssue: aiResult.warningPoints.find((w: string) => w.includes('주차') || w.includes('단속')) || "주차 정보 분석 중...",
        realIncome: aiResult.realIncome.daily,
        oneLiner: aiResult.oneLiner,
        vehicleLimit: {
          underpassHeight: aiResult.vehicleInfo.parkingHeight,
          highTopEntry: aiResult.vehicleInfo.highTopWarning,
          truckAccessibility: aiResult.vehicleInfo.alleyLevel
        },
        // --- 추가된 집화 업체 섹션 ---
        pickupTargets: aiResult.pickupTargets?.map((t: any) => ({
          name: t.target,
          reason: t.reason,
          tip: t.tip
        })) || [],
        // -------------------------
        amenities: {
          restroom: "편의시설 분석 중...",
          breakSpot: "휴게 공간 분석 중..."
        }
      }

      // Firebase에 분석 결과 저장
      try {
        const db = getFirestoreDB()
        console.log('Firebase에 분석 결과 저장 시작')
        
        await addDoc(collection(db, 'analyses'), {
          ...analysisResult,
          cafeText: cafeText.substring(0, 200), // 구인글 일부만 저장
          createdAt: serverTimestamp(),
          imageCount: mapImages.length
        })
        console.log('Firebase에 분석 결과 저장 완료')
      } catch (firebaseError: any) {
        console.error('Firebase 저장 오류 상세:', {
          message: firebaseError.message,
          code: firebaseError.code,
          stack: firebaseError.stack
        })
        // 저장 실패해도 분석 결과는 반환
      }

      return NextResponse.json(analysisResult)

    } catch (aiError) {
      console.error('AI 분석 오류:', aiError)
      
      // AI 분석 실패 시 샘플 데이터 반환
      const fallbackResult = {
        location: {
          name: "분석 중...",
          address: "AI 분석 처리 중입니다"
        },
        routeGrade: {
          overall: "분석중",
          fatigueScore: "0"
        },
        warningPoints: {
          narrowAlley: "AI 분석 중입니다...",
          deadEnd: "AI 분석 중입니다...",
          noElevator: "AI 분석 중입니다..."
        },
        parkingIssue: "AI 분석 중입니다...",
        realIncome: "분석 중...",
        oneLiner: "AI가 열심히 분석하고 있습니다!",
        vehicleLimit: {
          underpassHeight: "분석 중...",
          highTopEntry: "분석 중...",
          truckAccessibility: "분석 중..."
        },
        pickupTargets: [],
        amenities: {
          restroom: "분석 중...",
          breakSpot: "분석 중..."
        }
      }
      
      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 파일 업로드 크기 제한 설정
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
