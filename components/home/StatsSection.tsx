'use client'

import { useEffect, useState } from 'react'
import { Users, MessageSquare, Briefcase, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '1,000+',
    label: '활성 회원',
    description: '매일 활발히 활동하는 의료진',
  },
  {
    icon: MessageSquare,
    value: '5,000+',
    label: '게시글',
    description: '지식과 경험을 공유하는 게시글',
  },
  {
    icon: Briefcase,
    value: '500+',
    label: '채용공고',
    description: '1차의료기관 채용 기회',
  },
  {
    icon: TrendingUp,
    value: '95%',
    label: '만족도',
    description: '사용자 만족도',
  },
]

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('stats-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return (
    <section 
      id="stats-section"
      className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
    >
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            MediFirst를 선택하는 이유
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            빠르게 성장하는 1차의료기관 전문 플랫폼
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="text-center space-y-4 p-6 bg-white dark:bg-slate-950 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out',
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {stat.label}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

