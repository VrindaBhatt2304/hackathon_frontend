const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiRequest(endpoint, { method = "GET", body, token, signal } = {}) {
	const headers = {
		Accept: "application/json",
	};

	if (body !== undefined) {
		headers["Content-Type"] = "application/json";
	}

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	let response;

	try {
		response = await fetch(`${BASE_URL}${endpoint}`, {
			method,
			headers,
			signal,
			credentials: "include",
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch (error) {
		if (error.name === "AbortError") throw error;

		throw new Error("Unable to connect to the backend.", {
			cause: error,
		});
	}

	if (!response.ok) {
		const error = new Error(`API request failed (${response.status})`);
		error.status = response.status;
		throw error;
	}

	if (response.status === 204) return null;

	return response.json();
}
