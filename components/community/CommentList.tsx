'use client'

import { CommentItem } from './CommentItem'
import type { Comment } from '@/types/database'

interface CommentListProps {
  comments: Comment[]
  currentUserId: string | null
  onUpdate: () => void
}

export function CommentList({ comments, currentUserId, onUpdate }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        댓글이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

