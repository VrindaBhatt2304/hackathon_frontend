import { useEffect, useState } from "react";

export default function useApiData(fetcher, dependencies = []) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const controller = new AbortController();

		async function load() {
			setLoading(true);
			setError("");

			try {
				const result = await fetcher(controller.signal);

				if (!controller.signal.aborted) {
					setData(result);
				}
			} catch (err) {
				if (!controller.signal.aborted) {
					setError(err.message || "Failed to load data.");
				}
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		}

		load();

		return () => controller.abort();
		// Pass stable dependencies for values used by fetcher.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return { data, loading, error };
}
