'use client'

interface AnalysisResultProps {
  result: {
    location: {
      name: string;
      address: string;
    };
    routeGrade: {
      overall: string;
      fatigueScore: string;
      reason?: string;
    };
    zoneRatio?: {
      apartment: number;
      villa: number;
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
    fuelCost: {
      dailyDistance: string;
      roundTrips: string;
      dailyFuelCost: string;
      calculation: string;
    };
    redFlags?: {
      vehiclePurchase: boolean;
      advancePayment: boolean;
      unrealisticIncome: boolean;
    };
  };
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  // 주소에서 괄호와 그 안의 내용 제거 (예: "서울 관악구 신림동 (일부 제외)" -> "서울 관악구 신림동")
  const cleanAddress = result.location.address.replace(/\s*\(.*?\)\s*/g, '').trim();
  const naverMapLink = `https://map.naver.com/p/search/${encodeURIComponent(cleanAddress)}`;

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('사이트 주소가 클립보드에 복사되었습니다.'))
      .catch(err => console.error('클립보드 복사 실패:', err));
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('초보가능')) return 'text-emerald-400';
    if (grade.includes('보통')) return 'text-blue-400';
    if (grade.includes('숙련자')) return 'text-orange-400';
    if (grade.includes('체력왕') || grade.includes('금지') || grade.includes('⚠️')) return 'text-red-400';
    return 'text-gray-400';
  };

  const getRedFlagMessage = (flagType: string) => {
    switch (flagType) {
      case 'vehiclePurchase':
        return {
          title: '차량 구매 및 할부 유도',
          message: '일자리가 아닌 차를 파는 것이 목적인 "차량 강매" 수법과 95% 일치합니다. 계약 시 수천만 원의 빚을 떠안을 수 있습니다.',
          risk: '99%'
        };
      case 'advancePayment':
        return {
          title: '선입금 및 비용 요구',
          message: '정상적인 대리점은 교육비나 유니폼비를 현금으로 미리 요구하지 않습니다. 전형적인 "입금 유도형" 사기입니다.',
          risk: '80%'
        };
      case 'unrealisticIncome':
        return {
          title: '비현실적 고수익/조건',
          message: '신입 기사가 월 600만 원 순수익을 올리는 것은 물리적으로 불가능합니다. 과장 광고를 통해 차량 계약을 유도하는 미끼일 확률이 높습니다.',
          risk: '60%'
        };
      default:
        return null;
    }
  };

  const hasRedFlags = result.redFlags && Object.values(result.redFlags).some(flag => flag);
  const fatigueScoreNum = parseInt(result.routeGrade.fatigueScore);

  return (
    <div className="space-y-6">
      {/* Red Flags Warning */}
      {hasRedFlags && (
        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-4 animate-pulse">
          <div className="flex items-center mb-3">
            <div className="text-2xl mr-2">🚨</div>
            <h3 className="text-xl font-bold text-red-400">치명적인 경고 - 절대 계약하지 마세요!</h3>
          </div>
          <div className="space-y-3">
            {result.redFlags && Object.entries(result.redFlags).map(([key, value]) => {
              if (!value) return null;
              const flagInfo = getRedFlagMessage(key);
              if (!flagInfo) return null;

              return (
                <div key={key} className="bg-red-800/30 rounded-lg p-3 border border-red-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-300">{flagInfo.title}</h4>
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold">
                      위험도 {flagInfo.risk}
                    </span>
                  </div>
                  <p className="text-red-200 text-sm leading-relaxed">{flagInfo.message}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-red-800/50 rounded-lg border border-red-600/30">
            <p className="text-red-200 text-sm font-semibold text-center">
              ⚠️ 이런 조건의 구인글은 99% 사기입니다. 즉시 신고하고 절대 연락하지 마세요!
            </p>
          </div>
        </div>
      )}

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
        <div className="flex flex-col mb-2">
          <span className={`text-2xl sm:text-3xl font-bold mb-2 ${getGradeColor(result.routeGrade.overall)}`}>
            {result.routeGrade.overall}
          </span>
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div>
              <p className="text-xs text-gray-400 uppercase">피로도 점수</p>
              <p className={`text-3xl font-black ${fatigueScoreNum >= 80 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {result.routeGrade.fatigueScore}<span className="text-lg font-normal text-gray-500">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase mb-1">난이도</p>
              <span className={`px-2 py-1 rounded text-xs font-bold ${fatigueScoreNum >= 80 ? 'bg-red-500/20 text-red-400' :
                fatigueScoreNum >= 60 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                {fatigueScoreNum >= 80 ? '최상' : fatigueScoreNum >= 60 ? '상' : fatigueScoreNum >= 40 ? '중' : '하'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-4 leading-relaxed bg-black/20 p-3 rounded-lg border-l-4 border-blue-500">
          {result.routeGrade.reason || result.oneLiner}
        </p>
      </div>

      {/* Zone Ratio (Apt vs Villa) */}
      {result.zoneRatio && typeof result.zoneRatio.apartment === 'number' && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">🏘️ 구역 구성 비율 (추정)</p>
          <div className="space-y-4">
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${result.zoneRatio.apartment}%` }}
              />
              <div
                className="h-full bg-orange-500 transition-all duration-1000"
                style={{ width: `${result.zoneRatio.villa}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2" />
                <span className="text-gray-300">아파트 {result.zoneRatio.apartment}%</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-300">지번/빌라 {result.zoneRatio.villa}%</span>
                <div className="w-3 h-3 bg-orange-500 rounded-sm ml-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Limit */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">🚚 차량 및 배송 환경</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 mb-1">지하주차장 층고</p>
              <p className="text-white text-sm font-semibold">{result.vehicleLimit.underpassHeight}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 mb-1">고탑 진입</p>
              <p className="text-white text-sm font-semibold">{result.vehicleLimit.highTopEntry}</p>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-[10px] text-gray-500 mb-1">1톤 탑차 진입 및 도구 제안</p>
            <p className="text-white text-sm leading-relaxed">{result.vehicleLimit.truckAccessibility}</p>
          </div>
        </div>
      </div>

      {/* Warning Points */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">⚠️ 족집게 주의 구간</p>
        <ul className="space-y-3">
          {[result.warningPoints.narrowAlley, result.warningPoints.deadEnd, result.warningPoints.noElevator].map((point, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-300">
              <span className="text-blue-500 mr-2 font-bold">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Parking Issue */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">🚗 주차 및 단속 정보</p>
        <p className="text-gray-300 text-sm leading-relaxed">{result.parkingIssue}</p>
      </div>

      {/* Fuel Cost */}
      {result.fuelCost && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">⛽ 유류비 분석</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-gray-500 mb-1 uppercase">일일 총 이동거리</p>
              <p className="text-white font-bold">{result.fuelCost.dailyDistance}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1 uppercase">회전수</p>
              <p className="text-white font-bold">{result.fuelCost.roundTrips}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-[10px] text-gray-500 mb-1 uppercase">일일 유류비 (안전 마진 포함)</p>
            <p className="text-3xl font-black text-red-400">{result.fuelCost.dailyFuelCost}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-gray-500 mb-1 uppercase">계산 근거</p>
            <p className="text-xs text-gray-400 leading-relaxed">{result.fuelCost.calculation}</p>
          </div>
        </div>
      )}

      {/* Real Income */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 shadow-lg border border-blue-400/30">
        <p className="text-xs text-blue-200 uppercase tracking-wider mb-2 font-bold">💰 예상 일 순수익 (지출 공제 후)</p>
        <p className="text-3xl font-black text-white">{result.realIncome}</p>
        <p className="text-xs text-blue-200 mt-2 opacity-80">* 공고된 수익에서 유류비 및 고정 지출을 제외한 추정치입니다.</p>
      </div>

      {/* One Liner */}
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm italic font-medium">"{result.oneLiner}"</p>
      </div>
    </div>
  )
}
