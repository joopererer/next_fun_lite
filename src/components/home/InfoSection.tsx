import { getCachedAllVisibleInfos, getCachedInfoPosts } from '@/lib/cached-data'
import { InfoCard } from '@/src/components/InfoCard'

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
      <h2 className="section-title">
        📢 近期资讯
        <span className="text-base font-normal text-gray-400 ml-2">({infoCountLabel})</span>
      </h2>
      {infos.length === 0 ? (
        <p className="text-gray-400 text-sm">暂无未过期的资讯</p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {infos.map((a) => (
            <InfoCard key={a.id} activity={a} />
          ))}
        </div>
      )}
    </section>
  )
}
