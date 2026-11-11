import { getPrismaClient, getDbPool } from "@/lib/db";
import { CheckCircle, XCircle, ShieldCheck, Award, Calendar, User, MapPin } from "lucide-react";
import { PatronLanchaCarnetDocument } from "@/components/PatronLanchaCarnetDocument";

const prisma = getPrismaClient();

export const dynamic = "force-dynamic";

export default async function VerificarPatronPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let carnet: any = null;
    try {
        const pClient = prisma as any;
        if (pClient.patronLanchaCarnet?.findFirst) {
            carnet = await pClient.patronLanchaCarnet.findFirst({
                where: {
                    OR: [
                        { id },
                        { carnetNumber: id },
                        { tituloNumero: id },
                    ]
                },
                include: {
                    port: true,
                    captain: true,
                    request: true,
                }
            });
        } else {
            const pool = getDbPool();
            const res = await pool.query(`
                SELECT c.*,
                       json_build_object('id', p.id, 'name', p.name) as port,
                       json_build_object('id', u.id, 'name', u.name) as captain
                FROM "PatronLanchaCarnet" c
                LEFT JOIN "Port" p ON p.id = c."portId"
                LEFT JOIN "User" u ON u.id = c."captainId"
                WHERE c.id = $1 OR c."carnetNumber" = $1 OR c."tituloNumero" = $1
                LIMIT 1
            `, [id]);
            carnet = res.rows[0];
        }
    } catch (e) {
        console.error("Error al buscar carnet de patrón para verificación:", e);
    }

    const isValid = !!carnet;

    return (
        <div className="min-h-screen py-10 px-4 flex flex-col items-center">
            {/* Cabecera de Verificación */}
            <div className="max-w-2xl w-full mb-8">
                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
                    isValid
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                    {isValid ? <CheckCircle size={38} className="shrink-0" /> : <XCircle size={38} className="shrink-0" />}
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wider">
                            {isValid ? "Documento Oficial Válido y Vigente" : "Documento No Encontrado o Inválido"}
                        </h1>
                        <p className="text-xs opacity-80 mt-1">
                            {isValid
                                ? "Este Patrón de Lancha Costeras está legalmente registrado en la Dirección General de la Marina Mercante."
                                : "No se encontró ningún carnet registrado con el código especificado."}
                        </p>
                    </div>
                </div>
            </div>

            {isValid && (
                <div className="w-full flex justify-center">
                    <PatronLanchaCarnetDocument carnet={carnet} showPrintButton={true} />
                </div>
            )}
        </div>
    );
}

