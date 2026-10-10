import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

export default function VendorLayout() {
	return (
		<div className="flex min-h-screen w-full bg-slate-50">
			<VendorSidebar />
			<main className="min-w-0 flex-1 overflow-x-hidden">
				<Outlet />
			</main>
		</div>
	);
}
