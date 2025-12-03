#!/bin/bash
# MediFirst 임시 배포 스크립트 (Linux/Mac)
# localtunnel을 사용하여 로컬 개발 서버를 외부에 공개

echo "MediFirst 임시 배포 시작..."

# localtunnel 설치 확인
if ! command -v lt &> /dev/null; then
    echo "localtunnel이 설치되어 있지 않습니다. 설치 중..."
    npm install -g localtunnel
fi

# 개발 서버 실행 (백그라운드)
echo "개발 서버 시작 중..."
npm run dev &
DEV_PID=$!

# 서버가 시작될 때까지 대기
echo "서버 시작 대기 중 (5초)..."
sleep 5

# 터널 생성
echo "외부 접속 터널 생성 중..."
echo "터널 URL이 생성되면 외부에서 접속 가능합니다."
echo ""

lt --port 3000

# 스크립트 종료 시 개발 서버도 종료
echo "터널 종료 중..."
kill $DEV_PID

