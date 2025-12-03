# 임시 배포 가이드

## 가장 빠른 방법: localtunnel

### 1. localtunnel 설치 (한 번만)
```powershell
npm install -g localtunnel
```

### 2. 개발 서버 시작
터미널 1에서:
```powershell
npm run dev
```

### 3. 터널 생성
터미널 2에서:
```powershell
lt --port 3000
```

또는 간단한 스크립트 사용:
```powershell
.\start-tunnel-simple.ps1
```

### 4. 외부 URL 확인
터미널에 표시되는 URL 예시:
```
your url is: https://random-name.loca.lt
```

이 URL을 외부에서 접속할 수 있습니다!

## 커스텀 서브도메인 사용
```powershell
lt --port 3000 --subdomain medifirst
```
→ `https://medifirst.loca.lt` 사용 가능

## 비밀번호 설정 (선택사항)

터널에 비밀번호를 설정하려면:
```powershell
lt --port 3000 --subdomain medifirst --local-host localhost
```

또는 환경 변수로 설정:
```powershell
$env:LT_PASSWORD="your-password"
lt --port 3000
```

비밀번호 없이 사용하려면 (기본값):
```powershell
lt --port 3000
```

## 주의사항
- 개발 서버가 실행 중이어야 함
- 컴퓨터를 끄면 접속 불가
- Ctrl+C로 터널 종료

