import { Link } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { vendorService } from "../../services/vendorService";

const summaryCards = [
	{ label: "Total Requests", key: "total_requests" },
	{ label: "Pending Requests", key: "pending_requests" },
	{ label: "In Progress", key: "in_progress" },
	{ label: "Completed", key: "completed" },
];

export default function VendorDashboard() {
	const { data: summary, loading, error } = useApiData((signal) => vendorService.getDashboard(undefined, signal), []);

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
				<p className="mt-1 text-sm text-slate-500">Overview of assigned service requests.</p>
			</div>

			{loading && (
				<p role="status" className="text-sm text-slate-500">
					Loading vendor dashboard...
				</p>
			)}

			{error && (
				<div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<div key={card.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-sm font-medium text-slate-500">{card.label}</p>

						<p className="mt-3 text-3xl font-bold text-slate-900">{loading || error ? "—" : (summary?.[card.key] ?? "—")}</p>
					</div>
				))}
			</div>

			{!loading && !error && !summary && (
				<div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Vendor summary is not available yet.</div>
			)}

			<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

				<p className="mt-2 text-sm text-slate-500">Review requests assigned to your vendor account.</p>

				<div className="mt-4">
					<Link
						to="/vendor/requests"
						className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
					>
						View Assigned Requests
					</Link>
				</div>
			</div>
		</div>
	);
}
