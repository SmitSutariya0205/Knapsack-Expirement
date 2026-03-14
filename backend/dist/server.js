"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const participantRoutes_1 = require("./routes/participantRoutes");
const authRoutes_1 = require("./routes/authRoutes");
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 8787);
const ALLOWED_ORIGINS = [
    'https://arjav5090.github.io',
    'https://smitsutariya0205.github.io',
    'http://localhost:3000',
    'http://localhost:3001',
    ...(process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) ?? [])
];
console.log('[CORS] ALLOWED_ORIGINS:', JSON.stringify(ALLOWED_ORIGINS));
// MANUAL CORS — do NOT use the 'cors' npm package (Render/Cloudflare strips its headers)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else if (origin) {
        console.log(`[CORS] Origin REJECTED: "${origin}" not in`, ALLOWED_ORIGINS);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
        res.setHeader('Content-Length', '0');
        res.writeHead(204);
        return res.end();
    }
    next();
});
app.use(express_1.default.json({ limit: '2mb' }));
app.use(participantRoutes_1.router);
app.use(authRoutes_1.router);
// routes
app.get('/health', (_, res) => res.json({ ok: true }));
// Temporary debug endpoint
app.get('/debug-cors', (req, res) => {
    res.json({
        allowedOrigins: ALLOWED_ORIGINS,
        incomingOrigin: req.headers.origin || '(none)',
        corsOriginEnv: process.env.CORS_ORIGIN || '(not set)',
        nodeVersion: process.version
    });
});
app.listen(port, async () => {
    await (0, db_1.connectPostgres)();
    console.log(`[backend] running at http://localhost:${port}`);
});
