import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { businessService } from "../../services/businessService";

const MOCK_MODE = import.meta.env.VITE_USE_MOCKS === "true";

export default function AddFiles() {
	const { id } = useParams();
	const [files, setFiles] = useState([{ file_name: "", description: "" }]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	function updateFile(index, field, value) {
		setFiles((previous) => previous.map((file, i) => (i === index ? { ...file, [field]: value } : file)));
	}

	function addRow() {
		setFiles((previous) => [...previous, { file_name: "", description: "" }]);
	}

	function removeRow(index) {
		setFiles((previous) => previous.filter((_, i) => i !== index));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setMessage("");

		const cleanedFiles = files.map((file) => ({
			file_name: file.file_name.trim(),
			description: file.description.trim(),
		}));

		if (cleanedFiles.some((file) => !file.file_name)) {
			setError("Every file must have a name.");
			return;
		}

		if (MOCK_MODE) {
			setMessage("Files validated. Mock mode: no records were saved.");
			return;
		}

		setLoading(true);

		try {
			await businessService.addFiles(id, cleanedFiles);
			setMessage("File records submitted successfully.");
		} catch (err) {
			setError(err.message || "Unable to add files.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6">
			<Link to={`/business/cartons/${encodeURIComponent(id)}`} className="text-sm font-medium text-emerald-700">
				← Back to Carton
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-slate-900">Index Files</h1>
				<p className="mt-1 text-sm text-slate-500">Add file index records for carton {id}.</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				{files.map((file, index) => (
					<div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-slate-800">File {index + 1}</h2>

							{files.length > 1 && (
								<button type="button" onClick={() => removeRow(index)} className="text-sm text-red-600 hover:underline">
									Remove
								</button>
							)}
						</div>

						<div>
							<label htmlFor={`file-name-${index}`} className="mb-2 block text-sm font-medium text-slate-700">
								File Name
							</label>
							<input
								id={`file-name-${index}`}
								required
								value={file.file_name}
								onChange={(event) => updateFile(index, "file_name", event.target.value)}
								className="w-full rounded-lg border border-slate-300 px-4 py-2"
							/>
						</div>

						<div>
							<label htmlFor={`file-description-${index}`} className="mb-2 block text-sm font-medium text-slate-700">
								Description
							</label>
							<textarea
								id={`file-description-${index}`}
								value={file.description}
								onChange={(event) => updateFile(index, "description", event.target.value)}
								rows={2}
								className="w-full rounded-lg border border-slate-300 px-4 py-2"
							/>
						</div>
					</div>
				))}

				<button type="button" onClick={addRow} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">
					+ Add Another File
				</button>

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

				<div>
					<button
						type="submit"
						disabled={loading}
						className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
					>
						{loading ? "Saving..." : "Save File Index"}
					</button>
				</div>
			</form>
		</div>
	);
}
