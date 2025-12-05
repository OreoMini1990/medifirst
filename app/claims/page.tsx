'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NoticeBoard } from '@/components/claims/NoticeBoard'
import { QABoard } from '@/components/claims/QABoard'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function ClaimsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [defaultTab, setDefaultTab] = useState<'notice' | 'qa'>('notice')

  useEffect(() => {
    if (tabParam === 'notice' || tabParam === 'qa') {
      setDefaultTab(tabParam)
    }
  }, [tabParam])

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-6 pt-8 pb-12">
        {/* 상단 제목 영역 */}
        <section className="pt-8 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">심사청구</h1>
            <p className="mt-2 text-sm text-slate-500 font-normal">
              심사청구 Q&A, 고시·공지, 이달의 이슈
            </p>
          </div>
        </section>

        {/* 얇은 언더라인 탭 */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-8 text-[14px] items-center">
            <button
              type="button"
              onClick={() => setDefaultTab('notice')}
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                defaultTab === 'notice'
                  ? 'border-[#00B992] text-slate-900 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              최신고시
            </button>
            <button
              type="button"
              onClick={() => setDefaultTab('qa')}
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                defaultTab === 'qa'
                  ? 'border-[#00B992] text-slate-900 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              심사청구 Q&A
            </button>
          </nav>
        </div>

        {/* 게시판 컨텐츠 */}
        <div className="mt-6">
          {defaultTab === 'notice' && <NoticeBoard />}
          {defaultTab === 'qa' && <QABoard />}
        </div>
      </main>
    </div>
  )
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
      <ClaimsContent />
    </Suspense>
  )
}

