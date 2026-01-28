'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import TextInput from '@/components/TextInput'
import AnalysisResult from '@/components/AnalysisResult'
import Timeline from '@/components/Timeline'
// Firebase는 API Route에서 처리

export default function Home() {
  const [mapImages, setMapImages] = useState<File[]>([])
  const [cafeText, setCafeText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'analyze' | 'timeline'>('analyze')
  
  // 새로운 필드들
  const [deliveryCompany, setDeliveryCompany] = useState('')
  const [departureAddress, setDepartureAddress] = useState('')
  const [terminalAddress, setTerminalAddress] = useState('')
  const [warningFlags, setWarningFlags] = useState({
    vehiclePurchase: false,
    advancePayment: false,
    unrealisticIncome: false
  })
  
  // 카카오톡 오픈채팅방으로 변경하여 모달 관련 state 제거

  const handleAnalyze = async () => {
    console.log('분석 시작 - 이미지:', mapImages.length, '텍스트:', cafeText.length)
    
    if (mapImages.length === 0 || !cafeText.trim()) {
      alert('지도 이미지(최소 1장)와 지역 정보를 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // 다중 이미지 추가
      mapImages.forEach((image, index) => {
        console.log(`이미지 ${index} 추가:`, image.name, image.size, 'bytes')
        formData.append(`mapImage${index}`, image)
      })
      formData.append('imageCount', mapImages.length.toString())
      formData.append('cafeText', cafeText)
      formData.append('deliveryCompany', deliveryCompany)
      formData.append('departureAddress', departureAddress)
      formData.append('terminalAddress', terminalAddress)
      formData.append('warningFlags', JSON.stringify(warningFlags))
      
      console.log('FormData 준비 완료, 서버로 전송 중...')

      // 로컬과 배포 모두 Vercel Serverless Function 사용
      const apiUrl = '/api/analyze'
      
      console.log('요청 URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }))
        throw new Error(errorData.error || `서버 오류: ${response.status}`)
      }

      const result = await response.json()
      setAnalysisResult(result)
      
      // 분석 완료 후 타임라인 탭이 활성화되어 있으면 새로고침
      if (activeTab === 'timeline') {
        // 타임라인 컴포넌트가 자동으로 새로고침되도록 상태 업데이트
        window.dispatchEvent(new Event('analysis-completed'))
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      const errorMessage = error.message || '분석 중 오류가 발생했습니다.'
      alert(`오류: ${errorMessage}\n\nPython 백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:8000)`)
    } finally {
      setIsLoading(false)
    }
  }

  // 카카오톡 오픈채팅방으로 변경하여 핸드폰 저장 함수 제거

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block mb-6 sm:mb-8 lg:mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-4 sm:gap-6">
              <img 
                src="/logo512.png" 
                alt="용카 로고" 
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-3xl shadow-2xl ring-2 ring-white/10"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                  용카 라우트
                </h1>
              </div>
            </div>
            <div className="text-center sm:text-left mt-2 mb-3 sm:mt-3 sm:mb-4">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-300 leading-relaxed tracking-tight">
                  택배 라우트 분석 - 지도와 구인정보를 입력하면<br className="sm:hidden" /> AI가 분석해 드립니다.
                </h1>
              </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-4 mt-4 sm:mt-6">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center w-full sm:w-auto btn-primary text-base sm:text-lg lg:text-xl px-6 sm:px-8 py-3 sm:py-4"
            >
              <span className="flex items-left gap-2 mb-1">
                <span className="text-xs sm:text-sm">NEW 1월 31일 오픈</span>
              </span>
              <span className="text-center leading-tight">
                <span className="block">택배기사 필수 앱 "용카"</span>
              </span>
            </a>
                
            <a
              href="https://open.kakao.com/o/gsedoMci"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center w-full sm:w-auto text-base sm:text-lg lg:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-gray-900 transition-all duration-300 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 border border-yellow-400/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm">용카 오픈채팅방</span>
              </span>
              <span className="text-center leading-tight">용카를 먼저 만나보세요</span>
            </a>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === 'analyze'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              분석하기
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              타임라인
            </button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'analyze' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  지도 이미지 업로드
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  분석하고 싶은 지역의 지도를 최대 3장까지 업로드하세요<br className="hidden sm:block" />
                  <span className="text-xs opacity-75">(전체 지도 + 상세 골목 + 건물 현황 등)</span>
                </p>
              </div>
              <ImageUpload 
                onImageSelect={setMapImages}
                selectedImages={mapImages}
              />
            </div>

            <div className="card">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  기본 정보 입력
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  택배회사와 주소 정보를 입력하세요.
                </p>
              </div>
              
              {/* 택배회사 선택 */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-semibold text-white mb-2">
                  택배회사 선택 <span className="text-red-400">*</span>
                </label>
                <select
                  value={deliveryCompany}
                  onChange={(e) => setDeliveryCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">택배회사를 선택하세요</option>
                  <option value="씨제이">씨제이</option>
                  <option value="쿠팡주간">쿠팡주간</option>
                  <option value="쿠팡야간">쿠팡야간</option>
                  <option value="롯데">롯데</option>
                  <option value="한진">한진</option>
                  <option value="로젠">로젠</option>
                  <option value="씨제이오네">씨제이오네</option>
                  <option value="야간기타택배">야간기타택배</option>
                </select>
              </div>

              {/* 출발 주소 */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-semibold text-white mb-2">
                  출발 주소
                </label>
                <input
                  type="text"
                  value={departureAddress}
                  onChange={(e) => setDepartureAddress(e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 터미널 주소 */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-semibold text-white mb-2">
                  터미널 주소
                </label>
                <input
                  type="text"
                  value={terminalAddress}
                  onChange={(e) => setTerminalAddress(e.target.value)}
                  placeholder="예: 경기도 수원시 영통구 월드컵로 456"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 경고 체크박스 (선택항목) */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-semibold text-white mb-3">
                  주의사항 (선택항목)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={warningFlags.vehiclePurchase}
                      onChange={(e) => setWarningFlags({ ...warningFlags, vehiclePurchase: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="ml-3 text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                      차량 구매 및 할부 유도
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={warningFlags.advancePayment}
                      onChange={(e) => setWarningFlags({ ...warningFlags, advancePayment: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="ml-3 text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                      선입금 및 각종 비용 요구
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={warningFlags.unrealisticIncome}
                      onChange={(e) => setWarningFlags({ ...warningFlags, unrealisticIncome: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="ml-3 text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                      비현실적 고수익 및 조건
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  구인 정보 입력
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  구인 정보를 복사 붙여 넣으세요.
                </p>
              </div>
              <TextInput 
                value={cafeText}
                onChange={setCafeText}
                placeholder="수원 탑동, 단가 850원, 250개..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || mapImages.length === 0 || !cafeText.trim() || !deliveryCompany}
              className={`w-full btn-primary text-base sm:text-lg lg:text-xl px-6 sm:px-8 py-3 sm:py-4 ${isLoading ? 'loading-pulse' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mr-2 sm:mr-3"></div>
                  <span className="text-sm sm:text-base lg:text-lg">AI가 분석 중입니다...</span>
                </div>
              ) : (
                <span>스마트 분석 시작하기</span>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysisResult && (
              <>
                <div className="result-card">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      AI 분석 결과
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      데이터 기반 수익성 분석 리포트
                    </p>
                  </div>
                  <AnalysisResult result={analysisResult} />
                </div>

              </>
            )}

            {!analysisResult && (
              <div className="card text-center py-12 sm:py-16 lg:py-20">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-5">
                  AI 분석 대기 중
                </h3>
                <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed px-4">
                  지도 이미지와 구인 정보를 입력하시면 
                  <br />
                  <span className="font-semibold text-blue-400">AI가 라우트를 분석</span>해드립니다
                </p>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
                분석 타임라인
              </h2>
              <p className="text-gray-400 text-sm sm:text-base text-center">
                다른 사용자들이 분석한 라우트를 확인해보세요
              </p>
            </div>
            <Timeline />
          </div>
        )}
      </div>

      {/* 카카오톡 오픈채팅방으로 변경하여 모달 제거 */}
    </main>
  )
}
