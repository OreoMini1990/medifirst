'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { JobListItem } from './JobListItem'
import { Pagination } from '@/components/common/Pagination'
import type { Job, UserRole } from '@/types/database'
import { PenLine, Search } from 'lucide-react'

const positionLabels: Record<string, string> = {
  nurse: '간호사',
  assistant: '간호조무사',
  pt: '물리치료사',
  rt: '방사선사',
  lab_tech: '임상병리사',
  manager: '총괄팀장',
  admin_staff: '원무·행정',
  etc: '기타',
}

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

// 의사를 제외한 나머지 직역 (임상병리사는 'lab_tech'로 가정, 없으면 'etc'로 처리)
const otherPositions: (UserRole | string)[] = ['nurse', 'assistant', 'pt', 'rt', 'lab_tech', 'admin_staff', 'manager', 'etc']

export function OtherJobsBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [selectedPosition, setSelectedPosition] = useState<string>('전체')
  const jobsPerPage = 20
  const supabase = createClient()

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    
    try {
      // 전체 개수 조회 - 의사를 제외한 나머지 직역
      let countQuery = supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .in('position', otherPositions)

      // 직역 필터링
      if (selectedPosition && selectedPosition !== '전체') {
        countQuery = countQuery.eq('position', selectedPosition)
      }

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

      // 구인글 조회
      const offset = (currentPage - 1) * jobsPerPage
      let query = supabase
        .from('jobs')
        .select('*, profiles!hospital_id(display_name, workplace_name)')
        .in('position', otherPositions)

      // 직역 필터링
      if (selectedPosition && selectedPosition !== '전체') {
        query = query.eq('position', selectedPosition)
      }

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
  }, [currentPage, jobsPerPage, searchQuery, selectedRegion, selectedPosition, supabase])

  useEffect(() => {
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 리셋
  }, [selectedRegion, selectedPosition])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // 페이지 포커스 시 새로고침
  useEffect(() => {
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
  }, [fetchJobs])

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">의료진 구인</h2>
        <Button asChild className="ml-auto rounded-full bg-black text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/90">
          <Link href="/jobs/other/new">
            <PenLine className="h-4 w-4" />
            구인 등록
          </Link>
        </Button>
      </div>

      {/* 직역 필터 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedPosition === '전체' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedPosition('전체')
            setCurrentPage(1)
          }}
          className={selectedPosition === '전체' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
        >
          전체
        </Button>
        {otherPositions.map((position) => (
          <Button
            key={position}
            variant={selectedPosition === position ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedPosition(position)
              setCurrentPage(1)
            }}
            className={selectedPosition === position ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
          >
            {positionLabels[position] || position}
          </Button>
        ))}
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
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          구인글이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {jobs.map((job) => (
            <JobListItem
              key={job.id}
              href={`/jobs/other/${job.id}`}
              title={job.title}
              positionLabel={positionLabels[job.position] || job.position}
              region={job.region}
              employmentTypeLabel={employmentTypeLabels[job.employment_type] || job.employment_type}
              hospitalName={(job.profiles as any)?.workplace_name || job.profiles?.display_name || null}
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

