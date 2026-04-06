const { Client } = require('pg');
require('dotenv').config();

async function listUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    const users = await client.query('SELECT email, role FROM "User"');
    console.table(users.rows);
  } catch (err) {
    console.error('List users error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

listUsers();
