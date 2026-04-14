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
        const envBase = process.env.UPLOADS_BASE_PATH?.trim().replace(/[\\/]+$/, "");
        const cwdBase = process.cwd().trim().replace(/[\\/]+$/, "");
        
        const basePaths = [
            envBase,                        // 1. Custom ENV (e.g. D:\Digitalacma)
            cwdBase,                        // 2. Current Working Directory
            path.join(cwdBase, ".."),       // 3. Parent (useful if running from .next/server)
            "D:\\Digitalacma",               // 4. Hardcoded fallback for this specific server
            "C:\\Digitalacma",               // 5. Possible C: move
        ].filter(Boolean) as string[];

        let absolutePath = "";
        let found = false;

        for (const base of basePaths) {
            // Priority 1: public/uploads structure
            const candidate1 = path.join(base, "public", "uploads", relativePath);
            if (fs.existsSync(candidate1)) {
                absolutePath = candidate1;
                found = true;
                break;
            }
            // Priority 2: direct uploads structure (some production setups)
            const candidate2 = path.join(base, "uploads", relativePath);
            if (fs.existsSync(candidate2)) {
                absolutePath = candidate2;
                found = true;
                break;
            }
        }

        // --- DIAGNOSTIC LOGGING ---
        try {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] REQ: ${relativePath} | FOUND: ${found} | FINAL_PATH: ${absolutePath}\n`;
            
            // Try to write log to both ENV base and CWD to ensure visibility
            const logBases = [envBase, cwdBase].filter(Boolean) as string[];
            for (const logBase of logBases) {
                const debugLogPath = path.join(logBase, "public", "file_debug.txt");
                // Ensure public exists before writing log
                if (fs.existsSync(path.join(logBase, "public"))) {
                    fs.appendFileSync(debugLogPath, logEntry);
                }
            }
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
