'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PostListItem } from './PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post } from '@/types/database'
import { PenLine, Search } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  treatment: '진료질문',
  claims: '심사청구질문',
  admin: '원무/행정질문',
  startup: '개원질문',
}

export function QABoard() {
  const [posts, setPosts] = useState<(Post & { commentCount?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const postsPerPage = 20
  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    
    try {
      // 전체 개수 조회
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('board', 'community')
        .eq('sub_board', 'qa')
        .eq('is_question', true)
        .is('deleted_at', null)

      // 검색어가 있으면 제목으로 필터링
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
        .eq('board', 'community')
        .eq('sub_board', 'qa')
        .eq('is_question', true)
        .is('deleted_at', null)

      // 검색어가 있으면 제목으로 필터링
      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery.trim()}%`)
      }

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + postsPerPage - 1)

      if (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
      } else {
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
    setCurrentPage(1) // 검색 시 첫 페이지로 리셋
  }, [searchQuery])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // 페이지 포커스 시 게시글 새로고침
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
        <h2 className="text-xl font-semibold">질문게시판</h2>
        <Button asChild className="ml-auto rounded-full bg-black text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/90">
          <Link href="/community/qa/new">
            <PenLine className="h-4 w-4" />
            질문하기
          </Link>
        </Button>
      </div>

      {/* 게시글 리스트 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          질문이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              href={`/community/qa/${post.id}`}
              title={post.title}
              categoryLabel={post.category ? categoryLabels[post.category] : undefined}
              authorName={post.profiles?.display_name || '익명'}
              avatarUrl={post.profiles?.avatar_url || null}
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
      </div>
    </div>
  )
}

