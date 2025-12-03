'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/types/database'
import { MobileNav } from './MobileNav'

type NavItem = {
  href: string
  label: string
  external?: boolean
}

const navItems: NavItem[] = [
  { href: '/community', label: '커뮤니티' },
  { href: '/startup', label: '개원·경영' },
  { href: 'https://ghmedi.liveklass.com', label: '아카데미', external: true },
  { href: '/claims', label: '심사청구' },
  { href: '/jobs', label: '구인·구직' },
]

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Header: Auth error:', authError)
          setUser(null)
          setLoading(false)
          return
        }
        
        if (authUser) {
          console.log('Header: Fetching profile for user:', authUser.id)
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single()
            
          if (profileError) {
            console.error('Header: Profile error:', profileError)
            console.error('Header: Profile error details:', JSON.stringify(profileError, null, 2))
            
            // 프로필이 없는 경우 (PGRST116 에러) 프로필 생성 시도
            if (profileError.code === 'PGRST116' || profileError.message?.includes('0 rows')) {
              console.log('Header: Profile not found, creating profile...')
              const { error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  email: authUser.email || '',
                  display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
                  role: null,
                  workplace_name: null,
                })
              
              if (createError) {
                console.error('Header: Failed to create profile:', createError)
                // 프로필 생성 실패해도 기본 정보로 사용자 표시
                setUser({
                  id: authUser.id,
                  email: authUser.email || '',
                  display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
                  role: null,
                  workplace_name: null,
                  created_at: authUser.created_at,
                  updated_at: authUser.updated_at || authUser.created_at,
                } as Profile)
              } else {
                console.log('Header: Profile created successfully')
                // 프로필 생성 후 다시 조회
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', authUser.id)
                  .single()
                
                if (newProfile) {
                  setUser(newProfile)
                } else {
                  // 기본 정보로 사용자 표시
                  setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
                    role: null,
                    workplace_name: null,
                    created_at: authUser.created_at,
                    updated_at: authUser.updated_at || authUser.created_at,
                  } as Profile)
                }
              }
            } else {
              // 다른 에러인 경우 기본 정보로 사용자 표시
              setUser({
                id: authUser.id,
                email: authUser.email || '',
                display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
                role: null,
                workplace_name: null,
                created_at: authUser.created_at,
                updated_at: authUser.updated_at || authUser.created_at,
              } as Profile)
            }
          } else if (profile) {
            console.log('Header: Profile loaded:', profile.display_name, profile.email)
            setUser(profile)
          } else {
            console.log('Header: No profile found, using auth user data')
            // 프로필이 없어도 기본 정보로 사용자 표시
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
              role: null,
              workplace_name: null,
              created_at: authUser.created_at,
              updated_at: authUser.updated_at || authUser.created_at,
            } as Profile)
          }
          } catch (err) {
            console.error('Header: Exception fetching profile:', err)
            // 예외 발생 시에도 기본 정보로 사용자 표시
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
              role: null,
              workplace_name: null,
              created_at: authUser.created_at,
              updated_at: authUser.updated_at || authUser.created_at,
            } as Profile)
          }
        } else {
          console.log('Header: No auth user')
          setUser(null)
        }
      } catch (error) {
        console.error('Header: Unexpected error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Header: Auth state changed:', event, session?.user?.id)
      
      if (session?.user) {
        try {
          console.log('Header: Fetching profile on auth change for user:', session.user.id)
          
          // 프로필 조회
          const profileResult = await Promise.race([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            new Promise<{ data: null, error: { message: string } }>((resolve) => 
              setTimeout(() => resolve({ data: null, error: { message: 'Profile fetch timeout' } }), 5000)
            )
          ])
          
          const { data: profile, error: profileError } = profileResult
          
          if (profileError) {
            console.error('Header: Profile error on auth change:', profileError)
            console.error('Header: Profile error details:', JSON.stringify(profileError, null, 2))
            
            // 프로필이 없는 경우 (PGRST116 에러) 프로필 생성 시도
            if (profileError.code === 'PGRST116' || profileError.message?.includes('0 rows') || profileError.message?.includes('timeout')) {
              console.log('Header: Profile not found on auth change, creating profile...')
              const { error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
                  role: null,
                  workplace_name: null,
                })
              
              if (createError) {
                console.error('Header: Failed to create profile on auth change:', createError)
                // 프로필 생성 실패해도 기본 정보로 사용자 표시
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
                  role: null,
                  workplace_name: null,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || session.user.created_at,
                } as Profile)
              } else {
                console.log('Header: Profile created successfully on auth change')
                // 프로필 생성 후 다시 조회
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()
                
                if (newProfile) {
                  setUser(newProfile)
                } else {
                  // 기본 정보로 사용자 표시
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
                    role: null,
                    workplace_name: null,
                    created_at: session.user.created_at,
                    updated_at: session.user.updated_at || session.user.created_at,
                  } as Profile)
                }
              }
            } else {
              // 다른 에러인 경우 기본 정보로 사용자 표시
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
                role: null,
                workplace_name: null,
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at,
              } as Profile)
            }
          } else if (profile) {
            console.log('Header: Profile loaded on auth change:', profile.display_name, profile.email)
            setUser(profile)
          } else {
            console.log('Header: No profile found on auth change, using auth user data')
            // 프로필이 없어도 기본 정보로 사용자 표시
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
              role: null,
              workplace_name: null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            } as Profile)
          }
        } catch (error) {
          console.error('Header: Unexpected error on auth change:', error)
          // 에러가 발생해도 세션 정보로 사용자 표시
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null,
              role: null,
              workplace_name: null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            } as Profile)
          } else {
            setUser(null)
          }
        }
      } else {
        console.log('Header: No session on auth change')
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">MediFirst</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  {item.label}
                </a>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="md:hidden">
          <MobileNav />
        </div>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.display_name || '사용자'}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">프로필 설정</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

