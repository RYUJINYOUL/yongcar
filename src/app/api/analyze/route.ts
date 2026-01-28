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
    const deliveryCompany = formData.get('deliveryCompany') as string || ''
    const departureAddress = formData.get('departureAddress') as string || ''
    const terminalAddress = formData.get('terminalAddress') as string || ''
    const warningFlagsStr = formData.get('warningFlags') as string || '{}'
    let warningFlags: {
      vehiclePurchase?: boolean;
      advancePayment?: boolean;
      unrealisticIncome?: boolean;
    } = {}
    try {
      warningFlags = JSON.parse(warningFlagsStr)
    } catch (e) {
      console.error('warningFlags 파싱 오류:', e)
    }

    console.log('받은 데이터:', {
      이미지수: mapImages.length,
      텍스트길이: cafeText?.length,
      택배회사: deliveryCompany,
      출발주소: departureAddress,
      터미널주소: terminalAddress,
      경고사항: warningFlags
    })

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
      const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })

      // 개선된 족집게 분석 프롬프트
      const prompt = `
당신은 택배 기사님들 사이에서 '족집게 소장'으로 불리는 15년 경력의 베테랑 배송 컨설턴트입니다.
당신의 분석은 매우 날카롭고, 현실적이며, 때로는 거칠지만 기사님들에게 실질적인 도움이 됩니다.

**분석 철학 (날카로운 족집게):**
- '보통, 무난함' 같은 애매한 표현은 지양하세요.
- 구역의 특성을 '하체 강화 코스', '지옥의 오르막길', '멘탈 관리 필수 구역' 등 생생하고 직관적인 단어로 표현하세요.
- 초보자가 감당하기 힘든 구역은 확실하게 경고(초보 절대 금지 등)를 날리세요.
- 소장님들의 눈치 보지 말고, 기사님의 입장에서 '진짜 돈이 되는지, 몸이 박살나는지'를 가감 없이 분석하세요.

**[이미지 정밀 분석 지시 - 절대 준수]**
당신은 제공된 **지도 이미지의 시각적 정보**만을 최우선으로 분석해야 합니다. 지역명(예: 개봉동, 신림동)에 대한 일반적인 지식보다 **이미지에 실제로 보이는 패턴**이 훨씬 중요합니다.
1. 시각적 패턴 분석: 
   - [아파트]: 지도상에서 대형 직사각형, 규칙적인 단지 배치, 면 색상이 칠해진 넓은 구역, 명확한 '동' 번호.
   - [지번/빌라]: 촘촘하고 불규칙한 작은 사각형/다각형, 좁고 복잡한 선(골목), '번지' 위주의 밀집 구역.
2. 분석 오류 방지: 특정 동네 이름만 보고 "여기는 아파트가 많겠지"라고 추측하지 마세요. 캡쳐된 지도에 아파트 단지가 보이지 않는다면 반드시 '지번/빌라 100%'로 판정해야 합니다.
3. 결과 도출: 이미지에 표시된 선과 면의 형태를 근거로 '아파트 vs 지번/원룸'의 비율을 %로 산출하세요.

**1단계: 데이터 분석**
- [택배회사]: ${deliveryCompany || '미지정'}
- [출발 주소]: ${departureAddress || '미입력'}
- [터미널 주소]: ${terminalAddress || '미입력'}
- [구인글]: ${cafeText}
- [지도분석]: 이미지에 보이는 실제 골목의 밀도와 건물의 형태를 바탕으로 배송 난이도를 분석하세요.

**2단계: 택배 업무용 유류비 계산 (LPG 기준)**
- **거리 계산의 원칙**:
  1. 출발지(${departureAddress})와 터미널(${terminalAddress}) 사이의 거리를 계산하세요.
  2. 터미널과 배송지 사이의 거리를 계산하세요.
  3. 배송 구역 내에서의 반복 주행 거리(약 5-10km)를 반드시 포함하세요.
  4. 총 이동거리 = { (집-터미널) + (터미널-배송지) + (배송지-집) } + (구역 내 주행).
- **회전수**: ${deliveryCompany} 기준 (쿠팡주간 2회전, 야간 3회전, CJ 2회전, 롯데/한진/로젠 1회전 적용).
- **연비**: 택배 업무 특성(잦은 정차 및 공회전)과 LPG 차량임을 고려하여 **L당 9km**로 계산하세요.
- **유가**: LPG 기준 **1,050원/L** 적용.
- **계산식**: (총 이동거리 × 회전수 / 9) × 1050. (1,000원 단위 올림 적용)

**3단계: 레드 플래그(Red Flag) 경고 시스템**
${Object.keys(warningFlags).some(key => warningFlags[key as keyof typeof warningFlags]) ? `
⚠️ **치명적인 경고**: 사용자가 다음 위험 요소를 체크했습니다:
${warningFlags.vehiclePurchase ? '- 🚨 차량 구매 및 할부 유도: "일자리가 아닌 차를 파는 것이 목적인 \'차량 강매\' 수법과 95% 일치합니다. 계약 시 수천만 원의 빚을 떠안을 수 있습니다." (위험지수: 99%)' : ''}
${warningFlags.advancePayment ? '- 🚨 선입금 및 비용 요구: "정상적인 대리점은 교육비나 유니폼비를 현금으로 미리 요구하지 않습니다. 전형적인 \'입금 유도형\' 사기입니다." (위험지수: 80%)' : ''}
${warningFlags.unrealisticIncome ? '- 🚨 비현실적 고수익/조건: "신입 기사가 월 600만 원 순수익을 올리는 것은 물리적으로 불가능합니다. 과장 광고를 통해 차량 계약을 유도하는 미끼일 확률이 높습니다." (위험지수: 60%)' : ''}

