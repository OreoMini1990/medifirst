'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'

const benefits = [
  '무료 회원가입',
  '전문 의료진 커뮤니티',
  '실시간 정보 공유',
  '채용 기회 제공',
]

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-700 dark:to-blue-700">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-emerald-50">
              MediFirst와 함께 1차의료기관 커뮤니티에 참여하고
              <br />
              전문가 네트워크를 구축하세요
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white"
              >
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all">
              <Link href="/signup">
                무료로 가입하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-2 border-white text-white hover:bg-white/10">
              <Link href="/community">
                커뮤니티 둘러보기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

