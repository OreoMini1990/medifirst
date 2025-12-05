'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types/database'

const ROLE_OPTIONS = [
  { label: '의사', value: 'doctor' },
  { label: '봉직의', value: 'locum_doctor' },
  { label: '개원의', value: 'manager' },
  { label: '간호사', value: 'nurse' },
  { label: '간호조무사', value: 'assistant' },
  { label: '물리치료사', value: 'pt' },
  { label: '방사선사', value: 'rt' },
  { label: '임상병리사', value: 'cp' },
  { label: '원무', value: 'admin_staff' },
  { label: '기타', value: 'etc' },
] as const

export default function OnboardingPage() {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])
  const [workplaceName, setWorkplaceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkProfile()
  }, [])

  async function checkProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, roles, workplace_name')
      .eq('id', user.id)
      .single()

    // 이미 온보딩이 완료된 경우 홈으로 리다이렉트
    if ((profile?.role || (profile?.roles && Array.isArray(profile.roles) && profile.roles.length > 0)) && profile?.workplace_name) {
      router.push('/')
      return
    }

    setChecking(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (selectedRoles.length === 0) {
      setError('직업을 최소 1개 이상 선택해주세요.')
      setLoading(false)
      return
    }

    if (!workplaceName.trim()) {
      setError('근무지를 입력해주세요.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    // 첫 번째 선택된 직업을 role로 설정 (하위 호환성)
    const primaryRole = selectedRoles[0] as UserRole
    
    console.log('Onboarding: Updating profile with roles:', selectedRoles, 'workplace:', workplaceName.trim())
    
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: primaryRole,
        roles: selectedRoles,
        workplace_name: workplaceName.trim(),
        hospital_name: workplaceName.trim(), // 하위 호환성
      })
      .eq('id', user.id)
      .select()

    if (updateError) {
      console.error('Onboarding: Update error:', updateError)
      console.error('Onboarding: Update error details:', JSON.stringify(updateError, null, 2))
      setError(updateError.message || '저장 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    console.log('Onboarding: Profile updated successfully:', updateData)
    
    // 업데이트된 프로필 확인
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('role, workplace_name')
      .eq('id', user.id)
      .single()
    
    if (verifyError) {
      console.error('Onboarding: Verify error:', verifyError)
    } else {
      console.log('Onboarding: Verified profile:', verifyProfile)
    }
    
    // 업데이트 후 잠시 대기하여 데이터베이스에 반영되도록 함
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 강제로 페이지 새로고침하여 미들웨어가 업데이트된 프로필을 확인하도록 함
    window.location.href = '/'
  }

  if (checking) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">확인 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-100">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900">환영합니다!</CardTitle>
          <CardDescription className="text-slate-600">
            처음 오셨네요. 직업과 근무지를 선택해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">직업 * (복수 선택 가능)</Label>
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {ROLE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-2 cursor-pointer p-2.5 rounded-lg border transition-all ${
                      selectedRoles.includes(option.value as UserRole)
                        ? 'border-[#00B992] bg-emerald-50 shadow-sm'
                        : 'border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(option.value as UserRole)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, option.value as UserRole])
                        } else {
                          setSelectedRoles(selectedRoles.filter(r => r !== option.value))
                        }
                      }}
                      className="w-4 h-4 text-[#00B992] border-slate-300 rounded focus:ring-[#00B992] focus:ring-2"
                    />
                    <span className="text-sm text-slate-700 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-xs text-red-600 mt-1">직업을 최소 1개 이상 선택해주세요.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="workplaceName" className="text-slate-700 font-medium">근무지 *</Label>
              <Input
                id="workplaceName"
                type="text"
                placeholder="예) 좋은습관마취통증의학과의원"
                value={workplaceName}
                onChange={(e) => setWorkplaceName(e.target.value)}
                className="border-slate-200 focus:border-[#00B992] focus:ring-[#00B992]"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-[#00B992] hover:bg-[#00A882] text-white font-semibold py-6 text-base shadow-md hover:shadow-lg transition-all" 
              disabled={loading}
            >
              {loading ? '저장 중...' : '시작하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

