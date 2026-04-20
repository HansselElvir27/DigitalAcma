import { getPrismaClient } from "@/lib/db";
import { RequestsTable } from "./requests-table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function fetchRequests() {
  const prisma = getPrismaClient();
  try {
    return await prisma.informationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
  } catch (error) {
    console.error('[INFO-PAGE] DB Error:', error);
    return [];
  }
}

export default async function InfoRequestsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  // Restriction: Only ADMIN and CIM can view info requests
  if (role === "CAPITAN") {
    redirect("/dashboard/capitan");
  }

  const requests = await fetchRequests();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase italic">Solicitudes de <span className="text-brand-secondary">Información</span></h1>
        <p className="opacity-50 text-sm font-medium tracking-wide">Gestión de consultas y peticiones del público</p>
        {requests.length === 0 && (
          <p className="text-yellow-400 text-sm mt-4 flex items-center gap-2">
            ⚠️ Sin datos disponibles (ver consola para errores DB)
          </p>
        )}
      </div>

      <RequestsTable requests={requests} />
    </div>
  );
}

