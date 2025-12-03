# 온보딩 기능 구현 완료 문서

## 개요

회원가입 시 **직업(role)**과 **근무지(workplace_name)**를 필수로 입력받도록 하는 기능을 구현했습니다.

## 구현 내용

### 1. 데이터베이스 스키마 확장

#### profiles 테이블 변경사항
- `workplace_name` 필드 추가: 근무지 이름 (병원명, 의원명 등)
- `workplace_type` 필드 추가: 근무지 유형 ('clinic' | 'hospital' | 'etc') - 선택사항
- `role` CHECK 제약조건 확장: 'manager', 'etc' 추가

#### 마이그레이션 스크립트
`supabase/migration_add_workplace.sql` 파일을 생성하여 기존 데이터베이스에 필드를 추가할 수 있습니다.

**실행 방법:**
```sql
-- Supabase SQL Editor에서 실행
-- supabase/migration_add_workplace.sql 파일 내용 실행
```

### 2. 회원가입 페이지 수정 (`app/signup/page.tsx`)

#### 변경사항
- **직업 선택**: 필수 필드로 변경, 8개 옵션 제공
  - 의사, 간호사, 간호조무사, 물리치료사, 방사선사, 행정·원무, 원장/관리자, 기타
- **근무지 입력**: 필수 필드로 변경
  - placeholder: "예) 좋은습관마취통증의학과의원"
- **유효성 검사**: 직업과 근무지가 없으면 가입 불가

### 3. 온보딩 페이지 생성 (`app/onboarding/page.tsx`)

#### 기능
- 구글 OAuth 로그인 후 직업/근무지가 없을 때 표시되는 페이지
- 직업 선택 및 근무지 입력
- 제출 시 `profiles` 테이블 업데이트

#### 접근 제어
- 이미 온보딩이 완료된 사용자는 자동으로 홈으로 리다이렉트
- 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트

### 4. OAuth 콜백 수정 (`app/auth/callback/route.ts`)

#### 변경사항
- 구글 로그인 후 프로필 생성 시 `role`과 `workplace_name`을 `null`로 설정
- 기존 프로필이 있어도 `role` 또는 `workplace_name`이 없으면 `null`로 업데이트하여 온보딩으로 유도

### 5. 미들웨어 온보딩 체크 (`lib/supabase/middleware.ts`)

#### 로직
1. 로그인한 사용자 확인
2. `/onboarding` 페이지 접근 시 통과
3. 그 외 페이지에서 프로필 조회
4. `role` 또는 `workplace_name`이 없으면 `/onboarding`으로 리다이렉트

## 사용자 플로우

### 이메일 회원가입
1. `/signup` 페이지 접근
2. 이메일, 비밀번호, 닉네임 입력
3. **직업 선택** (필수)
4. **근무지 입력** (필수)
5. 가입 완료 → 홈으로 이동

### 구글 OAuth 로그인
1. `/login` 또는 `/signup`에서 "구글로 로그인" 클릭
2. 구글 계정 선택 및 권한 승인
3. OAuth 콜백 처리 → 프로필 생성 (role/workplace_name = null)
4. **온보딩 페이지로 자동 리다이렉트**
5. 직업 선택 및 근무지 입력
6. 제출 → 홈으로 이동

### 기존 사용자 (온보딩 미완료)
- 로그인 시 자동으로 `/onboarding`으로 리다이렉트
- 직업과 근무지 입력 후 서비스 이용 가능

## 데이터베이스 마이그레이션

### 새로 설치하는 경우
`supabase/schema.sql` 파일을 실행하면 모든 필드가 포함된 테이블이 생성됩니다.

### 기존 데이터베이스 업데이트
`supabase/migration_add_workplace.sql` 파일을 실행하세요:

```sql
-- Supabase 대시보드 → SQL Editor에서 실행
```

이 스크립트는:
- `workplace_name`, `workplace_type` 컬럼 추가
- `role` CHECK 제약조건 업데이트
- 기존 `hospital_name` 데이터를 `workplace_name`으로 마이그레이션

## 타입 정의 업데이트

`types/database.ts`에 다음이 추가되었습니다:

```typescript
export type UserRole = 
  | 'doctor' 
  | 'nurse' 
  | 'assistant' 
  | 'pt' 
  | 'rt' 
  | 'admin_staff'
  | 'manager'  // 추가
  | 'etc'      // 추가

export interface Profile {
  // ...
  workplace_name: string | null  // 추가
  workplace_type: string | null  // 추가
  hospital_name?: string | null  // 하위 호환성 유지
}
```

## 테스트 체크리스트

### 이메일 회원가입
- [ ] 직업 선택 없이 가입 시도 → 에러 메시지 표시
- [ ] 근무지 입력 없이 가입 시도 → 에러 메시지 표시
- [ ] 모든 필드 입력 후 가입 → 성공적으로 가입 및 홈으로 이동

### 구글 OAuth 로그인
- [ ] 구글 로그인 후 → 온보딩 페이지로 리다이렉트
- [ ] 온보딩 페이지에서 직업/근무지 입력 → 홈으로 이동
- [ ] 온보딩 완료 후 다시 로그인 → 온보딩 페이지로 이동하지 않음

### 미들웨어 동작
- [ ] 온보딩 미완료 사용자가 다른 페이지 접근 → 온보딩으로 리다이렉트
- [ ] 온보딩 완료 사용자는 정상적으로 모든 페이지 접근 가능

## 주의사항

1. **하위 호환성**: `hospital_name` 필드는 유지되지만, 새로운 코드에서는 `workplace_name`을 사용합니다.

2. **기존 사용자**: 기존에 가입한 사용자는 `role`과 `workplace_name`이 `null`일 수 있습니다. 이 경우 로그인 시 온보딩 페이지로 리다이렉트됩니다.

3. **데이터 마이그레이션**: 기존 `hospital_name` 데이터는 마이그레이션 스크립트에서 `workplace_name`으로 복사됩니다.

## 향후 개선 사항

- [ ] 근무지 자동완성 기능
- [ ] 근무지 검증 (실제 존재하는 병원/의원인지 확인)
- [ ] 프로필 수정 페이지에서 직업/근무지 변경 기능
- [ ] 게시글에 "직업 · 근무지" 정보 표시

