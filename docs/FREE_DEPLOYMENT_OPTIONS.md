# 무료 배포 옵션 가이드

Vercel 외에도 여러 무료 배포 옵션이 있습니다. 각각의 장단점과 배포 방법을 안내합니다.

## 1. Netlify (추천 ⭐)

### 장점
- Vercel과 유사한 사용성
- 무료 플랜: 100GB 대역폭, 300분 빌드 시간/월
- 자동 HTTPS, CDN 제공
- GitHub 연동 자동 배포

### 배포 방법

#### 방법 1: 웹 인터페이스
1. https://app.netlify.com 접속
2. GitHub 계정으로 로그인
3. "Add new site" → "Import an existing project"
4. GitHub 저장소 선택
5. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. "Deploy site" 클릭

#### 방법 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 주의사항
- Next.js는 Netlify Functions를 사용해야 함
- `netlify.toml` 설정 파일 필요할 수 있음

---

## 2. Render (추천 ⭐⭐)

### 장점
- 완전 무료 플랜 (제한적)
- Docker 지원
- 자동 HTTPS
- 쉬운 설정

### 배포 방법

1. https://render.com 접속
2. GitHub 계정으로 로그인
3. "New +" → "Web Service"
4. GitHub 저장소 선택
5. 설정:
   - Name: `medifirst`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free
6. 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. "Create Web Service" 클릭

### 주의사항
- 무료 플랜은 15분 비활성 시 슬리프 모드
- 첫 요청 시 깨어나는데 시간 소요 (약 30초)

---

## 3. Railway

### 장점
- $5 무료 크레딧/월
- 매우 쉬운 설정
- 자동 HTTPS
- 실시간 로그

### 배포 방법

1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. "New Project" → "Deploy from GitHub repo"
4. 저장소 선택
5. 자동 감지 (Next.js)
6. 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. 자동 배포 시작

### 주의사항
- 무료 크레딧 소진 시 결제 필요
- 크레딧은 매월 리셋

---

## 4. Cloudflare Pages

### 장점
- 무제한 대역폭 (무료)
- 빠른 CDN
- 자동 HTTPS

### 배포 방법

1. https://dash.cloudflare.com 접속
2. "Workers & Pages" → "Create application" → "Pages"
3. "Connect to Git"
4. GitHub 저장소 선택
5. 빌드 설정:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
6. 환경 변수 추가
7. "Save and Deploy"

### 주의사항
- Next.js 서버 기능은 Cloudflare Workers 필요
- 일부 Next.js 기능 제한 가능

---

## 5. Fly.io

### 장점
- 무료 플랜: 3개 VM, 3GB 공유 RAM
- 전 세계 배포
- Docker 기반

### 배포 방법

1. https://fly.io 접속
2. GitHub 계정으로 로그인
3. "Launch App" → GitHub 저장소 선택
4. 자동 설정 또는 수동 설정:
   ```bash
   flyctl launch
   ```
5. 환경 변수 설정:
   ```bash
   flyctl secrets set NEXT_PUBLIC_SUPABASE_URL=your_url
   flyctl secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
6. 배포:
   ```bash
   flyctl deploy
   ```

---

## 6. GitHub Codespaces + ngrok (임시 데모용)

### 장점
- 완전 무료 (개인 계정)
- 빠른 설정
- 임시 데모에 적합

### 배포 방법

1. GitHub Codespaces에서 프로젝트 열기
2. 터미널에서:
   ```bash
   npm install
   npm run dev
   ```
3. 다른 터미널에서 ngrok 설치 및 실행:
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```
4. ngrok이 제공하는 URL 사용 (예: `https://abc123.ngrok.io`)

### 주의사항
- Codespaces 종료 시 접속 불가
- ngrok 무료 플랜은 세션당 2시간 제한
- URL이 매번 변경됨

---

## 비교표

| 플랫폼 | 무료 플랜 | 설정 난이도 | 추천도 |
|--------|----------|------------|--------|
| **Render** | ✅ 제한적 | ⭐⭐ 쉬움 | ⭐⭐⭐ |
| **Railway** | ✅ $5/월 크레딧 | ⭐ 매우 쉬움 | ⭐⭐⭐ |
| **Netlify** | ✅ 100GB/월 | ⭐⭐ 쉬움 | ⭐⭐ |
| **Cloudflare Pages** | ✅ 무제한 | ⭐⭐ 보통 | ⭐⭐ |
| **Fly.io** | ✅ 3GB RAM | ⭐⭐⭐ 보통 | ⭐⭐ |
| **ngrok** | ✅ 임시 | ⭐ 매우 쉬움 | ⭐ (임시용) |

---

## 추천 순서

1. **Render** - 가장 간단하고 무료 플랜이 좋음
2. **Railway** - 설정이 매우 쉬움 (크레딧 사용)
3. **Netlify** - Vercel과 유사한 경험

---

## 공통 설정 사항

모든 플랫폼에서 필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase 설정:
- Authentication → URL Configuration에서 배포 URL 추가
- Redirect URLs에 `https://your-domain.com/auth/callback` 추가

