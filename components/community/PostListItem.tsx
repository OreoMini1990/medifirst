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
  commentCount?: number
  likeCount?: number
  viewCount?: number
  isLocked?: boolean
  variant?: 'default' | 'coinone'
  isNewWithinMonth?: boolean
  hasBackground?: boolean
  authorDisplayName?: string | null
  avatarUrl?: string | null
  isAnswered?: boolean
  showStats?: boolean
  isAnonymous?: boolean
  isStaff?: boolean
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
  isLocked = false,
  isNewWithinMonth = false,
  hasBackground = false,
  authorDisplayName = null,
  avatarUrl = null,
  isAnswered = false,
  showStats = false,
  isAnonymous = false,
  isStaff = false,
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
  
  // 작성자 닉네임 일부 표시 (예: 관**)
  const getPartialAuthorName = (name: string | null | undefined): string => {
    if (!name) return ''
    if (name.length <= 2) return name
    return name[0] + '*'.repeat(name.length - 1)
  }

  return (
    <li>
      <Link href={href} className="block">
        <div
          className={clsx(
            'flex items-start border-b border-slate-100',
            'hover:bg-slate-50/50 transition-colors',
            hasBackground && 'bg-blue-50/50'
          )}
        >
          {/* 왼쪽: 카테고리 + 제목 + 작성자/통계 */}
          <div className="flex-1 px-6 py-4 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              {displayCategory && (
                <span className={clsx(
                  'text-[12px] font-medium shrink-0 whitespace-nowrap w-[60px] tracking-tight',
                  hasBackground ? 'text-blue-600' : 'text-slate-500'
                )}>
                  {displayCategory}
                </span>
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="truncate text-[14px] font-normal text-slate-900 leading-relaxed">
                  {title}
                </span>
                {isLocked && (
                  <span className="inline-flex h-[16px] w-[16px] items-center justify-center text-slate-400 shrink-0">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                )}
                {(newPost || isNewWithinMonth) && (
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#00B992] text-[10px] font-bold text-white leading-none shrink-0">
                    N
                  </span>
                )}
                {isAnswered && (
                  <span className="inline-flex h-[18px] items-center px-1.5 rounded-sm bg-emerald-500 text-[10px] font-semibold text-white leading-none shrink-0 ml-1">
                    답변완료
                  </span>
                )}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  {isPinned && (
                    <span className="inline-flex h-[18px] items-center px-1.5 rounded-sm bg-slate-800 text-[10px] font-semibold text-white leading-none">
                      공지
                    </span>
                  )}
                  {showStats && authorDisplayName && (
                    <div className="flex items-center gap-1.5">
                      {isAnonymous && !isStaff ? (
                        // 익명 게시글: 관리자가 아닌 경우 익명 표시
                        <>
                          <div className="h-5 w-5 rounded-full bg-slate-400 flex items-center justify-center text-[10px] font-medium text-white shrink-0">
                            ?
                          </div>
                          <span className="text-[12px] font-medium text-slate-500">
                            익명
                          </span>
                        </>
                      ) : (
                        // 일반 게시글 또는 관리자: 실제 작성자 표시
                        <>
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={authorDisplayName}
                              className="h-5 w-5 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-600 shrink-0">
                              {authorDisplayName?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-[12px] font-medium text-slate-700">
                            {authorDisplayName}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {!showStats && authorDisplayName && (
                    <div className="flex items-center gap-1.5">
                      {isAnonymous && !isStaff ? (
                        // 익명 게시글: 관리자가 아닌 경우 익명 표시
                        <>
                          <div className="h-5 w-5 rounded-full bg-slate-400 flex items-center justify-center text-[10px] font-medium text-white shrink-0">
                            ?
                          </div>
                          <span className="text-[12px] text-slate-500">
                            익명
                          </span>
                        </>
                      ) : (
                        // 일반 게시글 또는 관리자: 실제 작성자 표시
                        <>
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={getPartialAuthorName(authorDisplayName)}
                              className="h-5 w-5 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-600 shrink-0">
                              {getPartialAuthorName(authorDisplayName)?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-[12px] text-slate-500">
                            {getPartialAuthorName(authorDisplayName)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 통계 정보 */}
            {showStats && (
              <div className="flex items-center gap-3 text-[12px] text-slate-500 ml-[76px]">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {viewCount || 0}
                </span>
                {likeCount > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {likeCount}
                  </span>
                )}
                {commentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {commentCount}
                  </span>
                )}
              </div>
            )}
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
