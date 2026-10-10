export const ENDPOINTS = {
	business: {
		dashboard: "/api/business/dashboard",
		cartons: "/api/cartons",
		cartonDetails: (id) => `/api/cartons/${encodeURIComponent(id)}`,
		cartonFiles: (id) => `/api/cartons/${encodeURIComponent(id)}/files`,
		requests: "/api/requests",
		retention: "/api/business/retention-alerts",
	},

	vendor: {
		dashboard: "/api/vendor/dashboard",
		requests: "/api/vendor/requests",
		requestDetails: (id) => `/api/vendor/requests/${encodeURIComponent(id)}`,
		requestActions: (id) => `/api/vendor/requests/${encodeURIComponent(id)}/actions`,
		destruction: (id) => `/api/vendor/requests/${encodeURIComponent(id)}/destruction`,
	},
};
