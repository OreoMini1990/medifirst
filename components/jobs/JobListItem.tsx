'use client'

import Link from 'next/link'

interface JobListItemProps {
  href: string
  title: string
  positionLabel: string
  region: string
  employmentTypeLabel: string
  hospitalName: string | null
  createdAt: string | Date
}

export function JobListItem({
  href,
  title,
  positionLabel,
  region,
  employmentTypeLabel,
  hospitalName,
  createdAt,
}: JobListItemProps) {

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

  const formattedDate = formatDate(createdAt)

  return (
    <li>
      <Link href={href} className="block">
        <div className="flex items-center border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
          {/* 제목 + 태그 */}
          <div className="flex-1 px-6 py-4 flex items-center gap-4 min-w-0">
            <span className="text-[12px] font-medium text-slate-500 shrink-0 whitespace-nowrap w-[60px] tracking-tight">
              {positionLabel}
            </span>
            <span className="truncate text-[14px] font-normal text-slate-900 min-w-0 leading-relaxed">
              {title}
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-auto text-xs text-slate-400">
              <span>{region}</span>
              <span>·</span>
              <span>{employmentTypeLabel}</span>
              {hospitalName && (
                <>
                  <span>·</span>
                  <span>{hospitalName}</span>
                </>
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

