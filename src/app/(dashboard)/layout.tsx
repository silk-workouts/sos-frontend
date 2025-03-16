import Navigation from "@/components/pages/dashboard/Navigation/Navigation";
import PlaylistsProvider from "./dashboard/context/PlaylistContext";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<PlaylistsProvider>
			{children}
			<Navigation />
		</PlaylistsProvider>
	);
}
