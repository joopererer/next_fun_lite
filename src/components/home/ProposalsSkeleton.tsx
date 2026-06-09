export function ProposalsSkeleton() {
  return (
    <section className="mb-10">
      <h2 className="section-title">💡 提议池</h2>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-4 mb-3 animate-pulse bg-white">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </section>
  )
}
