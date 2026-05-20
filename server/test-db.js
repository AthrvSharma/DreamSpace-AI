#!/usr/bin/env node
import 'dotenv/config';
import sequelize, { ensureDatabase, dbConfig } from './src/config/database.js';
import { User, Room, Redesign, Layout, Asset } from './src/models/index.js';
import { seedAssets } from './src/config/seed.js';

async function testConnection() {
  try {
    console.log('🔍 Testing TiDB/MySQL connection...\n');
    await ensureDatabase();
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.username}`);
    console.log(`   TLS: ${dbConfig.sslEnabled ? 'enabled' : 'disabled'}\n`);
    
    // Sync database
    console.log('🔄 Syncing database tables...');
    const syncOptions = process.env.DB_SYNC_ALTER === 'true' ? { alter: true } : {};
    await sequelize.sync(syncOptions);
    console.log('✅ Database tables synced!\n');
    await seedAssets();
    
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
    console.error('   1. Check TiDB Cloud credentials in .env');
    console.error('   2. Ensure TLS is enabled for TiDB Cloud');
    console.error('   3. Verify your IP address is allowed in TiDB Cloud network settings\n');
    process.exit(1);
  }
}

testConnection();
