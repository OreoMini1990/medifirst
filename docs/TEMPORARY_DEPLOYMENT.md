# 임시 배포 방법 (계정 불필요)

계정 생성 없이 로컬 개발 서버를 외부에 공개하는 방법들입니다.

## 1. localtunnel (추천 ⭐ - 계정 불필요)

### 설치 및 사용

```bash
# 설치
npm install -g localtunnel

# 개발 서버 실행 (다른 터미널)
npm run dev

# 터널 생성
lt --port 3000
```

또는 커스텀 서브도메인:
```bash
lt --port 3000 --subdomain medifirst
```

### 장점
- 계정 불필요
- 즉시 사용 가능
- 무료

### 단점
- URL이 매번 변경됨 (서브도메인 사용 시 일정 기간 유지)
- 세션 종료 시 접속 불가

---

## 2. serveo (SSH 기반, 계정 불필요)

### 사용 방법

```bash
# 개발 서버 실행 (다른 터미널)
npm run dev

# SSH 터널 생성
ssh -R 80:localhost:3000 serveo.net
```

또는 커스텀 서브도메인:
```bash
ssh -R medifirst:80:localhost:3000 serveo.net
```

### 장점
- 계정 불필요
- SSH만 있으면 됨
- 커스텀 서브도메인 가능

### 단점
- SSH 클라이언트 필요
- Windows에서는 추가 설정 필요할 수 있음

---

## 3. Cloudflare Tunnel (cloudflared)

### 설치 및 사용

```bash
# 설치 (Windows)
# https://github.com/cloudflare/cloudflared/releases 에서 다운로드
# 또는 Chocolatey: choco install cloudflared

# 개발 서버 실행 (다른 터미널)
npm run dev

# 터널 생성
cloudflared tunnel --url http://localhost:3000
```

### 장점
- Cloudflare의 빠른 네트워크
- 계정 불필요 (기본 사용)
- 안정적

### 단점
- URL이 매번 변경됨

---

## 4. ngrok (계정 필요하지만 무료)

### 빠른 설정

1. https://dashboard.ngrok.com/signup 에서 계정 생성
2. authtoken 복사
3. 설정:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

4. 사용:
```bash
# 개발 서버 실행 (다른 터미널)
npm run dev

# 터널 생성
ngrok http 3000
```

### 장점
- 안정적이고 빠름
- 웹 대시보드 제공
- 요청 로그 확인 가능

---

## 5. PowerShell 스크립트 (로컬 개발 서버 + localtunnel 자동화)

`start-tunnel.ps1` 파일 생성:

```powershell
# 개발 서버와 터널을 동시에 실행
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Start-Sleep -Seconds 5
lt --port 3000
```

사용:
```powershell
.\start-tunnel.ps1
```

---

## 추천 순서

1. **localtunnel** - 가장 간단, 계정 불필요
2. **Cloudflare Tunnel** - 빠르고 안정적
3. **ngrok** - 가장 안정적 (계정 필요)

---

## 주의사항

- 모든 방법은 로컬 개발 서버가 실행 중이어야 함
- 컴퓨터를 끄면 접속 불가
- HTTPS는 자동 제공됨 (대부분의 터널 서비스)

