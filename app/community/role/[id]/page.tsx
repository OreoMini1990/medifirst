'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Post, Comment, UserRole } from '@/types/database'
import { ArrowLeft, ArrowRight, Edit, Trash2, List } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommentItem } from '@/components/community/CommentItem'
import { CommentList } from '@/components/community/CommentList'
import { CommentForm } from '@/components/community/CommentForm'
import { PostListItem } from '@/components/community/PostListItem'
import { Eye, ThumbsUp } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const roleLabels: Record<UserRole, string> = {
  doctor: '의사',
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  admin_staff: '행정·원무',
  manager: '원장/관리자',
  etc: '기타',
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<(Post & { commentCount?: number })[]>([])
  const [prevPost, setPrevPost] = useState<Post | null>(null)
  const [nextPost, setNextPost] = useState<Post | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase])

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  useEffect(() => {
    if (post && params.id && !loading) {
      // 조회수 증가 API 호출 (에러는 무시)
      fetch(`/api/posts/${params.id}/view`, {
        method: 'POST',
      }).catch(() => {
        // 조회수 증가 실패는 무시 (post_views 테이블이 없을 수 있음)
      })
    }
  }, [post?.id, params.id, loading])

  useEffect(() => {
    let isMounted = true
    let hasChecked = false

    async function checkAccess() {
      if (!post || !currentUserId || !isMounted || hasChecked) return

      // 게시글이 직역별 커뮤니티인지 확인
      if (post.sub_board !== 'role') return

      hasChecked = true

      // 사용자 프로필에서 role 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUserId)
        .single()

      // 사용자 role과 게시글 category 비교
      if (isMounted && profile?.role && post.category && profile.role !== post.category) {
        alert('접근 권한이 없습니다. 본인의 직역 게시판만 확인할 수 있습니다.')
        router.push('/community?tab=role')
        return
      }
    }

    if (post && currentUserId) {
      checkAccess()
    }

    return () => {
      isMounted = false
    }
  }, [post?.id, currentUserId]) // post 전체가 아닌 post.id만 의존성으로

  async function fetchPost() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching post:', error.message || error)
        setPost(null)
        setLoading(false)
      } else if (data) {
        console.log('Post fetched:', data.title, 'Content length:', data.content?.length || 0)
        console.log('Post author_id:', data.author_id)
        console.log('Post profiles:', data.profiles)
        console.log('Post profiles display_name:', data.profiles?.display_name)
        setPost(data)
        setLikeCount(data.like_count || 0)
        fetchComments()
        fetchRelatedPosts(data) // post 상태 대신 data를 직접 전달
        fetchPrevNextPosts(data) // post 상태 대신 data를 직접 전달
        fetchLikeStatus() // 좋아요 상태 확인
        setLoading(false)
      } else {
        setPost(null)
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error fetching post:', err)
      setPost(null)
      setLoading(false)
    }
  }

  async function fetchLikeStatus() {
    if (!currentUserId || !params.id) return
    
    try {
      const response = await fetch(`/api/posts/${params.id}/like`)
      const data = await response.json()
      setLiked(data.liked || false)
      setLikeCount(data.likeCount || 0)
    } catch (error) {
      console.error('Error fetching like status:', error)
    }
  }

  async function handleLike() {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (liking) return

    setLiking(true)
    try {
      const response = await fetch(`/api/posts/${params.id}/like`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount || 0)
        // 게시글 상태도 업데이트
        if (post) {
          setPost({ ...post, like_count: data.likeCount || 0 })
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLiking(false)
    }
  }

  async function checkAccess() {
    if (!post || !currentUserId) return

    // 게시글이 직역별 커뮤니티인지 확인
    if (post.sub_board !== 'role') return

    // 사용자 프로필에서 role 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single()

    // 사용자 role과 게시글 category 비교
    if (profile?.role && post.category && profile.role !== post.category) {
      alert('접근 권한이 없습니다. 본인의 직역 게시판만 확인할 수 있습니다.')
      router.push('/community')
      return
    }
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles!author_id(display_name, role)')
      .eq('post_id', params.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
    } else {
      setComments(data || [])
    }
  }

  async function fetchPrevNextPosts(postData?: Post) {
    const targetPost = postData || post
    if (!targetPost?.category) return

    const currentDate = new Date(targetPost.created_at)

    // 이전글 (더 최신)
    const { data: prevData, error: prevError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('board', 'community')
      .eq('sub_board', 'role')
      .eq('category', targetPost.category)
      .gt('created_at', currentDate.toISOString())
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    // 다음글 (더 오래됨)
    const { data: nextData, error: nextError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('board', 'community')
      .eq('sub_board', 'role')
      .eq('category', targetPost.category)
      .lt('created_at', currentDate.toISOString())
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!prevError && prevData) setPrevPost(prevData as Post)
    if (!nextError && nextData) setNextPost(nextData as Post)
  }

  async function fetchRelatedPosts(postData?: Post) {
    const targetPost = postData || post
    if (!targetPost?.category) return

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!author_id(display_name, role)')
      .eq('board', 'community')
      .eq('sub_board', 'role')
      .eq('category', targetPost.category) // 같은 직역 게시글만 표시
      .neq('id', params.id as string)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching related posts:', error)
      setRelatedPosts([])
    } else if (data) {
      const postsWithComments = await Promise.all(
        data.map(async (p) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', p.id)
            .is('deleted_at', null)
          return { ...p, commentCount: count || 0 }
        })
      )
      setRelatedPosts(postsWithComments as Post[])
    } else {
      setRelatedPosts([])
    }
  }

  async function handleDeletePost() {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) {
      alert('삭제 중 오류가 발생했습니다.')
      console.error('Error deleting post:', error)
    } else {
      router.push('/community?tab=role')
      router.refresh()
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 게시글 상세 */}
      <section className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {(post.profiles?.display_name || '익명')[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {post.profiles?.display_name || '익명'}
          </span>
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1 hover:opacity-80 transition-opacity ${liked ? 'text-emerald-500' : ''} ${liking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ThumbsUp className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </button>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            조회 {post.view_count || 0}
          </span>
          <span>
            {(() => {
              const date = new Date(post.created_at)
              const now = new Date()
              const diff = now.getTime() - date.getTime()
              const days = Math.floor(diff / (1000 * 60 * 60 * 24))
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const minutes = Math.floor(diff / (1000 * 60))
              if (days > 0) return days === 1 ? '어제' : `${days}일 전`
              if (hours > 0) return `${hours}시간 전`
              if (minutes > 0) return `${minutes}분 전`
              return '방금 전'
            })()}
          </span>
          {currentUserId === post.author_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                  <span className="sr-only">메뉴</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/community/role/edit/${post.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <article className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-900 dark:text-slate-100 min-h-[100px]">
            {post.content || '(내용 없음)'}
          </div>
        </article>
      </section>

      {/* 이전글 / 다음글 / 목록 버튼 */}
      <div className="flex items-center justify-between border-b border-t border-slate-200 dark:border-slate-800 py-4">
        <Button variant="ghost" size="sm" asChild className="flex-1 justify-start">
          {prevPost ? (
            <Link href={`/community/role/${prevPost.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[200px]">{prevPost.title}</span>
            </Link>
          ) : (
            <div className="text-muted-foreground cursor-not-allowed">
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              이전글
            </div>
          )}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community?tab=role">
            <List className="mr-2 h-4 w-4" />
            목록
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="flex-1 justify-end">
          {nextPost ? (
            <Link href={`/community/role/${nextPost.id}`}>
              <span className="truncate max-w-[200px]">{nextPost.title}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div className="text-muted-foreground cursor-not-allowed">
              다음글
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </div>
          )}
        </Button>
      </div>

      {/* 댓글 섹션 */}
      <section className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-semibold mb-3">댓글</h2>
        <CommentForm postId={params.id as string} onSubmit={fetchComments} />
        <Separator className="my-4" />
        <CommentList
          comments={comments}
          currentUserId={currentUserId}
          onUpdate={fetchComments}
        />
      </section>

      {/* 전체 게시글 리스트 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">전체게시글</h3>
        {relatedPosts.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            {relatedPosts.map((p) => (
              <PostListItem
                key={p.id}
                href={`/community/role/${p.id}`}
                title={p.title}
                categoryLabel={undefined}
                authorName={p.profiles?.display_name || '익명'}
                avatarUrl={null}
                commentCount={p.commentCount || 0}
                likeCount={0}
                viewCount={p.view_count || 0}
                createdAt={p.created_at}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}

