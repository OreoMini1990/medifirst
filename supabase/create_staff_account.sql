-- 스텝 계정 생성 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요
-- 
-- 사용 방법:
-- 1. 아래 이메일과 비밀번호를 원하는 값으로 변경하세요
-- 2. role을 'manager' 또는 'admin_staff' 중 선택하세요
-- 3. Supabase SQL Editor에서 실행하세요

-- ============================================
-- 방법 1: 새 스텝 계정 생성 (기존 사용자 확인 포함)
-- ============================================

-- 이메일과 비밀번호 설정 (변경 필요)
DO $$
DECLARE
  new_user_id UUID;
  existing_user_id UUID;
  existing_profile_id UUID;
  staff_email TEXT := 'staff@medifirst.com';  -- 변경하세요
  staff_password TEXT := 'Staff123!@#';       -- 변경하세요 (강력한 비밀번호 권장)
  staff_role TEXT := 'manager';               -- 'manager' 또는 'admin_staff'
  staff_display_name TEXT := '관리자';         -- 변경하세요
BEGIN
  -- 기존 사용자 확인 (이메일로)
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = staff_email
  LIMIT 1;

  IF existing_user_id IS NOT NULL THEN
    -- 기존 사용자가 있는 경우
    new_user_id := existing_user_id;
    RAISE NOTICE '기존 사용자를 찾았습니다. ID: %', new_user_id;
    
    -- 프로필 확인
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE id = new_user_id;
    
    IF existing_profile_id IS NOT NULL THEN
      -- 프로필이 있으면 역할만 업데이트
      UPDATE public.profiles
      SET role = staff_role,
          display_name = COALESCE(NULLIF(staff_display_name, ''), display_name),
          workplace_name = COALESCE(NULLIF('MediFirst 운영팀', ''), workplace_name),
          updated_at = NOW()
      WHERE id = new_user_id;
      
      RAISE NOTICE '기존 프로필의 역할을 업데이트했습니다.';
      RAISE NOTICE '이메일: %', staff_email;
      RAISE NOTICE '역할: %', staff_role;
    ELSE
      -- 프로필이 없으면 생성 (ON CONFLICT로 안전하게 처리)
      INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        workplace_name,
        created_at,
        updated_at
      ) VALUES (
        new_user_id,
        staff_email,
        staff_display_name,
        staff_role,
        'MediFirst 운영팀',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
        workplace_name = COALESCE(NULLIF(EXCLUDED.workplace_name, ''), profiles.workplace_name),
        updated_at = NOW();
      
      RAISE NOTICE '기존 사용자에 대한 프로필을 생성/업데이트했습니다.';
      RAISE NOTICE '이메일: %', staff_email;
      RAISE NOTICE '역할: %', staff_role;
    END IF;
  ELSE
    -- 새 사용자 생성
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      staff_email,
      crypt(staff_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- profiles 테이블에 프로필 생성 (ON CONFLICT로 안전하게 처리)
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role,
      workplace_name,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      staff_email,
      staff_display_name,
      staff_role,
      'MediFirst 운영팀',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
      workplace_name = COALESCE(NULLIF(EXCLUDED.workplace_name, ''), profiles.workplace_name),
      updated_at = NOW();

    RAISE NOTICE '새 스텝 계정이 생성되었습니다!';
    RAISE NOTICE '이메일: %', staff_email;
    RAISE NOTICE '비밀번호: %', staff_password;
    RAISE NOTICE '역할: %', staff_role;
    RAISE NOTICE '사용자 ID: %', new_user_id;
  END IF;
END $$;

-- ============================================
-- 방법 2: 기존 사용자를 스텝으로 변경
-- ============================================

-- 기존 사용자의 이메일을 입력하세요
-- UPDATE public.profiles
-- SET role = 'manager'  -- 또는 'admin_staff'
-- WHERE email = '기존사용자@email.com';

-- ============================================
-- 스텝 계정 확인
-- ============================================

-- 생성된 스텝 계정 확인
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.workplace_name,
  p.created_at
FROM public.profiles p
WHERE p.role IN ('manager', 'admin_staff')
ORDER BY p.created_at DESC;

