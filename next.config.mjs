import path from 'path';
import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    // Define explicit root for output tracing so Next.js doesn't pick
    // a parent lockfile as the workspace root in some CI environments.
    outputFileTracingRoot: path.join(__dirname, '.'),
};

export default nextConfig;
