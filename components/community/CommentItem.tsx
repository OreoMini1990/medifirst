'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Comment } from '@/types/database'
import { Edit, Trash2, ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react'
import { CommentForm } from './CommentForm'

interface CommentItemProps {
  comment: Comment
  currentUserId: string | null
  postAuthorId: string | null
  onUpdate: () => void
  isReply?: boolean
  isPostAnonymous?: boolean
  isStaff?: boolean
}

export function CommentItem({ comment, currentUserId, postAuthorId, onUpdate, isReply = false, isPostAnonymous = false, isStaff = false }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.like_count || 0)
  const [liking, setLiking] = useState(false)
  const [replies, setReplies] = useState<Comment[]>(comment.replies || [])
  const supabase = createClient()

  const isOwner = currentUserId === comment.author_id
  const isAuthor = postAuthorId === comment.author_id

  useEffect(() => {
    fetchLikeStatus()
    fetchReplies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.id, currentUserId])

  async function fetchLikeStatus() {
    if (!currentUserId) return
    
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`)
      const data = await response.json()
      if (data.success) {
        setLiked(data.liked || false)
        setLikeCount(data.likeCount || 0)
      }
    } catch (error) {
      console.error('Error fetching like status:', error)
    }
  }

  async function fetchReplies() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id (
            display_name,
            role
          )
        `)
        .eq('parent_id', comment.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching replies:', error)
      } else {
        setReplies(data || [])
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editContent.trim()) return

    setSaving(true)
    const { error } = await supabase
      .from('comments')
      .update({
        content: editContent.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', comment.id)
      .eq('author_id', currentUserId)

    if (error) {
      console.error('Error updating comment:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
    } else {
      setIsEditing(false)
      onUpdate()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeleting(true)
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', comment.id)
      .eq('author_id', currentUserId)

    if (error) {
      console.error('Error deleting comment:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    } else {
      onUpdate()
    }
    setDeleting(false)
  }

  const handleLike = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.')
      return
    }

    if (liking) return

    setLiking(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount || 0)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleReplySubmit = () => {
    setIsReplying(false)
    fetchReplies()
    onUpdate()
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) {
      return days === 1 ? '어제' : `${days}일 전`
    }
    if (hours > 0) {
      return `${hours}시간 전`
    }
    if (minutes > 0) {
      return `${minutes}분 전`
    }
    return '방금 전'
  }

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {(() => {
              const displayName = isPostAnonymous && !isStaff 
                ? '익명' 
                : (comment.profiles?.display_name || '익명')
              return displayName[0]?.toUpperCase() || '?'
            })()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-sm ${isAuthor ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {(() => {
                if (isPostAnonymous && !isStaff) {
                  return '익명'
                }
                return comment.profiles?.display_name || '익명'
              })()}
            </span>
            {isPostAnonymous && isStaff && (
              <span className="text-xs text-slate-500 italic">
                (실제 작성자: {comment.profiles?.display_name || '익명'})
              </span>
            )}
            {isAuthor && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                글쓴이
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatRelativeTime(comment.created_at)}
            </span>
            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive" disabled={deleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? '삭제 중...' : '삭제'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={saving || !editContent.trim()}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-2">
                {comment.content}
              </p>
              <div className="flex items-center gap-3">
                {/* 추천 버튼 */}
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                    liked 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                  } ${liking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
                  <span className="text-xs font-medium">추천</span>
                  {likeCount > 0 && (
                    <span className="text-xs font-medium">{likeCount}</span>
                  )}
                </button>
                
                {/* 댓글쓰기 버튼 */}
                {!isReply && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">댓글쓰기</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 대댓글 작성 폼 */}
      {isReplying && !isReply && (
        <div className="ml-11 mt-2">
          <CommentForm 
            postId={comment.post_id} 
            parentId={comment.id}
            onSubmit={handleReplySubmit}
          />
        </div>
      )}

      {/* 대댓글 목록 */}
      {replies.length > 0 && (
        <div className="ml-11 mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              onUpdate={() => {
                fetchReplies()
                onUpdate()
              }}
              isReply={true}
              isPostAnonymous={isPostAnonymous}
              isStaff={isStaff}
            />
          ))}
        </div>
      )}
    </div>
  )
}
