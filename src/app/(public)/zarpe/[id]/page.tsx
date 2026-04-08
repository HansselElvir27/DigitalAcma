import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
import { Ship } from "lucide-react";
import { notFound } from "next/navigation";
import { ZarpeDocument } from "@/components/ZarpeDocument";
import { CloseButton } from "@/components/CloseButton";

export const dynamic = 'force-dynamic';

export default async function ZarpeDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const zarpe = await prisma.zarpeRequest.findUnique({
        where: { id },
        include: { port: true, user: true }
    });

    if (!zarpe || zarpe.status !== 'APPROVED') {
        notFound();
    }

    // Official Verification URL - points to public verification page
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verificar/${id}`;

    // Official Zarpe Number format: YYYY-DGMM-ZARPNAC-PORT-ID
    const zarpeNumber = `${new Date(zarpe.createdAt).getFullYear()}-DGMM-ZARPNAC-${zarpe.port.name.substring(0, 3).toUpperCase()}-${zarpe.id.substring(0, 5).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-neutral-100 py-8 px-4 print:p-0 print:bg-white print:min-h-0 relative">
            <CloseButton />
            <div className="max-w-[850px] mx-auto print:w-full mt-10 print:mt-0">
                <ZarpeDocument zarpe={zarpe as any} />
            </div>
        </div>
    );
}

