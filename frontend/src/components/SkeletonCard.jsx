/**
 * SkeletonCard.jsx
 * ----------------
 * Placeholder card shown while recommendations are loading.
 * Identical dimensions to MovieCard so the layout doesn't shift
 * when real cards replace the skeletons.
 */
export default function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
      {/* Poster placeholder — same aspect ratio as a movie poster (2:3) */}
      <div className="skeleton-shimmer w-full aspect-[2/3]" />

      {/* Text placeholders */}
      <div className="p-3 flex flex-col gap-2">
        <div className="skeleton-shimmer h-4 rounded w-4/5" />
        <div className="skeleton-shimmer h-3 rounded w-2/5" />
      </div>
    </div>
  )
}