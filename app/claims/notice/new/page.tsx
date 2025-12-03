'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewNoticePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkStaffPermission() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const staff = profile?.role === 'manager' || profile?.role === 'admin_staff'
      setIsStaff(staff)
      
      if (!staff) {
        setError('스탭만 최신고시를 작성할 수 있습니다.')
      }
      
      setLoading(false)
    }
    checkStaffPermission()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isStaff) {
      setError('스탭만 최신고시를 작성할 수 있습니다.')
      return
    }
    
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요합니다.')
      setSaving(false)
      return
    }

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        board: 'claims',
        sub_board: 'notice',
        category: null,
        title,
        content,
        is_question: false,
        is_pinned: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      console.error('Insert error details:', JSON.stringify(insertError, null, 2))
      setError(insertError.message || '게시글 작성에 실패했습니다.')
      setSaving(false)
    } else if (newPost) {
      console.log('Notice post created successfully:', newPost.id)
      setTimeout(() => {
        router.push(`/claims/notice/${newPost.id}`)
        router.refresh()
      }, 100)
    } else {
      console.error('Notice post creation returned no data')
      setError('게시글이 생성되지 않았습니다.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isStaff) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive py-8">
              <p className="text-lg font-semibold mb-2">권한이 없습니다</p>
              <p className="text-sm">스탭만 최신고시를 작성할 수 있습니다.</p>
              <Button onClick={() => router.back()} className="mt-4">
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>최신고시 글쓰기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? '작성 중...' : '작성하기'}
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

