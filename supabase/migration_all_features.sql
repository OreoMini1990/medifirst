-- 모든 기능 통합 마이그레이션
-- 실행 순서: 이 파일을 Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 조회수 기능
-- ============================================

-- posts 테이블에 view_count 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- post_views 테이블 생성 (중복 조회 방지용)
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT, -- 비로그인 사용자 추적용
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_user_view UNIQUE(post_id, user_id), -- 로그인 사용자 중복 방지
  CONSTRAINT unique_ip_view UNIQUE(post_id, ip_address) -- 비로그인 사용자 중복 방지 (24시간 기준)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);

-- RLS 정책
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post_views" ON post_views;
CREATE POLICY "Anyone can view post_views" ON post_views
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own views" ON post_views;
CREATE POLICY "Users can insert own views" ON post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- ============================================
-- 2. 게시글 추천 기능
-- ============================================

-- posts 테이블에 like_count 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- post_likes 테이블 생성 (중복 좋아요 방지용)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_post_user_like UNIQUE(post_id, user_id)
);

-- 좋아요 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- post_likes 테이블에 트리거 연결
DROP TRIGGER IF EXISTS update_post_like_count_trigger ON post_likes;
CREATE TRIGGER update_post_like_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- RLS 정책
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all post_likes" ON post_likes;
CREATE POLICY "Users can view all post_likes" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own post_likes" ON post_likes;
CREATE POLICY "Users can insert own post_likes" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own post_likes" ON post_likes;
CREATE POLICY "Users can delete own post_likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. 댓글 대댓글 및 추천 기능
-- ============================================

-- comments 테이블에 parent_id 컬럼 추가 (대댓글용)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- comments 테이블에 like_count 컬럼 추가
ALTER TABLE comments ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- comment_likes 테이블 생성 (중복 추천 방지용)
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_comment_user_like UNIQUE(comment_id, user_id)
);

-- 댓글 추천 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- comment_likes 테이블에 트리거 연결
DROP TRIGGER IF EXISTS update_comment_like_count_trigger ON comment_likes;
CREATE TRIGGER update_comment_like_count_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- RLS 정책
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all comment_likes" ON comment_likes;
CREATE POLICY "Users can view all comment_likes" ON comment_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own comment_likes" ON comment_likes;
CREATE POLICY "Users can insert own comment_likes" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comment_likes" ON comment_likes;
CREATE POLICY "Users can delete own comment_likes" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);

