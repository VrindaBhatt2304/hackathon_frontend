export default function Alert({ type = "info", children }) {
  const styles = {
    info: "bg-emerald-50 text-emerald-900 border-emerald-200",
    success: "bg-green-50 text-green-900 border-green-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    danger: "bg-rose-50 text-rose-900 border-rose-200",
  }[type] || "bg-emerald-50 text-emerald-900 border-emerald-200"

  return (
    <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${styles}`}>
      <span>{children}</span>
    </div>
  )
}
