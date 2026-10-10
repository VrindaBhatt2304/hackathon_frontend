import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { businessService } from "../../services/businessService";

export default function RetentionAlerts() {
	const [search, setSearch] = useState("");
	const [alertType, setAlertType] = useState("");

	const { data, loading, error } = useApiData((signal) => businessService.getRetentionAlerts(undefined, signal), []);

	const alerts = useMemo(() => {
		if (Array.isArray(data)) return data;
		if (Array.isArray(data?.items)) return data.items;
		return [];
	}, [data]);

	const alertTypes = [...new Set(alerts.map((alert) => alert.alert_type).filter(Boolean))];

	const filteredAlerts = useMemo(() => {
		return alerts.filter((alert) => {
			const matchesSearch = [alert.carton_id, alert.document_type].some((value) =>
				String(value ?? "")
					.toLowerCase()
					.includes(search.toLowerCase()),
			);

			return matchesSearch && (!alertType || alert.alert_type === alertType);
		});
	}, [alerts, search, alertType]);

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">Retention Alerts</h1>
				<p className="mt-1 text-sm text-slate-500">Review retention-related notifications for your cartons.</p>
			</div>

			<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<p className="text-sm text-slate-500">Total Available Alerts</p>
				<p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : error ? "—" : alerts.length}</p>
			</div>

			<div className="flex flex-wrap gap-3">
				<input
					type="search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search cartons..."
					aria-label="Search retention alerts"
					className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2"
				/>

				<select
					value={alertType}
					onChange={(event) => setAlertType(event.target.value)}
					aria-label="Filter by alert type"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2"
				>
					<option value="">All Alert Types</option>
					{alertTypes.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>

			{loading && (
				<p role="status" className="text-slate-500">
					Loading retention alerts...
				</p>
			)}

			{error && (
				<p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
					{error}
				</p>
			)}

			{!loading && !error && (
				<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
					<table className="w-full min-w-[800px] text-left text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								{["Carton ID", "Document Type", "Retention Expiry", "Alert Type", "Legal Hold", "Action"].map((heading) => (
									<th key={heading} className="px-4 py-3">
										{heading}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{filteredAlerts.map((alert, index) => (
								<tr key={alert.alert_id ?? `${alert.carton_id}-${index}`} className="border-t border-slate-100">
									<td className="px-4 py-3">{alert.carton_id ?? "—"}</td>
									<td className="px-4 py-3">{alert.document_type ?? "—"}</td>
									<td className="px-4 py-3">{alert.retention_expiry_date ?? "—"}</td>
									<td className="px-4 py-3">{alert.alert_type ?? "—"}</td>
									<td className="px-4 py-3">{alert.legal_hold_status ?? "—"}</td>
									<td className="px-4 py-3">
										{alert.carton_id != null ? (
											<Link
												to={`/business/cartons/${encodeURIComponent(alert.carton_id)}`}
												className="font-medium text-emerald-700 hover:underline"
											>
												View Carton
											</Link>
										) : (
											"—"
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filteredAlerts.length === 0 && (
						<p className="p-8 text-center text-sm text-slate-500">
							{alerts.length === 0 ? "No retention alerts available." : "No alerts match your filters."}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
