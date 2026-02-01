/**
 * ==========================================
 * 🚀 SERVIDOR PRINCIPAL - SIMULADOR TÁCTICO
 * ==========================================
 * Servidor Express con SQL Server
 * Con medidas de seguridad implementadas
 * ==========================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, closeConnection } = require('./database');

// Middleware de seguridad
const {
    helmetConfig,
    generalLimiter,
    parameterPollutionProtection,
    securityLogger,
    sanitizeInputs,
    additionalSecurityHeaders
} = require('./middleware/security');

// Rutas
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// VALIDACIÓN DE CONFIGURACIÓN CRÍTICA
// ==========================================
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('CAMBIAR') || process.env.JWT_SECRET.length < 32) {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ FATAL: JWT_SECRET no está configurado correctamente');
        console.error('   Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
        process.exit(1);
    } else {
        console.warn('⚠️  ADVERTENCIA: JWT_SECRET débil o no configurado (solo permitido en desarrollo)');
    }
}

// ==========================================
// MIDDLEWARES DE SEGURIDAD
// ==========================================

// Helmet - Headers de seguridad HTTP
app.use(helmetConfig);

// Trust proxy (necesario para rate limiting detrás de proxy/load balancer)
app.set('trust proxy', 1);

// CORS - Configuración según entorno
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://localhost:8080'];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (mobile apps, curl, etc.) solo en desarrollo
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Origen bloqueado: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // Cache preflight por 24 horas
}));

// Protección contra HTTP Parameter Pollution
app.use(parameterPollutionProtection);

// Rate limiting general
app.use('/api/', generalLimiter);

// Parsear JSON con límite de tamaño
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging de seguridad (detecta patrones sospechosos)
app.use(securityLogger);

// Sanitizar inputs
app.use(sanitizeInputs);

// Headers adicionales de seguridad
app.use(additionalSecurityHeaders);

// Servir archivos estáticos con headers de seguridad
app.use(express.static(path.join(__dirname, '..'), {
    dotfiles: 'deny', // No servir archivos ocultos
    index: ['index.html'],
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// Logging de requests (desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ==========================================
// RUTAS API
// ==========================================

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            status: 'ok',
            database: dbConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de pagos
app.use('/api/payments', paymentRoutes);

// Configuración del plan (para el frontend)
app.get('/api/config', async (req, res) => {
    try {
        const config = require('../config/freemium-config.json');
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Error cargando configuración' });
    }
});

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// Ruta no encontrada
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function startServer() {
    try {
        // Probar conexión a la base de datos
        console.log('[Server] Verificando conexión a la base de datos...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.warn('[Server] ⚠️ Base de datos no disponible. Algunas funciones no estarán disponibles.');
        }
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('==========================================');
            console.log('🚀 SIMULADOR TÁCTICO - SERVIDOR');
            console.log('==========================================');
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🗄️ Database: ${dbConnected ? '✅ Conectada' : '❌ No disponible'}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('==========================================');
            console.log('');
            console.log('📌 Endpoints disponibles:');
            console.log('   GET  /api/health - Estado del servidor');
            console.log('   POST /api/auth/register - Registrar usuario');
            console.log('   POST /api/auth/login - Iniciar sesión');
            console.log('   GET  /api/auth/me - Usuario actual');
            console.log('   GET  /api/payments/plans - Planes disponibles');
            console.log('   GET  /api/payments/features - Features del plan');
            console.log('   POST /api/payments/subscribe - Suscribirse a plan');
            console.log('==========================================');
        });
        
    } catch (error) {
        console.error('[Server] Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n[Server] Cerrando servidor...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[Server] Cerrando servidor...');
    await closeConnection();
    process.exit(0);
});

// Iniciar
startServer();
