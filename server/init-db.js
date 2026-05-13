#!/usr/bin/env node
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function initDatabase() {
  try {
    console.log('🚀 Setting up MySQL Database...\n');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Athrv@200611',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to MySQL\n');

    // Create database if not exists
    const dbName = process.env.DB_NAME || 'dreamspace';
    console.log(`📦 Creating database: ${dbName}...`);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' is ready!\n`);

    // Show next steps
    console.log('📝 Next Steps:');
    console.log('   1. Start the server: cd server && npm start');
    console.log('   2. The server will automatically create all tables');
    console.log('   3. Test login endpoints with your credentials\n');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\n💡 Make sure MySQL is running:');
    console.error('   Mac: brew services start mysql');
    console.error('   Windows: Start MySQL from Services');
    console.error('   Linux: sudo systemctl start mysql\n');
    process.exit(1);
  }
}

initDatabase();
