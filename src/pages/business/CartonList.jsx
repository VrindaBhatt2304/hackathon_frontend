import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useApiData from "../../hooks/useApiData";
import { businessService } from "../../services/businessService";

export default function CartonList() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");

	const { data, loading, error } = useApiData((signal) => businessService.getCartons(undefined, signal), []);

	// Temporary adapter; final response format awaits API contract.
	const cartons = useMemo(() => {
		if (Array.isArray(data)) return data;
		if (Array.isArray(data?.items)) return data.items;
		return [];
	}, [data]);

	const filteredCartons = useMemo(() => {
		return cartons.filter((carton) => {
			const query = search.toLowerCase();

			const matchesSearch = [carton.carton_id, carton.document_type, carton.entity_id, carton.department_id].some((value) =>
				String(value ?? "")
					.toLowerCase()
					.includes(query),
			);

			const matchesStatus = !status || String(carton.current_status ?? "") === status;

			return matchesSearch && matchesStatus;
		});
	}, [cartons, search, status]);

	const statuses = [...new Set(cartons.map((carton) => carton.current_status).filter(Boolean))];

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Carton Inventory</h1>
					<p className="mt-1 text-sm text-slate-500">Browse and manage your department's cartons.</p>
				</div>

				<Link to="/business/cartons/new" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
					Create Carton
				</Link>
			</div>

			<div className="flex flex-wrap gap-3">
				<input
					type="search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search cartons..."
					aria-label="Search cartons"
					className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-emerald-500"
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
			</div>

			{loading && (
				<p role="status" className="text-sm text-slate-500">
					Loading cartons...
				</p>
			)}

			{error && (
				<p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
					{error}
				</p>
			)}

			{!loading && !error && (
				<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
					<table className="w-full min-w-[850px] text-left text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								{["Carton ID", "Document Type", "Entity", "Department", "Location", "Status", "Action"].map((heading) => (
									<th key={heading} className="px-4 py-3 font-semibold">
										{heading}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{filteredCartons.map((carton) => (
								<tr key={carton.carton_id} className="border-t border-slate-100">
									<td className="px-4 py-3">{carton.carton_id ?? "—"}</td>
									<td className="px-4 py-3">{carton.document_type ?? "—"}</td>
									<td className="px-4 py-3">{carton.entity_id ?? "—"}</td>
									<td className="px-4 py-3">{carton.department_id ?? "—"}</td>
									<td className="px-4 py-3">{carton.location_id ?? "—"}</td>
									<td className="px-4 py-3">{carton.current_status ?? "—"}</td>
									<td className="px-4 py-3">
										{carton.carton_id != null ? (
											<Link
												to={`/business/cartons/${encodeURIComponent(carton.carton_id)}`}
												className="font-medium text-emerald-700 hover:underline"
											>
												View
											</Link>
										) : (
											"—"
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filteredCartons.length === 0 && (
						<p className="p-8 text-center text-sm text-slate-500">
							{cartons.length === 0 ? "No cartons available yet." : "No cartons match your filters."}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
