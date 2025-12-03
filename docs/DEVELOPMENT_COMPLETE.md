# MediFirst 개발 완료 문서

## 📋 프로젝트 개요

**프로젝트명**: MediFirst - 1차의료 종합커뮤니티  
**개발 기간**: 2024년 12월  
**버전**: 1.0.0 (MVP)  
**목적**: 1차의료기관(의원급) 종사자를 위한 통합 커뮤니티 플랫폼

### 프로젝트 목표

기존에 직역별로 분리되어 있던 의료진 커뮤니티를 통합하여, 1차의료기관 종사자들이 한 곳에서 소통하고 정보를 공유할 수 있는 플랫폼을 제공합니다.

---

## 🛠 기술 스택

### 프론트엔드
- **Framework**: Next.js 16.0.6 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.x
- **Component Library**: shadcn/ui (New York 스타일)
- **Icons**: Lucide React

### 백엔드 & 데이터베이스
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (향후 사용)
- **API**: Supabase REST API

### 개발 도구
- **Package Manager**: npm
- **Code Quality**: ESLint
- **Version Control**: Git

---

## 📁 프로젝트 구조

```
medifirst/
├── app/                          # Next.js App Router 페이지
│   ├── (auth)/                   # 인증 관련 페이지
│   │   ├── login/               # 로그인 페이지
│   │   └── signup/              # 회원가입 페이지
│   ├── auth/                     # OAuth 콜백 처리
│   │   └── callback/            # OAuth 콜백 라우트
│   ├── community/                # 커뮤니티 페이지
│   │   ├── page.tsx             # 커뮤니티 메인 (탭 UI)
│   │   └── role/                # 직역별 커뮤니티
│   │       ├── [id]/            # 게시글 상세
│   │       └── new/             # 글쓰기
│   ├── startup/                  # 개원·경영 페이지
│   │   └── page.tsx             # 개원·경영 메인 (탭 UI)
│   ├── jobs/                     # 구인·구직 페이지
│   │   └── page.tsx             # 채용공고 리스트
│   ├── academy/                  # 아카데미 페이지 (준비 중)
│   ├── claims/                   # 심사청구 페이지 (준비 중)
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지
│   └── globals.css               # 전역 스타일
│
├── components/                   # React 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ... (기타 UI 컴포넌트)
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Header.tsx            # 상단 헤더 (데스크톱)
│   │   └── MobileNav.tsx         # 모바일 네비게이션
│   ├── community/                # 커뮤니티 컴포넌트
│   │   ├── RoleCommunity.tsx    # 직역별 커뮤니티
│   │   ├── FreeBoard.tsx        # 자유게시판
│   │   └── QABoard.tsx          # 질문게시판
│   └── startup/                  # 개원·경영 컴포넌트
│       └── StartupBoard.tsx     # 개원·경영 게시판
│
├── lib/                          # 유틸리티 및 설정
│   ├── supabase/                 # Supabase 클라이언트
│   │   ├── client.ts             # 브라우저 클라이언트
│   │   ├── server.ts             # 서버 클라이언트
│   │   └── middleware.ts         # 미들웨어 헬퍼
│   └── utils.ts                  # 공통 유틸리티
│
├── types/                        # TypeScript 타입 정의
│   └── database.ts               # 데이터베이스 타입
│
├── supabase/                     # 데이터베이스 스키마
│   └── schema.sql                # SQL 스키마 파일
│
├── docs/                         # 문서
│   ├── GOOGLE_OAUTH_SETUP.md     # 구글 OAuth 설정 가이드
│   └── DEVELOPMENT_COMPLETE.md   # 개발 완료 문서 (본 문서)
│
├── middleware.ts                 # Next.js 미들웨어 (인증 처리)
├── next.config.ts                # Next.js 설정
├── tailwind.config.ts            # Tailwind CSS 설정
├── tsconfig.json                 # TypeScript 설정
├── components.json               # shadcn/ui 설정
├── package.json                  # 프로젝트 의존성
└── README.md                     # 프로젝트 README
```

---

## ✨ 구현된 기능

### 1. 인증 시스템 ✅

#### 이메일/비밀번호 로그인
- 이메일과 비밀번호를 사용한 기본 로그인
- 회원가입 시 프로필 자동 생성
- 비밀번호 최소 길이 검증 (6자 이상)

