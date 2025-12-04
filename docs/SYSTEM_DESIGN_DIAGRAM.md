# MediFirst 시스템 설계도

## 1. 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Application                          │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Pages      │  │ Components   │  │   Layout     │  │   │
│  │  │              │  │              │  │              │  │   │
│  │  │ - Community  │  │ - PostList   │  │ - Header     │  │   │
│  │  │ - Jobs       │  │ - Comment    │  │ - MobileNav  │  │   │
│  │  │ - Claims     │  │ - Pagination │  │              │  │   │
│  │  │ - Startup    │  │              │  │              │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │         Supabase Client (Client-side)            │   │   │
│  │  │  - Authentication                                │   │   │
│  │  │  - Database Queries                              │   │   │
│  │  │  - Real-time Subscriptions                       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Middleware                          │   │
│  │  - Session Management                                    │   │
│  │  - Authentication Check                                  │   │
│  │  - Onboarding Redirect                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Platform                          │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Auth Service   │  │   REST API       │  │  PostgreSQL  │  │
│  │                  │  │                  │  │  Database   │  │
│  │ - Email/Password │  │ - CRUD Operations│  │              │  │
│  │ - OAuth (Google) │  │ - Row Level      │  │ - profiles   │  │
│  │ - Session Mgmt   │  │   Security       │  │ - posts      │  │
│  └──────────────────┘  └──────────────────┘  │ - comments  │  │
│                                                 │ - jobs      │  │
│                                                 │ - resumes   │  │
│                                                 └──────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS) Policies                 │  │
│  │  - Profile Access Control                                │  │
│  │  - Post Access Control                                   │  │
│  │  - Comment Access Control                                │  │
│  │  - Job Access Control                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 데이터 흐름도 (Data Flow)

### 2.1 사용자 인증 흐름

```
User → Login Page → Supabase Auth → Session Created
                                    ↓
                              Profile Check
                                    ↓
                        [Profile exists?]
                         /            \
                       Yes            No
                        ↓              ↓
                   Home Page    Onboarding Page
                                    ↓
                              Profile Created
                                    ↓
                               Home Page
```

### 2.2 게시글 작성 흐름

```
User → Write Post → Form Validation → Supabase Insert
                                        ↓
                                  RLS Policy Check
                                        ↓
                                  [Authorized?]
                                   /         \
                                 Yes         No
                                  ↓           ↓
                            Post Created   Error
                                  ↓
                            Redirect to Detail
```

### 2.3 게시글 조회 흐름

```
User → Community Page → Fetch Posts → Supabase Query
                                        ↓
                                  RLS Policy Check
                                        ↓
                                  [Accessible?]
                                   /         \
                                 Yes         No
                                  ↓           ↓
                            Return Posts   Empty/Error
                                  ↓
                            Display Posts
```

## 3. 컴포넌트 계층 구조

```
App (Root)
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   └── MobileNav
│
├── HomePage
│   ├── HeroSection
│   ├── FeaturesSection
│   ├── StatsSection
│   └── CTASection
│
├── CommunityPage
│   ├── Tabs
│   │   ├── AllPostsBoard
│   │   │   └── PostListItem[]
│   │   ├── RoleCommunity
│   │   │   ├── SearchBar
│   │   │   ├── PostListItem[]
│   │   │   └── Pagination
│   │   ├── FreeBoard
│   │   │   ├── SearchBar
│   │   │   ├── PostListItem[]
│   │   │   └── Pagination
│   │   └── QABoard
│   │       ├── SearchBar
│   │       ├── PostListItem[]
│   │       └── Pagination
│   └── PostDetailPage
│       ├── PostHeader
│       ├── PostContent
│       ├── PostMeta
│       ├── NavigationButtons
│       ├── CommentForm
│       ├── CommentList
│       │   └── CommentItem[]
│       └── RelatedPosts
│
├── JobsPage
│   ├── Tabs (Recruit/Resume)
│   └── Tabs (Doctor/Medical Staff)
│       ├── DoctorJobsBoard
│       │   ├── RegionFilter
│       │   ├── SearchBar
│       │   ├── JobListItem[]
│       │   └── Pagination
│       └── OtherJobsBoard
│           ├── PositionFilter
│           ├── RegionFilter
│           ├── SearchBar
│           ├── JobListItem[]
│           └── Pagination
│
└── ClaimsPage
    ├── Tabs
    │   ├── NoticeBoard
    │   │   ├── PostListItem[]
    │   │   └── Pagination
    │   └── QABoard
    │       ├── PostListItem[]
    │       └── Pagination
    └── PostDetailPage
```

## 4. 데이터베이스 관계도 (ERD)

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│                 │
│ - id            │
│ - email         │
│ - user_metadata │
└────────┬────────┘
         │ 1:1
         │
┌────────▼────────┐
│    profiles     │
│                 │
│ - id (PK, FK)   │◄─────┐
│ - email         │      │
│ - display_name  │      │
│ - role          │      │
│ - workplace_name│      │
│ - created_at    │      │
│ - updated_at    │      │
└────────┬────────┘      │
         │ 1:N           │
         │                │
