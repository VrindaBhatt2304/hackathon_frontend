import { Link, useParams } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { businessService } from "../../services/businessService";

export default function CartonDetails() {
	const { id } = useParams();

	const { data: carton, loading, error } = useApiData((signal) => businessService.getCartonDetails(id, undefined, signal), [id]);

	const files = Array.isArray(carton?.files) ? carton.files : [];
	const events = Array.isArray(carton?.events) ? carton.events : [];
	const actions = Array.isArray(carton?.allowed_actions) ? carton.allowed_actions : [];

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<Link to="/business/cartons" className="text-sm font-medium text-emerald-700 hover:underline">
				← Back to Cartons
			</Link>

			<h1 className="text-2xl font-bold text-slate-900">Carton Details</h1>

			{loading && (
				<p role="status" className="text-slate-500">
					Loading carton details...
				</p>
			)}

			{error && (
				<p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
					{error}
				</p>
			)}

			{!loading && !error && !carton && <div className="rounded-xl border bg-white p-6 text-slate-500">Carton not found or unavailable.</div>}

			{!loading && !error && carton && (
				<>
					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="mb-5 text-lg font-semibold text-slate-900">Carton Information</h2>

						<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{[
								["Carton ID", carton.carton_id],
								["Document Type", carton.document_type],
								["Entity", carton.entity_id],
								["Department", carton.department_id],
								["Location", carton.location_id],
								["Vendor", carton.vendor_id],
								["Status", carton.current_status],
								["Retention Expiry", carton.retention_expiry_date],
							].map(([label, value]) => (
								<div key={label}>
									<p className="text-xs font-medium text-slate-500">{label}</p>
									<p className="mt-1 text-sm font-semibold text-slate-900">{value ?? "—"}</p>
								</div>
							))}
						</div>

						<div className="mt-6 flex flex-wrap gap-3">
							{actions.includes("CREATE_REQUEST") && (
								<Link
									to={`/business/requests/new?carton_id=${encodeURIComponent(id)}`}
									className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
								>
									Create Request
								</Link>
							)}

							{actions.includes("ADD_FILES") && (
								<Link
									to={`/business/cartons/${encodeURIComponent(id)}/files/new`}
									className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
								>
									Add Files
								</Link>
							)}
						</div>
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">Indexed Files</h2>

						{files.length === 0 ? (
							<p className="mt-4 text-sm text-slate-500">No file records available.</p>
						) : (
							<div className="mt-4 space-y-3">
								{files.map((file, index) => (
									<div key={file.file_id ?? index} className="rounded-lg border border-slate-200 p-3">
										<p className="font-medium text-slate-800">{file.file_name ?? file.file_id ?? "File"}</p>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">Event History</h2>

						{events.length === 0 ? (
							<p className="mt-4 text-sm text-slate-500">No event history available.</p>
						) : (
							<div className="mt-4 space-y-3">
								{events.map((event, index) => (
									<div key={event.event_id ?? index} className="rounded-lg border border-slate-200 p-3">
										<p className="font-medium text-slate-800">{event.event_type ?? "Event"}</p>
										<p className="text-xs text-slate-500">{event.created_at ?? ""}</p>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
