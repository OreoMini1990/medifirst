# 네이버 OAuth (kakkaobot !질문 연동)

MediFirst Vercel 배포(medifirstall.vercel.app)에서 **네이버 OAuth 시작/콜백**을 처리합니다.  
토큰은 **kakkaobot 전용 Supabase**의 `naver_oauth_tokens`에만 저장합니다.  
**MediFirst 홈**은 기존 Supabase(`NEXT_PUBLIC_SUPABASE_*` 등) 그대로 사용하며, env가 겹치지 않습니다.

## API 경로 (**/oauth/naver 사용 권장**)

- **시작**: `GET /oauth/naver/start?user_id=...&draft_id=...&user_name=...`
- **콜백**: `GET /oauth/naver/callback` (네이버 redirect)

`/oauth` 구간은 미들웨어에서 **로그인 리다이렉트 제외**되어, OAuth 링크 접속 시 로그인 화면으로 넘어가지 않습니다.  
`/auth/naver/*` 는 배포 환경에 따라 404가 날 수 있으므로 **`/oauth/naver/*`** 를 사용하세요.

## 환경 변수 (Vercel)

### Naver OAuth 전용 (kakkaobot Supabase)

**MediFirst 홈용 Supabase와 별도.** kakkaobot 서버가 쓰는 Supabase 프로젝트 URL·키를 넣습니다.

| 변수 | 설명 | 예시 |
|------|------|------|
| `NAVER_OAUTH_SUPABASE_URL` | **kakkaobot** Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY` | **kakkaobot** Supabase service_role 키 (토큰 저장용) | (kakkaobot Supabase 대시보드) |

- `NAVER_OAUTH_SUPABASE_ANON_KEY`로 대체 가능하나, service_role 권장 (RLS 우회).

### 네이버 앱 / state

| 변수 | 설명 | 예시 |
|------|------|------|
| `NAVER_CLIENT_ID` | 네이버 앱 Client ID | (개발자센터) |
| `NAVER_CLIENT_SECRET` | 네이버 앱 Client Secret | (개발자센터) |
| `NAVER_REDIRECT_URI` | 콜백 URL (네이버 앱에 등록된 값과 동일) | `https://medifirstall.vercel.app/oauth/naver/callback` |
| `OAUTH_STATE_SECRET` | state HMAC용 비밀 (kakkaobot과 동일 권장) | 영문/숫자 임의 문자열 |

- `NAVER_REDIRECT_URI` 없으면 `VERCEL_URL`로 `https://${VERCEL_URL}/oauth/naver/callback` 사용.
- **네이버 개발자센터** 앱의 Callback URL에 `https://medifirstall.vercel.app/oauth/naver/callback` 등록 필수.

## DB

- **naver_oauth_tokens**는 **kakkaobot Supabase**에만 존재 (kakkaobot `server/db/` 스키마·마이그레이션 참고).
- `server/db/migration_add_user_name_to_naver_tokens.sql` 적용 권장.

## Vercel 배포

- **Git 연동**: Vercel은 GitHub `OreoMini1990/medifirst` 리포를 기반으로 배포합니다.
- 이 디렉터리(medifirst)를 해당 리포에 push하면 Vercel이 자동 빌드·배포합니다.

## kakkaobot 쪽

- `NAVER_OAUTH_BASE_URL`: `https://medifirstall.vercel.app`
- `NAVER_OAUTH_START_PATH`: **`/oauth/naver/start`** (기본값)
→ `!질문` 연동 링크가 위 API로 연결됩니다.

## 적용 순서 (OAuth 링크 → 로그인/404 해결)

1. **Vercel**  
   - `NAVER_REDIRECT_URI` = `https://medifirstall.vercel.app/oauth/naver/callback`  
   - (그 외 NAVER_* / NAVER_OAUTH_SUPABASE_* / OAUTH_STATE_SECRET 설정 확인)

2. **네이버 개발자센터**  
   - 앱 **Callback URL**에 `https://medifirstall.vercel.app/oauth/naver/callback` 추가

3. **kakkaobot**  
   - `NAVER_OAUTH_BASE_URL` = `https://medifirstall.vercel.app`  
   - `NAVER_OAUTH_START_PATH` = **`/oauth/naver/start`** 또는 **미설정**  
   - PM2 재시작: `pm2 restart kakkaobot-server` (또는 사용 중인 앱명)

4. **Vercel**  
   - medifirst 리포 push 후 배포 완료 대기  
   - `!질문` → 연동 링크가 `https://medifirstall.vercel.app/oauth/naver/start?...` 로 안내되는지 확인
