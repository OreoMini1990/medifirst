-- 심사청구 게시판을 위한 sub_board 값 추가
-- 'notice' (최신고시) 추가

-- 기존 CHECK 제약 조건 제거
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sub_board_check;

-- 새로운 CHECK 제약 조건 추가 (notice 포함)
ALTER TABLE posts ADD CONSTRAINT posts_sub_board_check 
  CHECK (sub_board IN ('role', 'free', 'qa', 'notice'));

