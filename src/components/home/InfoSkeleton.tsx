export function InfoSkeleton() {
  return (
    <section className="mb-10">
      <h2 className="section-title">📢 近期资讯</h2>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4 animate-pulse bg-white">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    </section>
  )
}
