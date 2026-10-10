import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { businessService } from "../../services/businessService";

export default function MyRequests() {
	const [search, setSearch] = useState("");
	const [type, setType] = useState("");
	const [status, setStatus] = useState("");

	const { data, loading, error } = useApiData((signal) => businessService.getRequests(undefined, signal), []);

	const requests = useMemo(() => {
		if (Array.isArray(data)) return data;
		if (Array.isArray(data?.items)) return data.items;
		return [];
	}, [data]);

	const types = [...new Set(requests.map((r) => r.request_type).filter(Boolean))];

	const statuses = [...new Set(requests.map((r) => r.current_status).filter(Boolean))];

	const filteredRequests = useMemo(() => {
		return requests.filter((request) => {
			const matchesSearch = [request.request_id, request.carton_id].some((value) =>
				String(value ?? "")
					.toLowerCase()
					.includes(search.toLowerCase()),
			);

			return matchesSearch && (!type || request.request_type === type) && (!status || request.current_status === status);
		});
	}, [requests, search, type, status]);

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
					<p className="mt-1 text-sm text-slate-500">Track your carton service requests.</p>
				</div>

				<Link to="/business/requests/new" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
					New Request
				</Link>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<input
					type="search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search requests..."
					aria-label="Search requests"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2"
				/>

				<select
					value={type}
					onChange={(event) => setType(event.target.value)}
					aria-label="Filter by request type"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2"
				>
					<option value="">All Types</option>
					{types.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>

				<select
					value={status}
					onChange={(event) => setStatus(event.target.value)}
					aria-label="Filter by request status"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2"
				>
					<option value="">All Statuses</option>
					{statuses.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>

			{loading && (
				<p role="status" className="text-slate-500">
					Loading requests...
				</p>
			)}

			{error && (
				<p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
					{error}
				</p>
			)}

			{!loading && !error && (
				<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
					<table className="w-full min-w-[750px] text-left text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								{["Request ID", "Carton ID", "Type", "Status", "Created At"].map((heading) => (
									<th key={heading} className="px-4 py-3">
										{heading}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{filteredRequests.map((request) => (
								<tr key={request.request_id} className="border-t border-slate-100">
									<td className="px-4 py-3">{request.request_id ?? "—"}</td>
									<td className="px-4 py-3">{request.carton_id ?? "—"}</td>
									<td className="px-4 py-3">{request.request_type ?? "—"}</td>
									<td className="px-4 py-3">{request.current_status ?? "—"}</td>
									<td className="px-4 py-3">{request.created_at ?? "—"}</td>
								</tr>
							))}
						</tbody>
					</table>

					{filteredRequests.length === 0 && (
						<p className="p-8 text-center text-sm text-slate-500">
							{requests.length === 0 ? "No requests available yet." : "No requests match your filters."}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
