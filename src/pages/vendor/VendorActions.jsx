import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { vendorService } from "../../services/vendorService";
import useApiData from "../../hooks/useApiData";

const MOCK_MODE = import.meta.env.VITE_USE_MOCKS === "true";

export default function VendorActions() {
	const { id } = useParams();
	const [params] = useSearchParams();
	const selectedAction = params.get("action") || "";

	const {
		data: request,
		loading: requestLoading,
		error: requestError,
	} = useApiData((signal) => vendorService.getRequestDetails(id, undefined, signal), [id]);

	const [remarks, setRemarks] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const allowedActions = Array.isArray(request?.allowed_actions) ? request.allowed_actions : [];

	const actionAllowed = selectedAction && allowedActions.includes(selectedAction);

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setMessage("");

		if (!actionAllowed) {
			setError("This action is not available for this request.");
			return;
		}

		if (MOCK_MODE) {
			setMessage("Action validated. Mock mode: no workflow change was made.");
			return;
		}

		setSubmitting(true);

		try {
			await vendorService.performAction(id, selectedAction, remarks);
			setMessage("Action submitted successfully.");
		} catch (err) {
			setError(err.message || "Unable to perform action.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6">
			<Link to={`/vendor/requests/${encodeURIComponent(id)}`} className="text-sm font-medium text-emerald-700">
				← Back to Request
			</Link>

			<h1 className="text-2xl font-bold text-slate-900">Vendor Action</h1>

			{requestLoading && (
				<p role="status" className="text-sm text-slate-500">
					Checking available actions...
				</p>
			)}

			{requestError && (
				<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
					{requestError}
				</p>
			)}

			{!requestLoading && !requestError && (
				<form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div>
						<p className="text-sm text-slate-500">Selected Action</p>
						<p className="mt-1 font-semibold text-slate-900">{selectedAction || "No action selected"}</p>
					</div>

					{!actionAllowed && (
						<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">This action is not listed as available for the request.</p>
					)}

					<div>
						<label htmlFor="remarks" className="mb-2 block text-sm font-medium text-slate-700">
							Remarks
						</label>
						<textarea
							id="remarks"
							rows={4}
							value={remarks}
							onChange={(event) => setRemarks(event.target.value)}
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
						disabled={!actionAllowed || submitting}
						className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						{submitting ? "Submitting..." : "Confirm Action"}
					</button>
				</form>
			)}
		</div>
	);
}
