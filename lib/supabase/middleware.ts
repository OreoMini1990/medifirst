import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const p = (request.nextUrl?.pathname ?? '').toLowerCase()
  const rest = p.replace(/^\/+/, '')
  if (rest.startsWith('api') || rest.startsWith('oauth')) {
    return NextResponse.next({ request })
  }
  // kakkaobot OAuth 링크 쿼리(user_id+draft_id): 리다이렉트 스킵, 경로가 다르면 OAuth 시작으로 보냄
  const q = request.nextUrl.searchParams
  if (q.has('user_id') && q.has('draft_id')) {
    if (!rest.startsWith('oauth/naver/start')) {
      const oauthStart = new URL('/oauth/naver/start', request.nextUrl.origin)
      q.forEach((v, k) => oauthStart.searchParams.set(k, v))
      return NextResponse.redirect(oauthStart, 302)
    }
    return NextResponse.next({ request })
  }

  // 환경 변수가 없으면 미들웨어를 건너뜀
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Skipping middleware.')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    console.error('Middleware: Error getting user:', error)
    // 에러 발생 시에도 계속 진행 (인증되지 않은 사용자로 처리)
    user = null
  }

  const pathname = request.nextUrl.pathname ?? ''
  if (
    !user &&
    !pathname.toLowerCase().startsWith('/login') &&
    !pathname.toLowerCase().startsWith('/signup') &&
    !pathname.toLowerCase().startsWith('/auth') &&
    !pathname.toLowerCase().startsWith('/oauth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 로그인한 사용자의 온보딩 상태 확인
  if (user) {
    // 온보딩 페이지는 통과
    if (request.nextUrl.pathname.startsWith('/onboarding')) {
      return supabaseResponse
    }

    try {
      // 프로필 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, workplace_name')
        .eq('id', user.id)
        .single()

      // 프로필이 없거나 role 또는 workplace_name이 없으면 온보딩 페이지로 리다이렉트
      if (profileError || !profile || !profile.role || !profile.workplace_name) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Middleware: Error fetching profile:', error)
      // 프로필 조회 실패 시 온보딩 페이지로 리다이렉트
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

