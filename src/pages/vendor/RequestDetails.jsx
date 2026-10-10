import { Link, useParams } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { vendorService } from "../../services/vendorService";

export default function RequestDetails() {
	const { id } = useParams();

	const { data: request, loading, error } = useApiData((signal) => vendorService.getRequestDetails(id, undefined, signal), [id]);

	const allowedActions = Array.isArray(request?.allowed_actions) ? request.allowed_actions : [];

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<Link to="/vendor/requests" className="text-sm font-medium text-emerald-700 hover:underline">
				← Back to Requests
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-slate-900">Request Details</h1>

				<p className="mt-1 text-sm text-slate-500">Review request information and available actions.</p>
			</div>

			{loading && (
				<p role="status" className="text-sm text-slate-500">
					Loading request details...
				</p>
			)}

			{error && (
				<p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
					{error}
				</p>
			)}

			{!loading && !error && !request && (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Request not found or unavailable.</div>
			)}

			{!loading && !error && request && (
				<>
					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">Request Information</h2>

						<div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{[
								["Request ID", request.request_id],
								["Carton ID", request.carton_id],
								["Request Type", request.request_type],
								["Current Status", request.current_status],
								["Created At", request.created_at],
								["Updated At", request.updated_at],
							].map(([label, value]) => (
								<div key={label}>
									<p className="text-xs font-medium text-slate-500">{label}</p>

									<p className="mt-1 text-sm font-semibold text-slate-900">{value ?? "—"}</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">Available Actions</h2>

						{allowedActions.length === 0 ? (
							<p className="mt-3 text-sm text-slate-500">No actions are currently available for this request.</p>
						) : (
							<div className="mt-4 flex flex-wrap gap-3">
								{allowedActions.map((action) => (
									<Link
										key={action}
										to={`/vendor/requests/${encodeURIComponent(id)}/actions?action=${encodeURIComponent(action)}`}
										className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
									>
										{String(action).replaceAll("_", " ")}
									</Link>
								))}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
