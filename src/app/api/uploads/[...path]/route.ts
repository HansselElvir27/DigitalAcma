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

        // Skip redundant 'uploads' segment if present
        const effectivePathArray = (filePathArray[0] === 'uploads') ? filePathArray.slice(1) : filePathArray;
        const relativePath = path.join(...effectivePathArray);
        
        // --- ROBUST PATH RESOLUTION ---
        const basePaths = [
            process.env.UPLOADS_BASE_PATH, // 1. Custom ENV (e.g. D:\Digitalacma)
            process.cwd(),                 // 2. Current Working Directory
            path.join(process.cwd(), ".."), // 3. Parent (if running from /src or /.next)
            "D:\\Digitalacma",              // 4. Explicit Fallback for this specific server
            "C:\\Digitalacma",              // 5. Possible C: move
        ].filter(Boolean) as string[];

        let absolutePath = "";
        let found = false;

        for (const base of basePaths) {
            const candidate = path.join(base, "public", "uploads", relativePath);
            if (fs.existsSync(candidate)) {
                absolutePath = candidate;
                found = true;
                break;
            }
            // Fallback for missing 'public' segment in some production setups
            const candidateNoPublic = path.join(base, "uploads", relativePath);
            if (fs.existsSync(candidateNoPublic)) {
                absolutePath = candidateNoPublic;
                found = true;
                break;
            }
        }

        // Default if not found (for the error check later)
        if (!found) {
            absolutePath = path.join(process.env.UPLOADS_BASE_PATH || process.cwd(), "public", "uploads", relativePath);
        }

        // --- DIAGNOSTIC LOGGING (VISIBLE TO USER) ---
        try {
            const logEntry = `[${new Date().toISOString()}] REQ: ${relativePath} | FIND: ${found} | PATH: ${absolutePath}\n`;
            // Write to public so user can check it via browser at /file_debug.txt
            const debugLogPath = path.join(process.env.UPLOADS_BASE_PATH || process.cwd(), "public", "file_debug.txt");
            fs.appendFileSync(debugLogPath, logEntry);
        } catch (e) {}

        if (!found || !fs.existsSync(absolutePath)) {
            console.error(`File not found across all base paths: ${absolutePath}`);
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
