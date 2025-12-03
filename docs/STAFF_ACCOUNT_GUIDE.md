# 스텝 계정 생성 가이드

## 개요

최신고시를 작성하려면 스텝 권한이 필요합니다. 스텝 역할은 `manager` 또는 `admin_staff`입니다.

## 스텝 계정 생성 방법

### 방법 1: SQL 스크립트로 새 계정 생성 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **스크립트 수정 및 실행**
   - `supabase/create_staff_account.sql` 파일을 열어서
   - 다음 값들을 원하는 값으로 변경:
     ```sql
     staff_email TEXT := 'staff@medifirst.com';  -- 변경하세요
     staff_password TEXT := 'Staff123!@#';       -- 변경하세요
     staff_role TEXT := 'manager';               -- 'manager' 또는 'admin_staff'
     staff_display_name TEXT := '관리자';         -- 변경하세요
     ```
   - SQL Editor에 붙여넣고 "Run" 버튼 클릭

4. **생성된 계정 정보 확인**
   - 스크립트 실행 후 출력되는 이메일과 비밀번호를 기록하세요
   - 또는 아래 쿼리로 확인:
     ```sql
     SELECT email, display_name, role 
     FROM profiles 
     WHERE role IN ('manager', 'admin_staff');
     ```

### 방법 2: 기존 사용자를 스텝으로 변경

기존 사용자가 있다면, 그 사용자의 역할만 변경할 수 있습니다:

```sql
-- 기존 사용자의 이메일로 검색하여 역할 변경
UPDATE public.profiles
SET role = 'manager'  -- 또는 'admin_staff'
WHERE email = '기존사용자@email.com';
```

### 방법 3: Supabase Auth에서 직접 생성

1. **Supabase 대시보드 → Authentication → Users**
2. **"Add user" 클릭**
3. **이메일과 비밀번호 입력**
4. **생성 후 SQL Editor에서 프로필 업데이트:**
   ```sql
   -- 생성된 사용자 ID 확인 (Authentication → Users에서 확인)
   UPDATE public.profiles
   SET role = 'manager',
       display_name = '관리자',
       workplace_name = 'MediFirst 운영팀'
   WHERE id = '사용자ID';
   ```

## 스텝 계정으로 로그인

1. 애플리케이션의 로그인 페이지로 이동
2. 생성한 이메일과 비밀번호로 로그인
3. 온보딩 페이지가 나타나면:
   - 직업: "원장/관리자" 또는 "행정·원무" 선택
   - 근무지: 입력 (예: "MediFirst 운영팀")
4. 로그인 완료 후 "심사청구" → "최신고시" 탭으로 이동
5. "글쓰기" 버튼이 보이면 성공!

## 스텝 권한 확인

다음 쿼리로 현재 스텝 계정을 확인할 수 있습니다:

```sql
SELECT 
  email,
  display_name,
  role,
  workplace_name,
  created_at
FROM profiles
WHERE role IN ('manager', 'admin_staff')
ORDER BY created_at DESC;
```

## 문제 해결

### 로그인 후에도 "글쓰기" 버튼이 안 보이는 경우

1. 브라우저를 완전히 종료하고 다시 열기
2. 로그아웃 후 다시 로그인
3. 프로필의 role이 올바르게 설정되었는지 확인:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```

### "스탭만 최신고시를 작성할 수 있습니다" 오류가 나는 경우

1. 프로필의 role이 `manager` 또는 `admin_staff`인지 확인
2. 세션을 새로고침 (로그아웃 → 로그인)

## 보안 주의사항

- 스텝 계정의 비밀번호는 강력하게 설정하세요
- 스텝 계정 정보는 안전하게 보관하세요
- 프로덕션 환경에서는 스텝 계정 생성을 신중하게 관리하세요

