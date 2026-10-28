import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALLOWED_MIME_TYPES: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Hardened API route to safely serve uploaded documents and images.
 * Protects against Directory Traversal (LFI), unauthorized file reading, and XSS.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: filePathArray } = await params;
        if (!filePathArray || filePathArray.length === 0) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Prevent path traversal: sanitize every path segment
        const safeSegmentPattern = /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/;
        for (const segment of filePathArray) {
            if (!safeSegmentPattern.test(segment) || segment === ".." || segment === ".") {
                return new NextResponse("Invalid file path request", { status: 400 });
            }
        }

        // Skip redundant 'uploads' segment if present
        const effectivePathArray = (filePathArray[0] === 'uploads') ? filePathArray.slice(1) : filePathArray;
        const relativePath = path.join(...effectivePathArray);

        // Verify file extension
        const extension = path.extname(relativePath).toLowerCase();
        if (!ALLOWED_MIME_TYPES[extension]) {
            return new NextResponse("Unsupported file type", { status: 400 });
        }

        // Define valid base directories
        const envBase = process.env.UPLOADS_BASE_PATH?.trim().replace(/[\\/]+$/, "");
        const cwdBase = process.cwd().trim().replace(/[\\/]+$/, "");

        const baseDirs: string[] = [
            envBase ? path.resolve(envBase, "public", "uploads") : null,
            envBase ? path.resolve(envBase, "uploads") : null,
            path.resolve(cwdBase, "public", "uploads"),
            path.resolve(cwdBase, "uploads"),
        ].filter(Boolean) as string[];

        let targetFile: string | null = null;

        for (const baseDir of baseDirs) {
            const candidate = path.resolve(baseDir, relativePath);

            // Strict boundary check: ensure resolved candidate is inside baseDir
            if (!candidate.startsWith(baseDir + path.sep)) {
                continue;
            }

            if (fs.existsSync(candidate)) {
                const stat = fs.statSync(candidate);
                if (stat.isFile()) {
                    targetFile = candidate;
                    break;
                }
            }
        }

        if (!targetFile) {
            return new NextResponse("File Not Found", { status: 404 });
        }

        const fileBuffer = fs.readFileSync(targetFile);
        const contentType = ALLOWED_MIME_TYPES[extension] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "X-Content-Type-Options": "nosniff",
                "Content-Security-Policy": "default-src 'none'",
                "Cache-Control": "private, max-age=86400",
            },
        });
    } catch (error: any) {
        console.error("Error serving uploaded file safely:", error.message);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
