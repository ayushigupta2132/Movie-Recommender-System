export default function SkeletonCard({ index = 0 }) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60"
      style={{ '--stagger': index }}
      aria-hidden="true"
    >
      <div className="skeleton-shimmer w-full aspect-[2/3]" />
      <div className="p-3 flex flex-col gap-2.5">
        <div className="skeleton-shimmer h-3.5 rounded-md w-4/5" />
        <div className="skeleton-shimmer h-3 rounded-md w-2/5" />
      </div>
    </div>
  )
}
