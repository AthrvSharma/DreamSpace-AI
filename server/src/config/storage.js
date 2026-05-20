import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const serverRoot = path.resolve(__dirname, '..', '..');
export const storageRoot = process.env.STORAGE_DIR
    ? path.resolve(process.env.STORAGE_DIR)
    : serverRoot;

export const uploadDir = path.join(storageRoot, 'uploads');
export const generatedDir = path.join(storageRoot, 'generated');
export const exportDir = path.join(storageRoot, 'exports');

export function ensureStorageDirs() {
    for (const dir of [uploadDir, generatedDir, exportDir]) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
}

export function safeJoin(baseDir, unsafePath) {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(resolvedBase, unsafePath);

    if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(`${resolvedBase}${path.sep}`)) {
        throw new Error('Invalid file path.');
    }

    return resolvedPath;
}

export function resolvePublicFilePath(publicUrl) {
    const normalized = String(publicUrl || '').replace(/^\/+/, '');
    const [bucket, ...rest] = normalized.split('/');
    const relativePath = rest.join('/');

    if (!relativePath) throw new Error('Invalid file URL.');

    if (bucket === 'uploads') return safeJoin(uploadDir, relativePath);
    if (bucket === 'generated') return safeJoin(generatedDir, relativePath);
    if (bucket === 'exports') return safeJoin(exportDir, relativePath);

    throw new Error(`Unsupported file URL: ${publicUrl}`);
}
