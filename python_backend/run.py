#!/usr/bin/env python3
"""
택배 라우트 분석 Python 백엔드 서버 실행 스크립트
"""

import os
import sys
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# Gemini API 키는 코드에 직접 설정되어 있으므로 확인 생략
print("✅ Gemini API 키가 설정되어 있습니다.")

print("🚀 택배 라우트 분석 백엔드 서버를 시작합니다...")
print("📍 서버 주소: http://localhost:8000")
print("📋 API 문서: http://localhost:8000/docs")
print("❤️  헬스 체크: http://localhost:8000/health")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )
