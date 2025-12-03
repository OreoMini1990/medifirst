# 배포 가이드

## Vercel을 사용한 배포 (권장)

Vercel은 Next.js 제작사에서 만든 플랫폼으로, 가장 쉽고 빠르게 배포할 수 있습니다.

### 1. 사전 준비

#### GitHub 저장소 준비
1. GitHub에 프로젝트를 푸시합니다:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medifirst.git
git push -u origin main
```

### 2. Vercel 배포

#### 방법 1: 웹 인터페이스 사용 (가장 쉬움)

1. **Vercel 가입**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 가져오기**
   - "Add New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **환경 변수 설정**
   - "Environment Variables" 섹션에서 다음 변수 추가:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   - Supabase 대시보드에서 URL과 Anon Key를 복사하여 입력

4. **배포 설정**
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (자동)
   - Output Directory: `.next` (자동)

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 약 2-3분 후 배포 완료
   - 배포된 URL 확인 (예: `https://medifirst.vercel.app`)

#### 방법 2: Vercel CLI 사용

1. **Vercel CLI 설치**
```bash
npm i -g vercel
```

2. **로그인**
```bash
vercel login
```

3. **배포**
```bash
vercel
```

4. **환경 변수 설정**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

5. **프로덕션 배포**
```bash
vercel --prod
```

### 3. 환경 변수 확인

배포 후 다음 환경 변수가 설정되어 있는지 확인:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Supabase 설정 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard

2. **Authentication > URL Configuration**
   - Site URL: Vercel 배포 URL 추가
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback` 추가

3. **API Settings**
   - URL과 Anon Key 확인

### 5. 배포 후 확인사항

- [ ] 홈페이지가 정상적으로 로드되는가?
- [ ] 로그인/회원가입이 작동하는가?
- [ ] Supabase 연결이 정상인가?
- [ ] 이미지/리소스가 정상적으로 로드되는가?

## 다른 배포 옵션

### Netlify
1. https://netlify.com 접속
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포

### Railway
1. https://railway.app 접속
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포

### Render
1. https://render.com 접속
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포

## 문제 해결

### 빌드 에러
- `npm run build` 로컬에서 실행하여 에러 확인
- TypeScript 타입 에러 확인
- 환경 변수 누락 확인

### 런타임 에러
- 브라우저 콘솔 확인
- Vercel 로그 확인
- Supabase 연결 확인

### 환경 변수 문제
- Vercel 대시보드에서 환경 변수 재확인
- `NEXT_PUBLIC_` 접두사 확인
- 재배포 필요

## 빠른 배포 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] Vercel 계정 생성 및 GitHub 연결
- [ ] 환경 변수 설정 완료
- [ ] Supabase URL/Redirect 설정 완료
- [ ] 배포 성공 확인
- [ ] 기능 테스트 완료

