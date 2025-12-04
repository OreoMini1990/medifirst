# 심사청구 게시판 데이터베이스 설정

## 문제 해결

심사청구 게시판에서 "Error fetching posts: {}" 에러가 발생하는 경우, 데이터베이스 제약 조건이 업데이트되지 않았을 수 있습니다.

## 해결 방법

### 1. Supabase 대시보드에서 SQL 실행

Supabase 대시보드 → SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 기존 CHECK 제약 조건 제거
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sub_board_check;

-- 새로운 CHECK 제약 조건 추가 (notice 포함)
ALTER TABLE posts ADD CONSTRAINT posts_sub_board_check 
  CHECK (sub_board IN ('role', 'free', 'qa', 'notice'));
```

### 2. 또는 마이그레이션 파일 실행

`supabase/migration_add_claims_sub_boards.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

## 확인 방법

다음 쿼리로 제약 조건이 올바르게 설정되었는지 확인:

```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass 
AND conname = 'posts_sub_board_check';
```

결과에 `'notice'`가 포함되어 있어야 합니다.

## RLS 정책 확인

심사청구 게시판 게시글을 읽을 수 있도록 RLS 정책이 설정되어 있는지 확인하세요:

```sql
-- posts 테이블의 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

필요한 경우 다음 정책을 추가:

```sql
-- 모든 사용자가 심사청구 게시글을 읽을 수 있도록
CREATE POLICY "Anyone can view claims posts" ON posts
  FOR SELECT USING (board = 'claims');
```



