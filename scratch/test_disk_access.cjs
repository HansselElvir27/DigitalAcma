const fs = require('fs');
const path = require('path');

const testPaths = [
    'D:\\Digitalacma\\public\\uploads',
    'D:\\Digitalacma\\uploads',
    'E:\\Digitalacma\\public\\uploads',
];

testPaths.forEach(p => {
    try {
        console.log(`Checking ${p}...`);
        if (fs.existsSync(p)) {
            console.log(`  EXISTS!`);
            const files = fs.readdirSync(p);
            console.log(`  Contains ${files.length} items:`, files.slice(0, 5));
        } else {
            console.log(`  Does not exist.`);
        }
    } catch (e) {
        console.error(`  Error checking ${p}:`, e.message);
    }
});
