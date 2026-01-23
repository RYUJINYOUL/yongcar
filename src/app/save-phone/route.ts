import { NextRequest, NextResponse } from 'next/server'

// 간단한 메모리 저장소
const phoneNumbers: string[] = []

export async function POST(request: NextRequest) {
  console.log('📱 save-phone API 호출됨')
  
  try {
    // 요청 본문 파싱
    const body = await request.json()
    console.log('요청 데이터:', body)
    
    const { phoneNumber } = body
    
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: '핸드폰 번호가 필요합니다.' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 핸드폰 번호 형식 검증
    const phoneRegex = /^01[0-9]/
    if (!phoneRegex.test(phoneNumber.replace(/[^0-9]/g, ''))) {
      return NextResponse.json(
        { success: false, error: '올바른 핸드폰 번호 형식이 아닙니다.' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 메모리에 저장
    phoneNumbers.push(phoneNumber.trim())
    
    console.log('✅ 핸드폰 번호 저장 완료:', phoneNumber)
    console.log('📊 총 등록된 번호 수:', phoneNumbers.length)
    
    return NextResponse.json({ 
      success: true, 
      message: '출시 소식을 받을 번호가 등록되었습니다! 🎉',
      totalCount: phoneNumbers.length
    }, {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ API 오류:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: error?.message
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 조회용 GET 메서드
export async function GET() {
  return NextResponse.json({
    success: true,
    totalCount: phoneNumbers.length,
    message: `총 ${phoneNumbers.length}개의 번호가 등록되었습니다.`
  }, {
    headers: { 'Content-Type': 'application/json' }
  })
}
