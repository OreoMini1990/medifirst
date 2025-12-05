'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AllPostsBoard } from '@/components/community/AllPostsBoard'
import { RoleCommunity } from '@/components/community/RoleCommunity'
import { FreeBoard } from '@/components/community/FreeBoard'
import { QABoard } from '@/components/community/QABoard'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'
import type { Post, UserRole } from '@/types/database'
import { Search } from 'lucide-react'

type TabKey = 'all' | 'role' | 'free' | 'qa'

const COMMUNITY_TABS = [
  { id: 'all', label: '전체글' },
  { id: 'role', label: '직업별 커뮤니티' },
  { id: 'free', label: '자유게시판' },
  { id: 'qa', label: '질문게시판' },
]

function CommunityContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<{
    all: (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[]
    role: Post[]
    free: Post[]
    qa: Post[]
  }>({ all: [], role: [], free: [], qa: [] })
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (tabParam === 'free' || tabParam === 'qa' || tabParam === 'role' || tabParam === 'all') {
      setActiveTab(tabParam as TabKey)
    }
  }, [tabParam])

  // 사용자 role 가져오기
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role) {
          setUserRole(profile.role as UserRole)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }
    fetchUserRole()
  }, [supabase])

  // 모든 게시판 데이터 한 번에 가져오기
  useEffect(() => {
    async function fetchAllData() {
      if (!userRole) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // 전체글 (role + free + qa 합치기)
        const [roleResult, freeResult, qaResult] = await Promise.all([
          supabase
            .from('posts')
            .select('*, profiles!author_id(display_name, role)')
            .eq('board', 'community')
            .eq('sub_board', 'role')
            .eq('category', userRole)
            .is('deleted_at', null)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
          supabase
            .from('posts')
            .select('*, profiles!author_id(display_name, role)')
            .eq('board', 'community')
            .eq('sub_board', 'free')
            .is('deleted_at', null)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
          supabase
            .from('posts')
            .select('*, profiles!author_id(display_name, role)')
            .eq('board', 'community')
            .eq('sub_board', 'qa')
            .eq('is_question', true)
            .is('deleted_at', null)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
        ])

        const allPosts: Post[] = []
        if (roleResult.data) allPosts.push(...roleResult.data)
        if (freeResult.data) allPosts.push(...freeResult.data)
        if (qaResult.data) allPosts.push(...qaResult.data)

        allPosts.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        // 각 게시글에 댓글수, 좋아요수, 조회수 추가
        const allPostsWithCounts = await Promise.all(
          allPosts.map(async (post) => {
            const [commentCount, likeCount, viewCount] = await Promise.all([
              supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id).is('deleted_at', null),
              supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
              supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
            ])
            return {
              ...post,
              commentCount: commentCount.count || 0,
              likeCount: likeCount.count || 0,
              viewCount: viewCount.count || 0,
            }
          })
        )

        setData({
          all: allPostsWithCounts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          role: roleResult.data || [],
          free: freeResult.data || [],
          qa: qaResult.data || [],
        })
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userRole) {
      fetchAllData()
    } else {
      setLoading(false)
    }
  }, [userRole, supabase])

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-6 pt-8 pb-12">
        {/* 상단 제목 영역 */}
        <section className="pt-8 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">커뮤니티</h1>
            <p className="mt-2 text-sm text-slate-500 font-normal">
              1차의료기관 종사자들을 위한 소통 공간
            </p>
          </div>
        </section>

        {/* 얇은 언더라인 탭 */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-8 text-[14px] items-center justify-between">
            <div className="flex gap-8">
              {COMMUNITY_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabKey)}
                  className={clsx(
                    'pb-3 -mb-px border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-[#00B992] text-slate-900 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00B992] focus:border-[#00B992]"
                defaultValue="title"
              >
                <option value="title">제목</option>
                <option value="content">내용</option>
                <option value="author">작성자</option>
              </select>
              <input
                className="h-9 w-52 rounded-md border border-slate-300 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00B992] focus:border-[#00B992]"
                placeholder="게시글 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="h-9 px-4 rounded-md bg-slate-900 text-[13px] font-semibold text-white hover:bg-slate-800 active:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                검색
              </button>
            </div>
          </nav>
        </div>

        {/* 탭별 콘텐츠 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-500">
              로딩중입니다...
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'all' && <AllPostsBoard initialPosts={data.all} userRole={userRole} activeTab={activeTab} searchQuery={searchQuery} />}
              {activeTab === 'role' && <RoleCommunity initialPosts={data.role} userRole={userRole} activeTab={activeTab} searchQuery={searchQuery} />}
              {activeTab === 'free' && <FreeBoard initialPosts={data.free} activeTab={activeTab} searchQuery={searchQuery} />}
              {activeTab === 'qa' && <QABoard initialPosts={data.qa} activeTab={activeTab} searchQuery={searchQuery} />}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function CommunityPage() {
  // throw new Error("COMMUNITY_PAGE_TEST_ERROR") // ✅ 임시로 주석 처리 - 나중에 다시 활성화 가능
  
  return (
    <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
      <CommunityContent />
    </Suspense>
  )
}
