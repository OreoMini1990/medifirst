-- 각 게시판 태그별 임시 랜덤 글 발행 및 추천/댓글 생성
-- 게시판 성격에 맞게 다양한 테스트 데이터 생성

DO $$
DECLARE
  admin_user_id UUID;
  test_user_ids UUID[] := ARRAY[]::UUID[];
  post_ids UUID[] := ARRAY[]::UUID[];
  comment_ids UUID[] := ARRAY[]::UUID[];
  i INTEGER;
  j INTEGER;
  post_id UUID;
  comment_id UUID;
BEGIN
  -- 관리자 사용자 ID 가져오기
  SELECT id INTO admin_user_id FROM profiles WHERE email = 'staff@medifirst.com' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  -- 테스트 사용자 ID들 가져오기 (최대 5명)
  SELECT ARRAY_AGG(id) INTO test_user_ids
  FROM profiles
  WHERE email != 'staff@medifirst.com'
  LIMIT 5;

  -- ============================================
  -- 1. 심사청구 Q&A 태그별 게시글 생성
  -- ============================================
  
  -- 건보 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'claims',
      'qa',
      'health_insurance',
      '[건보] 건강보험 심사 관련 문의 ' || i,
      '건강보험 심사 관련 문의 내용입니다. ' || i,
      true,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 자보 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'claims',
      'qa',
      'auto_insurance',
      '[자보] 자동차보험 심사 관련 문의 ' || i,
      '자동차보험 심사 관련 문의 내용입니다. ' || i,
      true,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 산재 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'claims',
      'qa',
      'industrial',
      '[산재] 산재보험 심사 관련 문의 ' || i,
      '산재보험 심사 관련 문의 내용입니다. ' || i,
      true,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 기타 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'claims',
      'qa',
      'etc',
      '[기타] 기타 심사 관련 문의 ' || i,
      '기타 심사 관련 문의 내용입니다. ' || i,
      true,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- ============================================
  -- 2. 소통광장 태그별 게시글 생성
  -- ============================================
  
  -- 의학 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'free',
      'medical',
      '[의학] 의학 관련 정보 공유 ' || i,
      '의학 관련 정보 공유 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 자유 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'free',
      'free',
      '[자유] 자유로운 이야기 ' || i,
      '자유로운 이야기 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 질문 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'qa',
      'question',
      '[질문] 질문 게시글 ' || i,
      '질문 내용입니다. ' || i,
      true,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 정보 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'free',
      'info',
      '[정보] 유용한 정보 공유 ' || i,
      '유용한 정보 공유 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 맛집 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'free',
      'restaurant',
      '[맛집] 맛집 추천 ' || i,
      '맛집 추천 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 익명 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'free',
      'anonymous',
      '[익명] 익명 게시글 ' || i,
      '익명 게시글 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- ============================================
  -- 3. 장터 태그별 게시글 생성
  -- ============================================
  
  -- 팝니다 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'marketplace',
      'sell',
      '[팝니다] 판매 게시글 ' || i,
      '판매 게시글 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- 삽니다 태그 게시글 3개
  FOR i IN 1..3 LOOP
    INSERT INTO posts (author_id, board, sub_board, category, title, content, is_question, is_pinned, created_at)
    VALUES (
      admin_user_id,
      'community',
      'marketplace',
      'buy',
      '[삽니다] 구매 게시글 ' || i,
      '구매 게시글 내용입니다. ' || i,
      false,
      false,
      NOW() - (i || ' hours')::INTERVAL
    )
    RETURNING id INTO post_id;
    post_ids := array_append(post_ids, post_id);
  END LOOP;

  -- ============================================
  -- 4. 추천 및 댓글 생성 (랜덤하게)
  -- ============================================
  
  -- 각 게시글에 대해 랜덤하게 추천 및 댓글 추가
  FOR i IN 1..array_length(post_ids, 1) LOOP
    post_id := post_ids[i];
    DECLARE
      current_post_id UUID := post_id;
      current_user_id UUID;
    BEGIN
      -- 50% 확률로 추천 추가
      IF random() > 0.5 THEN
        -- 1-5개의 추천 추가
        FOR j IN 1..(floor(random() * 5)::INTEGER + 1) LOOP
          IF array_length(test_user_ids, 1) > 0 THEN
            current_user_id := test_user_ids[(floor(random() * array_length(test_user_ids, 1))::INTEGER + 1)];
            INSERT INTO post_likes (post_id, user_id, created_at)
            VALUES (
              current_post_id,
              current_user_id,
              NOW() - (j || ' minutes')::INTERVAL
            )
            ON CONFLICT ON CONSTRAINT unique_post_like DO NOTHING;
          END IF;
        END LOOP;
      END IF;

      -- 50% 확률로 댓글 추가
      IF random() > 0.5 THEN
        -- 1-3개의 댓글 추가
        FOR j IN 1..(floor(random() * 3)::INTEGER + 1) LOOP
          IF array_length(test_user_ids, 1) > 0 THEN
            current_user_id := test_user_ids[(floor(random() * array_length(test_user_ids, 1))::INTEGER + 1)];
            INSERT INTO comments (post_id, author_id, content, created_at)
            VALUES (
              current_post_id,
              current_user_id,
              '테스트 댓글 내용 ' || j,
              NOW() - (j || ' minutes')::INTERVAL
            )
            RETURNING id INTO comment_id;
            comment_ids := array_append(comment_ids, comment_id);
          END IF;
        END LOOP;
      END IF;

      -- 조회수 추가 (0-50 사이 랜덤)
      FOR j IN 1..(floor(random() * 50)::INTEGER) LOOP
        current_user_id := COALESCE(test_user_ids[(floor(random() * array_length(test_user_ids, 1))::INTEGER + 1)], admin_user_id);
        INSERT INTO post_views (post_id, user_id, viewed_at)
        VALUES (
          current_post_id,
          current_user_id,
          NOW() - (j || ' minutes')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
      END LOOP;
    END;
  END LOOP;

  -- 댓글에 추천 추가 (일부 댓글에만)
  FOR i IN 1..array_length(comment_ids, 1) LOOP
    comment_id := comment_ids[i];
    DECLARE
      current_comment_id UUID := comment_id;
      current_user_id UUID;
    BEGIN
      -- 30% 확률로 댓글 추천 추가
      IF random() > 0.7 THEN
        IF array_length(test_user_ids, 1) > 0 THEN
          current_user_id := test_user_ids[(floor(random() * array_length(test_user_ids, 1))::INTEGER + 1)];
          INSERT INTO comment_likes (comment_id, user_id, created_at)
          VALUES (
            current_comment_id,
            current_user_id,
            NOW()
          )
          ON CONFLICT ON CONSTRAINT unique_comment_user_like DO NOTHING;
        END IF;
      END IF;
    END;
  END LOOP;

  RAISE NOTICE 'Test data created successfully: % posts, % comments', array_length(post_ids, 1), array_length(comment_ids, 1);
END $$;

