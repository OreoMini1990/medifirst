import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: commentId } = await params

    // 현재 추천 상태 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking like status:', checkError)
      return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 })
    }

    let liked = false
    let newLikeCount = 0

    if (existingLike) {
      // 이미 추천을 눌렀으면 취소
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting like:', deleteError)
        return NextResponse.json({ error: 'Failed to unlike comment' }, { status: 500 })
      }
      liked = false
    } else {
      // 추천 추가
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
        })

      if (insertError) {
        console.error('Error inserting like:', insertError)
        return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 })
      }
      liked = true
    }

    // 업데이트된 like_count 조회
    const { data: updatedComment, error: fetchCommentError } = await supabase
      .from('comments')
      .select('like_count')
      .eq('id', commentId)
      .single()

    if (fetchCommentError) {
      console.error('Error fetching updated like count:', fetchCommentError)
      newLikeCount = 0
    } else {
      newLikeCount = updatedComment?.like_count || 0
    }

    return NextResponse.json({ success: true, liked, likeCount: newLikeCount })

  } catch (error) {
    console.error('Unexpected error in like route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { id: commentId } = await params

    let liked = false
    let likeCount = 0

    // 추천 수 조회
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .select('like_count')
      .eq('id', commentId)
      .single()

    if (commentError) {
      console.error('Error fetching comment for like count:', commentError)
    } else {
      likeCount = commentData?.like_count || 0
    }

    // 로그인한 경우 추천 상태 확인
    if (user) {
      const { data: existingLike, error: checkError } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking like status:', checkError)
      } else if (existingLike) {
        liked = true
      }
    }

    return NextResponse.json({ success: true, liked, likeCount })

  } catch (error) {
    console.error('Unexpected error in GET like route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

