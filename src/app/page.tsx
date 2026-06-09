import { Suspense } from 'react'
import { HomeLayout } from '@/src/components/home/HomeLayout'
import { RecruitingSection } from '@/src/components/home/RecruitingSection'
import { InfoSection } from '@/src/components/home/InfoSection'
import { ProposalsSection } from '@/src/components/home/ProposalsSection'
import { PastSection } from '@/src/components/home/PastSection'
import { RecruitingSkeleton } from '@/src/components/home/RecruitingSkeleton'
import { InfoSkeleton } from '@/src/components/home/InfoSkeleton'
import { ProposalsSkeleton } from '@/src/components/home/ProposalsSkeleton'

export default function Page() {
  return (
    <HomeLayout>
      <Suspense fallback={<RecruitingSkeleton />}>
        <RecruitingSection />
      </Suspense>
      <Suspense fallback={<InfoSkeleton />}>
        <InfoSection />
      </Suspense>
      <Suspense fallback={<ProposalsSkeleton />}>
        <ProposalsSection />
      </Suspense>
      <Suspense fallback={null}>
        <PastSection />
      </Suspense>
    </HomeLayout>
  )
}
