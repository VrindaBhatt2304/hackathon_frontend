import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { businessService } from "../../services/businessService";

const MOCK_MODE = import.meta.env.VITE_USE_MOCKS === "true";

export default function CreateCarton() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		document_type: "",
		entity_id: "",
		department_id: "",
		description: "",
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

		if (!form.document_type.trim()) {
			setError("Document type is required.");
			return;
		}

		if (MOCK_MODE) {
			setMessage("Form validated. Mock mode: no carton was created.");
			return;
		}

		setLoading(true);

		try {
			await businessService.createCarton(form);
			navigate("/business/cartons");
		} catch (err) {
			setError(err.message || "Unable to create carton.");
		} finally {
			setLoading(false);
		}
	}

	const fields = [
		{ name: "document_type", label: "Document Type", required: true },
		{ name: "entity_id", label: "Entity ID" },
		{ name: "department_id", label: "Department ID" },
	];

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6">
			<Link to="/business/cartons" className="text-sm font-medium text-emerald-700">
				← Back to Cartons
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-slate-900">Create Carton</h1>
				<p className="mt-1 text-sm text-slate-500">Enter the carton details below.</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				{fields.map((field) => (
					<div key={field.name}>
						<label htmlFor={field.name} className="mb-2 block text-sm font-medium text-slate-700">
							{field.label}
						</label>
						<input
							id={field.name}
							value={form[field.name]}
							onChange={(event) => update(field.name, event.target.value)}
							required={field.required}
							className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-emerald-500"
						/>
					</div>
				))}

				<div>
					<label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
						Description
					</label>
					<textarea
						id="description"
						rows={4}
						value={form.description}
						onChange={(event) => update("description", event.target.value)}
						className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-emerald-500"
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
					{loading ? "Creating..." : "Create Carton"}
				</button>
			</form>
		</div>
	);
}
