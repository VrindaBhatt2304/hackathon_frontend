import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

async function readMock() {
	const module = await import("../api/mocks/business.json");
	return module.default;
}

export const businessService = {
	async getDashboard(token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.dashboard;
		}
		return apiRequest(ENDPOINTS.business.dashboard, { token, signal });
	},

	async getCartons(token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.cartons;
		}
		return apiRequest(ENDPOINTS.business.cartons, { token, signal });
	},

	async getCartonDetails(id, token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.cartons.find((c) => String(c.carton_id) === String(id)) ?? null;
		}
		return apiRequest(ENDPOINTS.business.cartonDetails(id), { token, signal });
	},

	async getRequests(token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.requests;
		}
		return apiRequest(ENDPOINTS.business.requests, { token, signal });
	},

	async getRetentionAlerts(token, signal) {
		if (USE_MOCKS) {
			const mock = await readMock();
			return mock.retentionAlerts;
		}
		return apiRequest(ENDPOINTS.business.retention, { token, signal });
	},

	async createCarton(data, token) {
		if (USE_MOCKS) throw new Error("Mock mode: carton creation is disabled.");
		return apiRequest(ENDPOINTS.business.cartons, {
			method: "POST",
			body: data,
			token,
		});
	},

	async addFiles(id, files, token) {
		if (USE_MOCKS) throw new Error("Mock mode: file creation is disabled.");
		return apiRequest(ENDPOINTS.business.cartonFiles(id), {
			method: "POST",
			body: { files },
			token,
		});
	},

	async createRequest(data, token) {
		if (USE_MOCKS) throw new Error("Mock mode: request creation is disabled.");
		return apiRequest(ENDPOINTS.business.requests, {
			method: "POST",
			body: data,
			token,
		});
	},
};
