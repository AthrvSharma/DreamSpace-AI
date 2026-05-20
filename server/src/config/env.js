import dotenv from 'dotenv';

dotenv.config();

export const isProduction = process.env.NODE_ENV === 'production';

export function firstEnv(...names) {
    for (const name of names) {
        const value = process.env[name];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value).trim();
        }
    }
    return undefined;
}

export function parseBoolean(value, defaultValue = false) {
    if (value === undefined || value === null || value === '') return defaultValue;
    return ['1', 'true', 'yes', 'y', 'on'].includes(String(value).trim().toLowerCase());
}

export function parseInteger(value, defaultValue) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function parseCsv(value) {
    if (!value) return [];
    return String(value)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

export function requiredEnv(names, label = names[0]) {
    const value = firstEnv(...names);
    if (!value) {
        throw new Error(`Missing required environment variable: ${label}`);
    }
    return value;
}

export const serverConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    host: firstEnv('HOST') || '0.0.0.0',
    port: parseInteger(process.env.PORT, 5000),
    frontendUrl: firstEnv('FRONTEND_URL', 'PUBLIC_URL', 'RENDER_EXTERNAL_URL'),
    corsOrigins: parseCsv(process.env.CORS_ORIGIN),
    trustProxy: parseBoolean(process.env.TRUST_PROXY, isProduction),
    jsonBodyLimit: firstEnv('JSON_BODY_LIMIT') || '10mb',
};

export const authConfig = {
    jwtSecret: firstEnv('JWT_SECRET'),
    jwtExpiresIn: firstEnv('JWT_EXPIRES_IN') || '7d',
};

export function validateRuntimeEnv() {
    const errors = [];

    const requiredGroups = [
        [['JWT_SECRET'], 'JWT_SECRET'],
        [['TIDB_HOST', 'DB_HOST'], 'TIDB_HOST or DB_HOST'],
        [['TIDB_USER', 'DB_USER'], 'TIDB_USER or DB_USER'],
        [['TIDB_PASSWORD', 'DB_PASSWORD'], 'TIDB_PASSWORD or DB_PASSWORD'],
        [['TIDB_DB_NAME', 'DB_NAME'], 'TIDB_DB_NAME or DB_NAME'],
    ];

    for (const [names, label] of requiredGroups) {
        if (!firstEnv(...names)) errors.push(`Missing ${label}`);
    }

    const jwtSecret = firstEnv('JWT_SECRET') || '';
    if (jwtSecret && jwtSecret.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long');
    }
    if (isProduction && /your[_-]?secret|change[_-]?me|mock/i.test(jwtSecret)) {
        errors.push('JWT_SECRET must be a real production secret');
    }

    const host = firstEnv('TIDB_HOST', 'DB_HOST') || '';
    const sslEnabled = parseBoolean(firstEnv('TIDB_ENABLE_SSL', 'DB_SSL'), /tidbcloud\.com$/i.test(host));
    if (/tidbcloud\.com$/i.test(host) && !sslEnabled) {
        errors.push('TiDB Cloud public endpoints require TLS; set TIDB_ENABLE_SSL=true');
    }

    if (errors.length > 0) {
        throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
    }
}
