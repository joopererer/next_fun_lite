export function RecruitingSkeleton() {
  return (
    <section className="mb-10">
      <h2 className="section-title">🟢 正在招募</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4 animate-pulse bg-white">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-2 bg-gray-200 rounded w-full mb-4" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    </section>
  )
}
