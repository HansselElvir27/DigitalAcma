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
            if (extension === 'vnd.openxmlformats-officedocument.wordprocessingml.document') extension = 'docx';
            if (extension === 'msword') extension = 'doc';
            if (extension === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') extension = 'xlsx';
            if (extension === 'vnd.ms-excel') extension = 'xls';
        }

        let filename: string;
        if (preferredFilename) {
            filename = preferredFilename.includes('.') ? preferredFilename : `${preferredFilename}.${extension}`;
        } else {
            filename = `${uuidv4()}.${extension}`;
        }
        
        // Ensure directory structure
        const relativeDir = path.join("uploads", feature, recordId);
        
        // Base path can be customized via ENV to handle different drive letters (e.g. D:\Digitalacma)
        let basePath = (process.env.UPLOADS_BASE_PATH || process.cwd()).trim();
        // Remove trailing slash/backslash if present to avoid double separators
        basePath = basePath.replace(/[\\/]+$/, "");
        
        const absoluteDir = path.join(basePath, "public", relativeDir);

        try {
            if (!fs.existsSync(absoluteDir)) {
                console.log(`Creating directory: ${absoluteDir}`);
                fs.mkdirSync(absoluteDir, { recursive: true });
            }
        } catch (dirError: any) {
            console.error(`FAILED to create directory ${absoluteDir}:`, dirError.message);
            // If D: fails, fallback to project root as emergency
            if (basePath !== process.cwd()) {
                const fallbackDir = path.join(process.cwd(), "public", relativeDir);
                console.warn(`Attempting fallback to project root: ${fallbackDir}`);
                if (!fs.existsSync(fallbackDir)) {
                    fs.mkdirSync(fallbackDir, { recursive: true });
                }
                // Update final path
                const fallbackFilePath = path.join(fallbackDir, filename);
                const buffer = Buffer.from(data, 'base64');
                fs.writeFileSync(fallbackFilePath, buffer);
                const webSubPath = path.join(feature, recordId, filename);
                return `/api/uploads/${webSubPath.replace(/\\/g, '/')}`;
            }
            throw dirError;
        }

        const filePath = path.join(absoluteDir, filename);
        const buffer = Buffer.from(data, 'base64');

        fs.writeFileSync(filePath, buffer);
        console.log(`File saved successfully to: ${filePath}`);

        // Return the path that will be served by our custom API route
        const webSubPath = path.join(feature, recordId, filename);
        const webPath = `/api/uploads/${webSubPath.replace(/\\/g, '/')}`;
        return webPath;
    } catch (error: any) {
        console.error("Critical error saving base64 to file:", error.message);
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
