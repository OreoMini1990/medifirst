'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types/database'
import { Chrome } from 'lucide-react'

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

// 무작위 닉네임 생성 함수
function generateRandomNickname(): string {
  const adjectives = [
    '공감하는', '피곤한', '밝은', '조용한', '활발한', '친절한', '똑똑한', '용감한',
    '부지런한', '차분한', '열정적인', '온화한', '명랑한', '성실한', '긍정적인', '창의적인',
    '유쾌한', '진지한', '따뜻한', '시원한', '신중한', '적극적인', '낙천적인', '현명한'
  ]
  const animals = [
    '다람쥐', '생쥐', '햄스터', '토끼', '고양이', '강아지', '펭귄', '곰',
    '사자', '호랑이', '여우', '늑대', '사슴', '코끼리', '기린', '판다',
    '펜더', '오리', '닭', '병아리', '앵무새', '참새', '비둘기', '까마귀'
  ]
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
  
  return randomAdjective + randomAnimal
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [workplaceName, setWorkplaceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null)
  const [isNicknameFocused, setIsNicknameFocused] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 컴포넌트 마운트 시 닉네임 자동 생성
  useEffect(() => {
    if (!displayName && !isNicknameFocused) {
      setDisplayName(generateRandomNickname())
    }
  }, [])

  // 이메일 형식 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 비밀번호 강도 검증 (대소문자, 특수문자 포함, 6자 이상)
  const validatePassword = (password: string): { valid: boolean; message: string | null } => {
    if (password.length < 6) {
      return { valid: false, message: '비밀번호는 6자 이상이어야 합니다.' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: '비밀번호에 소문자가 포함되어야 합니다.' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: '비밀번호에 대문자가 포함되어야 합니다.' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: '비밀번호에 특수문자가 포함되어야 합니다.' }
    }
    return { valid: true, message: null }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.')
    } else {
      setEmailError(null)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value) {
      const validation = validatePassword(value)
      if (!validation.valid) {
        setPasswordError(validation.message)
      } else {
        setPasswordError(null)
      }
    } else {
      setPasswordError(null)
    }
    
    // 비밀번호 확인 검증도 함께 수행
    if (passwordConfirm && value !== passwordConfirm) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.')
    } else if (passwordConfirm && value === passwordConfirm) {
      setPasswordConfirmError(null)
    }
  }

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPasswordConfirm(value)
    if (value && value !== password) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.')
    } else {
      setPasswordConfirmError(null)
    }
  }

  const handleNicknameFocus = () => {
    setIsNicknameFocused(true)
  }

  const handleNicknameBlur = () => {
    setIsNicknameFocused(false)
    // 닉네임이 비어있으면 다시 생성
    if (!displayName.trim()) {
      setDisplayName(generateRandomNickname())
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 이메일 검증
    if (!email) {
      setEmailError('이메일을 입력해주세요.')
      setLoading(false)
      return
    }
    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.')
      setLoading(false)
      return
    }

    // 비밀번호 검증
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.')
      setLoading(false)
      return
    }
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message)
      setLoading(false)
      return
    }

    // 비밀번호 확인 검증
    if (!passwordConfirm) {
      setPasswordConfirmError('비밀번호 확인을 입력해주세요.')
      setLoading(false)
      return
    }
    if (password !== passwordConfirm) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    // 필수 필드 검증
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('인증 오류:', authError)
      // 에러 메시지를 한글로 변환
      let errorMessage = authError.message
      if (authError.message.includes('User already registered') || authError.message.includes('already registered')) {
        errorMessage = '이미 등록된 이메일입니다.'
      } else if (authError.message.includes('Invalid email') || authError.message.includes('invalid')) {
        errorMessage = '올바른 이메일 형식을 입력해주세요.'
      } else if (authError.message.includes('Password') || authError.message.includes('password')) {
        errorMessage = '비밀번호가 너무 짧거나 약합니다.'
      } else if (authError.message.includes('Email rate limit')) {
        errorMessage = '이메일 전송 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.'
      }
      setError(errorMessage)
      setLoading(false)
      return
    }

    if (authData.user) {
      // 세션이 완전히 설정될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 현재 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('세션 오류:', sessionError)
        // 세션이 없어도 프로필 업데이트는 시도 (트리거가 프로필을 생성했을 수 있음)
      }
      
      // 프로필이 이미 존재하는지 확인 (트리거에 의해 생성되었을 수 있음)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()
      
      if (existingProfile) {
        // 프로필이 이미 존재하면 업데이트
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            display_name: displayName.trim() || null,
            role: role as UserRole,
            workplace_name: workplaceName.trim(),
            hospital_name: workplaceName.trim(), // 하위 호환성
          })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error('프로필 업데이트 오류:', updateError)
          setError('프로필 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          setLoading(false)
          return
        }
      } else {
        // 프로필이 없으면 생성 (직업과 근무지 필수)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            display_name: displayName.trim() || null,
            role: role as UserRole,
            workplace_name: workplaceName.trim(),
            hospital_name: workplaceName.trim(), // 하위 호환성
          })

        if (profileError) {
          console.error('프로필 생성 오류:', profileError)
          console.error('프로필 생성 오류 상세:', JSON.stringify(profileError, null, 2))
          // RLS 정책 오류인 경우 더 명확한 메시지 표시
          if (profileError.message.includes('row-level security') || profileError.message.includes('RLS')) {
            setError('회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          } else if (profileError.message.includes('duplicate') || profileError.message.includes('unique')) {
            // 중복 오류인 경우 업데이트 시도
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                display_name: displayName.trim() || null,
                role: role as UserRole,
                workplace_name: workplaceName.trim(),
                hospital_name: workplaceName.trim(),
              })
              .eq('id', authData.user.id)
            
            if (updateError) {
              setError('이미 등록된 사용자입니다.')
            }
          } else {
            setError(profileError.message || '프로필 생성 중 오류가 발생했습니다.')
          }
          setLoading(false)
          return
        }
      }

      router.push('/')
      router.refresh()
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            MediFirst에 가입하여 1차의료 커뮤니티에 참여하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="예) example@email.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
              {emailError && (
                <div className="text-sm text-destructive">{emailError}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="대소문자, 특수문자 포함 6자 이상"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {passwordError && (
                <div className="text-sm text-destructive">{passwordError}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                required
              />
              {passwordConfirmError && (
                <div className="text-sm text-destructive">{passwordConfirmError}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">닉네임</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="닉네임 (선택사항)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onFocus={handleNicknameFocus}
                onBlur={handleNicknameBlur}
              />
              <p className="text-xs text-muted-foreground">
                기본 닉네임이 생성되었습니다. 클릭하여 수정할 수 있습니다.
              </p>
            </div>
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
                placeholder="예) 가나다라정형외과의원"
                value={workplaceName}
                onChange={(e) => setWorkplaceName(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

            <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            구글로 가입하기
          </Button>

          <div className="mt-4 text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
