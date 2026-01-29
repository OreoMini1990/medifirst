import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const p = (request.nextUrl?.pathname ?? '').toLowerCase()
  const rest = p.replace(/^\/+/, '')
  if (rest.startsWith('api') || rest.startsWith('oauth')) {
    return NextResponse.next({ request })
  }
  // kakkaobot OAuth 링크 쿼리(user_id+draft_id): 로그인 리다이렉트 스킵, 경로가 다르면 OAuth 시작으로 보냄
  const q = request.nextUrl.searchParams
  if (q.has('user_id') && q.has('draft_id')) {
    if (!rest.startsWith('oauth/naver/start')) {
      const oauthStart = new URL('/oauth/naver/start', request.nextUrl.origin)
      q.forEach((v, k) => oauthStart.searchParams.set(k, v))
      return NextResponse.redirect(oauthStart, 302)
    }
    return NextResponse.next({ request })
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image, favicon.ico, static images
     * - api (전체 /api/* 제외)
     * - oauth (전체 /oauth/* 제외 → kakkaobot !질문 Naver OAuth, 로그인 리다이렉트 없음)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|oauth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

