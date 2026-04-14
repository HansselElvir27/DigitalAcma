import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Custom API route to serve uploaded files from the filesystem.
 * This bypasses Next.js static serving issues on Windows Server.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePathArray = await params.path;
        if (!filePathArray || filePathArray.length === 0) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Skip redundant 'uploads' segment if present to avoid duplicating it in the physical path
        const effectivePathArray = (filePathArray[0] === 'uploads') ? filePathArray.slice(1) : filePathArray;
        const relativePath = path.join(...effectivePathArray);
        
        // Construct absolute path. We assume the 'uploads' folder is inside 'public'
        // which is in the project root (process.cwd()).
        const absolutePath = path.join(process.cwd(), "public", "uploads", relativePath);

        // Security check: Ensure we are still inside the uploads directory
        const uploadsRoot = path.join(process.cwd(), "public", "uploads");
        if (!absolutePath.startsWith(uploadsRoot)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!fs.existsSync(absolutePath)) {
            console.error(`File not found: ${absolutePath}`);
            return new NextResponse("File Not Found", { status: 404 });
        }

        const fileBuffer = fs.readFileSync(absolutePath);
        const extension = path.extname(absolutePath).toLowerCase();

        // Determine MIME type
        let contentType = "application/octet-stream";
        const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".pdf": "application/pdf",
            ".svg": "image/svg+xml",
            ".txt": "text/plain",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls": "application/vnd.ms-excel",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };

        if (mimeTypes[extension]) {
            contentType = mimeTypes[extension];
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: any) {
        console.error("Error serving file:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
