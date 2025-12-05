-- 기존 게시글에 태그 부여 (임시 데이터)
-- 소통광장 게시글에 랜덤 태그 부여 (기능 테스트용)
UPDATE posts 
SET category = (
  SELECT tag FROM (
    VALUES 
      ('medical'),
      ('free'),
      ('question'),
      ('info'),
      ('restaurant')
  ) AS tags(tag)
  ORDER BY RANDOM()
  LIMIT 1
)
WHERE board = 'community' 
  AND (sub_board = 'free' OR sub_board = 'qa')
  AND (category IS NULL OR category = '');

-- 테스트용: 기존 게시글에 다양한 태그 부여
-- 의학 태그
UPDATE posts 
SET category = 'medical'
WHERE id IN (
  SELECT id FROM posts
  WHERE board = 'community' 
    AND (sub_board = 'free' OR sub_board = 'qa')
    AND category IS NULL
    AND (title LIKE '%의학%' OR title LIKE '%진료%' OR title LIKE '%환자%')
  LIMIT 5
);

-- 정보 태그
UPDATE posts 
SET category = 'info'
WHERE id IN (
  SELECT id FROM posts
  WHERE board = 'community' 
    AND (sub_board = 'free' OR sub_board = 'qa')
    AND category IS NULL
    AND (title LIKE '%정보%' OR title LIKE '%공지%' OR title LIKE '%안내%')
  LIMIT 5
);

-- 맛집 태그
UPDATE posts 
SET category = 'restaurant'
WHERE id IN (
  SELECT id FROM posts
  WHERE board = 'community' 
    AND (sub_board = 'free' OR sub_board = 'qa')
    AND category IS NULL
    AND (title LIKE '%맛집%' OR title LIKE '%식당%' OR title LIKE '%음식%')
  LIMIT 5
);

-- 장터 게시글에 태그 부여 (임시)
UPDATE posts 
SET category = CASE 
  WHEN sub_board = 'marketplace' AND category IS NULL THEN 'sell'
  ELSE category
END
WHERE board = 'community' 
  AND sub_board = 'marketplace'
  AND category IS NULL;

-- 테스트용: 장터 게시글에 팝니다/삽니다 태그 부여
UPDATE posts 
SET category = CASE 
  WHEN title LIKE '%팝니다%' OR title LIKE '%판매%' OR title LIKE '%매도%' THEN 'sell'
  WHEN title LIKE '%삽니다%' OR title LIKE '%구매%' OR title LIKE '%매수%' THEN 'buy'
  ELSE 'sell'
END
WHERE board = 'community' 
  AND sub_board = 'marketplace'
  AND category IS NULL;

