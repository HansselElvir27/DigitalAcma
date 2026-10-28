import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "pdf", "txt", "doc", "docx", "xls", "xlsx"
]);

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB limit per file

/**
 * Saves a base64 string as a file on the local filesystem safely.
 * Sanitizes directories, names, and extensions to prevent arbitrary file writes / path traversal.
 */
export async function saveBase64ToFile(
    base64: string | null | undefined,
    feature: string,
    recordId: string,
    preferredFilename?: string
): Promise<string | null> {
    if (!base64 || typeof base64 !== 'string') return null;

    // If it's already a URL/Path, return it as is (backward compatibility)
    if (base64.startsWith('/uploads/') || base64.startsWith('/api/uploads/')) {
        return base64;
    }

    try {
        // Sanitize feature and recordId to prevent directory traversal
        const safeFeature = feature.replace(/[^a-zA-Z0-9_-]/g, "") || "uploads";
        const safeRecordId = recordId.replace(/[^a-zA-Z0-9_-]/g, "") || uuidv4();

        // Extract base64 data and mime type
        const matches = base64.match(/^data:([A-Za-z0-9\-+\/.]+);base64,(.+)$/);
        let mimeType: string | null = null;
        let data: string = base64;

        if (matches && matches.length === 3) {
            mimeType = matches[1];
            data = matches[2];
        }

        // Determine extension
        let extension = "png"; // fallback
        if (mimeType) {
            const ext = mimeType.split('/')[1]?.toLowerCase();
            if (ext === 'jpeg') extension = 'jpg';
            else if (ext === 'vnd.openxmlformats-officedocument.wordprocessingml.document') extension = 'docx';
            else if (ext === 'msword') extension = 'doc';
            else if (ext === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') extension = 'xlsx';
            else if (ext === 'vnd.ms-excel') extension = 'xls';
            else if (ext && ALLOWED_EXTENSIONS.has(ext)) extension = ext;
        }

        let filename: string;
        if (preferredFilename) {
            const cleanBase = path.basename(preferredFilename).replace(/[^a-zA-Z0-9._-]/g, "");
            const parsedExt = path.extname(cleanBase).replace(".", "").toLowerCase();
            const safeExt = ALLOWED_EXTENSIONS.has(parsedExt) ? parsedExt : extension;
            const nameWithoutExt = cleanBase.replace(/\.[^/.]+$/, "");
            filename = `${nameWithoutExt || uuidv4()}.${safeExt}`;
        } else {
            filename = `${uuidv4()}.${ALLOWED_EXTENSIONS.has(extension) ? extension : 'png'}`;
        }

        // Verify buffer size
        const buffer = Buffer.from(data, 'base64');
        if (buffer.length > MAX_FILE_SIZE_BYTES) {
            console.error(`File size exceeds limit: ${buffer.length} bytes`);
            return null;
        }

        // Ensure directory structure
        const relativeDir = path.join("uploads", safeFeature, safeRecordId);
        let basePath = (process.env.UPLOADS_BASE_PATH || process.cwd()).trim().replace(/[\\/]+$/, "");
        const absoluteDir = path.resolve(basePath, "public", relativeDir);

        if (!fs.existsSync(absoluteDir)) {
            fs.mkdirSync(absoluteDir, { recursive: true });
        }

        const filePath = path.resolve(absoluteDir, filename);

        // Security check: ensure final filePath is inside absoluteDir
        if (!filePath.startsWith(absoluteDir + path.sep)) {
            console.error("Path traversal detected in file save attempt:", filePath);
            return null;
        }

        fs.writeFileSync(filePath, buffer);

        const webSubPath = path.join(safeFeature, safeRecordId, filename);
        return `/api/uploads/${webSubPath.replace(/\\/g, '/')}`;
    } catch (error: any) {
        console.error("Critical error saving base64 to file:", error.message);
        return null;
    }
}

/**
 * Handles saving an array or JSON of base64 files safely.
 */
export async function saveMultipleBase64(
    filesJson: string | any[] | null | undefined,
    feature: string,
    recordId: string
): Promise<string | null> {
    if (!filesJson) return null;

    let files: any[] = [];
    try {
        files = typeof filesJson === 'string' ? JSON.parse(filesJson) : filesJson;
    } catch {
        return typeof filesJson === 'string' ? filesJson : null;
    }

    if (!Array.isArray(files)) return JSON.stringify(filesJson);

    // Limit array to maximum 20 files to prevent resource exhaustion
    const safeFilesList = files.slice(0, 20);

    const savedPaths = await Promise.all(
        safeFilesList.map(async (file, index) => {
            if (typeof file === 'string') {
                return await saveBase64ToFile(file, feature, recordId, `file_${index}`);
            } else if (file && file.data) {
                return await saveBase64ToFile(file.data, feature, recordId, file.name || `file_${index}`);
            }
            return file;
        })
    );

    return JSON.stringify(savedPaths.filter(p => !!p));
}
