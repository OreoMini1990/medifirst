'use client'

import { useState, useEffect } from 'react'
import { PostListItem } from './PostListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Post } from '@/types/database'
import { Search } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  treatment: '진료질문',
  claims: '심사청구질문',
  admin: '원무/행정질문',
  startup: '개원질문',
}

interface QABoardProps {
  initialPosts?: Post[]
  activeTab?: string
  postsPerPage?: number
  searchQuery?: string
}

export function QABoard({ initialPosts = [], activeTab = 'qa', postsPerPage: externalPostsPerPage, searchQuery: externalSearchQuery }: QABoardProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '')
  const [postsPerPage, setPostsPerPage] = useState(externalPostsPerPage || 20)
  
  // 외부에서 전달된 값이 변경되면 내부 state 업데이트
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery)
    }
  }, [externalSearchQuery])
  
  useEffect(() => {
    if (externalPostsPerPage !== undefined) {
      setPostsPerPage(externalPostsPerPage)
    }
  }, [externalPostsPerPage])

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

  const getWriteHref = () => {
    return '/community/qa/new'
  }

  return (
    <div className="space-y-4">
      {paginatedPosts.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          질문이 없습니다.
        </div>
      ) : (
        <ul>
          {paginatedPosts.map((post, index) => (
            <PostListItem
              key={post.id}
              href={`/community/qa/${post.id}`}
              title={post.title}
              categoryLabel="질문"
              createdAt={post.created_at}
              updatedAt={post.updated_at}
              isPinned={post.is_pinned || false}
              index={index}
              likeCount={post.like_count || 0}
              commentCount={0}
              viewCount={post.view_count || 0}
            />
          ))}
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
            질문하기
          </a>
        </div>
      </div>
    </div>
  )
}
