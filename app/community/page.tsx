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

type TabKey = 'all' | 'role' | 'communication' | 'marketplace'

const COMMUNITY_TABS = [
  { id: 'all', label: '전체글' },
  { id: 'role', label: '직무별 아지트' },
  { id: 'communication', label: '소통광장' },
  { id: 'marketplace', label: '장터' },
]

// 태그 타입 정의
type AllTag = 'all' | 'best' | 'hot'
type RoleTag = UserRole
type CommunicationTag = 'medical' | 'free' | 'question' | 'info' | 'restaurant' | 'anonymous'
type MarketplaceTag = 'sell' | 'buy'

type ActiveTag = AllTag | RoleTag | CommunicationTag | MarketplaceTag

function CommunityContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tagParam = searchParams.get('tag')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [activeTag, setActiveTag] = useState<ActiveTag | null>(tagParam as ActiveTag || null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<{
    all: (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[]
    role: Post[]
    communication: Post[]
    marketplace: Post[]
  }>({ all: [], role: [], communication: [], marketplace: [] })
  const [userRoles, setUserRoles] = useState<UserRole[]>([]) // 복수 직무 지원
  const supabase = createClient()

  useEffect(() => {
    if (tabParam === 'communication' || tabParam === 'marketplace' || tabParam === 'role' || tabParam === 'all') {
      setActiveTab(tabParam as TabKey)
    }
  }, [tabParam])

  useEffect(() => {
    if (tagParam) {
      setActiveTag(tagParam as ActiveTag)
    }
  }, [tagParam])

  // 사용자 role 가져오기 (복수 직무 지원)
  useEffect(() => {
    async function fetchUserRoles() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, roles') // roles는 복수 직무를 저장할 필드 (JSONB 배열)
          .eq('id', user.id)
          .single()

        if (profile) {
          // 복수 직무 지원: roles 배열이 있으면 사용, 없으면 role 단일값 사용
          const roles: UserRole[] = []
          if (profile.roles) {
            // JSONB 배열 파싱
            try {
              const rolesArray = typeof profile.roles === 'string' 
                ? JSON.parse(profile.roles) 
                : profile.roles
              if (Array.isArray(rolesArray)) {
                roles.push(...rolesArray.filter((r): r is UserRole => r !== null && r !== ''))
              }
            } catch (e) {
              console.error('Error parsing roles:', e)
            }
          }
          // roles가 비어있으면 role 단일값 사용
          if (roles.length === 0 && profile.role) {
            roles.push(profile.role as UserRole)
          }
          setUserRoles(roles)
        }
      } catch (error) {
        console.error('Error fetching user roles:', error)
      }
    }
    fetchUserRoles()
  }, [supabase])

  // 모든 게시판 데이터 한 번에 가져오기
  useEffect(() => {
    async function fetchAllData() {
      // 로딩 상태를 최소화: 데이터를 먼저 표시하고 카운트는 나중에 업데이트
      try {
        // 직무별 아지트: 로그인한 경우 사용자 직무 게시글, 로그인 안한 경우 전체 직무 게시글
        let roleQuery = supabase
          .from('posts')
          .select('*, profiles!author_id(display_name, role)')
          .eq('board', 'community')
          .eq('sub_board', 'role')
          .is('deleted_at', null)
        
        // 로그인한 경우에만 직무 필터링, 로그인 안한 경우 전체 표시
        if (userRoles.length > 0) {
          roleQuery = roleQuery.in('category', userRoles)
        }
        
        const roleResult = await roleQuery
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })

        if (roleResult.error) {
          console.error('Error fetching role posts:', JSON.stringify(roleResult.error, null, 2))
        }

        // 소통광장 (자유 + 질문 통합)
        const [freeResult, qaResult] = await Promise.all([
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
            .is('deleted_at', null)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
        ])

        if (freeResult.error) {
          console.error('Error fetching free posts:', JSON.stringify(freeResult.error, null, 2))
        }
        if (qaResult.error) {
          console.error('Error fetching qa posts:', JSON.stringify(qaResult.error, null, 2))
        }

        // 장터 게시판
        const marketplaceResult = await supabase
          .from('posts')
          .select('*, profiles!author_id(display_name, role)')
          .eq('board', 'community')
          .eq('sub_board', 'marketplace')
          .is('deleted_at', null)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })

        if (marketplaceResult.error) {
          console.error('Error fetching marketplace posts:', JSON.stringify(marketplaceResult.error, null, 2))
        }

        // 전체글: 유저의 해당 직무 글 + 소통광장 + 장터만 (다른 직무 글은 제외)
        const allPosts: Post[] = []
        // 유저의 직무 게시글만 추가
        if (roleResult.data && userRoles.length > 0) {
          allPosts.push(...roleResult.data.filter(post => userRoles.includes(post.category as UserRole)))
        }
        // 소통광장 게시글 추가
        if (freeResult.data) allPosts.push(...freeResult.data)
        if (qaResult.data) allPosts.push(...qaResult.data)
        // 장터 게시글 추가
        if (marketplaceResult.data) allPosts.push(...marketplaceResult.data)

        // 베스트 정렬 (조회순, 추후 월간추천순으로 변경 예정)
        const sortedAllPosts = [...allPosts].sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          // 베스트는 조회수 기준 (추후 월간 추천수로 변경)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        // 소통광장 데이터 통합
        const communicationPosts: Post[] = []
        if (freeResult.data) communicationPosts.push(...freeResult.data)
        if (qaResult.data) communicationPosts.push(...qaResult.data)
        communicationPosts.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        // 각 게시글에 댓글수, 좋아요수, 조회수 추가 (배치 처리로 성능 개선)
        const addCounts = async (posts: Post[]) => {
          if (posts.length === 0) return []
          
          // 모든 게시글 ID 수집
          const postIds = posts.map(p => p.id)
          
          // 배치로 댓글수, 좋아요수, 조회수 가져오기
          const [commentsResult, likesResult, viewsResult] = await Promise.all([
            supabase.from('comments').select('post_id').in('post_id', postIds).is('deleted_at', null),
            supabase.from('post_likes').select('post_id').in('post_id', postIds),
            supabase.from('post_views').select('post_id').in('post_id', postIds),
          ])
          
          // 카운트 맵 생성
          const commentCounts = new Map<string, number>()
          const likeCounts = new Map<string, number>()
          const viewCounts = new Map<string, number>()
          
          commentsResult.data?.forEach(c => {
            commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1)
          })
          likesResult.data?.forEach(l => {
            likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1)
          })
          viewsResult.data?.forEach(v => {
            viewCounts.set(v.post_id, (viewCounts.get(v.post_id) || 0) + 1)
          })
          
          // 게시글에 카운트 추가
          return posts.map(post => ({
            ...post,
            commentCount: commentCounts.get(post.id) || 0,
            likeCount: likeCounts.get(post.id) || 0,
            viewCount: viewCounts.get(post.id) || 0,
          }))
        }

        // 데이터를 먼저 표시 (카운트 없이)
        setData({
          all: sortedAllPosts.map(p => ({ ...p, commentCount: 0, likeCount: 0, viewCount: 0 })) as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          role: (roleResult.data || []).map(p => ({ ...p, commentCount: 0, likeCount: 0, viewCount: 0 })) as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          communication: communicationPosts.map(p => ({ ...p, commentCount: 0, likeCount: 0, viewCount: 0 })) as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          marketplace: (marketplaceResult.data || []).map(p => ({ ...p, commentCount: 0, likeCount: 0, viewCount: 0 })) as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
        })
        setLoading(false) // 데이터를 먼저 표시하고 로딩 종료

        // 카운트는 백그라운드에서 업데이트
        const [allPostsWithCounts, rolePostsWithCounts, communicationPostsWithCounts, marketplacePostsWithCounts] = await Promise.all([
          addCounts(sortedAllPosts),
          addCounts(roleResult.data || []),
          addCounts(communicationPosts),
          addCounts(marketplaceResult.data || [])
        ])

        // 카운트 업데이트
        setData({
          all: allPostsWithCounts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          role: rolePostsWithCounts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          communication: communicationPostsWithCounts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
          marketplace: marketplacePostsWithCounts as (Post & { commentCount?: number; likeCount?: number; viewCount?: number })[],
        })
      } catch (error) {
        console.error('Error fetching posts:', error)
        // 에러 발생 시 빈 배열로 초기화
        setData({
          all: [],
          role: [],
          communication: [],
          marketplace: [],
        })
        setLoading(false)
      }
    }

    fetchAllData()
  }, [userRoles, supabase])

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
                  onClick={() => {
                    setActiveTab(tab.id as TabKey)
                    setActiveTag(null) // 탭 변경 시 태그 초기화
                  }}
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

        {/* 태그 필터 영역 */}
        {activeTab && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeTab === 'all' && (
              <>
                <button
                  onClick={() => setActiveTag('all')}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    activeTag === 'all' || !activeTag
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  전체
                </button>
                <button
                  onClick={() => setActiveTag('best')}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    activeTag === 'best'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  베스트
                </button>
                <button
                  onClick={() => setActiveTag('hot')}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    activeTag === 'hot'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  핫이슈
                </button>
              </>
            )}
            {activeTab === 'role' && (
              <>
                {userRoles.length > 0 ? (
                  // 원장, 페닥, 의사 순으로 정렬
                  [...userRoles].sort((a, b) => {
                    const order: Record<UserRole, number> = {
                      manager: 1,
                      locum_doctor: 2,
                      doctor: 3,
                      nurse: 4,
                      assistant: 5,
                      pt: 6,
                      rt: 7,
                      cp: 8,
                      admin_staff: 9,
                      etc: 10,
                    }
                    return (order[a] || 99) - (order[b] || 99)
                  }).map((role) => {
                    const roleLabels: Record<UserRole, string> = {
                      doctor: '의사',
                      locum_doctor: '페닥',
                      manager: '원장', // 태그는 2글자 규칙에 따라 "원장"으로 표시
                      nurse: 'RN',
                      assistant: 'AN',
                      pt: '물치',
                      rt: '방사',
                      cp: '임병',
                      admin_staff: '원무',
                      etc: '기타',
                    }
                    return (
                      <button
                        key={role}
                        onClick={() => setActiveTag(role)}
                        className={clsx(
                          'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                          activeTag === role
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        )}
                      >
                        {roleLabels[role] || role}
                      </button>
                    )
                  })
                ) : (
                  <span className="text-xs text-slate-500">로그인 후 직무별 태그가 표시됩니다</span>
                )}
              </>
            )}
            {activeTab === 'communication' && (
              <>
                {(['medical', 'free', 'question', 'info', 'restaurant', 'anonymous'] as CommunicationTag[]).map((tag) => {
                  const tagLabels: Record<CommunicationTag, string> = {
                    medical: '의학',
                    free: '자유',
                    question: '질문',
                    info: '정보',
                    restaurant: '맛집',
                    anonymous: '익명',
                  }
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={clsx(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                        activeTag === tag
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      {tagLabels[tag]}
                    </button>
                  )
                })}
              </>
            )}
            {activeTab === 'marketplace' && (
              <>
                {(['sell', 'buy'] as MarketplaceTag[]).map((tag) => {
                  const tagLabels: Record<MarketplaceTag, string> = {
                    sell: '팝니다',
                    buy: '삽니다',
                  }
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={clsx(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                        activeTag === tag
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      {tagLabels[tag]}
                    </button>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* 탭별 콘텐츠 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-500">
              로딩중입니다...
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'all' && <AllPostsBoard initialPosts={data.all} userRole={userRoles[0] || null} activeTab={activeTab} searchQuery={searchQuery} activeTag={activeTag} />}
              {activeTab === 'role' && <RoleCommunity initialPosts={data.role} userRole={userRoles[0] || null} activeTab={activeTab} searchQuery={searchQuery} activeTag={activeTag} userRoles={userRoles} />}
              {activeTab === 'communication' && <FreeBoard initialPosts={data.communication} activeTab={activeTab} searchQuery={searchQuery} activeTag={activeTag} />}
              {activeTab === 'marketplace' && <FreeBoard initialPosts={data.marketplace} activeTab={activeTab} searchQuery={searchQuery} activeTag={activeTag} />}
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
