import { getPrismaClient } from "@/lib/db";
import { notFound } from "next/navigation";
import { ZarpeDocument } from "@/components/ZarpeDocument";
import { CloseButton } from "@/components/CloseButton";

const prisma = getPrismaClient();

export const dynamic = 'force-dynamic';

export default async function ZarpeDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const zarpe = await prisma.zarpeRequest.findUnique({
        where: { id },
        include: { 
            port: true, 
            user: { 
                select: { email: true } 
            } 
        }
    });

    if (!zarpe || zarpe.status !== 'APPROVED') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-8 px-4 print:p-0 print:bg-white print:min-h-0 relative">
            <CloseButton />
            <div className="max-w-[850px] mx-auto print:w-full mt-10 print:mt-0">
                <ZarpeDocument zarpe={zarpe as any} />
            </div>
        </div>
    );
}
