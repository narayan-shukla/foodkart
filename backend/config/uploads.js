import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(process.env.UPLOAD_DIR || path.join(backendDirectory, '..', 'uploads'));
fs.mkdirSync(uploadsDir, { recursive: true });
