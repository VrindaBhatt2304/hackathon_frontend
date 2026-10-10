import { NavLink } from "react-router-dom";

const menuItems = [
	{ label: "Dashboard", path: "/vendor/dashboard", icon: "▦" },
	{ label: "Assigned Requests", path: "/vendor/requests", icon: "☷" },
];

export default function VendorSidebar() {
	return (
		<aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#102D28] px-4 py-6 text-white">
			<div className="mb-10 flex items-center gap-3 px-2">
				<img src="/images/logo.png" alt="PRMS Logo" className="h-11 w-11 rounded-lg bg-white object-contain p-1" />
				<div>
					<h2 className="text-xl font-bold">PRMS</h2>
					<p className="text-xs text-emerald-200">Records Management</p>
				</div>
			</div>

			<p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">Vendor Workspace</p>

			<nav className="space-y-2">
				{menuItems.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						end
						className={({ isActive }) =>
							`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
								isActive ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-900"
							}`
						}
					>
						<span className="w-5 text-center text-lg">{item.icon}</span>
						{item.label}
					</NavLink>
				))}
			</nav>
		</aside>
	);
}
