'use client'

import { useState, useEffect } from 'react'
import { PostListItem } from './PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post, UserRole } from '@/types/database'
import { Search } from 'lucide-react'

const roleLabels: Record<UserRole, string> = {
  doctor: '의사',
  locum_doctor: '페닥',
  manager: '개원의',
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  cp: '임병',
  admin_staff: '원무',
  etc: '기타',
}

const getRoleShortLabel = (role: UserRole | string | null): string => {
  if (!role) return ''
  const fullLabel = roleLabels[role as UserRole] || role
  if (fullLabel.length <= 2) return fullLabel
  // 특정 직무는 약어로 표시
  if (role === 'manager') return '원장' // 태그는 2글자 규칙에 따라 "원장"으로 표시
  if (role === 'nurse') return 'RN'
  if (role === 'assistant') return 'AN'
  if (role === 'locum_doctor') return '페닥'
  if (role === 'cp') return '임병'
  if (fullLabel === '물리치료사') return '물치'
  if (fullLabel === '방사선사') return '방사'
  if (fullLabel === '원무') return '원무'
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
  activeTag?: string | null
}

export function AllPostsBoard({ initialPosts = [], userRole = null, activeTab = 'all', searchQuery: externalSearchQuery = '', activeTag = null }: AllPostsBoardProps) {
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

  // 태그 및 검색 필터링
  let filteredPosts = posts

  // 태그 필터링
  if (activeTag === 'best') {
    // 베스트: 월간(30일) 게시글 중 조회수 + 추천수 + 댓글수 점수로 상위 10개만
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000) // 30일 전
    
    filteredPosts = [...filteredPosts]
      .filter(post => {
        const postTime = new Date(post.created_at).getTime()
        return postTime >= thirtyDaysAgo // 최근 30일 내 게시글만
      })
      .map(post => {
        const viewScore = post.viewCount || 0
        const likeScore = post.likeCount || 0
        const commentScore = post.commentCount || 0
        const bestScore = viewScore + likeScore + commentScore
        return { ...post, bestScore }
      })
      .sort((a: any, b: any) => b.bestScore - a.bestScore)
      .slice(0, 10) // 상위 10개만
  } else if (activeTag === 'hot') {
    // 핫이슈: 신규 글(24시간 내) 중 조회수 + 추천수 + 댓글수 높은 글 10개만
    const now = Date.now()
    const oneDayAgo = now - (24 * 60 * 60 * 1000) // 24시간 전
    
    filteredPosts = [...filteredPosts]
      .filter(post => {
        const postTime = new Date(post.created_at).getTime()
        return postTime >= oneDayAgo // 최근 24시간 내 게시글만
      })
      .map(post => {
        const viewScore = post.viewCount || 0
        const likeScore = post.likeCount || 0
        const commentScore = post.commentCount || 0
        const hotScore = viewScore + likeScore + commentScore
        return { ...post, hotScore }
      })
      .sort((a: any, b: any) => b.hotScore - a.hotScore)
      .slice(0, 10) // 상위 10개만
  } else if (activeTag === 'all' || !activeTag) {
    // 전체: 기본 정렬 유지 (고정글 우선, 최신순)
    filteredPosts = [...filteredPosts].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
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
  }, [searchQuery, filteredPosts.length, postsPerPage])


  // 로그인 없이도 게시글 볼 수 있도록 변경

  const getWriteHref = () => {
    return '/community/new'
  }

  return (
    <div className="space-y-0">
      {paginatedPosts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">게시글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {paginatedPosts.map((post, index) => {
            const category = getBoardTag(post, userRole) || ''
            return (
              <PostListItem
                key={post.id}
                href={getPostHref(post)}
                title={post.title}
                categoryLabel={category}
                createdAt={post.created_at}
                updatedAt={post.updated_at}
                isPinned={post.is_pinned || false}
                index={index}
                likeCount={post.likeCount || 0}
                commentCount={post.commentCount || 0}
                viewCount={post.viewCount || 0}
                authorDisplayName={post.profiles?.display_name || null}
                avatarUrl={(post.profiles as any)?.avatar_url || null}
                showStats={true}
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
            href={getWriteHref()}
            className="inline-flex items-center rounded-md bg-[#00B992] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00A882] active:bg-[#009872] transition-colors"
          >
            {activeTab === 'qa' ? '질문하기' : '글쓰기'}
          </a>
        </div>
      </div>
    </div>
  )
}
