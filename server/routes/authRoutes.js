/**
 * ==========================================
 * 🔐 AUTH ROUTES - Rutas de Autenticación
 * ==========================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { query } = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'simulador_tactico_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/register - Registrar usuario
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre, apellido, nombreUsuario } = req.body;
        
        // Validaciones
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }
        
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
        
        // Log de actividad
        await query(`
            INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, IpAddress, UserAgent)
            VALUES (@userId, 'register', 'Usuario registrado', @ip, @userAgent)
        `, {
            userId: user.UsuarioId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
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
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }
        
        // Buscar usuario
        const user = await UserModel.findByEmail(email);
        if (!user) {
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
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        // Generar token
        const token = jwt.sign(
            { userId: user.UsuarioId, email: user.Email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
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
