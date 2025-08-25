type Props = { rating?: number | null }

export default function RatingStars({ rating = 0 }: Props) {
  const r = Math.max(0, Math.min(5, Math.round((rating ?? 0) * 2) / 2))
  const stars = [1,2,3,4,5].map((i) => ({
    full: i <= Math.floor(r),
    half: i - 0.5 === r
  }))
  return (
    <div className="flex items-center gap-1 text-yellow-500" aria-label={`Rating ${r} out of 5`}>
      {stars.map((s, idx) => (
        <span key={idx}>{s.full ? '★' : s.half ? '☆' : '☆'}</span>
      ))}
    </div>
  )
}
