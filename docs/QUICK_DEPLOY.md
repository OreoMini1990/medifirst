# 빠른 배포 가이드 (5분 안에 배포하기)

## 가장 빠른 방법: Vercel + GitHub

### 1단계: GitHub에 코드 푸시 (2분)

터미널에서 실행:

```bash
# Git 초기화 (이미 되어있다면 생략)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Ready for deployment"

# GitHub에 새 저장소 생성 후:
git remote add origin https://github.com/YOUR_USERNAME/medifirst.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel 배포 (3분)

1. **https://vercel.com 접속**
   - "Sign Up" 클릭
   - GitHub 계정으로 로그인

2. **프로젝트 가져오기**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **환경 변수 추가**
   - "Environment Variables" 섹션 클릭
   - 다음 두 개 추가:
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
       Value: (Supabase 대시보드에서 복사)
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       Value: (Supabase 대시보드에서 복사)

4. **배포 시작**
   - "Deploy" 버튼 클릭
   - 2-3분 대기

5. **완료!**
   - 배포 완료 후 URL 확인 (예: `https://medifirst-xxx.vercel.app`)
   - 이 URL을 외부에서 접속 가능합니다!

### 3단계: Supabase 설정 (1분)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard

2. **Authentication → URL Configuration**
   - Site URL: Vercel 배포 URL 입력
   - Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback` 추가

3. **저장**

## 배포 완료!

이제 외부에서 접속 가능한 URL이 생성되었습니다.

### 다음 단계
- [ ] 도메인 연결 (선택사항)
- [ ] 커스텀 도메인 설정
- [ ] SSL 인증서 자동 설정 (Vercel이 자동 처리)

## 문제 발생 시

**빌드 실패**
- Vercel 로그 확인
- 로컬에서 `npm run build` 실행하여 에러 확인

**환경 변수 오류**
- Vercel 대시보드에서 환경 변수 재확인
- 재배포 필요

**Supabase 연결 오류**
- Supabase 대시보드에서 URL 설정 확인
- Redirect URL 확인

