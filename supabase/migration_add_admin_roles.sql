-- 관리자 계정에 전체 직무 부여
-- staff@medifirst.com 계정에 모든 직무를 roles 필드에 추가

-- 먼저 profiles 테이블에 roles 컬럼이 없으면 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;

-- 관리자 계정 찾기 (email로)
-- auth.users 테이블과 profiles 테이블을 조인하여 관리자 계정의 id를 찾아 roles 업데이트
UPDATE profiles
SET roles = '["doctor", "locum_doctor", "manager", "nurse", "assistant", "pt", "rt", "cp", "admin_staff", "etc"]'::jsonb
WHERE id IN (
  SELECT au.id 
  FROM auth.users au
  WHERE au.email = 'staff@medifirst.com'
);

-- 업데이트 확인용 쿼리 (실행 후 확인)
-- SELECT 
--   p.id,
--   au.email,
--   p.role,
--   p.roles
-- FROM profiles p
-- JOIN auth.users au ON p.id = au.id
-- WHERE au.email = 'staff@medifirst.com';

