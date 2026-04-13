const path = require('path');
const fs = require('fs');

console.log('Current Working Directory (process.cwd()):', process.cwd());
console.log('__dirname:', __dirname);

const publicPath = path.join(process.cwd(), 'public');
console.log('Looking for public folder at:', publicPath);
console.log('Does public folder exist?', fs.existsSync(publicPath));

const uploadsPath = path.join(publicPath, 'uploads');
console.log('Looking for uploads folder at:', uploadsPath);
console.log('Does uploads folder exist?', fs.existsSync(uploadsPath));

// Try to find any uploads folder in the current drive
function findUploads(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file === 'uploads') {
                    console.log('FOUND UPLOADS:', fullPath);
                }
                // Don't recurse too deep into node_modules or .git
                if (file !== 'node_modules' && file !== '.git') {
                    // findUploads(fullPath); // skip recursion for now to be fast
                }
            }
        }
    } catch (e) {}
}

findUploads(process.cwd());
