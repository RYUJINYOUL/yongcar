'use client'

import { useState } from 'react'

interface AnalysisResultProps {
  result: {
    location: {
      name: string;
      address: string;
    };
    routeGrade: {
      overall: string;
      fatigueScore: string;
    };
    warningPoints: {
      narrowAlley: string;
      deadEnd: string;
      noElevator: string;
    };
    parkingIssue: string;
    realIncome: string;
    oneLiner: string;
    vehicleLimit: {
      underpassHeight: string;
      highTopEntry: string;
      truckAccessibility: string;
    };
    amenities: {
      restroom: string;
      breakSpot: string;
    };
    pickupTargets?: {
      name: string;
      reason: string;
      tip: string;
    }[];
  };
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const naverMapLink = `https://map.naver.com/p/search/${encodeURIComponent(result.location.address)}`;

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('사이트 주소가 클립보드에 복사되었습니다.'))
      .catch(err => console.error('클립보드 복사 실패:', err));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '초보가능': return 'text-emerald-400';
      case '보통': return 'text-blue-400';
      case '숙련자추천': return 'text-orange-400';
      case '체력왕챌린지': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Info */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">분석 지역</p>
        <p className="text-white font-medium">{result.location.name}</p>
        <p className="text-gray-400 text-sm mb-4">{result.location.address}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href={naverMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors duration-200 text-sm"
          >
            네이버맵으로 확인하기
          </a>
          <button 
            onClick={handleShareClick}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            사이트 공유하기
          </button>
        </div>
      </div>

      {/* Route Grade */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">🎯 라우트 등급</p>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-4xl font-bold ${getGradeColor(result.routeGrade.overall)}`}>
            {result.routeGrade.overall}
          </span>
          <div className="text-right">
            <p className="text-sm text-gray-400">피로도 점수</p>
            <p className="text-2xl font-semibold text-white">{result.routeGrade.fatigueScore}/100</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3 italic">"{result.oneLiner}"</p>
      </div>

      {/* Vehicle Limit */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">차량 제한 정보</p>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><span className="font-medium text-white">지하주차장 층고:</span> {result.vehicleLimit.underpassHeight}</li>
          <li><span className="font-medium text-white">고탑 진입:</span> {result.vehicleLimit.highTopEntry}</li>
          <li><span className="font-medium text-white">1톤 탑차 진입 난이도:</span> {result.vehicleLimit.truckAccessibility}</li>
        </ul>
      </div>

      {/* Warning Points */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">⚠️ 주의 구간</p>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><span className="font-medium text-white">좁은 골목:</span> {result.warningPoints.narrowAlley}</li>
          <li><span className="font-medium text-white">막다른 길:</span> {result.warningPoints.deadEnd}</li>
          <li><span className="font-medium text-white">계단 배송:</span> {result.warningPoints.noElevator}</li>
        </ul>
      </div>

      {/* Parking Issue */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">🚗 주차 정보</p>
        <p className="text-gray-300 text-sm">{result.parkingIssue}</p>
      </div>

      {/* Amenities */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">🏪 편의시설</p>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><span className="font-medium text-white">화장실:</span> {result.amenities.restroom}</li>
          <li><span className="font-medium text-white">휴게 공간:</span> {result.amenities.breakSpot}</li>
        </ul>
      </div>

      {/* Pickup Targets */}
      {result.pickupTargets && result.pickupTargets.length > 0 && (
        <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/20">
          <p className="text-xs text-green-400 uppercase tracking-wider mb-3">🎯 집화 선점 포인트</p>
          <div className="space-y-3">
            {result.pickupTargets.map((target, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-green-500/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{target.name}</h4>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <p className="text-gray-300 text-xs mb-2 leading-relaxed">{target.reason}</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2">
                  <p className="text-yellow-400 text-xs font-medium">🔥 현장 팁: {target.tip}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
            <p className="text-xs text-gray-400 italic">
              💼 집화 영업은 배송 동선 중에 자연스럽게 진행하세요. 무리한 영업보다는 관계 구축이 우선입니다.
            </p>
          </div>
        </div>
      )}

      {/* Real Income */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">💰 예상 순수익</p>
        <p className="text-2xl font-bold text-white">{result.realIncome}</p>
      </div>
    </div>
  )
}
