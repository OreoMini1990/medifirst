'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types/database'

// 게시판 타입
type BoardType = 'role' | 'communication' | 'marketplace'

// 직무 라벨
const roleLabels: Record<UserRole, string> = {
  doctor: '의사',
  locum_doctor: '봉직의 (페닥)',
  manager: '개원의',
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  cp: '임상병리사 (임병)',
  admin_staff: '원무',
  etc: '기타',
}

// 소통광장 태그 (순서: 의학, 자유, 질문, 정보, 맛집, 익명)
const communicationTags: Record<string, string> = {
  medical: '의학',
  free: '자유',
  question: '질문',
  info: '정보',
  restaurant: '맛집',
  anonymous: '익명',
}

// 장터 태그
const marketplaceTags: Record<string, string> = {
  sell: '팝니다',
  buy: '삽니다',
}

export default function NewCommunityPostPage() {
  const [boardType, setBoardType] = useState<BoardType>('communication')
  const [category, setCategory] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const router = useRouter()
  const supabase = createClient()

  // 사용자 직무 정보 가져오기
  useEffect(() => {
    async function fetchUserRoles() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()

        if (profile) {
          const roles: UserRole[] = []
          if (profile.roles) {
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
          if (roles.length === 0 && profile.role) {
            roles.push(profile.role as UserRole)
          }
          setUserRoles(roles)
          // 직무별 아지트 선택 시 첫 번째 직무를 기본값으로 설정
          if (boardType === 'role' && roles.length > 0 && !category) {
            setCategory(roles[0])
          }
        }
      } catch (error) {
        console.error('Error fetching user roles:', error)
      }
    }
    fetchUserRoles()
  }, [supabase, boardType])

  // 게시판 타입 변경 시 카테고리 초기화
  useEffect(() => {
    if (boardType === 'communication') {
      setCategory('medical') // 의학을 기본값으로
    } else if (boardType === 'marketplace') {
      setCategory('sell')
    } else if (boardType === 'role' && userRoles.length > 0) {
      setCategory(userRoles[0])
    } else {
      setCategory('')
    }
  }, [boardType, userRoles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    if (!category) {
      setError('태그/카테고리를 선택해주세요.')
      setLoading(false)
      return
    }

    let subBoard: string
    let isQuestion = false

    if (boardType === 'role') {
      subBoard = 'role'
    } else if (boardType === 'communication') {
      // 질문 태그 선택 시 qa, 나머지는 free
      if (category === 'question') {
        subBoard = 'qa'
        isQuestion = true
      } else {
        subBoard = 'free'
      }
      // 익명 태그는 free 또는 qa 모두 가능
    } else {
      subBoard = 'marketplace'
    }

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        board: 'community',
        sub_board: subBoard,
        category: category || null,
        title,
        content,
        is_question: isQuestion,
        is_pinned: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(insertError.message || insertError.details || '게시글 작성에 실패했습니다.')
      setLoading(false)
    } else if (newPost) {
      // 작성한 게시글 상세 페이지로 리다이렉트
      if (subBoard === 'role') {
        router.push(`/community/role/${newPost.id}`)
      } else if (subBoard === 'qa') {
        router.push(`/community/qa/${newPost.id}`)
      } else if (subBoard === 'free') {
        router.push(`/community/free/${newPost.id}`)
      } else if (subBoard === 'marketplace') {
        router.push(`/community/marketplace/${newPost.id}`)
      }
      router.refresh()
    } else {
      setError('게시글이 생성되지 않았습니다.')
      setLoading(false)
    }
  }

  const getCategoryOptions = () => {
    if (boardType === 'role') {
      // 직무별 아지트 선택 시: 사용자의 직무만 표시
      if (userRoles.length === 0) {
        return [] // 직무가 없으면 빈 배열 반환
      }
      return userRoles.map(role => ({
        value: role,
        label: roleLabels[role] || role,
      }))
    } else if (boardType === 'communication') {
      // 순서: 의학, 자유, 질문, 정보, 맛집, 익명
      const order = ['medical', 'free', 'question', 'info', 'restaurant', 'anonymous']
      return order.map(value => ({
        value,
        label: communicationTags[value],
      }))
    } else {
      return Object.entries(marketplaceTags).map(([value, label]) => ({
        value,
        label,
      }))
    }
  }

  const getBoardLabel = () => {
    if (boardType === 'role') return '직무별 아지트'
    if (boardType === 'communication') return '소통광장'
    if (boardType === 'marketplace') return '장터'
    return '커뮤니티'
  }

  const getCategoryLabel = () => {
    if (boardType === 'role') return '직무'
    if (boardType === 'communication') return '태그'
    if (boardType === 'marketplace') return '태그'
    return '카테고리'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-12">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-8 py-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">글쓰기</h1>
          </div>
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 게시판 선택과 태그 선택을 일렬로 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 게시판 선택 */}
                <div className="space-y-2">
                  <Label htmlFor="board" className="text-sm font-semibold text-slate-900">
                    게시판 <span className="text-red-500">*</span>
                  </Label>
                  <Select value={boardType} onValueChange={(value) => setBoardType(value as BoardType)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="게시판을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="communication">소통광장</SelectItem>
                      <SelectItem value="role">직무별 아지트</SelectItem>
                      <SelectItem value="marketplace">장터</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 태그/카테고리 선택 */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-slate-900">
                    {getCategoryLabel()} <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={category || undefined} 
                    onValueChange={setCategory}
                    disabled={boardType === 'role' && userRoles.length === 0}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={`${getCategoryLabel()}를 선택해주세요`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoryOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 안내 메시지 */}
              <div className="space-y-1">
                {boardType === 'role' && userRoles.length === 0 && (
                  <p className="text-xs text-slate-500">로그인 후 직무 정보를 설정해주세요.</p>
                )}
                <p className="text-xs text-slate-500">
                  {boardType === 'communication' && '글의 주제에 맞는 태그를 선택해주세요'}
                  {boardType === 'marketplace' && '팝니다 또는 삽니다를 선택해주세요'}
                  {boardType === 'role' && '본인의 직무를 선택해주세요'}
                </p>
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-900">제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="h-11"
                  required
                />
              </div>

              {/* 내용 */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold text-slate-900">내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={12}
                  className="resize-none"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 h-11 bg-[#00B992] hover:bg-[#00A882] text-white font-semibold"
                >
                  {loading ? '작성 중...' : '작성하기'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="h-11 px-6"
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

