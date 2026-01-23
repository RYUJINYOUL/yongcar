from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import json
import base64
from typing import List, Dict, Any
import google.generativeai as genai
from PIL import Image
import io
import re

app = FastAPI(title="Route Analyzer Backend")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API 키 설정
GEMINI_API_KEY = "AIzaSyDsDYnMtzsBZwD1zosmbSLQopT2NsO_J5M"
genai.configure(api_key=GEMINI_API_KEY)

class AnalysisRequest(BaseModel):
    imageBase64: str
    imageMimeType: str
    cafeText: str

class LocationInfo(BaseModel):
    name: str
    address: str
    coordinates: Dict[str, float]

class AnalysisInfo(BaseModel):
    areaType: str
    population: str
    businessDensity: str
    accessibility: str
    competition: str

class RevenueInfo(BaseModel):
    dailyEstimate: int
    monthlyEstimate: int
    factors: List[str]

class MarkerInfo(BaseModel):
    lat: float
    lng: float
    title: str
    type: str

class AnalysisResponse(BaseModel):
    location: LocationInfo
    analysis: AnalysisInfo
    revenue: RevenueInfo
    recommendations: List[str]
    markers: List[MarkerInfo]

def extract_location_from_image(image_base64: str, image_mime_type: str) -> Dict[str, Any]:
    """Gemini Vision API를 사용하여 지도 이미지에서 위치 정보 추출"""
    try:
        # Gemini 모델 초기화
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Base64 이미지를 디코딩하여 PIL Image로 변환
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        prompt = """이 네이버 지도 캡처 이미지를 분석해서 다음 정보를 JSON 형태로 추출해주세요:
        1. 지역명 (동/구 단위)
        2. 주소 정보
        3. 대략적인 좌표 (위도, 경도)
        4. 주변 상권 정보 (카페, 상점 등)
        5. 교통 접근성
        6. 주거/상업 지역 구분
        
        응답 형식:
        {
            "location": {
                "name": "지역명",
                "address": "상세주소",
                "coordinates": {"lat": 위도, "lng": 경도}
            },
            "businessInfo": {
                "cafes": ["카페1", "카페2"],
                "stores": ["상점1", "상점2"],
                "landmarks": ["건물1", "건물2"]
            },
            "accessibility": "교통 접근성 설명",
            "areaType": "주거지역/상업지역/혼합지역"
        }"""
        
        response = model.generate_content([prompt, image])
        content = response.text
        
        # JSON 추출
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            raise ValueError("JSON 형태의 응답을 찾을 수 없습니다.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 분석 오류: {str(e)}")

