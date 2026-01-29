import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const p = request.nextUrl?.pathname ?? ''
  if (p.startsWith('/api') || p.replace(/^\/+/, '').startsWith('api') ||
      p.startsWith('/oauth') || p.replace(/^\/+/, '').startsWith('oauth')) {
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