#### 구글 OAuth 로그인
- Google OAuth 2.0을 통한 소셜 로그인
- OAuth 콜백 자동 처리
- 구글 로그인 시 프로필 자동 생성

#### 인증 보호
- 미들웨어를 통한 페이지 접근 제어
- 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트
- 세션 자동 갱신

### 2. 커뮤니티 기능 ✅

#### 직역별 커뮤니티
- 의사, 간호사, 간호조무사, 물리치료사, 방사선사, 행정·원무 직역별 게시판
- 직역 필터링 기능
- 게시글 작성, 조회, 댓글 기능

#### 자유게시판
- 진료이야기, 심사청구, 개원·경영, CS, HR, 잡담 카테고리
- 자유로운 정보 공유

#### 질문게시판
- 진료질문, 심사청구질문, 원무/행정질문, 개원질문
- 질문/답변 형식의 게시판

### 3. 개원·경영 게시판 ✅

10개 카테고리로 구성된 전문 게시판:
- 전체
- 개원입지
- 대출
- 인테리어
- 법률
- 노무
- 세무
- 병원홍보
- 의료기기·IT
- 네트워크
- 운영지원

탭 UI를 통한 직관적인 카테고리 탐색

### 4. 구인·구직 기능 ✅

- 채용공고 리스트 조회
- 직종, 지역, 근무형태, 급여 정보 표시
- 병원명 및 연락처 정보

### 5. 레이아웃 및 네비게이션 ✅

#### 반응형 디자인
- 데스크톱: 상단 가로 네비게이션 메뉴
- 모바일: 햄버거 메뉴 (Sheet 컴포넌트)

#### 공통 컴포넌트
- 헤더: 로고, 네비게이션, 사용자 프로필 드롭다운
- 모바일 네비게이션: 사이드 메뉴

### 6. 데이터베이스 스키마 ✅

#### 주요 테이블
- `profiles`: 사용자 프로필 정보
- `posts`: 게시글 (커뮤니티, 개원·경영 등 통합)
- `comments`: 댓글
- `jobs`: 채용공고
- `resumes`: 이력서 (구조만 준비)

#### 보안
- Row Level Security (RLS) 정책 적용
- 사용자별 데이터 접근 제어

---

## 🚀 설치 및 실행 방법

### 필수 요구사항
- Node.js 18.x 이상
- npm 또는 yarn
- Supabase 계정

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 설정

1. Supabase 대시보드 접속
2. SQL Editor 열기
3. `supabase/schema.sql` 파일의 내용 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 구글 OAuth 설정 (선택사항)

구글 로그인을 사용하려면 `docs/GOOGLE_OAUTH_SETUP.md` 참고

---

## 📊 데이터베이스 스키마 상세

### profiles 테이블
```sql
- id (UUID, PK) - auth.users.id와 동일
- email (TEXT)
- display_name (TEXT, nullable)
- role (TEXT) - 'doctor' | 'nurse' | 'assistant' | 'pt' | 'rt' | 'admin_staff'
- hospital_name (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)
```

### posts 테이블
```sql
- id (UUID, PK)
- author_id (UUID, FK → profiles.id)
- board (TEXT) - 'community' | 'startup' | 'claims' | 'academy'
- sub_board (TEXT) - 'role' | 'free' | 'qa' (nullable)
- category (TEXT, nullable) - 카테고리별 분류
- title (TEXT)
- content (TEXT)
- is_question (BOOLEAN)
- is_pinned (BOOLEAN)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

### comments 테이블
```sql
- id (UUID, PK)
- post_id (UUID, FK → posts.id)
- author_id (UUID, FK → profiles.id)
- content (TEXT)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

### jobs 테이블
```sql
- id (UUID, PK)
- hospital_id (UUID, FK → profiles.id, nullable)
- title (TEXT)
- position (TEXT) - 직종
- description (TEXT)
- region (TEXT)
- employment_type (TEXT) - 'full_time' | 'part_time' | 'locum'
- salary_range (TEXT, nullable)
- contact (TEXT)
- created_at, updated_at (TIMESTAMP)
```

---

## 🔐 보안 설정

### Row Level Security (RLS) 정책

모든 테이블에 RLS가 활성화되어 있으며, 다음 정책이 적용됩니다:

