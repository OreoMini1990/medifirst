'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Briefcase } from 'lucide-react'

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
          {/* 왼쪽 아이콘 */}
          <div className="h-8 w-8 mt-1 shrink-0 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* 본문 영역 */}
          <div className="flex-1 min-w-0">
            {/* 첫 줄: 직역 태그 + 제목 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 shrink-0 font-medium">
                {positionLabel}
              </span>
              <p className="flex-1 truncate text-sm md:text-base font-medium text-slate-900 dark:text-slate-100">
                {title}
              </p>
            </div>

            {/* 둘째 줄: 메타 정보 */}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {region}
              </span>
              <span>{employmentTypeLabel}</span>
              {hospitalName && (
                <span className="font-medium text-slate-700 dark:text-slate-300">{hospitalName}</span>
              )}
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

