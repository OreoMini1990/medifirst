import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image, favicon.ico, static images
     * - api (전체 /api/* 제외 → proxy 미실행, API 라우트 직통)
     *   · /api/naver/oauth/* kakkaobot !질문 OAuth (로그인 불필요)
     *   · 기타 API는 각 라우트에서 supabase.auth.getUser() 사용
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

