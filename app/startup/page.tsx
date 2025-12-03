import { StartupBoard } from '@/components/startup/StartupBoard'

export default function StartupPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams.tab || 'all'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">개원·경영</h1>
        <p className="text-muted-foreground mt-2">
          1차의료기관 개원 및 경영 정보 공유
        </p>
      </div>

      <StartupBoard initialTab={tab} />
    </div>
  )
}

