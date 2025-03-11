import Navigation from "@/components/dashboard/Navigation/Navigation";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div>
			{children}
			<Navigation />
		</div>
	);
}
