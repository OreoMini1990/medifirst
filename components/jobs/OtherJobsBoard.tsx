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
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])
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

      // 직역 필터링 (복수 선택)
      if (selectedPositions.length > 0) {
        countQuery = countQuery.in('position', selectedPositions)
      }

      // 지역 필터링 (복수 선택)
      if (selectedRegions.length > 0) {
        const regionConditions = selectedRegions.map(region => `region.ilike.%${region}%`).join(',')
        // Supabase의 .or() 사용
        if (selectedRegions.length === 1) {
          countQuery = countQuery.ilike('region', `%${selectedRegions[0]}%`)
        } else {
          // 여러 지역 선택 시 OR 조건
          const orConditions = selectedRegions.map(region => `region.ilike.%${region}%`).join(',')
          countQuery = countQuery.or(orConditions)
        }
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

      // 직역 필터링 (복수 선택)
      if (selectedPositions.length > 0) {
        query = query.in('position', selectedPositions)
      }

      // 지역 필터링 (복수 선택)
      if (selectedRegions.length > 0) {
        if (selectedRegions.length === 1) {
          query = query.ilike('region', `%${selectedRegions[0]}%`)
        } else {
          // 여러 지역 선택 시 OR 조건
          const orConditions = selectedRegions.map(region => `region.ilike.%${region}%`).join(',')
          query = query.or(orConditions)
        }
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
  }, [currentPage, jobsPerPage, searchQuery, selectedRegions, selectedPositions, supabase])

  useEffect(() => {
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 리셋
  }, [selectedRegions, selectedPositions])

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
    <div className="space-y-0 p-6">
      {/* 직역 필터 (체크박스) */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">직무</div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedPositions.length === 0
                ? 'bg-[#00B992] text-white border border-[#00B992]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedPositions.length === 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedPositions([])
                }
                setCurrentPage(1)
              }}
              className="w-3.5 h-3.5 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-1"
            />
            <span>전체</span>
          </label>
          {otherPositions.map((position) => (
            <label
              key={position}
              className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedPositions.includes(position)
                  ? 'bg-[#00B992] text-white border border-[#00B992]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPositions.includes(position)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPositions([...selectedPositions, position])
                  } else {
                    setSelectedPositions(selectedPositions.filter(p => p !== position))
                  }
                  setCurrentPage(1)
                }}
                className="w-3.5 h-3.5 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-1"
              />
              <span>{positionLabels[position] || position}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 지역 필터 (체크박스) */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">지역</div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedRegions.length === 0
                ? 'bg-[#00B992] text-white border border-[#00B992]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedRegions.length === 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRegions([])
                }
                setCurrentPage(1)
              }}
              className="w-3.5 h-3.5 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-1"
            />
            <span>전체</span>
          </label>
          {regions.filter(r => r !== '전체').map((region) => (
            <label
              key={region}
              className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedRegions.includes(region)
                  ? 'bg-[#00B992] text-white border border-[#00B992]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRegions([...selectedRegions, region])
                  } else {
                    setSelectedRegions(selectedRegions.filter(r => r !== region))
                  }
                  setCurrentPage(1)
                }}
                className="w-3.5 h-3.5 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-1"
              />
              <span>{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 구인글 리스트 */}
      {loading ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">로딩 중...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">구인글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
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

      {/* 하단 영역 */}
      <div className="flex items-center justify-between pt-6 pb-2 border-t border-slate-100 mt-6">
        {/* 페이지네이션 */}
        <div className="flex justify-center flex-1">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        
        {/* 글쓰기 버튼 */}
        <div className="flex justify-end">
          <a
            href="/jobs/other/new"
            className="inline-flex items-center rounded-md bg-[#00B992] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00A882] active:bg-[#009872] transition-colors"
          >
            구인 등록
          </a>
        </div>
      </div>
    </div>
  )
}