def analyze_cafe_text(cafe_text: str) -> Dict[str, Any]:
    """카페 글에서 가격 정보와 지역 특성 분석"""
    try:
        # Gemini 모델 초기화
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = f"""당신은 택배 배송 전문가입니다. 다음 카페 글을 분석해서 JSON 형태로 정보를 추출해주세요:

{cafe_text}

분석할 내용:
1. 메뉴 가격대 (저가/중가/고가)
2. 지역 경제 수준 추정
3. 택배 수요 예상 (높음/보통/낮음)
4. 경쟁 업체 정보
5. 고객층 분석

응답 형식:
{{
    "priceRange": "가격대",
    "economicLevel": "경제수준",
    "deliveryDemand": "수요예상",
    "customerType": "고객층",
    "competitionLevel": "경쟁정도",
    "priceAnalysis": "가격분석상세"
}}"""
        
        response = model.generate_content(prompt)
        content = response.text
        
        # JSON 추출
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            raise ValueError("JSON 형태의 응답을 찾을 수 없습니다.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"텍스트 분석 오류: {str(e)}")

def calculate_revenue_estimate(location_data: Dict, cafe_data: Dict) -> Dict[str, Any]:
    """위치와 카페 데이터를 기반으로 수익 예상 계산"""
    
    # 기본 수익 계산 로직
    base_daily_revenue = 50000  # 기본 일일 수익
    
    # 지역 특성에 따른 가중치
    area_multiplier = 1.0
    if location_data.get("areaType") == "상업지역":
        area_multiplier = 1.5
    elif location_data.get("areaType") == "혼합지역":
        area_multiplier = 1.3
    
    # 가격대에 따른 가중치
    price_multiplier = 1.0
    if cafe_data.get("economicLevel") == "고소득":
        price_multiplier = 1.4
    elif cafe_data.get("economicLevel") == "중간소득":
        price_multiplier = 1.2
    
    # 수요에 따른 가중치
    demand_multiplier = 1.0
    if cafe_data.get("deliveryDemand") == "높음":
        demand_multiplier = 1.3
    elif cafe_data.get("deliveryDemand") == "보통":
        demand_multiplier = 1.1
    
    # 최종 수익 계산
    daily_estimate = int(base_daily_revenue * area_multiplier * price_multiplier * demand_multiplier)
    monthly_estimate = daily_estimate * 30
    
    # 수익 영향 요인
    factors = []
    if area_multiplier > 1.2:
        factors.append("상업지역으로 높은 배송 수요 예상")
    if price_multiplier > 1.2:
        factors.append("고소득층 지역으로 프리미엄 배송 가능")
    if demand_multiplier > 1.2:
        factors.append("카페/음식점 밀집으로 배송 주문 증가")
    
    return {
        "dailyEstimate": daily_estimate,
        "monthlyEstimate": monthly_estimate,
        "factors": factors
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_route(request: AnalysisRequest):
    """메인 분석 엔드포인트"""
    try:
        # 1. 이미지에서 위치 정보 추출
        location_data = extract_location_from_image(request.imageBase64, request.imageMimeType)
        
        # 2. 카페 텍스트 분석
        cafe_data = analyze_cafe_text(request.cafeText)
        
        # 3. 수익 예상 계산
        revenue_data = calculate_revenue_estimate(location_data, cafe_data)
        
        # 4. 추천 사항 생성
        recommendations = []
        if cafe_data.get("deliveryDemand") == "높음":
            recommendations.append("높은 배송 수요로 인한 수익성 우수")
        if location_data.get("areaType") == "상업지역":
            recommendations.append("상업지역 특성상 점심/저녁 시간대 집중 배송 권장")
        if cafe_data.get("competitionLevel") == "낮음":
            recommendations.append("경쟁이 적어 시장 진입 기회 양호")
        
        recommendations.extend([
            "주말보다 평일 배송량이 많을 것으로 예상",
            "카페 밀집 지역으로 음료 배송 특화 고려",
            "점심시간(11-14시) 배송 집중 예상"
        ])
        
        # 5. 마커 정보 생성 (샘플)
        markers = []
        if location_data.get("businessInfo", {}).get("cafes"):
            for i, cafe in enumerate(location_data["businessInfo"]["cafes"][:3]):
                markers.append({
                    "lat": location_data["location"]["coordinates"]["lat"] + (i * 0.001),
                    "lng": location_data["location"]["coordinates"]["lng"] + (i * 0.001),
                    "title": cafe,
                    "type": "cafe"
                })
        
        # 응답 구성
        response = AnalysisResponse(
            location=LocationInfo(
                name=location_data["location"]["name"],
                address=location_data["location"]["address"],
                coordinates=location_data["location"]["coordinates"]
            ),
            analysis=AnalysisInfo(
                areaType=location_data.get("areaType", "혼합지역"),
                population="중간 밀도",
                businessDensity="높음" if len(location_data.get("businessInfo", {}).get("cafes", [])) > 3 else "보통",
                accessibility=location_data.get("accessibility", "양호"),
                competition=cafe_data.get("competitionLevel", "보통")
            ),
            revenue=RevenueInfo(
                dailyEstimate=revenue_data["dailyEstimate"],
                monthlyEstimate=revenue_data["monthlyEstimate"],
                factors=revenue_data["factors"]
            ),
            recommendations=recommendations,
            markers=markers
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 처리 오류: {str(e)}")

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "message": "Route Analyzer Backend is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
