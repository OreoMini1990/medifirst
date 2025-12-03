-- 조회수 기능 추가 마이그레이션
-- 작성일: 2024년 12월

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

CREATE POLICY "Anyone can view post_views" ON post_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own views" ON post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

