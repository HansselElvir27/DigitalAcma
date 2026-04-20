import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
import { Ship } from "lucide-react";
import { ZarpesTable } from "./requests-table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ZarpesPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "PUBLIC";
    const userPortId = (session?.user as any)?.portId;

    // Filter by port if the user is a CAPITAN
    const where: any = {};
    if (userRole === "CAPITAN") {
        if (!userPortId) {
            // If captain has no port assigned, they see nothing
            return (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Ship size={48} className="mx-auto mb-4 opacity-30 text-red-500" />
                    <p className="text-lg font-bold">Error de Configuración</p>
                    <p className="opacity-60 text-sm">Su usuario no tiene un puerto asignado. Contacte al administrador.</p>
                </div>
            );
        }
        where.portId = userPortId;
    }

    const requests = await prisma.zarpeRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { user: true, port: true }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                        <Ship className="text-brand-secondary" size={32} />
                        Autorizaciones de <span className="text-brand-secondary">Zarpe</span>
                    </h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Gestión de tráfico marítimo y salidas de puerto</p>
                </div>
                <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div> {requests.filter((r: any) => r.status === 'PENDING').length} PENDIENTES
                </div>
            </div>

            <ZarpesTable requests={requests} userRole={userRole} />
        </div>
    );
}
