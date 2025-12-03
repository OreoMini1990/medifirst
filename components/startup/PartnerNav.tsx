'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/startup?category=location', label: '개원입지' },
  { href: '/startup?category=loan', label: '대출' },
  { href: '/startup?category=interior', label: '인테리어' },
  { href: '/startup?category=law', label: '법률' },
  { href: '/startup?category=labor', label: '노무' },
  { href: '/startup?category=tax', label: '세무' },
  { href: '/startup?category=promotion', label: '병원홍보' },
  { href: '/startup?category=medical-it', label: '의료기기·IT' },
  { href: '/startup?category=network', label: '네트워크' },
  { href: '/startup?category=support', label: '운영지원' },
]

export function PartnerNav() {
  const pathname = usePathname()
  
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="container">
        <div className="flex items-center gap-6 overflow-x-auto py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href.split('?')[0]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium whitespace-nowrap transition-colors pb-2 border-b-2',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

