import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import BusinessLayout from "./components/layout/BusinessLayout";
import VendorLayout from "./components/layout/VendorLayout";

import BusinessDashboard from "./pages/business/BusinessDashboard";
import CartonList from "./pages/business/CartonList";
import CreateCarton from "./pages/business/CreateCarton";
import CartonDetails from "./pages/business/CartonDetails";
import AddFiles from "./pages/business/AddFiles";
import CreateRequest from "./pages/business/CreateRequest";
import MyRequests from "./pages/business/MyRequests";
import RetentionAlerts from "./pages/business/RetentionAlerts";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorRequests from "./pages/vendor/VendorRequests";
import RequestDetails from "./pages/vendor/RequestDetails";
import VendorActions from "./pages/vendor/VendorActions";
import DestructionConfirmation from "./pages/vendor/DestructionConfirmation";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/business/dashboard" replace />} />

				<Route path="/business" element={<BusinessLayout />}>
					<Route path="dashboard" element={<BusinessDashboard />} />
					<Route path="cartons" element={<CartonList />} />
					<Route path="cartons/new" element={<CreateCarton />} />
					<Route path="cartons/:id" element={<CartonDetails />} />
					<Route path="cartons/:id/files/new" element={<AddFiles />} />
					<Route path="requests" element={<MyRequests />} />
					<Route path="requests/new" element={<CreateRequest />} />
					<Route path="retention" element={<RetentionAlerts />} />
				</Route>

				<Route path="/vendor" element={<VendorLayout />}>
					<Route path="dashboard" element={<VendorDashboard />} />
					<Route path="requests" element={<VendorRequests />} />
					<Route path="requests/:id" element={<RequestDetails />} />
					<Route path="requests/:id/actions" element={<VendorActions />} />
					<Route path="requests/:id/destruction" element={<DestructionConfirmation />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
