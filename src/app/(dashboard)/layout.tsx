import { Toaster } from "react-hot-toast";
import Navigation from "@/components/pages/dashboard/Navigation/Navigation";
import PlaylistsProvider from "./dashboard/context/PlaylistContext";
import Header from "@/components/pages/dashboard/Header/Header";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<PlaylistsProvider>
			<Header />
			{children}
			<Navigation />
			<Toaster position="top-right" toastOptions={{ duration: 4000 }} />
		</PlaylistsProvider>
	);
}
