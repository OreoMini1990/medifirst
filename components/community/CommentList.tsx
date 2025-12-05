'use client'

import { CommentItem } from './CommentItem'
import type { Comment } from '@/types/database'

interface CommentListProps {
  comments: Comment[]
  currentUserId: string | null
  postAuthorId: string | null
  onUpdate: () => void
  isPostAnonymous?: boolean
  isStaff?: boolean
}

export function CommentList({ comments, currentUserId, postAuthorId, onUpdate, isPostAnonymous = false, isStaff = false }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        댓글이 없습니다.
      </div>
    )
  }

  // 대댓글이 아닌 댓글만 필터링
  const topLevelComments = comments.filter(comment => !comment.parent_id)

  return (
    <div className="space-y-4 mt-4">
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          postAuthorId={postAuthorId}
          onUpdate={onUpdate}
          isPostAnonymous={isPostAnonymous}
          isStaff={isStaff}
        />
      ))}
    </div>
  )
}

