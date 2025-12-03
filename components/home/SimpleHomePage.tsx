import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SimpleHomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">MediFirst</h1>
        <p className="text-xl text-muted-foreground">
          1차의료기관 종사자를 위한 통합 커뮤니티 플랫폼
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>커뮤니티</CardTitle>
            <CardDescription>
              직업별 커뮤니티, 자유게시판, 질문게시판
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/community">커뮤니티로 이동</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>개원·경영</CardTitle>
            <CardDescription>
              개원 정보, 경영 노하우, 법률·세무 상담
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/startup">개원·경영으로 이동</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>구인·구직</CardTitle>
            <CardDescription>
              1차의료기관 채용공고 및 인재 정보
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/jobs">구인·구직으로 이동</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>아카데미</CardTitle>
            <CardDescription>
              진료 강의, 심사청구 강의, 세미나 (준비 중)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" disabled>
              <Link href="/academy">아카데미로 이동</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>심사청구</CardTitle>
            <CardDescription>
              심사청구 Q&A, 고시·공지 (준비 중)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" disabled>
              <Link href="/claims">심사청구로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

