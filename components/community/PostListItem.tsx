'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Eye, ThumbsUp } from 'lucide-react'

interface PostListItemProps {
  href: string
  title: string
  categoryLabel?: string | null
  boardTag?: string | null // 게시판 태그 (의사, 자유, 질문 등)
  authorName: string
  avatarUrl?: string | null
  commentCount: number
  likeCount: number
  viewCount: number
  createdAt: string | Date
}

export function PostListItem({
  href,
  title,
  categoryLabel,
  boardTag,
  authorName,
  avatarUrl,
  commentCount,
  likeCount,
  viewCount,
  createdAt,
}: PostListItemProps) {
  const formatRelativeTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
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
    <li>
      <Link href={href}>
        <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors">
          {/* 왼쪽 아바타 */}
          <Avatar className="h-8 w-8 mt-1 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {authorName[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          {/* 본문 영역 */}
          <div className="flex-1 min-w-0">
            {/* 첫 줄: 카테고리 + 제목 + 댓글수 */}
            <div className="flex items-center gap-2 mb-1">
              {categoryLabel && (
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 shrink-0">
                  {categoryLabel}
                </span>
              )}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <p className="truncate text-sm md:text-base font-medium text-slate-900 dark:text-slate-100">
                  {title}
                </p>
                {commentCount > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{commentCount}</span>
                  </span>
                )}
              </div>
            </div>

            {/* 둘째 줄: 메타 정보 */}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {boardTag && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 shrink-0 font-medium">
                  {boardTag}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {viewCount}
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{authorName}</span>
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}
