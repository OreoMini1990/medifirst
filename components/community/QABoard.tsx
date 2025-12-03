'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/types/database'
import { Plus } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  treatment: '진료질문',
  claims: '심사청구질문',
  admin: '원무/행정질문',
  startup: '개원질문',
}

export function QABoard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles:author_id(display_name, role)')
      .eq('board', 'community')
      .eq('sub_board', 'qa')
      .eq('is_question', true)
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/community/qa/new">
            <Plus className="mr-2 h-4 w-4" />
            질문하기
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          질문이 없습니다.
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
                      <Badge variant="destructive">질문</Badge>
                      {post.category && (
                        <Badge variant="outline">
                          {categoryLabels[post.category] || post.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/community/qa/${post.id}`}
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

