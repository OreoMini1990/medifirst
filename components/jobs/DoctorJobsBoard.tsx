'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { JobListItem } from './JobListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Job, UserRole } from '@/types/database'
import { PenLine, Search } from 'lucide-react'

const employmentTypeLabels: Record<string, string> = {
  full_time: '정규직',
  part_time: '파트타임',
  locum: '대체근무',
}

const regions = [
  '전체',
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]

export function DoctorJobsBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const jobsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchUserRole()
  }, [])

  async function fetchUserRole() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // 비로그인 사용자도 볼 수 있도록 userRole을 null로 유지
      setUserRole(null)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setUserRole(profile?.role as UserRole || null)
    setLoading(false)
  }

  const fetchJobs = useCallback(async () => {
    // 의사가 아니면 조회하지 않음
    if (userRole !== null && userRole !== 'doctor') {
      setJobs([])
      setTotalPages(0)
      setLoading(false)
      return
    }
    
    setLoading(true)
    
    try {
      // 전체 개수 조회 - 의사 직역만
      let countQuery = supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('position', 'doctor')

      // 지역 필터링
      if (selectedRegion && selectedRegion !== '전체') {
        countQuery = countQuery.ilike('region', `%${selectedRegion}%`)
      }

      // 검색어가 있으면 제목으로 필터링
      if (searchQuery.trim()) {
        countQuery = countQuery.ilike('title', `%${searchQuery.trim()}%`)
      }

      const { count } = await countQuery
      const total = count || 0
      setTotalPages(Math.ceil(total / jobsPerPage))

      // 구인글 조회 - 의사 직역만
      const offset = (currentPage - 1) * jobsPerPage
      let query = supabase
        .from('jobs')
        .select('*, profiles!hospital_id(display_name, workplace_name)')
        .eq('position', 'doctor')

      // 지역 필터링
      if (selectedRegion && selectedRegion !== '전체') {
        query = query.ilike('region', `%${selectedRegion}%`)
      }

      // 검색어가 있으면 제목으로 필터링
      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery.trim()}%`)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + jobsPerPage - 1)

      if (error) {
        console.error('Error fetching jobs:', error)
        setJobs([])
      } else {
        setJobs((data || []) as Job[])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [userRole, currentPage, jobsPerPage, searchQuery, selectedRegion, supabase])

  useEffect(() => {
    // userRole이 null이거나 'doctor'일 때만 조회
    if (userRole === null || userRole === 'doctor') {
      fetchJobs()
    }
  }, [userRole, currentPage, searchQuery, selectedRegion, fetchJobs])

  // 페이지 포커스 시 새로고침
  useEffect(() => {
    if (userRole !== null && userRole !== 'doctor') return

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchJobs()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [userRole, fetchJobs])

  // 의사가 아닌 회원이 접근 시 경고 표시
  useEffect(() => {
    if (userRole && userRole !== 'doctor') {
      alert('의사 멤버 전용입니다.')
      router.push('/jobs?tab=other&type=recruit')
    }
  }, [userRole, router])

  if (userRole && userRole !== 'doctor') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        의사 멤버 전용입니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">의사 구인</h2>
        <Button asChild className="ml-auto rounded-full bg-black text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/90">
          <Link href="/jobs/doctor/new">
            <PenLine className="h-4 w-4" />
            구인 등록
          </Link>
        </Button>
      </div>

      {/* 지역 필터 */}
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedRegion(region)
              setCurrentPage(1)
            }}
            className={selectedRegion === region ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
          >
            {region}
          </Button>
        ))}
      </div>

      {/* 구인글 리스트 */}
      {!loading && jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          구인글이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {jobs.map((job) => (
            <JobListItem
              key={job.id}
              href={`/jobs/doctor/${job.id}`}
              title={job.title}
              positionLabel="의사"
              region={job.region}
              employmentTypeLabel={employmentTypeLabels[job.employment_type] || job.employment_type}
              hospitalName={job.profiles?.workplace_name || job.profiles?.display_name || null}
              createdAt={job.created_at}
            />
          ))}
        </ul>
      )}

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* 검색 바 */}
      <div className="mt-4 flex w-full max-w-xl mx-auto items-center gap-2">
        <select className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm">
          <option value="title">제목</option>
          <option value="description">내용</option>
          <option value="hospital">병원명</option>
        </select>
        <input
          className="flex-1 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="검색할 단어 입력"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              setCurrentPage(1)
            }
          }}
        />
        <Button
          className="h-10 px-4 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-sm flex items-center gap-1 hover:bg-slate-800 dark:hover:bg-slate-700"
          onClick={() => setCurrentPage(1)}
        >
          <Search className="h-4 w-4" />
          검색
        </Button>
        {searchQuery && (
          <Button
            variant="outline"
            className="h-10 px-4 rounded-full text-sm"
            onClick={() => {
              setSearchQuery('')
              setCurrentPage(1)
            }}
          >
            초기화
          </Button>
        )}
      </div>
    </div>
  )
}

