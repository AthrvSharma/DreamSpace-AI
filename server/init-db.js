#!/usr/bin/env node
import 'dotenv/config';
import { ensureDatabase, dbConfig } from './src/config/database.js';

async function initDatabase() {
    try {
        console.log('🚀 Setting up production database...\n');
        await ensureDatabase();
        console.log(`✅ Database '${dbConfig.database}' is ready on ${dbConfig.host}:${dbConfig.port}`);
        console.log(`🔒 TLS: ${dbConfig.sslEnabled ? 'enabled' : 'disabled'}\n`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Database setup failed:');
        console.error(`   ${err.message}\n`);
        console.error('Check your TiDB Cloud host, user, password, database name, TLS settings, and IP allowlist.');
        process.exit(1);
    }
}

initDatabase();
