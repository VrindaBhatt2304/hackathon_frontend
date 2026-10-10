export default function EmptyState({ icon, title, message }) {
  const defaultIcon = (
    <svg className="w-10 h-10 text-stone-400 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )

  return (
    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50">
      <div className="flex justify-center mb-3">
        {icon || defaultIcon}
      </div>
      <div className="text-base font-semibold text-stone-800 mb-1">
        {title}
      </div>
      {message && (
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          {message}
        </p>
      )}
    </div>
  )
}