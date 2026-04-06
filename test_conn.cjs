const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    console.log('Connecting to:', process.env.DATABASE_URL.split('@')[1]);
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

test();
