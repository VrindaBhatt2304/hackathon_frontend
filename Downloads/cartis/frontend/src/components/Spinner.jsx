export default function Spinner({ text = "Loading…" }) {
  return (
    <div className="min-h-[240px] flex flex-col items-center justify-center gap-3 text-stone-500 font-medium text-sm">
      <div className="w-7 h-7 border-3 border-emerald-600/30 border-t-emerald-700 rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  )
}