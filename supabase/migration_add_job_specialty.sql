-- Migration: Add specialty column to jobs table
-- 구인구직 테이블에 전공(specialty) 컬럼 추가

-- specialty 컬럼 추가
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS specialty TEXT;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_jobs_specialty ON jobs(specialty);

-- 기존 데이터는 NULL로 유지 (선택사항)

