import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // OAuth 로그인 후 프로필이 없으면 생성
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 프로필이 없으면 생성 (role, workplace_name은 null로 설정하여 온보딩으로 보냄)
    if (!profile || profileError?.code === 'PGRST116') {
      console.log('OAuth Callback: Creating profile for user:', user.id)
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || '',
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || null,
        role: null,
        workplace_name: null,
        hospital_name: null,
      })
      
      if (insertError) {
        console.error('OAuth Callback: Profile creation error:', insertError)
      } else {
        console.log('OAuth Callback: Profile created successfully')
      }
    } else if (profile) {
      // 프로필이 있지만 role이나 workplace_name이 없으면 null로 설정
      if (!profile.role || !profile.workplace_name) {
        console.log('OAuth Callback: Updating profile to set role/workplace_name to null')
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: null,
            workplace_name: null,
          })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('OAuth Callback: Profile update error:', updateError)
        }
      }
      
      // display_name이 없으면 업데이트
      if (!profile.display_name) {
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || null
        if (displayName) {
          console.log('OAuth Callback: Updating display_name:', displayName)
          await supabase
            .from('profiles')
            .update({ display_name: displayName })
            .eq('id', user.id)
        }
      }
    }
    
    // 프로필 생성/업데이트 후 잠시 대기하여 데이터베이스에 반영되도록 함
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return NextResponse.redirect(`${origin}/`)
}

