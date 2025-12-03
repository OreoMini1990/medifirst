'use client'

import { PartnerNav } from '@/components/startup/PartnerNav'
import { PartnerCard } from '@/components/startup/PartnerCard'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// 임시 파트너 데이터
const partnerData = [
  {
    title: '세무법인 진솔',
    description: '병의원세무전문 세무법인 진솔 (병의원세무, 기장...)',
    logoText: '진솔',
    subscribers: 36,
    posts: 26,
    totalAnswers: 59,
  },
  {
    title: '세무법인 대성',
    description: '세무법인 대성은 병의원 전문이라는 패러다임으로...',
    logoText: '대성',
    subscribers: 182,
    posts: 189,
    totalAnswers: 0,
  },
  {
    title: '메디택스',
    description: '20년 이상 병의원 및 MSO 세무회계관리 노하우...',
    logoText: '메디',
    subscribers: 1,
    posts: 13,
    totalAnswers: 8,
  },
  {
    title: '세무법인 성수',
    description: '국세청 출신의 젊은 세무사들로 구성된 병의원...',
    logoText: '성수',
    subscribers: 2,
    posts: 29,
    totalAnswers: 0,
  },
  {
    title: '위너스세무그룹',
    description: '대구·경북지역 병의원 전문 세무그룹 입니다. 대구...',
    logoText: '위너스',
    subscribers: 0,
    posts: 3,
    totalAnswers: 0,
  },
  {
    title: '위너스세무',
    description: '개원 준비부터 세무조사 대응까지 병의원 세무...',
    logoText: 'W',
    subscribers: 65,
    posts: 39,
    totalAnswers: 23,
  },
  {
    title: '세무법인 프라이어',
    description: '병의원에 특화된 세무정보를 제공하는 세무법인...',
    logoText: 'P',
    subscribers: 87,
    posts: 66,
    totalAnswers: 17,
  },
  {
    title: '바른택스',
    description: '병의원 전문 세무사 바른택스',
    logoText: '@',
    subscribers: 12,
    posts: 3,
    totalAnswers: 0,
  },
  {
    title: '한길세무그룹',
    description: '병의원을 위한 전문적이고 체계적인 세무관리 서비스...',
    logoText: '한길',
    subscribers: 11,
    posts: 33,
    totalAnswers: 42,
  },
  {
    title: '의사마누라의 1인칭 세무',
    description: '병원세무 1위 베스트셀러 [의사마누라의 1인칭...',
    logoText: '의사',
    subscribers: 187,
    posts: 25,
    totalAnswers: 131,
  },
]

function StartupContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'tax'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">개원·경영</h1>
        <p className="text-muted-foreground mt-2">
          1차의료기관 개원 및 경영 정보 공유
        </p>
      </div>

      {/* 파트너 네비게이션 */}
      <PartnerNav />

      {/* 전문파트너 섹션 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">전문파트너</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {partnerData.map((partner, index) => (
            <PartnerCard
              key={index}
              title={partner.title}
              description={partner.description}
              logoText={partner.logoText}
              subscribers={partner.subscribers}
              posts={partner.posts}
              totalAnswers={partner.totalAnswers}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StartupPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
      <StartupContent />
    </Suspense>
  )
}
