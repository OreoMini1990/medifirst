import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoleCommunity } from '@/components/community/RoleCommunity'
import { FreeBoard } from '@/components/community/FreeBoard'
import { QABoard } from '@/components/community/QABoard'

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">커뮤니티</h1>
        <p className="text-muted-foreground mt-2">
          1차의료기관 종사자들을 위한 소통 공간
        </p>
      </div>

      <Tabs defaultValue="role" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="role">직역별 커뮤니티</TabsTrigger>
          <TabsTrigger value="free">자유게시판</TabsTrigger>
          <TabsTrigger value="qa">질문게시판</TabsTrigger>
        </TabsList>
        <TabsContent value="role" className="mt-6">
          <RoleCommunity />
        </TabsContent>
        <TabsContent value="free" className="mt-6">
          <FreeBoard />
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
          <QABoard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

