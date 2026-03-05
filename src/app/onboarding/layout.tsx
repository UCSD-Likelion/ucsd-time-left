import { AuthProvider } from "@/Components/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>{children}</AuthProvider>
	);
}
