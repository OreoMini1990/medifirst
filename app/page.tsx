import { getHomepageConfig } from '@/lib/config/homepage'
import { PremiumHomePage } from '@/components/home/PremiumHomePage'
import { SimpleHomePage } from '@/components/home/SimpleHomePage'

export default function HomePage() {
  const config = getHomepageConfig()
  
  // 프리미엄 디자인이 활성화되어 있으면 PremiumHomePage를, 아니면 SimpleHomePage를 렌더링
  if (config.premium) {
    return <PremiumHomePage />
  }
  
  return <SimpleHomePage />
}
