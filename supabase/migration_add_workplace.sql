-- Migration: Add workplace_name and workplace_type to profiles table
-- 기존 테이블에 필드 추가하는 마이그레이션 스크립트

-- workplace_name 컬럼 추가 (hospital_name이 있으면 그 값으로 채움)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS workplace_name TEXT;

-- workplace_type 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS workplace_type TEXT CHECK (workplace_type IN ('clinic', 'hospital', 'etc'));

-- role CHECK 제약조건 업데이트 (manager, etc 추가)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('doctor', 'nurse', 'assistant', 'pt', 'rt', 'admin_staff', 'manager', 'etc'));

-- 기존 데이터 마이그레이션: hospital_name이 있으면 workplace_name으로 복사
UPDATE profiles 
SET workplace_name = hospital_name 
WHERE workplace_name IS NULL AND hospital_name IS NOT NULL;

