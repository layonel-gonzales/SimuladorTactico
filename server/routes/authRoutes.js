/**
 * ==========================================
 * 🔐 AUTH ROUTES - Rutas de Autenticación
 * ==========================================
 * Con validación de inputs y rate limiting
 * ==========================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');
const { query } = require('../database');

// Middleware de seguridad y validación
const { loginLimiter, registerLimiter } = require('../middleware/security');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Validar que JWT_SECRET esté configurado correctamente
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.warn('[Auth] ⚠️ JWT_SECRET débil o no configurado');
}
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/register - Registrar usuario
 * Con rate limiting y validación de inputs
 */
router.post('/register', registerLimiter, validateRegister, async (req, res) => {
    try {
        const { email, password, nombre, apellido, nombreUsuario } = req.body;
        
        // Verificar si el email ya existe
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Este email ya está registrado' 
            });
        }
        
        // Crear usuario
        const user = await UserModel.create({
            email,
            password,
            nombre,
            apellido,
            nombreUsuario
        });
        
        // Log de actividad (sanitizado)
        await query(`
            INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, IpAddress, UserAgent)
            VALUES (@userId, 'register', 'Usuario registrado', @ip, @userAgent)
        `, {
            userId: user.UsuarioId,
            ip: (req.ip || '').substring(0, 45), // Limitar longitud
            userAgent: (req.get('User-Agent') || '').substring(0, 255) // Limitar longitud
        });
        
        // Generar token
        const token = jwt.sign(
            { userId: user.UsuarioId, email: user.Email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.UsuarioId,
                email: user.Email,
                nombre: user.Nombre,
                plan: 'free'
            },
            token
        });
        
    } catch (error) {
        console.error('[Auth] Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /api/auth/login - Iniciar sesión
 * Con rate limiting estricto y validación
 */
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario
        const user = await UserModel.findByEmail(email);
        if (!user) {
            // Usar tiempo constante para prevenir timing attacks
            await UserModel.fakePasswordCheck();
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }
        
        // Verificar si está bloqueado
        if (user.Bloqueado) {
            return res.status(403).json({ 
                error: 'Cuenta bloqueada. Contacte soporte.' 
            });
        }
        
        // Verificar contraseña
        const isValid = await UserModel.verifyPassword(password, user.PasswordHash);
        if (!isValid) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }
        
        // Actualizar último acceso
        await UserModel.updateLastAccess(user.UsuarioId);
        
        // Log de actividad
        await query(`
            INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, IpAddress, UserAgent)
            VALUES (@userId, 'login', 'Inicio de sesión', @ip, @userAgent)
        `, {
            userId: user.UsuarioId,
            ip: (req.ip || '').substring(0, 45),
            userAgent: (req.get('User-Agent') || '').substring(0, 255)
        });
        
        // Generar token con claims mínimos
        const token = jwt.sign(
            { 
                userId: user.UsuarioId, 
                email: user.Email,
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_SECRET,
            { 
                expiresIn: JWT_EXPIRES_IN,
                issuer: 'simulador-tactico'
            }
        );
        
        // Obtener features del plan
        const features = await UserModel.getUserPlanFeatures(user.UsuarioId);
        
        res.json({
            message: 'Login exitoso',
            user: {
                id: user.UsuarioId,
                email: user.Email,
                nombre: user.Nombre,
                apellido: user.Apellido,
                fotoUrl: user.FotoUrl,
                plan: user.PlanCodigo,
                planNombre: user.PlanNombre
            },
            features,
            token
        });
        
    } catch (error) {
        console.error('[Auth] Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/auth/me - Obtener usuario actual
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const features = await UserModel.getUserPlanFeatures(user.UsuarioId);
        
        res.json({
            user: {
                id: user.UsuarioId,
                email: user.Email,
                nombre: user.Nombre,
                apellido: user.Apellido,
                nombreUsuario: user.NombreUsuario,
                fotoUrl: user.FotoUrl,
                plan: user.PlanCodigo,
                planNombre: user.PlanNombre,
                fechaRegistro: user.FechaRegistro
            },
            features
        });
        
    } catch (error) {
        console.error('[Auth] Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /api/auth/logout - Cerrar sesión
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Log de actividad
        await query(`
            INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, IpAddress)
            VALUES (@userId, 'logout', 'Cierre de sesión', @ip)
        `, {
            userId: req.user.userId,
            ip: req.ip
        });
        
        res.json({ message: 'Sesión cerrada exitosamente' });
        
    } catch (error) {
        console.error('[Auth] Error en logout:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * Middleware de autenticación
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
