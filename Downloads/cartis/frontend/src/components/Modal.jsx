export default function Modal({ title, children, onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full p-6 relative overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <h2 className="text-lg font-bold text-stone-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-700 text-lg leading-none p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}