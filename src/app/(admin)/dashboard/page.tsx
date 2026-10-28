import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardRootPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const role = (session.user as any)?.role;

    if (role === "CAPITAN") {
        redirect("/dashboard/capitan");
    }

    // Default for ADMIN and CIM
    redirect("/dashboard/cim");
}

