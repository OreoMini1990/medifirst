/**
 * 홈페이지 디자인 설정
 * 
 * 이 파일을 수정하여 홈페이지 디자인을 제어할 수 있습니다.
 * - premium: true -> 상업화된 프리미엄 디자인
 * - premium: false -> 단순한 기본 디자인
 */

export const homepageConfig = {
  // 프리미엄 디자인 활성화 여부
  premium: false,
  
  // 각 섹션별 활성화 여부
  sections: {
    hero: true,           // 히어로 섹션
    features: true,        // 기능 소개 섹션
    stats: true,          // 통계 섹션
    cta: true,           // CTA 섹션
  },
  
  // 디자인 테마 설정
  theme: {
    primaryColor: 'emerald',  // primary 색상 (emerald, blue, purple 등)
    gradient: true,           // 그라데이션 효과 사용 여부
    animations: true,         // 애니메이션 효과 사용 여부
  }
}

// 환경 변수로도 제어 가능 (우선순위: 환경 변수 > 설정 파일)
export const getHomepageConfig = () => {
  const envPremium = process.env.NEXT_PUBLIC_HOMEPAGE_PREMIUM
  if (envPremium !== undefined) {
    return {
      ...homepageConfig,
      premium: envPremium === 'true',
    }
  }
  return homepageConfig
}

