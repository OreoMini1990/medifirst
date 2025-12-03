# 홈페이지 디자인 설정 가이드

## 개요

MediFirst 홈페이지는 두 가지 디자인 모드를 지원합니다:
- **프리미엄 디자인**: 상업화 가능한 고급 디자인 (히어로 섹션, 기능 소개, 통계, CTA 등)
- **단순 디자인**: 기본적인 카드 레이아웃

## 설정 방법

### 방법 1: 설정 파일 수정 (권장)

`lib/config/homepage.ts` 파일을 열어서 설정을 변경하세요:

```typescript
export const homepageConfig = {
  // 프리미엄 디자인 활성화 여부
  premium: true,  // true: 프리미엄 디자인, false: 단순 디자인
  
  // 각 섹션별 활성화 여부
  sections: {
    hero: true,      // 히어로 섹션
    features: true,  // 기능 소개 섹션
    stats: true,     // 통계 섹션
    cta: true,       // CTA 섹션
  },
  
  // 디자인 테마 설정
  theme: {
    primaryColor: 'emerald',  // primary 색상
    gradient: true,           // 그라데이션 효과
    animations: true,         // 애니메이션 효과
  }
}
```

### 방법 2: 환경 변수 사용

`.env.local` 파일에 다음을 추가하세요:

```bash
# 프리미엄 디자인 활성화 (true/false)
NEXT_PUBLIC_HOMEPAGE_PREMIUM=true
```

환경 변수가 설정되어 있으면 설정 파일보다 우선순위가 높습니다.

## 디자인 모드 전환

### 프리미엄 디자인으로 전환

1. `lib/config/homepage.ts`에서 `premium: true`로 설정
2. 또는 `.env.local`에 `NEXT_PUBLIC_HOMEPAGE_PREMIUM=true` 추가

### 단순 디자인으로 롤백

1. `lib/config/homepage.ts`에서 `premium: false`로 설정
2. 또는 `.env.local`에 `NEXT_PUBLIC_HOMEPAGE_PREMIUM=false` 추가

## 섹션별 제어

각 섹션을 개별적으로 활성화/비활성화할 수 있습니다:

```typescript
sections: {
  hero: true,      // 히어로 섹션 표시
  features: true,  // 기능 소개 섹션 표시
  stats: false,    // 통계 섹션 숨김
  cta: true,       // CTA 섹션 표시
}
```

## 컴포넌트 구조

```
components/home/
├── PremiumHomePage.tsx    # 프리미엄 디자인 메인 컴포넌트
├── SimpleHomePage.tsx      # 단순 디자인 메인 컴포넌트
├── HeroSection.tsx         # 히어로 섹션
├── FeaturesSection.tsx     # 기능 소개 섹션
├── StatsSection.tsx        # 통계 섹션
└── CTASection.tsx          # CTA 섹션
```

## 커스터마이징

### 색상 변경

`lib/config/homepage.ts`의 `theme.primaryColor`를 변경하여 주요 색상을 변경할 수 있습니다:
- `emerald` (기본값)
- `blue`
- `purple`
- 기타 Tailwind 색상

### 애니메이션 비활성화

성능 최적화를 위해 애니메이션을 비활성화할 수 있습니다:

```typescript
theme: {
  animations: false,
}
```

## 주의사항

1. 설정 변경 후 개발 서버를 재시작해야 할 수 있습니다.
2. 환경 변수는 빌드 타임에 적용되므로 변경 후 재빌드가 필요합니다.
3. 프리미엄 디자인은 더 많은 리소스를 사용할 수 있습니다.

