import { fmtDateTime } from '../lib/helpers'

export default function EventTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-stone-400 text-sm italic">No events recorded yet.</p>
  }

  return (
    <div className="relative pl-4 space-y-6">
      {events.map((ev, i) => (
        <div key={ev.event_id} className="relative flex items-start gap-4">
          {/* Vertical joining line */}
          {i < events.length - 1 && (
            <span className="absolute left-[7px] top-3.5 -bottom-6 w-0.5 bg-stone-200" />
          )}

          {/* Dot */}
          <div className="relative z-10 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm mt-1 shrink-0" />

          {/* Content */}
          <div className="flex-1 text-sm">
            <div className="font-semibold text-stone-900 tracking-tight">{ev.event_type}</div>
            <div className="text-xs text-stone-500 mt-0.5">
              {fmtDateTime(ev.event_timestamp)} · {ev.actor_type || 'SYSTEM'}
              {ev.actor_id && <span> · {ev.actor_id}</span>}
              {ev.request_id && <span> · Req: {ev.request_id}</span>}
            </div>
            {ev.remarks && (
              <div className="text-xs text-stone-600 mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                {ev.remarks}
              </div>
            )}
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-stone-100 text-stone-700 rounded-md border border-stone-200">
                {ev.resulting_status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}