**중요**: 이러한 레드 플래그가 있는 경우, warningPoints와 oneLiner에 반드시 강력한 경고 메시지를 포함하세요.
` : ''}

**작성 예시 (신림동 기준):**
- routeGrade.overall: "⚠️ 하체 강화 코스 (초보 절대 금지)"
- routeGrade.fatigueScore: 88
- routeGrade.reason: "신림동은 대한민국 빌라 지번 배송의 끝판왕입니다. 엘리베이터 없는 5층 빌라와 좁은 골목길 불법 주차 차량 사이를 통과해야 합니다. 초보는 하루만 해도 도망갈 수 있는 구역입니다."
- vehicleInfo.alleyLevel: "1톤 탑차 진입 시 사이드미러 접어야 하는 구간 속출. 고탑은 절대 금지(전선 낮음). 2단 접이식 카트 없으면 배송 효율 반토막 납니다."
- warningPoints: ["지옥의 오르막길 배송. 빌라 입구마다 오토바이 알박기 주의.", "퇴근 시간대 배달 오토바이와 뒤섞여 멘탈 관리 필수.", "주차 공간 부족으로 인한 불법 주정차 단속 주의"]

**JSON 응답 형식 (엄격 준수):**
{
  "location": { "name": "...", "address": "..." },
  "routeGrade": {
    "overall": "날카로운 한줄 등급 (예: ⚠️ 하체 강화 코스)",
    "fatigueScore": 0,
    "reason": "현실적이고 날카로운 이유 설명"
  },
  "zoneRatio": {
    "apartment": 0,
    "villa": 0
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
  "fuelCost": {
    "dailyDistance": "일일 총 이동거리 (km)",
    "roundTrips": "회전수",
    "dailyFuelCost": "일일 유류비 (원)",
    "calculation": "계산 과정 설명"
  },
  "warningPoints": [
    "주의 구간 1 (날카롭게)",
    "주의 구간 2 (날카롭게)",
    "주의 구간 3 (날카롭게)"
  ],
  "oneLiner": "기사님들 가슴에 꽂히는 날카로운 한줄평"
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
          fatigueScore: aiResult.routeGrade.fatigueScore.toString(),
          reason: aiResult.routeGrade.reason
        },
        zoneRatio: aiResult.zoneRatio || { apartment: 0, villa: 100 },
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
        fuelCost: {
          dailyDistance: aiResult.fuelCost?.dailyDistance || "분석 중...",
          roundTrips: aiResult.fuelCost?.roundTrips || "분석 중...",
          dailyFuelCost: aiResult.fuelCost?.dailyFuelCost || "분석 중...",
          calculation: aiResult.fuelCost?.calculation || "거리 및 회전수 분석 중..."
        },
        redFlags: warningFlags
      }

      // Firebase에 분석 결과 저장
      try {
        const db = getFirestoreDB()
        console.log('Firebase에 분석 결과 저장 시작')

        await addDoc(collection(db, 'analyses'), {
          ...analysisResult,
          cafeText: cafeText.substring(0, 200), // 구인글 일부만 저장
          deliveryCompany: deliveryCompany || '',
          departureAddress: departureAddress || '',
          terminalAddress: terminalAddress || '',
          warningFlags: warningFlags,
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
        fuelCost: {
          dailyDistance: "분석 중...",
          roundTrips: "분석 중...",
          dailyFuelCost: "분석 중...",
          calculation: "거리 및 회전수 분석 중..."
        },
        redFlags: warningFlags
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
