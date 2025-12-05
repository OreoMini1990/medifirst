'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PostListItem } from '@/components/community/PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post } from '@/types/database'
import { PenLine, Search, Lock } from 'lucide-react'

type QATag = 'all' | 'health_insurance' | 'auto_insurance' | 'industrial' | 'etc'

const qaTagLabels: Record<QATag, string> = {
  all: '전체',
  health_insurance: '건보',
  auto_insurance: '자보',
  industrial: '산재',
  etc: '기타',
}

export function QABoard() {
  const [posts, setPosts] = useState<(Post & { commentCount?: number; isAnswered?: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState<QATag>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const postsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

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
        
        // 스탭 권한: manager 또는 admin_staff
        setIsStaff(profile?.role === 'manager' || profile?.role === 'admin_staff')
      }
    }
    getCurrentUser()
  }, [supabase])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    
    try {
      // 전체 개수 조회
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('board', 'claims')
        .eq('sub_board', 'qa')
        .is('deleted_at', null)

      if (searchQuery.trim()) {
        countQuery = countQuery.ilike('title', `%${searchQuery.trim()}%`)
      }
      
      // 태그 필터링
      if (activeTag !== 'all') {
        countQuery = countQuery.eq('category', activeTag)
      }

      console.log('QABoard: Fetching posts with board=claims, sub_board=qa')
      const { count } = await countQuery
      const total = count || 0
      console.log('QABoard: Total posts count:', total)
      setTotalPages(Math.ceil(total / postsPerPage))

      // 게시글 조회
      const offset = (currentPage - 1) * postsPerPage
      let query = supabase
        .from('posts')
        .select('*, profiles!author_id(display_name, role)')
        .eq('board', 'claims')
        .eq('sub_board', 'qa')
        .is('deleted_at', null)

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery.trim()}%`)
      }
      
      // 태그 필터링
      if (activeTag !== 'all') {
        query = query.eq('category', activeTag)
      }

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + postsPerPage - 1)

      if (error) {
        console.error('QABoard: Error fetching posts:', error)
        console.error('QABoard: Error details:', JSON.stringify(error, null, 2))
        setPosts([])
      } else {
        console.log('QABoard: Fetched', data?.length || 0, 'posts')
        if (data && data.length > 0) {
          console.log('QABoard: Sample post:', { id: data[0].id, title: data[0].title, board: data[0].board, sub_board: data[0].sub_board })
        }
        // 각 게시글의 댓글 수 및 답변 여부 조회
        const postsWithComments = await Promise.all(
          (data || []).map(async (post) => {
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
              .is('deleted_at', null)
            
            // 댓글이 있으면 답변완료로 간주
            const isAnswered = (count || 0) > 0
            
            return { ...post, commentCount: count || 0, isAnswered }
          })
        )
        console.log('Posts with comments:', postsWithComments.length)
        setPosts(postsWithComments as Post[])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, postsPerPage, searchQuery, activeTag, supabase])

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
      {/* 태그 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'health_insurance', 'auto_insurance', 'industrial', 'etc'] as QATag[]).map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setActiveTag(tag)
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTag === tag
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {qaTagLabels[tag]}
          </button>
        ))}
      </div>
      
      {/* 게시글 리스트 */}
      {loading ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">로딩 중...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">문의글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {posts.map((post, index) => {
            // 작성자이거나 스탭인지 확인
            const canViewContent = currentUserId === post.author_id || isStaff
            
            // 태그 라벨 매핑
            const getCategoryLabel = (category: string | null): string => {
              if (!category) return '기타'
              const labels: Record<string, string> = {
                'health_insurance': '건보',
                'auto_insurance': '자보',
                'industrial': '산재',
                'etc': '기타',
              }
              return labels[category] || category
            }
            
            // 작성자 닉네임 일부 표시 (관리자가 아닌 경우에도)
            const getPartialAuthorName = (name: string | null | undefined): string => {
              if (!name) return ''
              if (name.length <= 2) return name
              return name[0] + '*'.repeat(name.length - 1)
            }
            
            const authorName = post.profiles?.display_name || ''
            const displayAuthorName = isStaff ? authorName : getPartialAuthorName(authorName)
            
            return (
              <PostListItem
                key={post.id}
                href={`/claims/qa/${post.id}`}
                title={post.title}
                categoryLabel={getCategoryLabel(post.category)}
                createdAt={post.created_at}
                updatedAt={post.updated_at}
                isPinned={post.is_pinned || false}
                index={index}
                likeCount={0}
                commentCount={post.commentCount || 0}
                viewCount={post.view_count || 0}
                isLocked={true}
                authorDisplayName={displayAuthorName}
                avatarUrl={(post.profiles as any)?.avatar_url || null}
                isAnswered={post.isAnswered}
                showStats={false}
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
        <div className="flex justify-end">
          <a
            href="/claims/qa/new"
            className="inline-flex items-center rounded-md bg-[#00B992] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00A882] active:bg-[#009872] transition-colors"
          >
            문의하기
          </a>
        </div>
      </div>
    </div>
  )
}

