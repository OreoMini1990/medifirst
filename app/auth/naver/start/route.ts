/**
 * GET /auth/naver/start
 * kakkaobot !질문 연동용 네이버 OAuth 시작
 * /auth 허용 구간 → 미들웨어 로그인 리다이렉트 없음
 * 쿼리: user_id (필수), draft_id, user_name (선택)
 */

import { createState } from '@/lib/naver-oauth/state'
import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.NAVER_CLIENT_ID!

function getRedirectUri(): string | null {
  if (process.env.NAVER_REDIRECT_URI) return process.env.NAVER_REDIRECT_URI
  const v = process.env.VERCEL_URL
  if (v) return `https://${v}/auth/naver/callback`
  return null
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id') ?? request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json(
      { error: 'user_id_required', message: 'user_id가 필요합니다.' },
      { status: 400 }
    )
  }

  if (!CLIENT_ID) {
    return NextResponse.json(
      {
        error: 'config_error',
        message: 'NAVER_CLIENT_ID가 설정되지 않았습니다. 환경변수를 확인하세요.',
      },
      { status: 500 }
    )
  }

  const redirectUri = getRedirectUri()
  if (!redirectUri) {
    return NextResponse.json(
      {
        error: 'config_error',
        message: 'NAVER_REDIRECT_URI 또는 VERCEL_URL이 필요합니다.',
      },
      { status: 500 }
    )
  }

  const draftId = (request.nextUrl.searchParams.get('draft_id') ?? request.nextUrl.searchParams.get('draftId') ?? '').trim() || null
  const userName = (request.nextUrl.searchParams.get('user_name') ?? request.nextUrl.searchParams.get('userName') ?? '').trim() || null

  const state = createState(String(userId), draftId, userName)

  const authUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', 'cafe_write')

  return NextResponse.redirect(authUrl.toString(), 302)
}
