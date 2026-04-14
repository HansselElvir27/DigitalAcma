const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('--- Digitalacma Storage Diagnostic ---');

const envBase = process.env.UPLOADS_BASE_PATH?.trim().replace(/[\\/]+$/, "");
const cwdBase = process.cwd().trim().replace(/[\\/]+$/, "");

console.log('Environment Base Path (UPLOADS_BASE_PATH):', envBase || 'NOT SET');
console.log('Current Working Directory (CWD):', cwdBase);

const basePaths = [
    envBase,
    cwdBase,
    path.join(cwdBase, ".."),
    "D:\\Digitalacma",
    "C:\\Digitalacma",
].filter(Boolean);

console.log('\n--- Checking Candidate Base Paths ---');
basePaths.forEach((base, index) => {
    console.log(`\nCandidate ${index + 1}: ${base}`);
    const exists = fs.existsSync(base);
    console.log(`  Exists: ${exists}`);
    
    if (exists) {
        const publicPath = path.join(base, "public");
        const uploadsPath1 = path.join(base, "public", "uploads");
        const uploadsPath2 = path.join(base, "uploads");
        
        console.log(`  - Has public folder: ${fs.existsSync(publicPath)}`);
        console.log(`  - Has public/uploads folder: ${fs.existsSync(uploadsPath1)}`);
        console.log(`  - Has direct uploads folder: ${fs.existsSync(uploadsPath2)}`);
    }
});

console.log('\n--- Storage Logic Simulation ---');
const simulatedFeature = 'zarpes';
const simulatedId = 'test-id';
const simulatedFile = 'test.txt';

let writeBasePath = envBase || cwdBase;
const absoluteDir = path.join(writeBasePath, "public", "uploads", simulatedFeature, simulatedId);

console.log('If saving a file now, it would try to create directory:');
console.log('  ->', absoluteDir);
