'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Post, StartupCategory } from '@/types/database'
import { Plus } from 'lucide-react'

const categoryLabels: Record<StartupCategory | 'all', string> = {
  all: '전체',
  site: '개원입지',
  loan: '대출',
  interior: '인테리어',
  law: '법률',
  labor: '노무',
  tax: '세무',
  marketing: '병원홍보',
  equipment_it: '의료기기·IT',
  network: '네트워크',
  ops_support: '운영지원',
}

export function StartupBoard({ initialTab = 'all' }: { initialTab?: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedTab, setSelectedTab] = useState<string>(initialTab)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const tab = searchParams.get('tab') || 'all'
    setSelectedTab(tab)
    fetchPosts(tab)
  }, [searchParams])

  async function fetchPosts(tab: string) {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, profiles:author_id(display_name, role)')
      .eq('board', 'startup')
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (tab !== 'all') {
      query = query.eq('category', tab)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  const handleTabChange = (value: string) => {
    setSelectedTab(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    router.push(`/startup?${params.toString()}`)
    fetchPosts(value)
  }

  return (
    <div className="space-y-4">
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList className="flex-wrap h-auto">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button asChild>
            <Link href="/startup/new">
              <Plus className="mr-2 h-4 w-4" />
              글쓰기
            </Link>
          </Button>
        </div>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              게시글이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.is_pinned && (
                            <Badge variant="secondary">고정</Badge>
                          )}
                          {post.category && (
                            <Badge variant="outline">
                              {categoryLabels[post.category as StartupCategory] || post.category}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          <Link
                            href={`/startup/${post.id}`}
                            className="hover:underline"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {post.profiles?.display_name || '익명'} ·{' '}
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

