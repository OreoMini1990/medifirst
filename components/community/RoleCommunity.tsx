'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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

interface RoleCommunityProps {
  initialPosts?: Post[]
  userRole?: UserRole | null
  activeTab?: string
  searchQuery?: string
  activeTag?: string | null
  userRoles?: UserRole[]
}

export function RoleCommunity({ initialPosts = [], userRole = null, activeTab = 'role', searchQuery: externalSearchQuery = '', activeTag = null, userRoles = [] }: RoleCommunityProps) {
  const [posts, setPosts] = useState<(Post & { commentCount?: number; likeCount?: number; viewCount?: number })[]>(initialPosts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[])
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

  // 직무별 게시글은 sub_board가 'role'이고 category가 직무(UserRole)인 경우만 표시
  filteredPosts = filteredPosts.filter(post => {
    if (post.sub_board !== 'role') return false
    const postCategory = post.category as string
    return postCategory && ['doctor', 'locum_doctor', 'manager', 'nurse', 'assistant', 'pt', 'rt', 'cp', 'admin_staff', 'etc'].includes(postCategory)
  })

  // 태그 필터링 (직무별)
  if (activeTag) {
    // 특정 직무 태그 선택 시 해당 직무 게시글만 표시
    filteredPosts = filteredPosts.filter(post => post.category === activeTag)
  } else if (userRoles.length > 0) {
    // 로그인한 경우: 사용자의 모든 직무 게시글 표시
    filteredPosts = filteredPosts.filter(post => userRoles.includes(post.category as UserRole))
  }
  // 로그인 안한 경우: 전체 직무 게시글 표시 (필터링 없음)

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
  // 직무별 게시글은 로그인한 경우 해당 직무 게시글만, 로그인 안한 경우 전체 직무 게시글 표시

  const getWriteHref = () => {
    return '/community/new'
  }

  return (
    <div className="space-y-0">
      {/* 게시글 리스트 */}
      {paginatedPosts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">게시글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {paginatedPosts.map((post, index) => {
            // 게시글의 category를 기반으로 라벨 가져오기
            const postCategory = post.category as UserRole
            const categoryLabel = postCategory ? roleLabels[postCategory] || postCategory : ''
            const shortLabel = getRoleShortLabel(postCategory)
            
            return (
              <PostListItem
                key={post.id}
                href={`/community/role/${post.id}`}
                title={post.title}
                categoryLabel={shortLabel || categoryLabel}
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
            글쓰기
          </a>
        </div>
      </div>
    </div>
  )
}
