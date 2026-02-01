/**
 * ==========================================
 * 🚀 SERVIDOR PRINCIPAL - SIMULADOR TÁCTICO
 * ==========================================
 * Servidor Express con SQL Server
 * ==========================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, closeConnection } = require('./database');

// Rutas
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES
// ==========================================

// CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true
}));

// Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..')));

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
