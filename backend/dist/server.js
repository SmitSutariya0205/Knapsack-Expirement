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
// MANUAL CORS INJECTION FOR RENDER
// Using standard explicit manual headers because the 'cors' package gets blocked during preflight
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://arjav5090.github.io',
        'https://smitsutariya0205.github.io',
        'http://localhost:3000',
        'http://localhost:3001',
        ...(process.env.CORS_ORIGIN?.split(',') ?? [])
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else if (allowedOrigins.length > 0) {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
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
