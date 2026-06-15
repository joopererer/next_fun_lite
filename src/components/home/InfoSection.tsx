import { getCachedAllVisibleInfos, getCachedInfoPosts } from '@/lib/cached-data'
import { InfoCard } from '@/src/components/InfoCard'
import { InfoSectionTitle } from './InfoSectionTitle'

export async function InfoSection() {
  const [infos, allVisibleInfos] = await Promise.all([
    getCachedInfoPosts(),
    getCachedAllVisibleInfos(),
  ])

  if (allVisibleInfos.length === 0) return null

  const infoCountLabel =
    infos.length < allVisibleInfos.length
      ? `${infos.length}/${allVisibleInfos.length}`
      : String(infos.length)

  return (
    <section className="mb-8 sm:mb-10">
      <InfoSectionTitle count={infoCountLabel} hasItems={infos.length > 0} />
      {infos.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {infos.map((a) => (
            <InfoCard key={a.id} activity={a} />
          ))}
        </div>
      )}
    </section>
  )
}
