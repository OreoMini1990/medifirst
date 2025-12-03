'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Eye, ThumbsUp } from 'lucide-react'

interface PostListRowProps {
  id: string
  title: string
  isPinned: boolean
  categoryLabel?: string | null
  authorName: string
  createdAt: string
  viewCount?: number | null
  likeCount?: number | null
  commentCount?: number | null
  href: string
}

export function PostListRow({
  id,
  title,
  isPinned,
  categoryLabel,
  authorName,
  createdAt,
  viewCount = 0,
  likeCount = 0,
  commentCount = 0,
  href,
}: PostListRowProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 7) {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
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
    <Link href={href}>
      <div className="flex items-center justify-between px-4 py-3 border-b hover:bg-muted/50 cursor-pointer transition-colors">
        {/* 왼쪽: 배지 + 카테고리 + 제목 + 댓글 수 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isPinned && (
            <Badge variant="destructive" className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
              필독
            </Badge>
          )}
          {categoryLabel && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border-0 shrink-0">
              {categoryLabel}
            </Badge>
          )}
          <span className="truncate text-sm md:text-base font-medium">
            {title}
          </span>
          {commentCount !== null && commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          )}
        </div>

        {/* 오른쪽: 메타 정보 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 ml-4">
          <span className="hidden md:inline">{authorName}</span>
          <span className="hidden sm:inline">{formatRelativeTime(createdAt)}</span>
          <span className="hidden md:flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {viewCount || 0}
          </span>
          {likeCount !== null && likeCount > 0 && (
            <span className="hidden lg:flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {likeCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

