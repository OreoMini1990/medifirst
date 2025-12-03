'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImageIcon, Smile, MessageCircle } from 'lucide-react'

interface CommentFormProps {
  postId: string
  onSubmit: () => void
}

export function CommentForm({ postId, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      setSubmitting(false)
      return
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
      })

    if (error) {
      console.error('Error submitting comment:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } else {
      setContent('')
      onSubmit()
    }
    setSubmitting(false)
  }

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 px-4 py-3 flex items-end gap-3">
      {/* 왼쪽 아이콘들 */}
      <div className="flex flex-col justify-between gap-2 pb-2">
        <button
          type="button"
          className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => {
            // 이미지 업로드 기능 (추후 구현)
            alert('이미지 업로드 기능은 준비 중입니다.')
          }}
        >
          <ImageIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <button
          type="button"
          className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => {
            // 이모티콘 기능 (추후 구현)
            alert('이모티콘 기능은 준비 중입니다.')
          }}
        >
          <Smile className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* 입력창 */}
      <textarea
        className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm resize-none min-h-[60px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        placeholder="댓글을 작성해주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            router.push('/login')
          }
        }}
      />

      {/* 등록 버튼 */}
      <button
        className="mb-2 h-9 px-4 rounded-full bg-emerald-500 text-white text-sm flex items-center gap-1 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={submitting || !content.trim()}
      >
        <MessageCircle className="h-4 w-4" />
        {submitting ? '등록 중...' : '등록'}
      </button>
    </div>
  )
}

