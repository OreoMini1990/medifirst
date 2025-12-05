'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Post } from '@/types/database'
import { PostListItem } from '@/components/community/PostListItem'

type SectionPosts = {
  community: (Post & { board_type?: string; comment_count?: number })[]
  startup: (Post & { board_type?: string; comment_count?: number })[]
  claims: (Post & { board_type?: string; comment_count?: number })[]
  jobs: any[]
}

export function CommunityStyleHomePage() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sectionPosts, setSectionPosts] = useState<SectionPosts>({
    community: [],
    startup: [],
    claims: [],
    jobs: []
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function loadData() {
      try {
        // 사용자 정보 로드
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          if (profile) setUser(profile)
        }

        // 각 섹션별로 최신 게시글 로드
        const [communityResult, startupResult, claimsResult, jobsResult] = await Promise.all([
          // 커뮤니티 게시글
          supabase
            .from('posts')
            .select('*, profiles!author_id(display_name, role)')
            .eq('board', 'community')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(5),
          // 개원·경영 게시글
          supabase
            .from('posts')
            .select('*, profiles!author_id(display_name, role)')
            .eq('board', 'startup')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(5),
          // 심사청구 게시글
          supabase
            .from('posts')
            .select('*, profiles!author_id(display_name, role)')
            .eq('board', 'claims')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(5),
          // 구인·구직 (jobs 테이블)
          supabase
            .from('jobs')
            .select('*, profiles:hospital_id(display_name)')
            .order('created_at', { ascending: false })
            .limit(5)
        ])

        // jobs 데이터를 posts 형식으로 변환
        const processedJobs = jobsResult.data ? jobsResult.data.map((job: any) => ({
          id: job.id,
          title: job.title,
          profiles: job.profiles || { display_name: '병원' },
          comment_count: 0,
          board_type: 'jobs',
          board: 'jobs',
          sub_board: null,
          created_at: job.created_at,
          updated_at: job.updated_at
        })) : []

        // 각 섹션별로 댓글 수 추가
        const processPosts = async (posts: Post[]) => {
          return await Promise.all(
            posts.map(async (post) => {
              const [commentsResult] = await Promise.all([
                supabase
                  .from('comments')
                  .select('id', { count: 'exact', head: true })
                  .eq('post_id', post.id),
              ])

              return {
                ...post,
                comment_count: commentsResult.count || 0,
                board_type: post.sub_board || post.board,
              } as Post & { board_type?: string; comment_count?: number }
            })
          )
        }

        setSectionPosts({
          community: communityResult.data ? await processPosts(communityResult.data) : [],
          startup: startupResult.data ? await processPosts(startupResult.data) : [],
          claims: claimsResult.data ? await processPosts(claimsResult.data) : [],
          jobs: processedJobs
        })
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getPostHref = (post: Post & { board_type?: string }, board?: string) => {
    if (board === 'startup') return `/startup?post=${post.id}`
    if (board === 'claims') {
      if (post.sub_board === 'notice') return `/claims/notice/${post.id}`
      return `/claims/qa/${post.id}`
    }
    if (board === 'jobs') return `/jobs/${post.id}`
    
    const boardType = post.board_type || post.sub_board || post.board
    if (boardType === 'role') return `/community/role/${post.id}`
    if (boardType === 'free') return `/community/free/${post.id}`
    if (boardType === 'qa') return `/community/qa/${post.id}`
    return `/community/${post.id}`
  }

  const getBoardTag = (post: Post & { board_type?: string }, board?: string) => {
    if (board === 'startup') return '개원·경영'
    if (board === 'claims') {
      if (post.sub_board === 'notice') return '공지'
      return 'Q&A'
    }
    if (board === 'jobs') return '구인·구직'
    
    const boardType = post.board_type || post.sub_board || post.board
    if (boardType === 'role') return '직업별'
    if (boardType === 'free') return '자유'
    if (boardType === 'qa') return '질문'
    return '커뮤니티'
  }

  // 임시글 데이터
  const getPlaceholderPosts = (board: string) => {
    const placeholders: Record<string, { title: string; author: string }[]> = {
      community: [
        { title: '커뮤니티에 오신 것을 환영합니다', author: '관리자' },
        { title: '새로운 소식이 곧 업데이트됩니다', author: '관리자' }
      ],
      startup: [
        { title: '개원·경영 정보가 곧 업데이트됩니다', author: '관리자' },
        { title: '경영 노하우를 공유해보세요', author: '관리자' }
      ],
      claims: [
        { title: '심사청구 관련 공지사항이 곧 업데이트됩니다', author: '관리자' },
        { title: '최신 고시를 확인해보세요', author: '관리자' }
      ],
      jobs: [
        { title: '구인·구직 정보가 곧 업데이트됩니다', author: '관리자' },
        { title: '새로운 채용공고를 확인해보세요', author: '관리자' }
      ]
    }
    return placeholders[board] || []
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 검색바 섹션 (헤더 아래) */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="1차의료기관에 대해 궁금한 내용을 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-11 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/community?search=${encodeURIComponent(searchQuery)}`
                  }
                }}
              />
              <Button
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 rounded-md"
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/community?search=${encodeURIComponent(searchQuery)}`
                  }
                }}
              >
                <Search className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 메인 콘텐츠 (2/3) */}
          <div className="lg:col-span-2">
            {/* 2x2 그리드 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'community', title: '커뮤니티', href: '/community', posts: sectionPosts.community, placeholder: getPlaceholderPosts('community') },
                { key: 'startup', title: '개원·경영', href: '/startup', posts: sectionPosts.startup, placeholder: getPlaceholderPosts('startup') },
                { key: 'claims', title: '심사청구', href: '/claims', posts: sectionPosts.claims, placeholder: getPlaceholderPosts('claims') },
                { key: 'jobs', title: '구인·구직', href: '/jobs', posts: sectionPosts.jobs, placeholder: getPlaceholderPosts('jobs') }
              ].map((section) => {
                const displayPosts = section.posts.length > 0 
                  ? section.posts 
                  : section.placeholder.map((p, i) => ({
                      id: `placeholder-${section.key}-${i}`,
                      title: p.title,
                      profiles: { display_name: p.author },
                      comment_count: 0,
                      board_type: section.key,
                      board: section.key as any,
                      sub_board: null,
                      isPlaceholder: true
                    }))

                return (
                <Card key={section.key} className="border-slate-200 shadow-sm h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col flex-1">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                      <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                      <Link
                        href={section.href}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        더보기
                      </Link>
                    </div>
                    {loading ? (
                      <div className="py-8 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">로딩 중...</div>
                    ) : (
                      <ul className="divide-y divide-slate-100 flex-1">
                        {displayPosts.slice(0, 4).map((post: any, index: number) => {
                          const postWithType = post as Post & { board_type?: string; comment_count?: number; isPlaceholder?: boolean }
                          const boardTag = getBoardTag(postWithType, section.key)
                          const href = postWithType.isPlaceholder ? '#' : getPostHref(postWithType, section.key)
                          
                          return (
                            <li key={post.id} className={`hover:bg-slate-50 transition-colors ${postWithType.isPlaceholder ? 'opacity-60' : ''}`}>
                              <Link href={href} className="block" onClick={(e) => postWithType.isPlaceholder && e.preventDefault()}>
                                <div className="px-3 py-2.5 flex items-start space-x-2 hover:bg-slate-50 transition-colors">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-emerald-600">
                                        {boardTag[0]}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="mb-0.5">
                                      <span className="text-xs text-slate-900 font-medium line-clamp-2 leading-snug">
                                        {post.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                                      {post.profiles?.display_name && (
                                        <span className="truncate">{post.profiles.display_name}</span>
                                      )}
                                      {postWithType.comment_count !== undefined && postWithType.comment_count > 0 && (
                                        <span className="flex-shrink-0">답변 {postWithType.comment_count}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </div>

          {/* 오른쪽 사이드바 (1/3) */}
          <div className="lg:col-span-1 space-y-4">
            {/* 사용자 프로필 카드 */}
            {user ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-500 text-white text-sm">
                        {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">
                        {user.display_name || '사용자'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {user.role || '비 IT 직군'} @{user.workplace_name || '없음'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-3 pt-3 border-t border-slate-200">
                    <Link
                      href="/profile"
                      className="text-xs text-center text-slate-600 hover:text-emerald-600 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      내 정보
                    </Link>
                    <Link
                      href="/profile"
                      className="text-xs text-center text-slate-600 hover:text-emerald-600 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      내 프로필
                    </Link>
                    <Link
                      href="/community"
                      className="text-xs text-center text-slate-600 hover:text-emerald-600 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      내글
                    </Link>
                    <Link
                      href="/community"
                      className="text-xs text-center text-slate-600 hover:text-emerald-600 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      스크랩
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4 text-center space-y-3">
                  <p className="text-xs text-slate-600">로그인이 필요합니다</p>
                  <div className="space-y-2">
                    <Button asChild size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-xs h-8">
                      <Link href="/login">로그인</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full text-xs h-8">
                      <Link href="/signup">회원가입</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            {/* 새 댓글 섹션 */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">새 댓글</h3>
                <div className="space-y-2">
                  <div className="text-xs text-slate-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <p className="line-clamp-2">
                        최근 댓글이 없습니다. 커뮤니티에 참여해보세요!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

