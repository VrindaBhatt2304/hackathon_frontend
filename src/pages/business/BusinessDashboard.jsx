import { Link } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { businessService } from "../../services/businessService";

const summaryCards = [
	{ label: "Total Cartons", key: "total_cartons" },
	{ label: "In Storage", key: "in_storage" },
	{ label: "Open Requests", key: "open_requests" },
	{ label: "Retention Alerts", key: "retention_alerts" },
];

export default function BusinessDashboard() {
	const { data: summary, loading, error } = useApiData((signal) => businessService.getDashboard(undefined, signal), []);

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">Business Dashboard</h1>
				<p className="mt-1 text-sm text-slate-500">Overview of your department's records and requests.</p>
			</div>

			{loading && (
				<p role="status" className="text-sm text-slate-500">
					Loading dashboard...
				</p>
			)}

			{error && (
				<div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
					{error}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<div key={card.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-sm font-medium text-slate-500">{card.label}</p>
						<p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "..." : (summary?.[card.key] ?? "—")}</p>
					</div>
				))}
			</div>

			{!loading && !error && !summary && (
				<div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Dashboard summary is not available yet.</div>
			)}

			<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

				<div className="mt-4 flex flex-wrap gap-3">
					<Link to="/business/cartons" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
						View Cartons
					</Link>

					<Link
						to="/business/cartons/new"
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
					>
						Create Carton
					</Link>

					<Link
						to="/business/requests"
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
					>
						My Requests
					</Link>

					<Link
						to="/business/retention"
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
					>
						Retention Alerts
					</Link>
				</div>
			</div>
		</div>
	);
}
