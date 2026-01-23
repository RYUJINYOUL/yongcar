'use client'

interface NaverMapProps {
  location: {
    name: string
    lat?: number
    lng?: number
  }
  markers?: Array<{
    lat: number
    lng: number
    label: string
  }>
}

export default function NaverMap({ location, markers }: NaverMapProps) {
  // Placeholder map visualization since we don't have actual Naver Map API
  return (
    <div className="relative">
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-white/10">
        {/* Map placeholder with grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Location indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 bg-blue-400 rounded-full" />
            </div>
            <p className="text-white font-medium">{location.name}</p>
            {location.lat && location.lng && (
              <p className="text-gray-500 text-xs mt-1">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Markers */}
        {markers && markers.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-2">주요 지점 ({markers.length}개)</p>
              <div className="flex flex-wrap gap-2">
                {markers.slice(0, 5).map((marker, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                  >
                    {marker.label}
                  </span>
                ))}
                {markers.length > 5 && (
                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                    +{markers.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}