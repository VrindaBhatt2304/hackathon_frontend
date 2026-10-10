import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { vendorService } from "../../services/vendorService";

export default function VendorRequests() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [type, setType] = useState("");

	const { data, loading, error } = useApiData((signal) => vendorService.getRequests(undefined, signal), []);

	// Temporary response adapter until API contract is finalized.
	const requests = useMemo(() => {
		if (Array.isArray(data)) return data;
		if (Array.isArray(data?.items)) return data.items;
		return [];
	}, [data]);

	const statuses = [...new Set(requests.map((request) => request.current_status).filter(Boolean))];

	const types = [...new Set(requests.map((request) => request.request_type).filter(Boolean))];

	const filteredRequests = useMemo(() => {
		return requests.filter((request) => {
			const query = search.toLowerCase();

			const matchesSearch = [request.request_id, request.carton_id, request.request_type].some((value) =>
				String(value ?? "")
					.toLowerCase()
					.includes(query),
			);

			const matchesStatus = !status || request.current_status === status;

			const matchesType = !type || request.request_type === type;

			return matchesSearch && matchesStatus && matchesType;
		});
	}, [requests, search, status, type]);

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">Assigned Requests</h1>
				<p className="mt-1 text-sm text-slate-500">View and track requests assigned to your vendor account.</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<input
					type="search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search requests..."
					aria-label="Search vendor requests"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-emerald-500"
				/>

				<select
					value={status}
					onChange={(event) => setStatus(event.target.value)}
					aria-label="Filter by status"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2"
				>
					<option value="">All Statuses</option>
					{statuses.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>

				<select
					value={type}
					onChange={(event) => setType(event.target.value)}
					aria-label="Filter by request type"
					className="rounded-lg border border-slate-300 bg-white px-4 py-2"
				>
					<option value="">All Request Types</option>
					{types.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>

			{loading && (
				<p role="status" className="text-sm text-slate-500">
					Loading assigned requests...
				</p>
			)}

			{error && (
				<p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
					{error}
				</p>
			)}

			{!loading && !error && (
				<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
					<table className="w-full min-w-[800px] text-left text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								{["Request ID", "Carton ID", "Request Type", "Status", "Created At", "Action"].map((heading) => (
									<th key={heading} className="px-4 py-3 font-semibold">
										{heading}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{filteredRequests.map((request) => (
								<tr key={request.request_id} className="border-t border-slate-100 hover:bg-slate-50">
									<td className="px-4 py-3">{request.request_id ?? "—"}</td>

									<td className="px-4 py-3">{request.carton_id ?? "—"}</td>

									<td className="px-4 py-3">{request.request_type ?? "—"}</td>

									<td className="px-4 py-3">{request.current_status ?? "—"}</td>

									<td className="px-4 py-3">{request.created_at ?? "—"}</td>

									<td className="px-4 py-3">
										{request.request_id != null ? (
											<Link
												to={`/vendor/requests/${encodeURIComponent(request.request_id)}`}
												className="font-medium text-emerald-700 hover:underline"
											>
												View Details
											</Link>
										) : (
											"—"
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filteredRequests.length === 0 && (
						<p className="p-8 text-center text-sm text-slate-500">
							{requests.length === 0 ? "No assigned requests available yet." : "No requests match your filters."}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
