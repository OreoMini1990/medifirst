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
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const jobsPerPage = 20
  
  const specialties = [
    '전공무관',
    '일반의',
    '가정의학과',
    '내과',
    '마취통증의학과',
    '비뇨의학과',
    '산부인과',
    '성형외과',
    '소아청소년과',
    '신경과',
    '신경외과',
    '안과',
    '영상의학과',
    '외과',
    '응급의학과',
    '이비인후과',
    '재활의학과',
    '정신건강의학과',
    '정형외과',
    '피부과',
    '흉부외과',
  ]
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
      setUserRoles([])
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, roles')
      .eq('id', user.id)
      .single()

    const role = profile?.role as UserRole || null
    setUserRole(role)
    
    // roles 배열 파싱
    const roles: UserRole[] = []
    if (profile?.roles) {
      try {
        const parsedRoles = Array.isArray(profile.roles) ? profile.roles : JSON.parse(profile.roles as string)
        if (Array.isArray(parsedRoles)) {
          roles.push(...parsedRoles.filter(r => r))
        }
      } catch (e) {
        // 파싱 실패 시 무시
      }
    }
    // role 단일값도 추가
    if (role) {
      roles.push(role)
    }
    setUserRoles([...new Set(roles)]) // 중복 제거
    
    setLoading(false)
  }

  const fetchJobs = useCallback(async () => {
    // 의사 접근 가능 여부 확인
    const hasDoctorAccess = 
      userRole === null || // 비로그인 사용자는 볼 수 있음
      userRole === 'doctor' || 
      userRole === 'manager' || 
      userRole === 'locum_doctor' ||
      userRoles.includes('doctor')
    
    if (!hasDoctorAccess) {
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

      // 전공 필터링 (복수 선택)
      if (selectedSpecialties.length > 0) {
        if (selectedSpecialties.length === 1) {
          if (selectedSpecialties[0] === '전공무관') {
            // 전공무관은 specialty가 NULL이거나 '전공무관'인 경우
            countQuery = countQuery.or('specialty.is.null,specialty.eq.전공무관')
          } else {
            countQuery = countQuery.eq('specialty', selectedSpecialties[0])
          }
        } else {
          // 여러 전공 선택 시 OR 조건
          const conditions: string[] = []
          if (selectedSpecialties.includes('전공무관')) {
            conditions.push('specialty.is.null')
            conditions.push('specialty.eq.전공무관')
          }
          const otherSpecialties = selectedSpecialties.filter(s => s !== '전공무관')
          if (otherSpecialties.length > 0) {
            conditions.push(...otherSpecialties.map(s => `specialty.eq.${s}`))
          }
          if (conditions.length > 0) {
            countQuery = countQuery.or(conditions.join(','))
          }
        }
      }

      // 지역 필터링 (복수 선택)
      if (selectedRegions.length > 0) {
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

      // 구인글 조회 - 의사 직역만
      const offset = (currentPage - 1) * jobsPerPage
      let query = supabase
        .from('jobs')
        .select('*, profiles!hospital_id(display_name, workplace_name)')
        .eq('position', 'doctor')

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
  }, [userRole, userRoles, currentPage, jobsPerPage, searchQuery, selectedRegions, selectedSpecialties, supabase])

  useEffect(() => {
    // 의사 접근 가능한 경우에만 조회
    const hasAccess = 
      userRole === null || 
      userRole === 'doctor' || 
      userRole === 'manager' || 
      userRole === 'locum_doctor' ||
      userRoles.includes('doctor')
    
    if (hasAccess) {
      fetchJobs()
    }
  }, [userRole, userRoles, currentPage, searchQuery, selectedRegions, selectedSpecialties, fetchJobs])

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

  // 의사 접근 권한 확인
  const hasAccess = 
    userRole === null || // 비로그인 사용자는 볼 수 있음
    userRole === 'doctor' || 
    userRole === 'manager' || 
    userRole === 'locum_doctor' ||
    userRoles.includes('doctor')

  if (!hasAccess && userRole !== null) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        의사 멤버 전용입니다.
      </div>
    )
  }

  return (
    <div className="space-y-0 p-6">
      {/* 전공 필터 (체크박스) */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">전공</div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedSpecialties.length === 0
                ? 'bg-[#00B992] text-white border border-[#00B992]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSpecialties.length === 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSpecialties([])
                }
                setCurrentPage(1)
              }}
              className="w-3.5 h-3.5 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-1"
            />
            <span>전체</span>
          </label>
          {specialties.map((specialty) => (
            <label
              key={specialty}
              className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedSpecialties.includes(specialty)
                  ? 'bg-[#00B992] text-white border border-[#00B992]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSpecialties.includes(specialty)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSpecialties([...selectedSpecialties, specialty])
                  } else {
                    setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty))
                  }
                  setCurrentPage(1)
                }}
                className="w-3.5 h-3.5 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-1"
              />
              <span>{specialty}</span>
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
      {!loading && jobs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 font-normal">구인글이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <JobListItem
              key={job.id}
              href={`/jobs/doctor/${job.id}`}
              title={job.title}
              positionLabel="의사"
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
            href="/jobs/doctor/new"
            className="inline-flex items-center rounded-md bg-[#00B992] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00A882] active:bg-[#009872] transition-colors"
          >
            구인 등록
          </a>
        </div>
      </div>
    </div>
  )
}

