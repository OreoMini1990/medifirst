-- 직무 목록 업데이트 마이그레이션
-- 봉직의(페닥), 임상병리사(임병) 추가, 행정을 원무로 변경

-- profiles 테이블의 role CHECK 제약조건 업데이트
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('doctor', 'locum_doctor', 'manager', 'nurse', 'assistant', 'pt', 'rt', 'cp', 'admin_staff', 'etc'));

-- 기존 데이터 마이그레이션 (필요시)
-- 기존 'manager'는 그대로 유지 (원장)
-- 'admin_staff'는 그대로 유지 (원무로 표시만 변경)

