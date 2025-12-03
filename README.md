# MediFirst - 1차의료 종합커뮤니티

1차의료기관(의원급) 종사자를 위한 통합 커뮤니티 플랫폼입니다.

## 주요 기능

- **커뮤니티**: 직역별 커뮤니티, 자유게시판, 질문게시판
- **개원·경영**: 개원 정보, 경영 노하우, 법률·세무 상담
- **구인·구직**: 1차의료기관 채용공고 및 인재 정보
- **아카데미**: 진료 강의, 심사청구 강의, 세미나 (준비 중)
- **심사청구**: 심사청구 Q&A, 고시·공지 (준비 중)

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 데이터베이스 설정

Supabase 대시보드에서 SQL Editor를 열고 `supabase/schema.sql` 파일의 내용을 실행하세요.

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
medifirst/
├── app/                    # Next.js App Router 페이지
│   ├── community/         # 커뮤니티 페이지
│   ├── startup/           # 개원·경영 페이지
│   ├── jobs/              # 구인·구직 페이지
│   ├── academy/           # 아카데미 페이지
│   ├── claims/            # 심사청구 페이지
│   ├── login/             # 로그인 페이지
│   └── signup/            # 회원가입 페이지
├── components/            # React 컴포넌트
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── community/         # 커뮤니티 컴포넌트
│   └── startup/           # 개원·경영 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   └── supabase/          # Supabase 클라이언트
├── types/                 # TypeScript 타입 정의
└── supabase/              # 데이터베이스 스키마
    └── schema.sql         # SQL 스키마
```

## 데이터베이스 스키마

주요 테이블:
- `profiles`: 사용자 프로필
- `posts`: 게시글 (커뮤니티, 개원·경영 등)
- `comments`: 댓글
- `jobs`: 채용공고
- `resumes`: 이력서

자세한 스키마는 `supabase/schema.sql`을 참고하세요.

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
