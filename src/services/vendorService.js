import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

async function readMock() {
	const module = await import("../api/mocks/vendor.json");
	return module.default;
}

export const vendorService = {
	async getDashboard(token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.dashboard;
		}
		return apiRequest(ENDPOINTS.vendor.dashboard, { token, signal });
	},

	async getRequests(token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.requests;
		}
		return apiRequest(ENDPOINTS.vendor.requests, { token, signal });
	},

	async getRequestDetails(id, token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.requests.find((r) => String(r.request_id) === String(id)) ?? null;
		}
		return apiRequest(ENDPOINTS.vendor.requestDetails(id), { token, signal });
	},

	async performAction(id, action, remarks, token) {
		if (USE_MOCKS) throw new Error("Mock mode: workflow actions are disabled.");
		return apiRequest(ENDPOINTS.vendor.requestActions(id), {
			method: "POST",
			body: { action, remarks },
			token,
		});
	},

	async confirmDestruction(id, data, token) {
		if (USE_MOCKS) throw new Error("Mock mode: destruction confirmation is disabled.");
		return apiRequest(ENDPOINTS.vendor.destruction(id), {
			method: "POST",
			body: data,
			token,
		});
	},
};
