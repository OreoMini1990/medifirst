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
  { label: '간호사', value: 'nurse' },
  { label: '간호조무사', value: 'assistant' },
  { label: '물리치료사', value: 'pt' },
  { label: '방사선사', value: 'rt' },
  { label: '행정·원무', value: 'admin_staff' },
  { label: '원장/관리자', value: 'manager' },
  { label: '기타', value: 'etc' },
] as const

export default function OnboardingPage() {
  const [role, setRole] = useState<UserRole | ''>('')
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
      .select('role, workplace_name')
      .eq('id', user.id)
      .single()

    // 이미 온보딩이 완료된 경우 홈으로 리다이렉트
    if (profile?.role && profile?.workplace_name) {
      router.push('/')
      return
    }

    setChecking(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!role) {
      setError('직업을 선택해주세요.')
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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: role as UserRole,
        workplace_name: workplaceName.trim(),
        hospital_name: workplaceName.trim(), // 하위 호환성
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>환영합니다!</CardTitle>
          <CardDescription>
            처음 오셨네요. 직업과 근무지를 선택해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">직업 *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)} required>
                <SelectTrigger>
                  <SelectValue placeholder="직업을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workplaceName">근무지 *</Label>
              <Input
                id="workplaceName"
                type="text"
                placeholder="예) 좋은습관마취통증의학과의원"
                value={workplaceName}
                onChange={(e) => setWorkplaceName(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '저장 중...' : '시작하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

