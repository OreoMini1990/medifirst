'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DoctorJobsBoard } from '@/components/jobs/DoctorJobsBoard'
import { OtherJobsBoard } from '@/components/jobs/OtherJobsBoard'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function JobsPage() {
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
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'doctor') {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">구인·구직</h1>
        <p className="text-muted-foreground mt-2">
          1차의료기관 채용공고 및 인재 정보
        </p>
      </div>

      {/* 구인/구직 탭 */}
      <Tabs value={jobType} onValueChange={(value) => setJobType(value as 'recruit' | 'resume')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="recruit">구인</TabsTrigger>
          <TabsTrigger value="resume">구직</TabsTrigger>
        </TabsList>

        {/* 구인 탭 */}
        <TabsContent value="recruit" className="mt-0">
          <Tabs value={defaultTab} onValueChange={(value) => setDefaultTab(value as 'doctor' | 'other')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="doctor">의사</TabsTrigger>
              <TabsTrigger value="other">의료진</TabsTrigger>
            </TabsList>
            <TabsContent value="doctor" className="mt-6">
              <DoctorJobsBoard />
            </TabsContent>
            <TabsContent value="other" className="mt-6">
              <OtherJobsBoard />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 구직 탭 */}
        <TabsContent value="resume" className="mt-0">
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              구직 기능은 준비 중입니다.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              곧 만나보실 수 있습니다.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
