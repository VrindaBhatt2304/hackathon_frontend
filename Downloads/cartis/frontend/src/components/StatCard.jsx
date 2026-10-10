export default function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      {icon && <div className="text-emerald-700 mb-3">{icon}</div>}
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
        {label}
      </div>
      <div 
        className="text-3xl font-bold tracking-tight text-stone-900" 
        style={color ? { color } : {}}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs text-stone-400 mt-2 font-medium">
          {sub}
        </div>
      )}
    </div>
  )
}