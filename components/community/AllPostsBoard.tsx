'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PostListItem } from './PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post, UserRole } from '@/types/database'
import { PenLine, Search } from 'lucide-react'

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

// 직역명을 2글자로 줄이는 함수
const getRoleShortLabel = (role: UserRole | string | null): string => {
  if (!role) return ''
  const fullLabel = roleLabels[role as UserRole] || role
  if (fullLabel.length <= 2) return fullLabel
  // 2글자로 줄이기
  if (fullLabel === '간호조무사') return '간조'
  if (fullLabel === '물리치료사') return '물치'
  if (fullLabel === '방사선사') return '방사'
  if (fullLabel === '행정·원무') return '행정'
  return fullLabel.slice(0, 2)
}

// 게시판 태그 생성 함수
const getBoardTag = (post: Post, userRole: UserRole | null): string => {
  if (post.sub_board === 'role') {
    return getRoleShortLabel(post.category as UserRole)
  } else if (post.sub_board === 'free') {
    return '자유'
  } else if (post.sub_board === 'qa') {
    return '질문'
  }
  return ''
}

// 게시글 링크 생성 함수
const getPostHref = (post: Post): string => {
  if (post.sub_board === 'role') {
    return `/community/role/${post.id}`
  } else if (post.sub_board === 'free') {
    return `/community/free/${post.id}`
  } else if (post.sub_board === 'qa') {
    return `/community/qa/${post.id}`
  }
  return '#'
}

export function AllPostsBoard() {
  const [posts, setPosts] = useState<(Post & { commentCount?: number })[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const postsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchUserRole()
  }, [])

  async function fetchUserRole() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role) {
      router.push('/onboarding')
      return
    }

    setUserRole(profile.role as UserRole)
  }

  const fetchPosts = useCallback(async () => {
    if (!userRole) return
    
    setLoading(true)
    
    try {
      // 각 게시판별로 조회 후 합치기
      // 1. 사용자 직역 게시판
      let roleQuery = supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('board', 'community')
        .eq('sub_board', 'role')
        .eq('category', userRole)
        .is('deleted_at', null)

      // 2. 자유게시판
      let freeQuery = supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('board', 'community')
        .eq('sub_board', 'free')
        .is('deleted_at', null)

      // 3. 질문게시판
      let qaQuery = supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('board', 'community')
        .eq('sub_board', 'qa')
        .eq('is_question', true)
        .is('deleted_at', null)

      // 검색어가 있으면 제목으로 필터링
      if (searchQuery.trim()) {
        const searchTerm = `%${searchQuery.trim()}%`
        roleQuery = roleQuery.ilike('title', searchTerm)
        freeQuery = freeQuery.ilike('title', searchTerm)
        qaQuery = qaQuery.ilike('title', searchTerm)
      }

      // 각 게시판에서 게시글 가져오기
      const [roleResult, freeResult, qaResult] = await Promise.all([
        roleQuery.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
        freeQuery.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
        qaQuery.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
      ])

      // 모든 게시글 합치기
      const allPosts: Post[] = []
      if (roleResult.data) allPosts.push(...roleResult.data)
      if (freeResult.data) allPosts.push(...freeResult.data)
      if (qaResult.data) allPosts.push(...qaResult.data)

      // 생성일 기준으로 정렬
      allPosts.sort((a, b) => {
        // 고정글 우선
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        // 생성일 내림차순
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      // 전체 개수 계산
      const total = allPosts.length
      setTotalPages(Math.ceil(total / postsPerPage))

      // 페이지네이션 적용
      const offset = (currentPage - 1) * postsPerPage
      const paginatedPosts = allPosts.slice(offset, offset + postsPerPage)

      // 각 게시글의 댓글 수 조회
      const postsWithComments = await Promise.all(
        paginatedPosts.map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
            .is('deleted_at', null)
          
          return { ...post, commentCount: count || 0 }
        })
      )
      setPosts(postsWithComments as Post[])
    } catch (err) {
      console.error('Unexpected error:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [userRole, currentPage, postsPerPage, searchQuery, supabase])

  useEffect(() => {
    if (userRole) {
      fetchPosts()
    }
  }, [userRole, currentPage, searchQuery, fetchPosts])

  // 페이지 포커스 시 게시글 새로고침
  useEffect(() => {
    if (!userRole) return

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [userRole, fetchPosts])

  if (!userRole) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">전체글</h2>
        <Button asChild className="ml-auto rounded-full bg-black text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/90">
          <Link href="/community/role/new">
            <PenLine className="h-4 w-4" />
            글쓰기
          </Link>
        </Button>
      </div>

      {/* 게시글 리스트 */}
      {!loading && posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          게시글이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              href={getPostHref(post)}
              title={post.title}
              boardTag={getBoardTag(post, userRole)}
              authorName={post.profiles?.display_name || '익명'}
              commentCount={post.commentCount || 0}
              likeCount={post.like_count || 0}
              viewCount={post.view_count || 0}
              createdAt={post.created_at}
            />
          ))}
        </ul>
      )}

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* 검색 바 */}
      <div className="mt-4 flex w-full max-w-xl mx-auto items-center gap-2">
        <select className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm">
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>
        <input
          className="flex-1 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="검색할 단어 입력"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              setCurrentPage(1)
            }
          }}
        />
        <Button
          className="h-10 px-4 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-sm flex items-center gap-1 hover:bg-slate-800 dark:hover:bg-slate-700"
          onClick={() => {
            setCurrentPage(1)
          }}
        >
          <Search className="h-4 w-4" />
          검색
        </Button>
        {searchQuery && (
          <Button
            variant="outline"
            className="h-10 px-4 rounded-full text-sm"
            onClick={() => {
              setSearchQuery('')
              setCurrentPage(1)
            }}
          >
            초기화
          </Button>
        )}
      </div>
    </div>
  )
}

