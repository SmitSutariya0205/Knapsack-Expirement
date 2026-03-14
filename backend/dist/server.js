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
    ...(process.env.CORS_ORIGIN?.split(',') ?? [])
];
// MANUAL CORS — do NOT use the 'cors' npm package (Render/Cloudflare strips its headers)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});
app.use(express_1.default.json({ limit: '2mb' }));
app.use(participantRoutes_1.router);
app.use(authRoutes_1.router);
// routes
app.get('/health', (_, res) => res.json({ ok: true }));
app.listen(port, async () => {
    await (0, db_1.connectPostgres)();
    console.log(`[backend] running at http://localhost:${port}`);
});
