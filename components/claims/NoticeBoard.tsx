'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PostListItem } from '@/components/community/PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post } from '@/types/database'
import { PenLine, Search } from 'lucide-react'

export function NoticeBoard() {
  const [posts, setPosts] = useState<(Post & { commentCount?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const postsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkStaffPermission() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setIsStaff(profile?.role === 'manager' || profile?.role === 'admin_staff')
      }
    }
    checkStaffPermission()
  }, [supabase])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    
    try {
      // 전체 개수 조회
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('board', 'claims')
        .eq('sub_board', 'notice')
        .is('deleted_at', null)

      if (searchQuery.trim()) {
        countQuery = countQuery.ilike('title', `%${searchQuery.trim()}%`)
      }

      const { count } = await countQuery
      const total = count || 0
      setTotalPages(Math.ceil(total / postsPerPage))

      // 게시글 조회
      const offset = (currentPage - 1) * postsPerPage
      let query = supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('board', 'claims')
        .eq('sub_board', 'notice')
        .is('deleted_at', null)

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery.trim()}%`)
      }

      console.log('NoticeBoard: Fetching posts with board=claims, sub_board=notice')
      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + postsPerPage - 1)

      if (error) {
        console.error('NoticeBoard: Error fetching posts:', error)
        console.error('NoticeBoard: Error code:', error.code)
        console.error('NoticeBoard: Error message:', error.message)
        console.error('NoticeBoard: Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        console.error('NoticeBoard: Error hint:', error.hint)
        console.error('NoticeBoard: Full error object:', error)
        
        // 데이터베이스 제약 조건 에러인 경우 사용자에게 안내
        if (error.code === '23514' || error.message?.includes('CHECK constraint')) {
          console.error('NoticeBoard: Database constraint error - sub_board "notice" may not be allowed yet')
        }
        
        setPosts([])
      } else {
        console.log('NoticeBoard: Fetched', data?.length || 0, 'posts')
        if (data && data.length > 0) {
          console.log('NoticeBoard: Sample post:', { id: data[0].id, title: data[0].title, board: data[0].board, sub_board: data[0].sub_board })
        }
        // 각 게시글의 댓글 수 조회
        const postsWithComments = await Promise.all(
          (data || []).map(async (post) => {
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
              .is('deleted_at', null)
            
            return { ...post, commentCount: count || 0 }
          })
        )
        setPosts(postsWithComments as Post[])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, postsPerPage, searchQuery, supabase])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
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
  }, [fetchPosts])

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">최신고시</h2>
        {isStaff && (
          <Button asChild className="ml-auto rounded-full bg-black text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/90">
            <Link href="/claims/notice/new">
              <PenLine className="h-4 w-4" />
              글쓰기
            </Link>
          </Button>
        )}
      </div>

      {/* 게시글 리스트 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          게시글이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              href={`/claims/notice/${post.id}`}
              title={post.title}
              authorName={post.profiles?.display_name || '익명'}
              avatarUrl={null}
              commentCount={post.commentCount || 0}
              likeCount={0}
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
          onClick={() => setCurrentPage(1)}
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

