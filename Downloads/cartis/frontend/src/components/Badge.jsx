export default function Badge({ className = "bg-stone-100 text-stone-700 border-stone-200", children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  )
}