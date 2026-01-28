from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import base64
import io
from PIL import Image
import json
import re

# Gemini API 설정
GEMINI_API_KEY = "AIzaSyDsDYnMtzsBZwD1zosmbSLQopT2NsO_J5M"
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Route Analyzer API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    image_base64: str
    cafe_text: str

class LocationInfo(BaseModel):
    name: str
    address: str
    coordinates: dict

class AnalysisInfo(BaseModel):
    areaType: str
    population: str
    businessDensity: str
    accessibility: str
    competition: str

class RevenueInfo(BaseModel):
    dailyEstimate: int
    monthlyEstimate: int
    factors: list

class AnalysisResponse(BaseModel):
    location: LocationInfo
    analysis: AnalysisInfo
    revenue: RevenueInfo
    recommendations: list
    markers: list

def extract_location_from_image(image_base64: str, cafe_text: str):
    """Gemini를 사용하여 이미지에서 위치 정보 추출 및 분석"""
    try:
        model = genai.GenerativeModel('models/gemini-2.0-flash-exp')
        
        # Base64 이미지를 PIL Image로 변환
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        prompt = f"""
        이 네이버 지도 이미지를 분석하고 다음 카페/상점 정보를 참고하여 택배 라우트 수익성을 분석해주세요:

        카페/상점 정보: {cafe_text}

        다음 JSON 형식으로 응답해주세요:
        {{
            "location": {{
                "name": "지역명",
                "address": "상세 주소",
                "coordinates": {{"lat": 37.5665, "lng": 126.9780}}
            }},
            "analysis": {{
                "areaType": "지역 특성 (주거지역/상업지역/혼합지역 등)",
                "population": "인구 밀도 분석",
                "businessDensity": "상권 밀도 분석",
                "accessibility": "교통 접근성 분석",
                "competition": "경쟁업체 분석"
            }},
            "revenue": {{
                "dailyEstimate": 150000,
                "monthlyEstimate": 4500000,
                "factors": ["요인1", "요인2", "요인3"]
            }},
            "recommendations": ["추천사항1", "추천사항2", "추천사항3"],
            "markers": [
                {{"lat": 37.5665, "lng": 126.9780, "title": "주요 지점1", "type": "delivery"}},
                {{"lat": 37.5675, "lng": 126.9790, "title": "주요 지점2", "type": "pickup"}}
            ]
        }}

        분석 시 고려사항:
        1. 지도에서 보이는 도로망과 건물 밀도
        2. 제공된 카페/상점 가격 정보로 지역 경제 수준 판단
        3. 택배 배송에 유리한 요소들 (접근성, 주차, 인구밀도 등)
        4. 예상 수익은 현실적인 범위에서 계산
        """
        
        response = model.generate_content([prompt, image])
        
        # JSON 응답 파싱
        response_text = response.text.strip()
        
        # JSON 부분만 추출 (```json으로 감싸져 있을 수 있음)
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1)
        else:
            # JSON 마커가 없으면 전체 텍스트에서 JSON 찾기
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_text = json_match.group(0)
            else:
                json_text = response_text
        
        try:
            result = json.loads(json_text)
            return result
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            print(f"응답 텍스트: {response_text}")
            # 기본 응답 반환
            return {
                "location": {
                    "name": "분석된 지역",
                    "address": "주소 정보를 확인할 수 없음",
                    "coordinates": {"lat": 37.5665, "lng": 126.9780}
                },
                "analysis": {
                    "areaType": "혼합 지역",
                    "population": "중간 밀도",
                    "businessDensity": "보통",
                    "accessibility": "양호",
                    "competition": "중간 수준"
                },
                "revenue": {
                    "dailyEstimate": 120000,
                    "monthlyEstimate": 3600000,
                    "factors": ["지역 특성", "접근성", "경쟁 상황"]
                },
                "recommendations": [
                    "교통 접근성이 좋은 지역을 우선 공략하세요",
                    "주거 밀집 지역의 오전 시간대를 활용하세요",
                    "상업 지역의 점심시간 배송 수요를 노려보세요"
                ],
                "markers": [
                    {"lat": 37.5665, "lng": 126.9780, "title": "분석 지역", "type": "delivery"}
                ]
            }
            
    except Exception as e:
        print(f"이미지 분석 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"이미지 분석 실패: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Route Analyzer API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Route Analyzer Backend is running"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_route(request: AnalysisRequest):
    """지도 이미지와 카페 텍스트를 분석하여 라우트 수익성 평가"""
    try:
        # Gemini를 사용하여 이미지 분석
        result = extract_location_from_image(request.image_base64, request.cafe_text)
        
        return AnalysisResponse(**result)
        
    except Exception as e:
        print(f"분석 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")

# Vercel용 핸들러
def handler(request):
    import uvicorn
    return uvicorn.run(app, host="0.0.0.0", port=8000)










