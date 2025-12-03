'use client'

import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { StatsSection } from './StatsSection'
import { CTASection } from './CTASection'
import { homepageConfig } from '@/lib/config/homepage'

export function PremiumHomePage() {
  return (
    <div className="min-h-screen">
      {homepageConfig.sections.hero && <HeroSection />}
      {homepageConfig.sections.features && <FeaturesSection />}
      {homepageConfig.sections.stats && <StatsSection />}
      {homepageConfig.sections.cta && <CTASection />}
    </div>
  )
}