- **profiles**: 모든 사용자가 조회 가능, 본인만 수정 가능
- **posts**: 삭제되지 않은 게시글만 조회 가능, 작성자만 수정/삭제 가능
- **comments**: 삭제되지 않은 댓글만 조회 가능, 작성자만 수정/삭제 가능
- **jobs**: 모든 사용자가 조회 가능, 작성자만 수정 가능
- **resumes**: 본인 이력서만 조회 가능

---

## 📝 주요 파일 설명

### 인증 관련
- `app/login/page.tsx`: 로그인 페이지 (이메일/구글)
- `app/signup/page.tsx`: 회원가입 페이지 (이메일/구글)
- `app/auth/callback/route.ts`: OAuth 콜백 처리 및 프로필 자동 생성
- `middleware.ts`: 인증 미들웨어 (페이지 접근 제어)

### 커뮤니티 관련
- `app/community/page.tsx`: 커뮤니티 메인 페이지 (탭 UI)
- `components/community/RoleCommunity.tsx`: 직역별 커뮤니티 컴포넌트
- `components/community/FreeBoard.tsx`: 자유게시판 컴포넌트
- `components/community/QABoard.tsx`: 질문게시판 컴포넌트

### 개원·경영 관련
- `app/startup/page.tsx`: 개원·경영 메인 페이지
- `components/startup/StartupBoard.tsx`: 개원·경영 게시판 컴포넌트

### 레이아웃 관련
- `components/layout/Header.tsx`: 상단 헤더 컴포넌트
- `components/layout/MobileNav.tsx`: 모바일 네비게이션 컴포넌트
- `app/layout.tsx`: 루트 레이아웃

---

## 🎨 UI/UX 특징

### 디자인 시스템
- **스타일**: shadcn/ui New York 스타일
- **색상**: 다크 모드 지원 (CSS 변수 기반)
- **타이포그래피**: Geist Sans, Geist Mono 폰트

### 반응형 디자인
- 모바일 우선 설계
- 데스크톱: 최대 너비 컨테이너 사용
- 모바일: 햄버거 메뉴로 네비게이션 접근

### 사용자 경험
- 직관적인 탭 UI로 카테고리 탐색
- 로딩 상태 표시
- 에러 메시지 표시
- 부드러운 페이지 전환

---

## 🔄 향후 개발 계획

### Phase 2 (준비 중)
- [ ] 아카데미 페이지 구현
  - 강의 목록/상세
  - 동영상 플레이어 통합
  - 카테고리별 필터링

- [ ] 심사청구 페이지 구현
  - 최신 고시·공지
  - 이달의 이슈
  - 심사청구 Q&A (일반/VIP)

### Phase 3 (계획)
- [ ] 게시글 작성/수정/삭제 기능 완성
- [ ] 이미지 업로드 기능
- [ ] 검색 기능
- [ ] 알림 시스템
- [ ] 좋아요/북마크 기능
- [ ] 프로필 설정 페이지
- [ ] 관리자 페이지

### Phase 4 (계획)
- [ ] PWA 지원 (웹앱)
- [ ] 푸시 알림
- [ ] 오프라인 지원
- [ ] 성능 최적화

---

## 🐛 알려진 이슈 및 제한사항

### 현재 제한사항
1. **게시글 작성/수정 기능 미완성**
   - 직역별 커뮤니티 글쓰기만 구현됨
   - 자유게시판, 질문게시판, 개원·경영 글쓰기 페이지 필요

2. **이미지 업로드 미지원**
   - 현재 텍스트만 지원
   - Supabase Storage 연동 필요

3. **검색 기능 없음**
   - 게시글 검색 기능 필요

4. **페이지네이션 없음**
   - 현재 최신 50개만 표시
   - 무한 스크롤 또는 페이지네이션 필요

### 알려진 이슈
- Next.js 16에서 `middleware.ts` 파일에 대한 deprecation 경고 (기능상 문제 없음)

---

## 📚 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

## 👥 개발 정보

### 개발 환경
- **개발 도구**: Cursor IDE
- **버전 관리**: Git
- **배포**: 준비 중 (Vercel 권장)

### 코드 스타일
- TypeScript strict mode 활성화
- ESLint 규칙 준수
- Prettier 포맷팅 (권장)

---

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

---

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 버그 리포트는 프로젝트 관리자에게 연락해주세요.

---

**문서 작성일**: 2024년 12월  
**최종 업데이트**: 2024년 12월

