'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Building2,
  ArrowRight,
  Shield,
  Zap,
  Heart
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: '직업별 커뮤니티',
    description: '의사, 간호사, 물리치료사 등 직업별로 구성된 전문 커뮤니티에서 동료들과 소통하세요.',
    href: '/community?tab=role',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: MessageSquare,
    title: '자유게시판 & 질문게시판',
    description: '자유롭게 의견을 나누고, 궁금한 점을 질문하고 답변받을 수 있습니다.',
    href: '/community?tab=free',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Briefcase,
    title: '구인·구직',
    description: '1차의료기관 채용공고와 인재 정보를 한 곳에서 확인하세요.',
    href: '/jobs',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: GraduationCap,
    title: '아카데미',
    description: '진료 강의, 심사청구 강의, 세미나 등 전문 교육 콘텐츠를 제공합니다.',
    href: 'https://ghmedi.liveklass.com',
    external: true,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: FileText,
    title: '심사청구',
    description: '심사청구 Q&A, 고시·공지, 이달의 이슈를 확인하세요.',
    href: '/claims',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    comingSoon: true,
  },
  {
    icon: Building2,
    title: '개원·경영',
    description: '개원 정보, 경영 노하우, 법률·세무 상담을 받아보세요.',
    href: '/startup',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    comingSoon: true,
  },
]

const benefits = [
  {
    icon: Shield,
    title: '안전한 커뮤니티',
    description: '검증된 의료진만 참여하는 안전한 공간',
  },
  {
    icon: Zap,
    title: '빠른 정보 공유',
    description: '실시간으로 최신 정보와 노하우를 공유',
  },
  {
    icon: Heart,
    title: '전문가 네트워크',
    description: '동료 의료진들과의 소중한 네트워크 형성',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            모든 기능을 한 곳에서
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            1차의료기관 종사자들을 위한 통합 플랫폼으로
            <br />
            커뮤니티부터 채용까지 모든 것을 제공합니다
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon
            const content = (
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-200 dark:hover:border-emerald-800">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feature.comingSoon ? (
                    <Button variant="outline" disabled className="w-full">
                      준비 중
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" className="w-full group">
                      {feature.external ? (
                        <a 
                          href={feature.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          자세히 보기
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ) : (
                        <Link href={feature.href} className="flex items-center justify-center">
                          자세히 보기
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
            
            return feature.external ? (
              <a key={feature.title} href={feature.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <Link key={feature.title} href={feature.href}>
                {content}
              </Link>
            )
          })}
        </div>
        
        {/* 추가 혜택 */}
        <div className="grid gap-6 md:grid-cols-3 mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

