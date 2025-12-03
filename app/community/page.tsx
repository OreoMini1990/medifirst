'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AllPostsBoard } from '@/components/community/AllPostsBoard'
import { RoleCommunity } from '@/components/community/RoleCommunity'
import { FreeBoard } from '@/components/community/FreeBoard'
import { QABoard } from '@/components/community/QABoard'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function CommunityContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [defaultTab, setDefaultTab] = useState<'all' | 'role' | 'free' | 'qa'>('all')

  useEffect(() => {
    if (tabParam === 'free' || tabParam === 'qa' || tabParam === 'role' || tabParam === 'all') {
      setDefaultTab(tabParam)
    }
  }, [tabParam])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">커뮤니티</h1>
        <p className="text-muted-foreground mt-2">
          1차의료기관 종사자들을 위한 소통 공간
        </p>
      </div>

      <Tabs value={defaultTab} onValueChange={(value) => setDefaultTab(value as 'all' | 'role' | 'free' | 'qa')} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">전체글</TabsTrigger>
          <TabsTrigger value="role">직업별 커뮤니티</TabsTrigger>
          <TabsTrigger value="free">자유게시판</TabsTrigger>
          <TabsTrigger value="qa">질문게시판</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <AllPostsBoard />
        </TabsContent>
        <TabsContent value="role" className="mt-6">
          <RoleCommunity />
        </TabsContent>
        <TabsContent value="free" className="mt-6">
          <FreeBoard />
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
          <QABoard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
      <CommunityContent />
    </Suspense>
  )
}

