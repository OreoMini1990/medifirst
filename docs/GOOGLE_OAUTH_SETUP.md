# 구글 OAuth 설정 가이드

MediFirst에서 구글 로그인을 사용하기 위한 Supabase 설정 방법입니다.

## 1. Supabase 대시보드에서 구글 OAuth 설정

### Step 1: Authentication 설정
1. Supabase 대시보드에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **Authentication** 클릭
4. **Providers** 탭 선택

### Step 2: Google Provider 활성화
1. **Google** 프로바이더 찾기
2. **Enable Google provider** 토글 활성화

### Step 3: Google Cloud Console 설정

#### 3-1. Google Cloud Console 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

#### 3-2. OAuth 동의 화면 설정
1. 좌측 메뉴 → **APIs & Services** → **OAuth consent screen**
2. User Type 선택 (외부 사용자)
3. 앱 정보 입력:
   - 앱 이름: MediFirst
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. **저장 후 계속** 클릭

#### 3-3. 범위(Scopes) 설정
1. 기본 범위는 그대로 두고 **저장 후 계속**
2. 테스트 사용자 추가 (선택사항)
3. **저장 후 계속**

#### 3-4. OAuth 클라이언트 ID 생성
1. 좌측 메뉴 → **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth client ID** 선택
3. Application type: **Web application**
4. Name: MediFirst (또는 원하는 이름)
5. **Authorized redirect URIs** 추가:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   - `<your-project-ref>`는 Supabase 프로젝트 URL에서 확인 가능
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
6. **CREATE** 클릭
7. **Client ID**와 **Client Secret** 복사

### Step 4: Supabase에 Google OAuth 정보 입력
1. Supabase 대시보드로 돌아가기
2. **Authentication** → **Providers** → **Google**
3. 다음 정보 입력:
   - **Client ID (for OAuth)**: Google Cloud Console에서 복사한 Client ID
   - **Client Secret (for OAuth)**: Google Cloud Console에서 복사한 Client Secret
4. **Save** 클릭

## 2. Redirect URL 확인

Supabase 대시보드에서:
1. **Authentication** → **URL Configuration**
2. **Redirect URLs**에 다음이 포함되어 있는지 확인:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
   (프로덕션 도메인은 실제 도메인으로 변경)

## 3. 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:3000/login` 접속

3. **구글로 로그인** 버튼 클릭

4. Google 계정 선택 및 권한 승인

5. 자동으로 홈페이지로 리다이렉트되며 로그인 완료

## 문제 해결

### "redirect_uri_mismatch" 오류
- Google Cloud Console의 **Authorized redirect URIs**에 Supabase 콜백 URL이 정확히 입력되었는지 확인
- URL 끝에 슬래시(`/`)가 있으면 제거

### 프로필이 생성되지 않음
- `app/auth/callback/route.ts` 파일이 올바르게 생성되었는지 확인
- Supabase 데이터베이스의 `profiles` 테이블에 RLS 정책이 올바르게 설정되었는지 확인

### 로그인 후 홈페이지로 리다이렉트되지 않음
- `.env.local` 파일의 `NEXT_PUBLIC_SUPABASE_URL`이 올바른지 확인
- 브라우저 콘솔에서 오류 메시지 확인

## 참고 자료

- [Supabase Google OAuth 문서](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)

