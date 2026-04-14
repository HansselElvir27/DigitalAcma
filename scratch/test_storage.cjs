const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function saveBase64ToFile(base64, feature, recordId, preferredFilename) {
    if (!base64 || typeof base64 !== 'string') return null;
    if (base64.startsWith('/uploads/')) return base64;

    try {
        const matches = base64.match(/^data:([A-Za-z\-+/.]+);base64,(.+)$/);
        let mimeType = null;
        let data = base64;

        if (matches && matches.length === 3) {
            mimeType = matches[1];
            data = matches[2];
        }

        let extension = "png";
        if (mimeType) {
            const ext = mimeType.split('/')[1];
            extension = ext === 'jpeg' ? 'jpg' : ext;
        }

        const filename = preferredFilename || `${uuidv4()}.${extension}`;
        const relativeDir = path.join("uploads", feature, recordId);
        
        let basePath = (process.env.UPLOADS_BASE_PATH || process.cwd()).trim();
        basePath = basePath.replace(/[\\/]+$/, "");
        
        const absoluteDir = path.join(basePath, "public", relativeDir);

        try {
            if (!fs.existsSync(absoluteDir)) {
                fs.mkdirSync(absoluteDir, { recursive: true });
            }
        } catch (dirError) {
            console.error(`FAILED to create directory:`, dirError.message);
        }

        const filePath = path.join(absoluteDir, filename);
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, buffer);

        const webSubPath = path.join(feature, recordId, filename);
        return `/api/uploads/${webSubPath.replace(/\\/g, '/')}`;
    } catch (error) {
        console.error("Critical error:", error.message);
        return null;
    }
}

async function test() {
    process.env.UPLOADS_BASE_PATH = "E:\\Digitalacma";
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const res = await saveBase64ToFile(dummyBase64, 'test_zx', '1234', 'test.png');
    console.log("SAVE BASE64 RETURNED:", res);
}
test();
