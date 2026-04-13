import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Saves a base64 string as a file on the local filesystem.
 * 
 * @param base64 String containing the base64 data (with or without data prefix)
 * @param feature Folder category (e.g., 'zarpes', 'vessels')
 * @param recordId ID of the record to create a subfolder
 * @param preferredFilename Optional filename (e.g., 'signature.png')
 * @returns The public URL path (e.g., '/uploads/zarpes/id/signature.png')
 */
export async function saveBase64ToFile(
    base64: string | null | undefined,
    feature: string,
    recordId: string,
    preferredFilename?: string
): Promise<string | null> {
    if (!base64 || typeof base64 !== 'string') return null;

    // If it's already a URL/Path, return it as is (backward compatibility)
    if (base64.startsWith('/uploads/')) return base64;

    try {
        // Extract base64 data and mime type
        const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        let mimeType: string | null = null;
        let data: string = base64;

        if (matches && matches.length === 3) {
            mimeType = matches[1];
            data = matches[2];
        }

        // Determine extension
        let extension = "png"; // fallback
        if (mimeType) {
            const ext = mimeType.split('/')[1];
            extension = ext === 'jpeg' ? 'jpg' : ext;
        }

        const filename = preferredFilename || `${uuidv4()}.${extension}`;
        
        // Ensure directory structure: public/uploads/[feature]/[recordId]/
        const relativeDir = path.join("uploads", feature, recordId);
        const absoluteDir = path.join(process.cwd(), "public", relativeDir);

        if (!fs.existsSync(absoluteDir)) {
            fs.mkdirSync(absoluteDir, { recursive: true });
        }

        const filePath = path.join(absoluteDir, filename);
        const buffer = Buffer.from(data, 'base64');

        fs.writeFileSync(filePath, buffer);

        // Return the path that will be served by our custom API route
        // We use /api/uploads/ instead of /uploads/ to bypass Next.js static serving issues on Windows Server
        const webPath = `/api/uploads/${relativeDir.replace(/\\/g, '/')}/${filename}`;
        return webPath;
    } catch (error) {
        console.error("Error saving base64 to file:", error);
        return null;
    }
}

/**
 * Handles saving an array or JSON of base64 files.
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
    } catch (e) {
        return typeof filesJson === 'string' ? filesJson : null;
    }

    if (!Array.isArray(files)) return JSON.stringify(filesJson);

    const savedPaths = await Promise.all(
        files.map(async (file, index) => {
            if (typeof file === 'string') {
                return await saveBase64ToFile(file, feature, recordId, `file_${index}`);
            } else if (file && file.data) {
                // If it's an object { data, name }
                return await saveBase64ToFile(file.data, feature, recordId, file.name);
            }
            return file;
        })
    );

    return JSON.stringify(savedPaths.filter(p => !!p));
}
