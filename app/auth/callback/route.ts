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
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 프로필이 없으면 생성 (role, workplace_name은 null로 설정하여 온보딩으로 보냄)
    if (!profile) {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || '',
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        role: null,
        workplace_name: null,
        hospital_name: null,
      })
    } else {
      // 프로필이 있지만 role이나 workplace_name이 없으면 null로 설정
      if (!profile.role || !profile.workplace_name) {
        await supabase
          .from('profiles')
          .update({
            role: null,
            workplace_name: null,
          })
          .eq('id', user.id)
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}

