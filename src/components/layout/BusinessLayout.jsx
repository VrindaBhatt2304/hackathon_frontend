import { Outlet } from "react-router-dom";
import BusinessSidebar from "./BusinessSidebar";

export default function BusinessLayout() {
	return (
		<div className="flex min-h-screen w-full bg-slate-50">
			<BusinessSidebar />

			<main className="min-w-0 flex-1 overflow-x-hidden">
				<Outlet />
			</main>
		</div>
	);
}
