-- 장터 게시판 추가 마이그레이션
-- 작성일: 2024년 12월

-- posts 테이블의 sub_board CHECK 제약조건에 'marketplace' 추가
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sub_board_check;
ALTER TABLE posts ADD CONSTRAINT posts_sub_board_check 
  CHECK (sub_board IN ('role', 'free', 'qa', 'notice', 'marketplace'));

-- profiles 테이블에 복수 직무를 저장할 roles 필드 추가 (JSONB 배열)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_sub_board_marketplace ON posts(sub_board) WHERE sub_board = 'marketplace';
CREATE INDEX IF NOT EXISTS idx_posts_category_marketplace ON posts(category) WHERE sub_board = 'marketplace';

