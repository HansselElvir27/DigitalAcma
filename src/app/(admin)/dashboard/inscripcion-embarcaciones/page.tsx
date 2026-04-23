import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InscripcionEmbarcacionesAdminPage from "./client-page";

export const dynamic = 'force-dynamic';

export default async function InscripcionEmbarcacionesPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role || "PUBLIC";

    // Solo CAPITAN y ADMIN pueden acceder
    if (role !== "CAPITAN" && role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <InscripcionEmbarcacionesAdminPage />;
}