┌────────▼────────┐      │
│     posts       │      │
│                 │      │
│ - id (PK)       │      │
│ - author_id(FK) ├──────┘
│ - board         │
│ - sub_board     │
│ - category      │
│ - title         │
│ - content       │
│ - is_question   │
│ - is_pinned     │
│ - view_count    │
│ - created_at    │
│ - updated_at    │
│ - deleted_at    │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│    comments     │
│                 │
│ - id (PK)       │
│ - post_id (FK)  │
│ - author_id(FK) ├──────┐
│ - content       │      │
│ - created_at    │      │
│ - updated_at    │      │
│ - deleted_at    │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│      jobs       │      │
│                 │      │
│ - id (PK)       │      │
│ - hospital_id(FK)├──────┘
│ - title         │
│ - position      │
│ - description   │
│ - region        │
│ - employment_type│
│ - salary_range  │
│ - contact       │
│ - created_at    │
│ - updated_at    │
└─────────────────┘
```

## 5. 인증 및 권한 흐름도

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication Flow                  │
└─────────────────────────────────────────────────────────┘

User Action
    │
    ├─→ Email/Password Login
    │       │
    │       ├─→ Supabase Auth
    │       │       │
    │       │       ├─→ Success → Session Created
    │       │       └─→ Failure → Error Message
    │       │
    │       └─→ Profile Check
    │               │
    │               ├─→ Exists → Home
    │               └─→ Not Exists → Onboarding
    │
    └─→ Google OAuth Login
            │
            ├─→ Google OAuth
            │       │
            │       └─→ Callback Handler
            │               │
            │               ├─→ Profile Check
            │               │       │
            │               │       ├─→ Exists → Home
            │               │       └─→ Not Exists → Create Profile → Onboarding
            │               │
            │               └─→ Session Created
            │
            └─→ Home Page

┌─────────────────────────────────────────────────────────┐
│                    Authorization Flow                    │
└─────────────────────────────────────────────────────────┘

Page Access
    │
    ├─→ Middleware Check
    │       │
    │       ├─→ Authenticated?
    │       │       │
    │       │       ├─→ No → Redirect to Login
    │       │       └─→ Yes → Continue
    │       │
    │       └─→ Onboarding Complete?
    │               │
    │               ├─→ No → Redirect to Onboarding
    │               └─→ Yes → Continue
    │
    └─→ Page Load
            │
            ├─→ Data Fetch
            │       │
            │       └─→ RLS Policy Check
            │               │
            │               ├─→ Authorized? → Return Data
            │               └─→ Not Authorized → Empty/Error
            │
            └─→ Render Page
```

## 6. 페이지 라우팅 구조

```
/ (Home)
├── /login
├── /signup
├── /onboarding
│
├── /community
│   ├── /community?tab=all
│   ├── /community?tab=role
│   ├── /community?tab=free
│   ├── /community?tab=qa
│   │
│   ├── /community/role/[id]
│   ├── /community/role/new
│   ├── /community/role/edit/[id]
│   │
│   ├── /community/free/[id]
│   ├── /community/free/new
│   ├── /community/free/edit/[id]
│   │
│   ├── /community/qa/[id]
│   ├── /community/qa/new
│   └── /community/qa/edit/[id]
│
├── /jobs
│   ├── /jobs?tab=doctor
│   ├── /jobs?tab=other
│   │
│   ├── /jobs/doctor/[id]
│   ├── /jobs/doctor/new
│   └── /jobs/doctor/edit/[id]
│
├── /claims
│   ├── /claims?tab=notice
│   ├── /claims?tab=qa
│   │
│   ├── /claims/notice/[id]
│   ├── /claims/notice/new
│   ├── /claims/notice/edit/[id]
│   │
│   ├── /claims/qa/[id]
│   ├── /claims/qa/new
│   └── /claims/qa/edit/[id]
│
├── /startup
├── /academy
│
└── /auth/callback (OAuth)
```

## 7. 상태 관리 구조

```
Component State (React Hooks)
├── useState
│   ├── UI State (loading, error, etc.)
│   ├── Form State (input values)
│   └── Data State (posts, comments, etc.)
│
├── useEffect
│   ├── Data Fetching
│   ├── Side Effects
│   └── Cleanup
│
└── useCallback
    ├── Memoized Functions
    └── Event Handlers

Server State (Supabase)
├── Real-time Queries
├── Cached Data
└── Optimistic Updates
```

## 8. 보안 계층 구조

```
┌─────────────────────────────────────────┐
│         Client-side Security            │
│                                         │
│  - Input Validation                    │
│  - XSS Prevention                      │
│  - CSRF Protection (Next.js)          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Middleware Security              │
│                                         │
│  - Authentication Check                │
│  - Session Validation                  │
│  - Onboarding Check                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Supabase Security               │
│                                         │
│  - Row Level Security (RLS)            │
│  - Policy-based Access Control         │
│  - Encrypted Connections (HTTPS)       │
└─────────────────────────────────────────┘
```

---

**문서 작성일**: 2024년 12월  
**문서 버전**: 1.0.0



