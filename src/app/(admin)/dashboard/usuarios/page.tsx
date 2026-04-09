import { getPrismaClient } from "@/lib/db";
const prisma = getPrismaClient();
import { Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserManagement } from "@/components/UserManagement";

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
    const session = await getServerSession(authOptions);
    const currentUserRole = (session?.user as any)?.role || "PUBLIC";

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { port: true }
    });

    const ports = await prisma.port.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                    <Users className="text-brand-secondary" size={32} />
                    Gestión de <span className="text-brand-secondary">Usuarios</span>
                </h1>
                <p className="opacity-50 text-sm font-medium tracking-wide">Administración de accesos, roles y puertos registrados</p>
            </div>

            <UserManagement 
                initialUsers={JSON.parse(JSON.stringify(users))} 
                ports={JSON.parse(JSON.stringify(ports))} 
                currentUserRole={currentUserRole} 
            />
        </div>
    );
}
