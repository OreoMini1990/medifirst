'use client'

import { useState } from 'react'
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

// 장터 태그
const marketplaceTags: Record<string, string> = {
  sell: '팝니다',
  buy: '삽니다',
}

export default function NewMarketplacePostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState<string>('sell') // 기본값: 팝니다
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

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

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        board: 'community',
        sub_board: 'marketplace',
        category: tag || null, // 태그를 category에 저장
        title,
        content,
        is_question: false,
        is_pinned: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      console.error('Error details:', JSON.stringify(insertError, null, 2))
      setError(insertError.message || insertError.details || '게시글 작성에 실패했습니다.')
      setLoading(false)
    } else if (newPost) {
      // 작성한 게시글 상세 페이지로 리다이렉트
      router.push(`/community/marketplace/${newPost.id}`)
      router.refresh()
    } else {
      setError('게시글이 생성되지 않았습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>장터 글쓰기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag">태그 <span className="text-red-500">*</span></Label>
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger>
                  <SelectValue placeholder="태그를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(marketplaceTags).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">팝니다 또는 삽니다를 선택해주세요</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 의료기기 판매합니다"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상품 정보, 가격, 연락처 등을 자세히 입력해주세요"
                rows={10}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? '작성 중...' : '작성하기'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

