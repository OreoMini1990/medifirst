# Vercel에서 구글 로그인 설정 가이드

## 문제 해결

Vercel에서 구글 로그인이 작동하지 않는 경우, 다음 설정을 확인하세요.

## 1. Supabase OAuth 리다이렉트 URL 설정

### Supabase 대시보드에서 설정:

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication → URL Configuration 이동**
   - 왼쪽 메뉴에서 "Authentication" 클릭
   - "URL Configuration" 탭 선택

3. **Redirect URLs 추가**
   - "Redirect URLs" 섹션에 다음 URL들을 추가:
     ```
     https://your-project.vercel.app/auth/callback
     https://your-project.vercel.app/**
     ```
   - `your-project`를 실제 Vercel 프로젝트 이름으로 변경
   - 여러 환경이 있다면 각각 추가:
     ```
     https://your-project.vercel.app/auth/callback
     https://your-project-git-main.vercel.app/auth/callback
     https://your-project-username.vercel.app/auth/callback
     ```

4. **Site URL 설정**
   - "Site URL" 필드에 Vercel 배포 URL 입력:
     ```
     https://your-project.vercel.app
     ```

## 2. Vercel 환경 변수 설정

### Vercel 대시보드에서 설정:

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables 이동**

3. **환경 변수 추가**
   - 다음 환경 변수들을 추가:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
     ```
   - `NEXT_PUBLIC_SITE_URL`은 선택사항이지만, 명시적으로 설정하는 것을 권장합니다.

4. **환경 선택**
   - Production
   - Preview
   - Development
   - 모두 선택하여 저장

5. **재배포**
   - 환경 변수 추가 후 자동으로 재배포되거나
   - 수동으로 "Deployments" 탭에서 최신 배포를 "Redeploy" 클릭

## 3. Google OAuth 설정 확인

### Supabase에서 Google Provider 설정:

1. **Supabase 대시보드 → Authentication → Providers**
2. **Google Provider 활성화**
   - "Enable Google provider" 토글 ON
   - Google Client ID와 Client Secret 입력
   - Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 ID 사용

### Google Cloud Console 설정:

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com
   - 프로젝트 선택

2. **APIs & Services → Credentials**
3. **OAuth 2.0 클라이언트 ID 확인/생성**
4. **승인된 리디렉션 URI 추가**
   - Supabase OAuth 콜백 URL 추가:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - `your-project-ref`는 Supabase 프로젝트 참조 ID입니다.
   - Supabase 대시보드 → Settings → API에서 확인 가능

## 4. 테스트 방법

1. **Vercel 배포 URL 접속**
   - `https://your-project.vercel.app/login`

2. **구글 로그인 버튼 클릭**

3. **예상 동작**
   - Google 로그인 페이지로 리다이렉트
   - 로그인 성공 후 `/auth/callback`으로 리다이렉트
   - 그 다음 홈페이지(`/`)로 리다이렉트

## 5. 문제 해결

### 문제: "redirect_uri_mismatch" 오류
**해결**: Supabase와 Google Cloud Console 모두에 올바른 리다이렉트 URL이 등록되어 있는지 확인

### 문제: 로그인 후 무한 리다이렉트
**해결**: 
- Supabase Site URL이 올바르게 설정되었는지 확인
- 미들웨어가 올바르게 작동하는지 확인

### 문제: 콜백 페이지에서 오류 발생
**해결**:
- Vercel 로그 확인 (Deployments → 최신 배포 → Functions 탭)
- Supabase 환경 변수가 올바르게 설정되었는지 확인

## 6. 디버깅 팁

### 브라우저 콘솔 확인
- F12 → Console 탭에서 오류 메시지 확인
- Network 탭에서 OAuth 요청 확인

### Vercel 로그 확인
- Vercel 대시보드 → Deployments → 최신 배포 → Functions
- `/auth/callback` 함수의 로그 확인

### Supabase 로그 확인
- Supabase 대시보드 → Logs → Auth Logs
- OAuth 관련 로그 확인

## 참고

- `NEXT_PUBLIC_SITE_URL` 환경 변수가 설정되지 않으면 `window.location.origin`을 사용합니다.
- Vercel Preview 배포의 경우 동적 URL이 생성되므로, Supabase에서 와일드카드(`**`)를 사용하는 것이 좋습니다.



