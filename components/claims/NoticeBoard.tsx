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
    <div className="space-y-0">
      {/* 게시글 리스트 */}
      {loading ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">로딩 중...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">게시글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {posts.map((post, index) => {
            // 1달 이내 게시글인지 확인 (30일)
            const isNewWithinMonth = () => {
              if (!post.created_at) return false
              const now = new Date()
              const created = new Date(post.created_at)
              const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
              return diffDays <= 30
            }
            
            return (
              <PostListItem
                key={post.id}
                href={`/claims/notice/${post.id}`}
                title={post.title}
                categoryLabel="고시"
                createdAt={post.created_at}
                updatedAt={post.updated_at}
                isPinned={post.is_pinned || false}
                index={index}
                likeCount={0}
                commentCount={post.commentCount || 0}
                viewCount={post.view_count || 0}
                isNewWithinMonth={isNewWithinMonth()}
                hasBackground={true}
              />
            )
          })}
        </ul>
      )}

      {/* 하단 영역 */}
      <div className="flex items-center justify-between pt-6 pb-2 border-t border-slate-100 mt-6">
        {/* 페이지네이션 */}
        <div className="flex justify-center flex-1">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        
        {/* 글쓰기 버튼 */}
        {isStaff && (
          <div className="flex justify-end">
            <a
              href="/claims/notice/new"
              className="inline-flex items-center rounded-md bg-[#00B992] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00A882] active:bg-[#009872] transition-colors"
            >
              글쓰기
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

