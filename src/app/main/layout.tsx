import { AuthProvider } from "@/Components/AuthProvider";
import { Navbar } from "@/Components/Navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Navbar />
            {children}
        </AuthProvider>
    );
}