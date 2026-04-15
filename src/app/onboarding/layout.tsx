"use client";

import { AuthProvider, useAuth } from "@/Components/AuthProvider";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function OnboardingGate({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, loading } = useAuth();

	useEffect(() => {
		if (!loading && !user) {
			const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
			router.replace(`/login${redirect}`);
		}
	}, [loading, pathname, router, user]);

	return children;
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<OnboardingGate>{children}</OnboardingGate>
		</AuthProvider>
	);
}
