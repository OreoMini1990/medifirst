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
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: '로그인이 필요합니다.'
      }, { status: 401 })
    }
    
    const { id } = await params
    const postId = id

    // 게시글 존재 확인
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ 
        error: 'Post not found' 
      }, { status: 404 })
    }

    // 이미 좋아요 했는지 확인
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting like:', deleteError)
        return NextResponse.json({ 
          error: 'Failed to unlike post',
          details: deleteError.message 
        }, { status: 500 })
      }

      // 좋아요 수 조회
      const { data: updatedPost } = await supabase
        .from('posts')
        .select('like_count')
        .eq('id', postId)
        .single()

      return NextResponse.json({ 
        success: true,
        liked: false,
        likeCount: updatedPost?.like_count || 0
      })
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        })

      if (insertError) {
        // UNIQUE 제약 조건 위반은 이미 좋아요한 것으로 간주
        if (insertError.code === '23505') {
          return NextResponse.json({ 
            success: true,
            liked: true,
            message: 'Already liked'
          })
        }
        
        console.error('Error inserting like:', insertError)
        return NextResponse.json({ 
          error: 'Failed to like post',
          details: insertError.message 
        }, { status: 500 })
      }

      // 좋아요 수 조회
      const { data: updatedPost } = await supabase
        .from('posts')
        .select('like_count')
        .eq('id', postId)
        .single()

      return NextResponse.json({ 
        success: true,
        liked: true,
        likeCount: updatedPost?.like_count || 0
      })
    }

  } catch (error) {
    console.error('Unexpected error in like route:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// 좋아요 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { id } = await params
    const postId = id

    if (!user) {
      return NextResponse.json({ 
        liked: false,
        likeCount: 0
      })
    }

    // 좋아요 상태 확인
    const { data: like } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    // 좋아요 수 조회
    const { data: post } = await supabase
      .from('posts')
      .select('like_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({ 
      liked: !!like,
      likeCount: post?.like_count || 0
    })

  } catch (error) {
    console.error('Unexpected error in like GET route:', error)
    return NextResponse.json({ 
      liked: false,
      likeCount: 0
    })
  }
}

