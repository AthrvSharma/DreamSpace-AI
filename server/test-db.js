#!/usr/bin/env node
import 'dotenv/config';
import sequelize from './src/config/database.js';
import { User, Room, Redesign, Layout, Asset } from './src/models/index.js';

async function testConnection() {
  try {
    console.log('🔍 Testing MySQL Connection...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection successful!');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}\n`);
    
    // Sync database
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced!\n');
    
    // Count records
    const userCount = await User.count();
    const roomCount = await Room.count();
    const assetCount = await Asset.count();
    
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Rooms: ${roomCount}`);
    console.log(`   Assets: ${assetCount}\n`);
    
    console.log('✨ Database setup is ready!');
    console.log('   You can now start the server with: npm start\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Connection Error:');
    console.error(`   ${err.message}\n`);
    console.error('💡 Troubleshooting:');
    console.error('   1. Ensure MySQL server is running');
    console.error('   2. Check .env file credentials');
    console.error('   3. Verify database exists (CREATE DATABASE dreamspace;)\n');
    process.exit(1);
  }
}

testConnection();
