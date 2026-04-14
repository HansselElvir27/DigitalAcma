const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkPaths() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    try {
        log('Checking Zarpe signature paths...');
        const resZarpe = await pool.query('SELECT id, signature, "captainSignature" FROM "ZarpeRequest" WHERE signature IS NOT NULL OR "captainSignature" IS NOT NULL LIMIT 5');
        log('Zarpe paths: ' + JSON.stringify(resZarpe.rows, null, 2));

        log('\nChecking Vessel photos paths...');
        const resVessel = await pool.query('SELECT id, "vesselPhotos" FROM "VesselRegistration" WHERE "vesselPhotos" IS NOT NULL LIMIT 5');
        resVessel.rows.forEach((row, i) => {
             log(`Vessel ${row.id} photos: ${row.vesselPhotos}`);
        });

    } catch (e) {
        log('Error querying DB: ' + e.message);
    } finally {
        await pool.end();
        fs.writeFileSync('E:\\Digitalacma\\scratch\\db_paths_output.txt', output);
    }
}

checkPaths();
