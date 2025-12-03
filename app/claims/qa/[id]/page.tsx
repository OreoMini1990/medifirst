'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Post, Comment } from '@/types/database'
import { ArrowLeft, ArrowRight, Edit, Trash2, Eye, ThumbsUp, List, Lock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommentList } from '@/components/community/CommentList'
import { CommentForm } from '@/components/community/CommentForm'
import { PostListItem } from '@/components/community/PostListItem'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ClaimsQADetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<(Post & { commentCount?: number })[]>([])
  const [prevPost, setPrevPost] = useState<Post | null>(null)
  const [nextPost, setNextPost] = useState<Post | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setIsStaff(profile?.role === 'manager' || profile?.role === 'admin_staff')
      }
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
      fetch(`/api/posts/${params.id}/view`, {
        method: 'POST',
      }).catch(() => {})
    }
  }, [post?.id, params.id, loading])

  async function fetchPost() {
    try {
      setLoading(true)
      console.log('ClaimsQA: Fetching post with id:', params.id)
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('ClaimsQA: Error fetching post:', error.message || error)
        console.error('ClaimsQA: Error details:', JSON.stringify(error, null, 2))
        console.error('ClaimsQA: Post ID:', params.id)
        setPost(null)
        setLoading(false)
      } else if (data) {
        console.log('ClaimsQA: Post fetched successfully:', { id: data.id, title: data.title, board: data.board, sub_board: data.sub_board })
        setPost(data)
        fetchComments()
        fetchRelatedPosts(data)
        fetchPrevNextPosts(data)
        setLoading(false)
      } else {
        console.error('ClaimsQA: No data returned for post ID:', params.id)
        setPost(null)
        setLoading(false)
      }
    } catch (err) {
      console.error('ClaimsQA: Unexpected error fetching post:', err)
      setPost(null)
      setLoading(false)
    }
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles!author_id(display_name, role, avatar_url)')
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
    if (!targetPost) return

    const currentDate = new Date(targetPost.created_at)

    const { data: prevData, error: prevError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('board', 'claims')
      .eq('sub_board', 'qa')
      .gt('created_at', currentDate.toISOString())
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const { data: nextData, error: nextError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('board', 'claims')
      .eq('sub_board', 'qa')
      .lt('created_at', currentDate.toISOString())
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (prevError) console.error('Error fetching previous post:', prevError)
    if (nextError) console.error('Error fetching next post:', nextError)

    if (!prevError && prevData) setPrevPost(prevData as Post)
    else setPrevPost(null)
    
    if (!nextError && nextData) setNextPost(nextData as Post)
    else setNextPost(null)
  }

  async function fetchRelatedPosts(postData?: Post) {
    const targetPost = postData || post
    if (!targetPost) return

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!author_id(display_name, role, avatar_url)')
      .eq('board', 'claims')
      .eq('sub_board', 'qa')
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
      router.push('/claims?tab=qa')
      router.refresh()
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 7) {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
    if (days > 0) {
      return days === 1 ? '어제' : `${days}일 전`
    }
    if (hours > 0) {
      return `${hours}시간 전`
    }
    if (minutes > 0) {
      return `${minutes}분 전`
    }
    return '방금 전'
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>
  }

  // 접근 권한 확인: 작성자이거나 스탭만 내용을 볼 수 있음
  const canViewContent = currentUserId === post.author_id || isStaff
  
  // 디버깅 로그
  console.log('ClaimsQA: Access control check:', {
    currentUserId,
    postAuthorId: post.author_id,
    isStaff,
    canViewContent,
    isAuthor: currentUserId === post.author_id,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 이전글 / 다음글 / 목록 버튼 */}
      <div className="flex items-center justify-between border-b border-t border-slate-200 dark:border-slate-800 py-4">
        <Button variant="ghost" size="sm" asChild className="flex-1 justify-start">
          {prevPost ? (
            <Link href={`/claims/qa/${prevPost.id}`}>
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
          <Link href="/claims?tab=qa">
            <List className="mr-2 h-4 w-4" />
            목록
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="flex-1 justify-end">
          {nextPost ? (
            <Link href={`/claims/qa/${nextPost.id}`}>
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
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            조회 {post.view_count || 0}
          </span>
          <span>
            {formatRelativeTime(post.created_at)}
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
                  <Link href={`/claims/qa/edit/${post.id}`}>
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

        {/* 내용 접근 제어 */}
        {canViewContent ? (
          <article className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap leading-relaxed text-slate-900 dark:text-slate-100 min-h-[100px]">
              {post.content || '(내용 없음)'}
            </div>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <Lock className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
              비공개 문의글입니다
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">
              작성자와 스탭만 내용을 볼 수 있습니다.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
              현재 사용자: {currentUserId ? '로그인됨' : '비로그인'} | 작성자: {post.author_id?.substring(0, 8)}...
            </p>
          </div>
        )}
      </section>

      {/* 댓글 섹션 - 작성자와 스탭만 볼 수 있음 */}
      {canViewContent && (
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
      )}

      {/* 전체 게시글 리스트 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">전체게시글</h3>
        {relatedPosts.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            {relatedPosts.map((p) => {
              const canView = currentUserId === p.author_id || isStaff
              return (
                <PostListItem
                  key={p.id}
                  href={`/claims/qa/${p.id}`}
                  title={p.title}
                  authorName={p.profiles?.display_name || '익명'}
                  avatarUrl={null}
                  commentCount={p.commentCount || 0}
                  likeCount={0}
                  viewCount={p.view_count || 0}
                  createdAt={p.created_at}
                  isLocked={!canView}
                />
              )
            })}
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

