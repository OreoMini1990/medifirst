-- 테스트용 임시글 생성
-- 각 직무별로 3개씩, 소통광장 태그별로 3개씩 생성

-- 먼저 marketplace를 sub_board에 추가 (제약 조건 업데이트)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sub_board_check;
ALTER TABLE posts ADD CONSTRAINT posts_sub_board_check 
  CHECK (sub_board IN ('role', 'free', 'qa', 'notice', 'marketplace'));

-- 관리자 계정 ID 가져오기 (staff@medifirst.com)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- 관리자 계정 ID 찾기
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'staff@medifirst.com'
  LIMIT 1;

  -- 관리자 계정이 없으면 기본 사용자 사용
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- 직무별 아지트 게시글 생성 (각 직무별 3개씩)
  INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
  VALUES
    -- 의사 (doctor)
    (admin_user_id, 'community', 'role', 'doctor', '[의사] 의사 게시글 1', '의사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'doctor', '[의사] 의사 게시글 2', '의사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'doctor', '[의사] 의사 게시글 3', '의사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 봉직의 (locum_doctor - 페닥)
    (admin_user_id, 'community', 'role', 'locum_doctor', '[페닥] 봉직의 게시글 1', '봉직의 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'locum_doctor', '[페닥] 봉직의 게시글 2', '봉직의 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'locum_doctor', '[페닥] 봉직의 게시글 3', '봉직의 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 원장 (manager)
    (admin_user_id, 'community', 'role', 'manager', '[원장] 원장 게시글 1', '원장 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'manager', '[원장] 원장 게시글 2', '원장 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'manager', '[원장] 원장 게시글 3', '원장 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 간호사 (nurse - RN)
    (admin_user_id, 'community', 'role', 'nurse', '[RN] 간호사 게시글 1', '간호사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'nurse', '[RN] 간호사 게시글 2', '간호사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'nurse', '[RN] 간호사 게시글 3', '간호사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 간호조무사 (assistant - AN)
    (admin_user_id, 'community', 'role', 'assistant', '[AN] 간호조무사 게시글 1', '간호조무사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'assistant', '[AN] 간호조무사 게시글 2', '간호조무사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'assistant', '[AN] 간호조무사 게시글 3', '간호조무사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 물리치료사 (pt)
    (admin_user_id, 'community', 'role', 'pt', '[물치] 물리치료사 게시글 1', '물리치료사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'pt', '[물치] 물리치료사 게시글 2', '물리치료사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'pt', '[물치] 물리치료사 게시글 3', '물리치료사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 방사선사 (rt)
    (admin_user_id, 'community', 'role', 'rt', '[방사] 방사선사 게시글 1', '방사선사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'rt', '[방사] 방사선사 게시글 2', '방사선사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'rt', '[방사] 방사선사 게시글 3', '방사선사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 임상병리사 (cp - 임병)
    (admin_user_id, 'community', 'role', 'cp', '[임병] 임상병리사 게시글 1', '임상병리사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'cp', '[임병] 임상병리사 게시글 2', '임상병리사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'cp', '[임병] 임상병리사 게시글 3', '임상병리사 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 원무 (admin_staff)
    (admin_user_id, 'community', 'role', 'admin_staff', '[원무] 원무 게시글 1', '원무 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'admin_staff', '[원무] 원무 게시글 2', '원무 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'admin_staff', '[원무] 원무 게시글 3', '원무 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 기타 (etc)
    (admin_user_id, 'community', 'role', 'etc', '[기타] 기타 직무 게시글 1', '기타 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'role', 'etc', '[기타] 기타 직무 게시글 2', '기타 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'role', 'etc', '[기타] 기타 직무 게시글 3', '기타 직무 관련 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours');

  -- 소통광장 게시글 생성 (각 태그별 3개씩)
  INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
  VALUES
    -- 의학 태그
    (admin_user_id, 'community', 'free', 'medical', '[의학] 의학 관련 게시글 1', '의학 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'free', 'medical', '[의학] 의학 관련 게시글 2', '의학 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'free', 'medical', '[의학] 의학 관련 게시글 3', '의학 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 자유 태그
    (admin_user_id, 'community', 'free', 'free', '[자유] 자유 게시글 1', '자유 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'free', 'free', '[자유] 자유 게시글 2', '자유 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'free', 'free', '[자유] 자유 게시글 3', '자유 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 질문 태그
    (admin_user_id, 'community', 'qa', 'question', '[질문] 질문 게시글 1', '질문 태그 게시글 내용입니다.', true, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'qa', 'question', '[질문] 질문 게시글 2', '질문 태그 게시글 내용입니다.', true, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'qa', 'question', '[질문] 질문 게시글 3', '질문 태그 게시글 내용입니다.', true, false, NOW() - INTERVAL '3 hours'),
    
    -- 정보 태그
    (admin_user_id, 'community', 'free', 'info', '[정보] 정보 게시글 1', '정보 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'free', 'info', '[정보] 정보 게시글 2', '정보 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'free', 'info', '[정보] 정보 게시글 3', '정보 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 맛집 태그
    (admin_user_id, 'community', 'free', 'restaurant', '[맛집] 맛집 게시글 1', '맛집 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'free', 'restaurant', '[맛집] 맛집 게시글 2', '맛집 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'free', 'restaurant', '[맛집] 맛집 게시글 3', '맛집 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours');

  -- 장터 게시글 생성 (각 태그별 3개씩)
  INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
  VALUES
    -- 팝니다 태그
    (admin_user_id, 'community', 'marketplace', 'sell', '[팝니다] 판매 게시글 1', '팝니다 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'marketplace', 'sell', '[팝니다] 판매 게시글 2', '팝니다 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'marketplace', 'sell', '[팝니다] 판매 게시글 3', '팝니다 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours'),
    
    -- 삽니다 태그
    (admin_user_id, 'community', 'marketplace', 'buy', '[삽니다] 구매 게시글 1', '삽니다 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'community', 'marketplace', 'buy', '[삽니다] 구매 게시글 2', '삽니다 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'community', 'marketplace', 'buy', '[삽니다] 구매 게시글 3', '삽니다 태그 게시글 내용입니다.', false, false, NOW() - INTERVAL '3 hours');

END $$;

