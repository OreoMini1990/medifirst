'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Job, UserRole } from '@/types/database'
import { Plus } from 'lucide-react'

const roleLabels: Record<UserRole, string> = {
  doctor: '의사',
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  admin_staff: '행정·원무',
}

const employmentTypeLabels: Record<string, string> = {
  full_time: '정규직',
  part_time: '파트타임',
  locum: '임시직',
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles:hospital_id(display_name, hospital_name)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching jobs:', error)
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">구인·구직</h1>
          <p className="text-muted-foreground mt-2">
            1차의료기관 채용공고 및 인재 정보
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            채용공고 등록
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          채용공고가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">
                        {roleLabels[job.position]}
                      </Badge>
                      <Badge variant="outline">
                        {employmentTypeLabels[job.employment_type]}
                      </Badge>
                      <Badge variant="secondary">{job.region}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    {job.profiles && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.profiles.hospital_name || job.profiles.display_name}
                      </p>
                    )}
                  </div>
                  {job.salary_range && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{job.salary_range}</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>
                    {new Date(job.created_at).toLocaleDateString('ko-KR')}
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

