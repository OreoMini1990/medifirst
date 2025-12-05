'use client'

import Link from 'next/link'
import clsx from 'clsx'

export interface PostListItemProps {
  href: string
  title: string
  categoryLabel?: string | null
  boardTag?: string | null
  createdAt: string | Date
  updatedAt?: string | Date
  isPinned?: boolean
  index?: number
  // 호환성을 위해 유지하되 사용하지 않음
  authorName?: string
  avatarUrl?: string | null
  commentCount?: number
  likeCount?: number
  viewCount?: number
  isLocked?: boolean
  variant?: 'default' | 'coinone'
}

export function PostListItem({
  href,
  title,
  categoryLabel,
  boardTag,
  createdAt,
  isPinned = false,
  index = 0,
  likeCount = 0,
  commentCount = 0,
  viewCount = 0,
}: PostListItemProps) {
  const displayCategory = categoryLabel || boardTag || ''
  const formatDate = (input: string | Date) => {
    const d = typeof input === 'string' ? new Date(input) : input
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    // 24시간 이내
    if (diffMs < 24 * 60 * 60 * 1000) {
      if (diffMinutes < 60) {
        return `${diffMinutes}분 전`
      } else {
        return `${diffHours}시간 전`
      }
    }
    
    // 24시간 이상
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const isNew = () => {
    if (!createdAt) return false
    const now = new Date()
    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24
  }

  const formattedDate = formatDate(createdAt)
  const newPost = isNew()

  return (
    <li>
      <Link href={href} className="block">
        <div
          className={clsx(
            'flex items-center border-b border-slate-100',
            'hover:bg-slate-50/50 transition-colors'
          )}
        >
          {/* 제목 + N 배지 */}
          <div className="flex-1 px-6 py-4 flex items-center gap-4 min-w-0">
            {displayCategory && (
              <span className="text-[12px] font-medium text-slate-500 shrink-0 whitespace-nowrap w-[60px] tracking-tight">
                {displayCategory}
              </span>
            )}
            <span className="truncate text-[14px] font-normal text-slate-900 min-w-0 leading-relaxed">
              {title}
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {isPinned && (
                <span className="inline-flex h-[18px] items-center px-1.5 rounded-sm bg-slate-800 text-[10px] font-semibold text-white leading-none">
                  공지
                </span>
              )}
              {newPost && (
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#00B992] text-[10px] font-bold text-white leading-none">
                  N
                </span>
              )}
            </div>
          </div>

          {/* 등록일 */}
          <div className="w-[110px] px-6 py-4 text-[13px] text-slate-400 shrink-0">
            <div className="text-right whitespace-nowrap font-normal">{formattedDate}</div>
          </div>
        </div>
      </Link>
    </li>
  )
}
