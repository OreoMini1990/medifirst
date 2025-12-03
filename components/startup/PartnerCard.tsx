'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PartnerCardProps {
  title: string
  description: string
  logoUrl?: string
  logoText?: string
  subscribers: number
  posts: number
  totalAnswers: number
}

export function PartnerCard({
  title,
  description,
  logoUrl,
  logoText,
  subscribers,
  posts,
  totalAnswers,
}: PartnerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            {logoUrl ? (
              <AvatarImage src={logoUrl} alt={title} />
            ) : (
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                {logoText || title[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 line-clamp-2">{title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>구독 {subscribers}</span>
          <span>•</span>
          <span>포스트 {posts}</span>
          <span>•</span>
          <span>총 답변 {totalAnswers}</span>
        </div>
      </CardContent>
    </Card>
  )
}

