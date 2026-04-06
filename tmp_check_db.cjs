const { Client } = require('pg');
require('dotenv').config();

async function checkData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    const portCount = await client.query('SELECT COUNT(*) FROM "Port"');
    console.log('Port count:', portCount.rows[0].count);
    
    const ports = await client.query('SELECT name FROM "Port" LIMIT 5');
    console.log('Sample ports:', ports.rows.map(r => r.name));
    
    const userCount = await client.query('SELECT COUNT(*) FROM "User"');
    console.log('User count:', userCount.rows[0].count);
    
    const users = await client.query('SELECT email FROM "User" LIMIT 5');
    console.log('Sample users:', users.rows.map(r => r.email));
    
  } catch (err) {
    console.error('Check data error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkData();
