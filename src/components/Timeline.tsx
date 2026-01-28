'use client'

import { useState, useEffect } from 'react'
import AnalysisResult from './AnalysisResult'

interface TimelineItem {
  id: string
  location: {
    name: string
    address: string
  }
  routeGrade: {
    overall: string
    fatigueScore: string
  }
  oneLiner: string
  realIncome: string
  createdAt: string
  cafeText?: string
  [key: string]: any
}

interface TimelineProps {
  onRefresh?: () => void
}

export default function Timeline({ onRefresh }: TimelineProps) {
  const [analyses, setAnalyses] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTimeline()

    // 분석 완료 이벤트 리스너
    const handleAnalysisCompleted = () => {
      setTimeout(() => {
        fetchTimeline()
      }, 1000) // 1초 후 새로고침 (Firebase 저장 시간 고려)
    }

    window.addEventListener('analysis-completed', handleAnalysisCompleted)

    return () => {
      window.removeEventListener('analysis-completed', handleAnalysisCompleted)
    }
  }, [])

  const fetchTimeline = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('타임라인 요청 시작')
      const response = await fetch('/api/timeline?limit=50')

      console.log('타임라인 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || `서버 오류: ${response.status}`
        console.error('타임라인 응답 오류:', errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('타임라인 데이터 수신:', data.analyses?.length || 0, '개')

      setAnalyses(data.analyses || [])
      setError(null)
    } catch (err: any) {
      console.error('타임라인 로드 오류 상세:', {
        message: err.message,
        stack: err.stack
      })
      setError(err.message || '타임라인을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days < 7) return `${days}일 전`

      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '알 수 없음'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '초보가능': return 'text-emerald-400'
      case '보통': return 'text-blue-400'
      case '숙련자추천': return 'text-orange-400'
      case '체력왕챌린지': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="card text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">타임라인을 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchTimeline}
          className="btn-primary px-6 py-2 text-sm"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="card text-center py-20">
        <h3 className="text-2xl font-bold text-white mb-4">
          아직 분석 결과가 없습니다
        </h3>
        <p className="text-gray-400">
          첫 번째 분석을 시작해보세요!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {analyses.map((item) => (
        <div key={item.id} className="card hover:border-white/20 transition-all">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl font-bold ${getGradeColor(item.routeGrade?.overall || '')}`}>
                  {item.routeGrade?.overall || '분석중'}
                </span>
                <span className="text-sm text-gray-400">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {item.location?.name || '알 수 없는 지역'}
              </h3>
              <p className="text-sm text-gray-400">
                {item.location?.address || ''}
              </p>
            </div>
          </div>

          {/* 한줄평 */}
          {item.oneLiner && (
            <div className="mb-4">
              <p className="text-gray-300 italic">"{item.oneLiner}"</p>
            </div>
          )}

          {/* 수익 정보 */}
          {item.realIncome && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">예상 수익</p>
              <p className="text-lg font-semibold text-white">{item.realIncome}</p>
            </div>
          )}

          {/* 구인글 미리보기 */}
          {item.cafeText && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-1">구인 정보</p>
              <p className="text-sm text-gray-400 line-clamp-2">{item.cafeText}</p>
            </div>
          )}

          {/* 상세 보기 버튼 */}
          <button
            onClick={() => {
              setExpandedId(expandedId === item.id ? null : item.id)
            }}
            className="mt-4 w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {expandedId === item.id ? '상세 정보 접기 ↑' : '상세 정보 보기 ↓'}
          </button>

          {/* 확장된 상세 정보 */}
          {expandedId === item.id && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <AnalysisResult
                result={{
                  location: item.location,
                  routeGrade: item.routeGrade,
                  warningPoints: typeof item.warningPoints === 'object' && !Array.isArray(item.warningPoints)
                    ? item.warningPoints
                    : {
                      narrowAlley: Array.isArray(item.warningPoints) ? item.warningPoints[0] || '' : '',
                      deadEnd: Array.isArray(item.warningPoints) ? item.warningPoints[1] || '' : '',
                      noElevator: Array.isArray(item.warningPoints) ? item.warningPoints[2] || '' : ''
                    },
                  parkingIssue: item.parkingIssue || '',
                  realIncome: item.realIncome || '정보 없음',
                  oneLiner: item.oneLiner || '',
                  vehicleLimit: item.vehicleLimit || {
                    underpassHeight: '',
                    highTopEntry: '',
                    truckAccessibility: ''
                  },
                  fuelCost: item.fuelCost,
                  zoneRatio: item.zoneRatio,
                  redFlags: item.redFlags
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

