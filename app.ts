// Local AI Studio / npm run dev compatibility entry point.
// The Vercel function lives entirely inside api/index.ts to avoid ESM import resolution failures.
export { default } from './api/index.js';
