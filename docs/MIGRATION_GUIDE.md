# 데이터베이스 마이그레이션 가이드

## 문제 해결

댓글 추천과 조회수 기능이 작동하지 않는 경우, 다음 마이그레이션을 실행해야 합니다.

## 실행 방법

1. Supabase 대시보드에 로그인
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. **New query** 클릭
4. `supabase/migration_all_features.sql` 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭

## 마이그레이션 내용

이 마이그레이션은 다음 기능을 추가합니다:

### 1. 조회수 기능
- `posts` 테이블에 `view_count` 컬럼 추가
- `post_views` 테이블 생성 (중복 조회 방지)

### 2. 게시글 추천 기능
- `posts` 테이블에 `like_count` 컬럼 추가
- `post_likes` 테이블 생성
- 자동 카운트 업데이트 트리거

### 3. 댓글 대댓글 및 추천 기능
- `comments` 테이블에 `parent_id` 컬럼 추가 (대댓글용)
- `comments` 테이블에 `like_count` 컬럼 추가
- `comment_likes` 테이블 생성
- 자동 카운트 업데이트 트리거

## 확인 방법

마이그레이션 실행 후:

1. **조회수 확인**: 게시글을 열면 조회수가 증가해야 합니다.
2. **게시글 추천 확인**: 게시글 하단의 추천 버튼을 클릭하면 작동해야 합니다.
3. **댓글 추천 확인**: 댓글의 추천 버튼을 클릭하면 작동해야 합니다.
4. **대댓글 확인**: 댓글에 "댓글쓰기" 버튼을 클릭하여 대댓글을 작성할 수 있어야 합니다.

## 문제 해결

### 에러가 발생하는 경우

1. **테이블이 이미 존재하는 경우**: 마이그레이션은 `IF NOT EXISTS`를 사용하므로 안전하게 실행할 수 있습니다.
2. **권한 오류**: Supabase 프로젝트의 관리자 권한이 필요합니다.
3. **RLS 정책 오류**: 마이그레이션에 RLS 정책이 포함되어 있습니다.

### 수동 확인

다음 쿼리로 테이블이 생성되었는지 확인할 수 있습니다:

```sql
-- 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_views', 'post_likes', 'comment_likes');

-- 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('view_count', 'like_count');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND column_name IN ('parent_id', 'like_count');
```



