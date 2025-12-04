'use client'

import { useState, useEffect } from 'react'
import { PostListItem } from './PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post, UserRole } from '@/types/database'
import { Search } from 'lucide-react'

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

const getRoleShortLabel = (role: UserRole | string | null): string => {
  if (!role) return ''
  const fullLabel = roleLabels[role as UserRole] || role
  if (fullLabel.length <= 2) return fullLabel
  if (fullLabel === '간호조무사') return '간조'
  if (fullLabel === '물리치료사') return '물치'
  if (fullLabel === '방사선사') return '방사'
  if (fullLabel === '행정·원무') return '행정'
  return fullLabel.slice(0, 2)
}

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

interface AllPostsBoardProps {
  initialPosts?: (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[]
  userRole?: UserRole | null
  activeTab?: string
  searchQuery?: string
}

export function AllPostsBoard({ initialPosts = [], userRole = null, activeTab = 'all', searchQuery: externalSearchQuery = '' }: AllPostsBoardProps) {
  const [posts, setPosts] = useState<(Post & { commentCount?: number; likeCount?: number; viewCount?: number })[]>(initialPosts)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery)
  const postsPerPage = 10 // 고정값
  
  // 외부에서 전달된 searchQuery가 변경되면 내부 state 업데이트
  useEffect(() => {
    setSearchQuery(externalSearchQuery)
  }, [externalSearchQuery])

  useEffect(() => {
    setPosts(initialPosts)
    setTotalPages(Math.ceil(initialPosts.length / postsPerPage))
    setCurrentPage(1)
  }, [initialPosts, postsPerPage])

  // 검색 필터링
  const filteredPosts = searchQuery.trim()
    ? posts.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  useEffect(() => {
    setTotalPages(Math.ceil(filteredPosts.length / postsPerPage))
    setCurrentPage(1)
  }, [searchQuery, filteredPosts.length, postsPerPage])


  if (!userRole) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-600 mb-2">로그인이 필요합니다.</p>
        <p className="text-xs text-slate-400">게시글을 보려면 먼저 로그인해주세요.</p>
      </div>
    )
  }

  const getWriteHref = () => {
    if (activeTab === 'all' || activeTab === 'role') return '/community/role/new'
    if (activeTab === 'free') return '/community/free/new'
    return '/community/qa/new'
  }

  return (
    <div className="space-y-4">
      {paginatedPosts.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          게시글이 없습니다.
        </div>
      ) : (
        <ul>
          {paginatedPosts.map((post, index) => {
            const category = getBoardTag(post, userRole) || ''
            return (
              <PostListItem
                key={post.id}
                href={getPostHref(post)}
                title={post.title}
                categoryLabel={category}
                boardTag={category}
                createdAt={post.created_at}
                updatedAt={post.updated_at}
                isPinned={post.is_pinned || false}
                index={index}
                likeCount={post.likeCount || 0}
                commentCount={post.commentCount || 0}
                viewCount={post.viewCount || 0}
              />
            )
          })}
        </ul>
      )}

      {/* 하단 영역 */}
      <div className="flex items-center justify-between py-4">
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
            className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
          >
            {activeTab === 'qa' ? '질문하기' : '글쓰기'}
          </a>
        </div>
      </div>
    </div>
  )
}
