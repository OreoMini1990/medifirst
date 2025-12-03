'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Post, UserRole } from '@/types/database'
import { Plus } from 'lucide-react'

const roleLabels: Record<UserRole, string> = {
  doctor: '의사',
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  admin_staff: '행정·원무',
}

export function RoleCommunity() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [selectedRole])

  async function fetchPosts() {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, profiles:author_id(display_name, role)')
      .eq('board', 'community')
      .eq('sub_board', 'role')
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (selectedRole !== 'all') {
      query = query.eq('category', selectedRole)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | 'all')}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            {Object.entries(roleLabels).map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button asChild>
          <Link href="/community/role/new">
            <Plus className="mr-2 h-4 w-4" />
            글쓰기
          </Link>
        </Button>
      </div>

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
                          {roleLabels[post.category as UserRole] || post.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/community/role/${post.id}`}
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
    </div>
  )
}

