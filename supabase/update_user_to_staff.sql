-- 기존 사용자를 스텝으로 변경하는 간단한 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- ============================================
-- 방법 1: 이메일로 역할 변경
-- ============================================

-- 아래 이메일을 변경하세요
UPDATE public.profiles
SET 
  role = 'manager',  -- 또는 'admin_staff'
  display_name = COALESCE(NULLIF(display_name, ''), '관리자'),
  workplace_name = COALESCE(NULLIF(workplace_name, ''), 'MediFirst 운영팀'),
  updated_at = NOW()
WHERE email = 'staff@medifirst.com';  -- 변경하세요

-- ============================================
-- 방법 2: 사용자 ID로 역할 변경
-- ============================================

-- 아래 사용자 ID를 변경하세요
-- UPDATE public.profiles
-- SET 
--   role = 'manager',  -- 또는 'admin_staff'
--   display_name = COALESCE(NULLIF(display_name, ''), '관리자'),
--   workplace_name = COALESCE(NULLIF(workplace_name, ''), 'MediFirst 운영팀'),
--   updated_at = NOW()
-- WHERE id = '508272ad-b077-45c0-a390-3f4120674583';  -- 변경하세요

-- ============================================
-- 방법 3: 모든 사용자 확인 후 선택
-- ============================================

-- 모든 사용자 목록 확인
SELECT 
  id,
  email,
  display_name,
  role,
  workplace_name
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 변경 확인
-- ============================================

-- 스텝 계정 확인
SELECT 
  id,
  email,
  display_name,
  role,
  workplace_name,
  created_at
FROM public.profiles
WHERE role IN ('manager', 'admin_staff')
ORDER BY updated_at DESC;

