'use client'

import { useState, useEffect } from 'react'
import { PostListItem } from './PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post } from '@/types/database'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const categoryLabels: Record<string, string> = {
  treatment: '진료이야기',
  claims: '심사청구',
  startup: '개원·경영',
  cs: 'CS',
  hr: 'HR',
  chat: '잡담',
}

interface FreeBoardProps {
  initialPosts?: Post[]
  activeTab?: string
  searchQuery?: string
  activeTag?: string | null
}

export function FreeBoard({ initialPosts = [], activeTab = 'communication', searchQuery: externalSearchQuery = '', activeTag = null }: FreeBoardProps) {
  const [posts, setPosts] = useState<(Post & { commentCount?: number; likeCount?: number; viewCount?: number })[]>(initialPosts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery)
  const [isStaff, setIsStaff] = useState(false)
  const postsPerPage = 10 // 고정값
  const supabase = createClient()
  
  // 관리자 여부 확인
  useEffect(() => {
    async function checkStaff() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsStaff(false)
        return
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()
      
      // 스탭 권한: manager, admin_staff 또는 staff@medifirst.com
      setIsStaff(
        profile?.role === 'manager' || 
        profile?.role === 'admin_staff' || 
        profile?.email === 'staff@medifirst.com'
      )
    }
    checkStaff()
  }, [supabase])
  
  // 외부에서 전달된 searchQuery가 변경되면 내부 state 업데이트
  useEffect(() => {
    setSearchQuery(externalSearchQuery)
  }, [externalSearchQuery])

  useEffect(() => {
    setPosts(initialPosts)
    setTotalPages(Math.ceil(initialPosts.length / postsPerPage))
    setCurrentPage(1)
  }, [initialPosts, postsPerPage])

  // 태그 및 검색 필터링
  let filteredPosts = posts

  // 태그 필터링
  if (activeTag) {
    if (activeTab === 'communication') {
      // 소통광장 태그 필터링
      if (activeTag === 'free') {
        filteredPosts = filteredPosts.filter(post => post.sub_board === 'free' && post.category !== 'anonymous')
      } else if (activeTag === 'question') {
        filteredPosts = filteredPosts.filter(post => (post.sub_board === 'qa' || post.is_question) && post.category !== 'anonymous')
      } else if (activeTag === 'anonymous') {
        // 익명 태그 필터링
        filteredPosts = filteredPosts.filter(post => post.category === 'anonymous')
      } else if (['medical', 'info', 'restaurant'].includes(activeTag)) {
        // 카테고리 기반 필터링 (category 필드 사용)
        filteredPosts = filteredPosts.filter(post => post.category === activeTag)
      }
    } else if (activeTab === 'marketplace') {
      // 장터 태그 필터링
      if (activeTag === 'sell' || activeTag === 'buy') {
        filteredPosts = filteredPosts.filter(post => post.category === activeTag)
      }
    }
  }

  // 검색 필터링
  if (searchQuery.trim()) {
    filteredPosts = filteredPosts.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  useEffect(() => {
    setTotalPages(Math.ceil(filteredPosts.length / postsPerPage))
    setCurrentPage(1)
  }, [searchQuery, activeTag, filteredPosts.length, postsPerPage])

  const getWriteHref = () => {
    return '/community/new'
  }

  const getPostHref = (post: Post) => {
    if (activeTab === 'marketplace') return `/community/marketplace/${post.id}`
    if (post.sub_board === 'free') return `/community/free/${post.id}`
    if (post.sub_board === 'qa') return `/community/qa/${post.id}`
    return `/community/free/${post.id}`
  }

  const getCategoryLabel = (post: Post) => {
    if (activeTab === 'marketplace') {
      if (post.category === 'sell') return '팝니다'
      if (post.category === 'buy') return '삽니다'
      return '장터'
    }
    if (post.sub_board === 'free') {
      if (post.category === 'medical') return '의학'
      if (post.category === 'info') return '정보'
      if (post.category === 'restaurant') return '맛집'
      if (post.category === 'anonymous') return '익명'
      return '자유'
    }
    if (post.sub_board === 'qa' || post.is_question) {
      if (post.category === 'anonymous') return '익명'
      return '질문'
    }
    return '소통광장'
  }

  return (
    <div className="space-y-0">
      {paginatedPosts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">게시글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {paginatedPosts.map((post, index) => (
            <PostListItem
              key={post.id}
              href={getPostHref(post)}
              title={post.title}
              categoryLabel={getCategoryLabel(post)}
              createdAt={post.created_at}
              updatedAt={post.updated_at}
              isPinned={post.is_pinned || false}
              index={index}
              likeCount={post.likeCount || post.like_count || 0}
              commentCount={post.commentCount || 0}
              viewCount={post.viewCount || post.view_count || 0}
              authorDisplayName={post.profiles?.display_name || null}
              avatarUrl={(post.profiles as any)?.avatar_url || null}
              showStats={true}
              isAnonymous={post.category === 'anonymous'}
              isStaff={false}
            />
          ))}
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
            href={getWriteHref()}
            className="inline-flex items-center rounded-md bg-[#00B992] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00A882] active:bg-[#009872] transition-colors"
          >
            글쓰기
          </a>
        </div>
      </div>
    </div>
  )
}
