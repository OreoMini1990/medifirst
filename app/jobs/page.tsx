'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DoctorJobsBoard } from '@/components/jobs/DoctorJobsBoard'
import { OtherJobsBoard } from '@/components/jobs/OtherJobsBoard'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

function JobsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const typeParam = searchParams.get('type')
  const [defaultTab, setDefaultTab] = useState<'doctor' | 'other'>('doctor')
  const [jobType, setJobType] = useState<'recruit' | 'resume'>('recruit')
  const [userRoleChecked, setUserRoleChecked] = useState(false)
  const supabase = createClient()

  // 사용자 직업 확인하여 기본 탭 설정
  useEffect(() => {
    async function checkUserRole() {
      // URL 파라미터가 있으면 사용자가 직접 선택한 것이므로 그대로 사용
      if (tabParam === 'doctor' || tabParam === 'other') {
        setDefaultTab(tabParam)
        setUserRoleChecked(true)
        return
      }

      // URL 파라미터가 없으면 사용자 직업 확인
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // 로그인하지 않은 경우 기본값(의료진) 사용
          setDefaultTab('other')
          setUserRoleChecked(true)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()

        // 의사 접근 가능: role이 doctor, manager, locum_doctor이거나 roles 배열에 doctor가 포함된 경우
        const hasDoctorAccess = 
          profile?.role === 'doctor' || 
          profile?.role === 'manager' || 
          profile?.role === 'locum_doctor' ||
          (profile?.roles && Array.isArray(profile.roles) && profile.roles.includes('doctor'))

        if (hasDoctorAccess) {
          setDefaultTab('doctor')
        } else {
          setDefaultTab('other')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        // 에러 발생 시 기본값(의료진) 사용
        setDefaultTab('other')
      } finally {
        setUserRoleChecked(true)
      }
    }

    checkUserRole()
  }, [tabParam, supabase])

  useEffect(() => {
    if (typeParam === 'recruit' || typeParam === 'resume') {
      setJobType(typeParam)
    }
  }, [typeParam])

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 상단 제목 영역 */}
        <section className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">구인·구직</h1>
            <p className="mt-2 text-sm text-slate-500 font-normal">
              1차의료기관 채용공고 및 인재 정보
            </p>
          </div>
        </section>

        {/* 얇은 언더라인 탭 */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-8 text-[14px] items-center">
            <button
              type="button"
              onClick={() => setJobType('recruit')}
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                jobType === 'recruit'
                  ? 'border-[#00B992] text-slate-900 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              구인
            </button>
            <button
              type="button"
              onClick={() => setJobType('resume')}
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                jobType === 'resume'
                  ? 'border-[#00B992] text-slate-900 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              구직
            </button>
          </nav>
        </div>

        {/* 구인 탭 */}
        {jobType === 'recruit' && (
          <div>
            {userRoleChecked ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultTab('doctor')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      defaultTab === 'doctor'
                        ? 'bg-[#00B992] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    의사
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultTab('other')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      defaultTab === 'other'
                        ? 'bg-[#00B992] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    의료진
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  {defaultTab === 'doctor' && <DoctorJobsBoard />}
                  {defaultTab === 'other' && <OtherJobsBoard />}
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-400 font-normal">로딩 중...</p>
              </div>
            )}
          </div>
        )}

        {/* 구직 탭 */}
        {jobType === 'resume' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm py-16 text-center">
            <p className="text-sm text-slate-400 font-normal">
              구직 기능은 준비 중입니다.
            </p>
            <p className="text-xs text-slate-400 font-normal mt-2">
              곧 만나보실 수 있습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
      <JobsContent />
    </Suspense>
  )
}
