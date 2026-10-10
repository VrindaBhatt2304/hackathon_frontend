import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { vendorService } from "../../services/vendorService";

const MOCK_MODE = import.meta.env.VITE_USE_MOCKS === "true";

export default function DestructionConfirmation() {
	const { id } = useParams();

	const [certificateReference, setCertificateReference] = useState("");
	const [destructionDate, setDestructionDate] = useState("");
	const [remarks, setRemarks] = useState("");
	const [confirmed, setConfirmed] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setMessage("");

		if (!certificateReference.trim() || !destructionDate || !confirmed) {
			setError("Complete all required fields and confirm destruction.");
			return;
		}

		const payload = {
			certificate_reference: certificateReference.trim(),
			destruction_date: destructionDate,
			remarks: remarks.trim(),
		};

		if (MOCK_MODE) {
			setMessage("Form validated. Mock mode: no destruction was confirmed.");
			return;
		}

		setLoading(true);

		try {
			await vendorService.confirmDestruction(id, payload);
			setMessage("Destruction confirmation submitted successfully.");
		} catch (err) {
			setError(err.message || "Unable to confirm destruction.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6">
			<Link to={`/vendor/requests/${encodeURIComponent(id)}`} className="text-sm font-medium text-emerald-700">
				← Back to Request
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-slate-900">Destruction Confirmation</h1>
				<p className="mt-1 text-sm text-slate-500">Record destruction evidence for request {id}.</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<div>
					<label htmlFor="certificate" className="mb-2 block text-sm font-medium text-slate-700">
						Certificate Reference
					</label>
					<input
						id="certificate"
						required
						value={certificateReference}
						onChange={(event) => setCertificateReference(event.target.value)}
						className="w-full rounded-lg border border-slate-300 px-4 py-2"
					/>
				</div>

				<div>
					<label htmlFor="destructionDate" className="mb-2 block text-sm font-medium text-slate-700">
						Destruction Date
					</label>
					<input
						id="destructionDate"
						type="date"
						required
						value={destructionDate}
						onChange={(event) => setDestructionDate(event.target.value)}
						className="w-full rounded-lg border border-slate-300 px-4 py-2"
					/>
				</div>

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

				<label className="flex items-start gap-3 text-sm text-slate-700">
					<input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />I confirm
					that the physical destruction has been completed and supporting evidence is available.
				</label>

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
					disabled={loading || !confirmed}
					className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? "Submitting..." : "Submit Confirmation"}
				</button>
			</form>
		</div>
	);
}
