'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // totalPages가 0이거나 음수인 경우에만 숨김
  if (totalPages < 1) return null

  // 페이지 번호 배열 생성 (최대 5개)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex justify-center items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-9 px-3 rounded-md border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="ml-1">이전</span>
      </Button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          className={cn(
            'h-9 w-9 rounded-md text-sm font-medium transition-all',
            page === currentPage
              ? 'bg-[#00B992] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-9 px-3 rounded-md border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        <span className="mr-1">다음</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

