import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
import { LifeBuoy } from "lucide-react";
import { PaseSalidaTable } from "./requests-table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function PaseSalidaAdminPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "PUBLIC";
    const userPortId = (session?.user as any)?.portId;

    // Get all PaseSalida requests
    const requests = await prisma.paseSalida.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                        <LifeBuoy className="text-brand-secondary" size={32} />
                        Autorizaciones de <span className="text-brand-secondary">Pase de Salida</span>
                    </h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Gestión de permisos de salida (máx. 2 millas náuticas)</p>
                </div>
                <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div> {requests.filter((r: any) => r.status === 'PENDING').length} PENDIENTES
                </div>
            </div>

            <PaseSalidaTable requests={requests} userRole={userRole} />
        </div>
    );
}

