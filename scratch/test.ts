import { saveBase64ToFile, saveMultipleBase64 } from "./src/lib/storage";

async function run() {
    process.env.UPLOADS_BASE_PATH = "E:\\Digitalacma";
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoA";
    
    console.log("Testing normal saveBase64ToFile:");
    const res1 = await saveBase64ToFile(dummyBase64, 'test_feature', '123', 'test.png');
    console.log("result:", res1);
    
    console.log("\nTesting saveMultipleBase64 with single array:");
    const res2 = await saveMultipleBase64([dummyBase64], 'test_feature', '123');
    console.log("result:", res2);

    console.log("\nTesting saveMultipleBase64 with json string array:");
    const res3 = await saveMultipleBase64(`["${dummyBase64}"]`, 'test_feature', '123');
    console.log("result:", res3);
    
    console.log("\nTesting saveMultipleBase64 with json object:");
    const res4 = await saveMultipleBase64([{data: dummyBase64, name: "foo.png"}], 'test_feature', '123');
    console.log("result:", res4);
}

run().catch(console.error);
