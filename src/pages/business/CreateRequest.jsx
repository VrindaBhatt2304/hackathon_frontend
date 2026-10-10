import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { businessService } from "../../services/businessService";

const MOCK_MODE = import.meta.env.VITE_USE_MOCKS === "true";

export default function CreateRequest() {
	const navigate = useNavigate();
	const [params] = useSearchParams();

	const [form, setForm] = useState({
		carton_id: params.get("carton_id") || "",
		request_type: "",
		remarks: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	function update(field, value) {
		setForm((previous) => ({ ...previous, [field]: value }));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setMessage("");

		if (!form.carton_id.trim() || !form.request_type.trim()) {
			setError("Carton ID and request type are required.");
			return;
		}

		if (MOCK_MODE) {
			setMessage("Request validated. Mock mode: no request was created.");
			return;
		}

		setLoading(true);

		try {
			await businessService.createRequest(form);
			navigate("/business/requests");
		} catch (err) {
			setError(err.message || "Unable to create request.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6">
			<Link to="/business/requests" className="text-sm font-medium text-emerald-700">
				← Back to Requests
			</Link>

			<h1 className="text-2xl font-bold text-slate-900">Create Service Request</h1>

			<form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<div>
					<label htmlFor="carton_id" className="mb-2 block text-sm font-medium text-slate-700">
						Carton ID
					</label>
					<input
						id="carton_id"
						required
						value={form.carton_id}
						onChange={(event) => update("carton_id", event.target.value)}
						className="w-full rounded-lg border border-slate-300 px-4 py-2"
					/>
				</div>

				<div>
					<label htmlFor="request_type" className="mb-2 block text-sm font-medium text-slate-700">
						Request Type
					</label>
					<input
						id="request_type"
						required
						placeholder="Enter request type"
						value={form.request_type}
						onChange={(event) => update("request_type", event.target.value)}
						className="w-full rounded-lg border border-slate-300 px-4 py-2"
					/>
					<p className="mt-1 text-xs text-slate-500">Final request types will come from the agreed API contract.</p>
				</div>

				<div>
					<label htmlFor="remarks" className="mb-2 block text-sm font-medium text-slate-700">
						Remarks
					</label>
					<textarea
						id="remarks"
						rows={4}
						value={form.remarks}
						onChange={(event) => update("remarks", event.target.value)}
						className="w-full rounded-lg border border-slate-300 px-4 py-2"
					/>
				</div>

				{error && (
					<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
						{error}
					</p>
				)}

				{message && (
					<p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
						{message}
					</p>
				)}

				<button
					type="submit"
					disabled={loading}
					className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
				>
					{loading ? "Submitting..." : "Create Request"}
				</button>
			</form>
		</div>
	);
}
