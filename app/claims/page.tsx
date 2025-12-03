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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">심사청구</h1>
        <p className="text-muted-foreground mt-2">
          심사청구 Q&A, 고시·공지, 이달의 이슈
        </p>
      </div>

      <Tabs value={defaultTab} onValueChange={(value) => setDefaultTab(value as 'notice' | 'qa')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notice">최신고시</TabsTrigger>
          <TabsTrigger value="qa">심사청구 Q&A</TabsTrigger>
        </TabsList>
        <TabsContent value="notice" className="mt-6">
          <NoticeBoard />
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
          <QABoard />
        </TabsContent>
      </Tabs>
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

