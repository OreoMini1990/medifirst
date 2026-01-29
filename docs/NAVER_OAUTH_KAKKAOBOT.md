# 네이버 OAuth (kakkaobot !질문 연동)

MediFirst Vercel 배포(medifirstall.vercel.app)에서 **네이버 OAuth 시작/콜백**을 처리합니다.  
토큰은 **Supabase `naver_oauth_tokens`**에 저장하며, kakkaobot 서버와 **동일 DB**를 사용합니다.

## API 경로

- **시작**: `GET /api/naver/oauth/start?user_id=...&draft_id=...&user_name=...`
- **콜백**: `GET /api/naver/oauth/callback` (네이버 redirect)

## 환경 변수 (Vercel)

Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**에서 추가:

| 변수 | 설명 | 예시 |
|------|------|------|
| `NAVER_CLIENT_ID` | 네이버 앱 Client ID | (개발자센터) |
| `NAVER_CLIENT_SECRET` | 네이버 앱 Client Secret | (개발자센터) |
| `NAVER_REDIRECT_URI` | 콜백 URL (네이버 앱에 등록된 값과 동일) | `https://medifirstall.vercel.app/api/naver/oauth/callback` |
| `OAUTH_STATE_SECRET` | state HMAC용 비밀 (kakkaobot과 동일 권장) | 영문/숫자 임의 문자열 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (기존) | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role (토큰 저장용, kakkaobot과 동일 프로젝트) | (Supabase 대시보드) |

- `NAVER_REDIRECT_URI` 없으면 `VERCEL_URL`로 `https://${VERCEL_URL}/api/naver/oauth/callback` 사용.
- **네이버 개발자센터** 앱의 Callback URL에 `https://medifirstall.vercel.app/api/naver/oauth/callback` 등록 필수.

## DB

- **naver_oauth_tokens** 테이블 필요 (kakkaobot `server/db/` 스키마·마이그레이션 참고).
- `server/db/migration_add_user_name_to_naver_tokens.sql` 적용 권장.

## Vercel 배포

- **Git 연동**: Vercel은 GitHub `OreoMini1990/medifirst` 리포를 기반으로 배포합니다.
- 이 디렉터리(medifirst)를 해당 리포에 push하면 Vercel이 자동 빌드·배포합니다.

## kakkaobot 쪽

- `NAVER_OAUTH_BASE_URL`: `https://medifirstall.vercel.app`
- `NAVER_OAUTH_START_PATH`: `/api/naver/oauth/start`  
→ `!질문` 연동 링크가 위 API로 연결됩니다.
