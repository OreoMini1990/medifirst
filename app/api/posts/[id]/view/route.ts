import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { id } = await params
    const postId = id

    // post_views 테이블이 없을 수 있으므로, 먼저 view_count만 증가시키고
    // post_views 테이블이 있으면 중복 체크를 수행
    
    // view_count 증가 (간단한 방법)
    const { data: post } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ 
        error: 'Post not found' 
      }, { status: 404 })
    }

    // post_views 테이블이 있는지 확인하고 중복 체크 시도
    try {
      // IP 주소 추출 (비로그인 사용자용)
      const forwardedFor = request.headers.get('x-forwarded-for')
      const realIp = request.headers.get('x-real-ip')
      const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

      // 중복 조회 체크 (post_views 테이블이 있을 경우)
      let checkQuery = supabase
        .from('post_views')
        .select('id, viewed_at')
        .eq('post_id', postId)
        .limit(1)

      if (user) {
        checkQuery = checkQuery.eq('user_id', user.id)
      } else {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        checkQuery = checkQuery
          .eq('ip_address', ipAddress)
          .gte('viewed_at', oneDayAgo)
      }

      const { data: existingView, error: checkError } = await checkQuery

      // post_views 테이블이 없으면 에러를 무시하고 view_count만 증가
      if (checkError && checkError.code === '42P01') {
        // 테이블이 없음 - view_count만 증가
        const { error: updateError } = await supabase
          .from('posts')
          .update({ view_count: (post.view_count || 0) + 1 })
          .eq('id', postId)

        if (updateError) {
          console.error('Error updating view count:', updateError)
          return NextResponse.json({ 
            success: false,
            error: 'Failed to update view count'
          }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true,
          viewCount: (post.view_count || 0) + 1,
          message: 'View count updated (post_views table not found)'
        })
      }

      // 이미 조회한 경우
      if (existingView && existingView.length > 0) {
        return NextResponse.json({ 
          success: true, 
          alreadyViewed: true,
          message: 'Already viewed'
        })
      }

      // 조회 기록 추가
      const { error: viewError } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          user_id: user?.id || null,
          ip_address: user ? null : ipAddress,
        })

      if (viewError) {
        // UNIQUE 제약 조건 위반은 이미 조회한 것으로 간주
        if (viewError.code === '23505') {
          return NextResponse.json({ 
            success: true, 
            alreadyViewed: true,
            message: 'Duplicate view prevented'
          })
        }
        
        // 다른 에러는 무시하고 view_count만 증가
        console.error('Error recording view:', viewError)
      }
    } catch (tableError) {
      // post_views 테이블 관련 에러는 무시하고 view_count만 증가
      console.error('Error with post_views table:', tableError)
    }

    // view_count 증가
    const { error: updateError } = await supabase
      .from('posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', postId)

    if (updateError) {
      console.error('Error updating view count:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update view count',
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      viewCount: (post.view_count || 0) + 1
    })

  } catch (error) {
    console.error('Unexpected error in view route:', error)
    // 에러가 발생해도 성공으로 처리 (조회수 증가 실패는 치명적이지 않음)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

