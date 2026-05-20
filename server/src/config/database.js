import fs from 'fs';
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import {
    firstEnv,
    parseBoolean,
    parseInteger,
    requiredEnv,
    isProduction,
} from './env.js';

const host = requiredEnv(['TIDB_HOST', 'DB_HOST'], 'TIDB_HOST or DB_HOST');
const port = parseInteger(firstEnv('TIDB_PORT', 'DB_PORT'), 4000);
const username = requiredEnv(['TIDB_USER', 'DB_USER'], 'TIDB_USER or DB_USER');
const password = requiredEnv(['TIDB_PASSWORD', 'DB_PASSWORD'], 'TIDB_PASSWORD or DB_PASSWORD');
const database = requiredEnv(['TIDB_DB_NAME', 'DB_NAME'], 'TIDB_DB_NAME or DB_NAME');
const isTidbCloud = /tidbcloud\.com$/i.test(host);
const sslEnabled = parseBoolean(firstEnv('TIDB_ENABLE_SSL', 'DB_SSL'), isTidbCloud);
const connectTimeout = parseInteger(firstEnv('DB_CONNECT_TIMEOUT_MS', 'TIDB_CONNECT_TIMEOUT_MS'), 30000);

function buildSslOptions() {
    if (!sslEnabled) return undefined;

    const caPath = firstEnv('TIDB_CA_PATH', 'DB_SSL_CA_PATH');
    const ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: parseBoolean(
            firstEnv('TIDB_SSL_REJECT_UNAUTHORIZED', 'DB_SSL_REJECT_UNAUTHORIZED'),
            true
        ),
    };

    if (caPath) {
        ssl.ca = fs.readFileSync(caPath);
    }

    return ssl;
}

const ssl = buildSslOptions();

export const dbConfig = {
    host,
    port,
    username,
    password,
    database,
    sslEnabled,
    connectTimeout,
};

const sequelize = new Sequelize({
    dialect: 'mysql',
    host,
    port,
    username,
    password,
    database,
    logging: parseBoolean(process.env.DB_LOGGING, false) ? console.log : false,
    dialectOptions: {
        connectTimeout,
        ...(ssl ? { ssl } : {}),
    },
    pool: {
        max: parseInteger(process.env.DB_POOL_MAX, isProduction ? 10 : 5),
        min: parseInteger(process.env.DB_POOL_MIN, 0),
        acquire: parseInteger(process.env.DB_POOL_ACQUIRE_MS, 30000),
        idle: parseInteger(process.env.DB_POOL_IDLE_MS, 10000),
        evict: parseInteger(process.env.DB_POOL_EVICT_MS, 1000),
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
});

function quoteIdentifier(identifier) {
    if (!/^[A-Za-z0-9_$]+$/.test(identifier)) {
        throw new Error('Database name can only contain letters, numbers, underscores, and dollar signs.');
    }
    return `\`${identifier.replaceAll('`', '``')}\``;
}

export async function ensureDatabase() {
    if (!parseBoolean(process.env.DB_CREATE_IF_MISSING, true)) return;

    const connection = await mysql.createConnection({
        host,
        port,
        user: username,
        password,
        connectTimeout,
        ...(ssl ? { ssl } : {}),
    });

    try {
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
    } finally {
        await connection.end();
    }
}

export default sequelize;
