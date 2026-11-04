import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardRootPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    console.log(`[DASHBOARD ROOT] User: ${session?.user?.email || "NONE"}, Role: ${userRole || "NONE"}`);

    if (!session?.user) {
        console.log("[DASHBOARD ROOT] No session found, redirecting to /auth/signin");
        redirect("/auth/signin");
    }

    if (userRole === "CAPITAN") {
        redirect("/dashboard/capitan");
    }

    // Default for ADMIN and CIM
    redirect("/dashboard/cim");
}
