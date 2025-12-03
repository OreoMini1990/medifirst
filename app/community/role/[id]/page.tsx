'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Post, Comment, UserRole } from '@/types/database'
import { ArrowLeft } from 'lucide-react'

const roleLabels: Record<UserRole, string> = {
  doctor: '의사',
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  admin_staff: '행정·원무',
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchPost()
      fetchComments()
    }
  }, [params.id])

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles:author_id(display_name, role)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
    } else {
      setPost(data)
    }
    setLoading(false)
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:author_id(display_name, role)')
      .eq('post_id', params.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
    } else {
      setComments(data || [])
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentContent.trim()) return

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('로그인이 필요합니다.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: params.id as string,
        author_id: user.id,
        content: commentContent,
      })

    if (error) {
      console.error('Error submitting comment:', error)
    } else {
      setCommentContent('')
      fetchComments()
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/community">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.is_pinned && (
                  <Badge variant="secondary">고정</Badge>
                )}
                {post.category && (
                  <Badge variant="outline">
                    {roleLabels[post.category as UserRole] || post.category}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          <Separator />
          <div className="mt-4 text-sm text-muted-foreground">
            작성자: {post.profiles?.display_name || '익명'} ·{' '}
            {new Date(post.created_at).toLocaleString('ko-KR')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>댓글 {comments.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={submitting || !commentContent.trim()}>
              {submitting ? '작성 중...' : '댓글 작성'}
            </Button>
          </form>

          <Separator />

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                댓글이 없습니다.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {comment.profiles?.display_name || '익명'}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

