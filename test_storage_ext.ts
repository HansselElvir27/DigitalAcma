import { saveBase64ToFile } from './src/lib/storage';

async function run() {
    process.env.UPLOADS_BASE_PATH = "D:\\Digitalacma";
    const dummyBase64 = "data:application/pdf;base64,JVBERi0xLjQKJ...";
    console.log("Saving board_attachment...");
    const path = await saveBase64ToFile(dummyBase64, 'zarpes', 'test-123', 'board_attachment');
    console.log("Result:", path);
}

run().catch(console.error);
