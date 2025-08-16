/**
 * 🚀 SERVIDOR FREEMIUM - SIMULADOR TÁCTICO
 * 
 * Backend completo para manejo de:
 * - Autenticación de usuarios
 * - Gestión de suscripciones con Stripe
 * - Control de dispositivos (máx 3 por usuario premium)
 * - Base de datos de usuarios
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'simulador_tactico_secret_2025';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Servir desde el directorio padre (raíz del proyecto)

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 requests por ventana
});
app.use('/api/', limiter);

// Base de datos en memoria (en producción usar MongoDB, PostgreSQL, etc.)
let users = new Map();
let devices = new Map();
let subscriptions = new Map();

// Modelos de datos
class User {
    constructor(email, password) {
        this.id = uuidv4();
        this.email = email;
        this.passwordHash = bcrypt.hashSync(password, 10);
        this.isPremium = false;
        this.premiumExpires = null;
        this.stripeCustomerId = null;
        this.createdAt = new Date();
        this.lastLogin = null;
    }
}

class Device {
    constructor(userId, deviceId, deviceInfo = {}) {
        this.id = uuidv4();
        this.userId = userId;
        this.deviceId = deviceId;
        this.deviceInfo = deviceInfo; // navegador, OS, etc.
        this.registeredAt = new Date();
        this.lastAccess = new Date();
        this.isActive = true;
    }
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// --- MIDDLEWARE DE VERIFICACIÓN DE CARACTERÍSTICAS ---

// Planes y características disponibles
const planFeatures = {
    free: {
        maxLines: 5,
        maxTactics: 3,
        maxAnimationDuration: 10,
        maxAnimationFrames: 5,
        maxAnimations: 1,
        formations: ['4-4-2', '4-3-3'],
        colors: ['#ff0000', '#0000ff', '#00ff00'],
        export: 'watermark',
        audioRecording: false,
        jsonExport: false,
        socialShare: false,
        maxDevices: 3
    },
    premium: {
        maxLines: -1,
        maxTactics: -1,
        maxAnimationDuration: 120,
        maxAnimationFrames: -1,
        maxAnimations: -1,
        formations: 'all',
        colors: 'all',
        export: 'hd',
        audioRecording: true,
        jsonExport: true,
        socialShare: true,
        maxDevices: 10
    },
    pro: {
        maxLines: -1,
        maxTactics: -1,
        maxAnimationDuration: -1,
        maxAnimationFrames: -1,
        maxAnimations: -1,
        formations: 'all',
        colors: 'all',
        export: 'hd',
        audioRecording: true,
        jsonExport: true,
        socialShare: true,
        multipleTeams: true,
        analytics: true,
        collaboration: 5,
        apiAccess: true,
        prioritySupport: true,
        whiteLabel: true,
        maxDevices: -1
    }
};

// Middleware para verificar acceso a características
function checkFeatureAccess(feature, checkValue = null) {
    return (req, res, next) => {
        try {
            const user = users.get(req.user.userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            const userPlan = user.isPremium ? 'premium' : 'free';
            const userFeatures = planFeatures[userPlan];
            
            // Verificar si la característica está disponible
            if (!userFeatures.hasOwnProperty(feature)) {
                return res.status(403).json({
                    error: 'Feature not supported',
                    feature: feature
                });
            }
            
            const featureValue = userFeatures[feature];
            
            // Si es boolean, verificar directamente
            if (typeof featureValue === 'boolean' && !featureValue) {
                return res.status(403).json({
                    error: 'Feature requires upgrade',
                    feature: feature,
                    requiredPlan: getMinimumPlanFor(feature),
                    currentPlan: userPlan
                });
            }
            
            // Si es numérico y hay un valor a verificar
            if (typeof featureValue === 'number' && checkValue !== null) {
                if (featureValue !== -1 && checkValue > featureValue) {
                    return res.status(403).json({
                        error: 'Feature limit exceeded',
                        feature: feature,
                        limit: featureValue,
                        requested: checkValue,
                        requiredPlan: getMinimumPlanFor(feature),
                        currentPlan: userPlan
                    });
                }
            }
            
            // Si es array, verificar si el valor está incluido
            if (Array.isArray(featureValue) && checkValue !== null) {
                if (!featureValue.includes(checkValue)) {
                    return res.status(403).json({
                        error: 'Feature value not allowed',
                        feature: feature,
                        allowedValues: featureValue,
                        requested: checkValue,
                        requiredPlan: getMinimumPlanFor(feature),
                        currentPlan: userPlan
                    });
                }
            }
            
            req.userPlan = userPlan;
            req.userFeatures = userFeatures;
            next();
        } catch (error) {
            console.error('Error checking feature access:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
}

// Función auxiliar para obtener el plan mínimo requerido
function getMinimumPlanFor(feature) {
    for (const [planName, features] of Object.entries(planFeatures)) {
        if (features[feature] && 
            (typeof features[feature] === 'boolean' && features[feature]) ||
            (typeof features[feature] === 'number' && features[feature] === -1) ||
            (features[feature] === 'all')) {
            return planName;
        }
    }
    return 'premium';
}

// --- ENDPOINTS DE AUTENTICACIÓN ---

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, deviceId, deviceInfo } = req.body;

        if (!email || !password || !deviceId) {
            return res.status(400).json({ error: 'Email, contraseña y deviceId son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = Array.from(users.values()).find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Crear usuario
        const user = new User(email, password);
        users.set(user.id, user);

        // Registrar primer dispositivo
        const device = new Device(user.id, deviceId, deviceInfo);
        devices.set(device.id, device);

        // Crear token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                email: user.email,
                isPremium: user.isPremium,
                premiumExpires: user.premiumExpires
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, deviceId, deviceInfo } = req.body;

        if (!email || !password || !deviceId) {
            return res.status(400).json({ error: 'Email, contraseña y deviceId son requeridos' });
        }

        // Buscar usuario
        const user = Array.from(users.values()).find(u => u.email === email);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar límite de dispositivos para usuarios premium
        if (user.isPremium) {
            const userDevices = Array.from(devices.values()).filter(d => d.userId === user.id && d.isActive);
            const existingDevice = userDevices.find(d => d.deviceId === deviceId);

            if (!existingDevice && userDevices.length >= 3) {
                return res.status(429).json({ 
                    error: 'Límite de dispositivos alcanzado',
                    code: 'DEVICE_LIMIT_REACHED',
                    devices: userDevices.map(d => ({
                        id: d.id,
                        deviceInfo: d.deviceInfo,
                        lastAccess: d.lastAccess
                    }))
                });
            }

            // Registrar nuevo dispositivo si no existe
            if (!existingDevice) {
                const device = new Device(user.id, deviceId, deviceInfo);
                devices.set(device.id, device);
            } else {
                // Actualizar último acceso
                existingDevice.lastAccess = new Date();
            }
        }

        // Actualizar último login
        user.lastLogin = new Date();

        // Crear token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                isPremium: user.isPremium,
                premiumExpires: user.premiumExpires,
                canAccessPremium: user.isPremium && (!user.premiumExpires || new Date() < new Date(user.premiumExpires))
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// --- ENDPOINTS DE DISPOSITIVOS ---

// Obtener dispositivos del usuario
app.get('/api/devices', authenticateToken, (req, res) => {
    try {
        const userDevices = Array.from(devices.values())
            .filter(d => d.userId === req.user.userId && d.isActive)
            .map(d => ({
                id: d.id,
                deviceInfo: d.deviceInfo,
                registeredAt: d.registeredAt,
                lastAccess: d.lastAccess
            }));

        res.json({ devices: userDevices });
    } catch (error) {
        console.error('Error obteniendo dispositivos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Desvincular dispositivo
app.delete('/api/devices/:deviceId', authenticateToken, (req, res) => {
    try {
        const { deviceId } = req.params;
        const device = Array.from(devices.values()).find(d => 
            d.id === deviceId && d.userId === req.user.userId
        );

        if (!device) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }

        device.isActive = false;
        res.json({ message: 'Dispositivo desvinculado exitosamente' });

    } catch (error) {
        console.error('Error desvinculando dispositivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// --- ENDPOINTS DE STRIPE ---

// Crear sesión de checkout para suscripción
app.post('/api/stripe/create-checkout-session', authenticateToken, async (req, res) => {
    try {
        const user = users.get(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Crear o recuperar customer de Stripe
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id }
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
        }

        // Crear sesión de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Simulador Táctico Premium',
                        description: 'Acceso completo a todas las funciones del simulador'
                    },
                    unit_amount: 999, // $9.99 USD
                    recurring: {
                        interval: 'month'
                    }
                },
                quantity: 1
            }],
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
            metadata: {
                userId: user.id
            }
        });

        res.json({ sessionId: session.id });

    } catch (error) {
        console.error('Error creando sesión de checkout:', error);
        res.status(500).json({ error: 'Error creando sesión de pago' });
    }
});

// Webhook de Stripe
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Error verificando webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar eventos de Stripe
    switch (event.type) {
        case 'checkout.session.completed':
            handleCheckoutCompleted(event.data.object);
            break;
        case 'invoice.payment_succeeded':
            handlePaymentSucceeded(event.data.object);
            break;
        case 'customer.subscription.deleted':
            handleSubscriptionDeleted(event.data.object);
            break;
        default:
            console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({received: true});
});

// Handlers de eventos de Stripe
async function handleCheckoutCompleted(session) {
    const userId = session.metadata.userId;
    const user = users.get(userId);
    
    if (user) {
        user.isPremium = true;
        user.premiumExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
        console.log(`Usuario ${user.email} actualizado a premium`);
    }
}

async function handlePaymentSucceeded(invoice) {
    const customerId = invoice.customer;
    const user = Array.from(users.values()).find(u => u.stripeCustomerId === customerId);
    
    if (user) {
        user.isPremium = true;
        user.premiumExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
        console.log(`Pago exitoso para ${user.email}, premium extendido`);
    }
}

async function handleSubscriptionDeleted(subscription) {
    const customerId = subscription.customer;
    const user = Array.from(users.values()).find(u => u.stripeCustomerId === customerId);
    
    if (user) {
        user.isPremium = false;
        user.premiumExpires = null;
        console.log(`Suscripción cancelada para ${user.email}`);
    }
}

// --- ENDPOINTS DE ESTADO ---

// Verificar estado del usuario
app.get('/api/user/status', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userDevices = Array.from(devices.values())
            .filter(d => d.userId === user.id && d.isActive);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                isPremium: user.isPremium,
                premiumExpires: user.premiumExpires,
                canAccessPremium: user.isPremium && (!user.premiumExpires || new Date() < new Date(user.premiumExpires)),
                deviceCount: userDevices.length,
                maxDevices: user.isPremium ? 3 : 1
            }
        });

    } catch (error) {
        console.error('Error obteniendo estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint de bienvenida del API
app.get('/api', (req, res) => {
    res.json({
        message: '🚀 Simulador Táctico API',
        version: '1.0.0',
        endpoints: [
            'POST /api/auth/login',
            'POST /api/auth/register', 
            'GET /api/user/status',
            'GET /api/devices',
            'POST /api/stripe/create-checkout-session',
            'GET /api/health'
        ],
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        users: users.size,
        devices: devices.size
    });
});

// --- ENDPOINTS ESPECÍFICOS FREEMIUM ---

// Rutas de desarrollo eliminadas para producción

// Obtener configuración freemium
app.get('/api/config', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '..', 'config', 'freemium-config.json');
        
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            res.json(JSON.parse(configData));
        } else {
            // Devolver configuración por defecto si no existe el archivo
            res.json(getDefaultFreemiumConfig());
        }
    } catch (error) {
        console.error('Error reading freemium config:', error);
        res.status(500).json({ 
            error: 'Error loading configuration',
            defaultConfig: getDefaultFreemiumConfig()
        });
    }
});

// Guardar configuración freemium (solo para administradores)
app.post('/api/config', authenticateToken, (req, res) => {
    try {
        const { config, adminPassword } = req.body;
        
        // Verificar contraseña de administrador
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SimuladorTactico2025!';
        if (adminPassword !== ADMIN_PASSWORD) {
            return res.status(403).json({ error: 'Unauthorized admin access' });
        }
        
        const fs = require('fs');
        const path = require('path');
        const configDir = path.join(__dirname, '..', 'config');
        const configPath = path.join(configDir, 'freemium-config.json');
        
        // Crear directorio config si no existe
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        // Crear backup antes de guardar
        if (fs.existsSync(configPath)) {
            const backupPath = path.join(configDir, `freemium-config-backup-${Date.now()}.json`);
            fs.copyFileSync(configPath, backupPath);
        }
        
        // Validar configuración
        if (!config.plans || !config.categories) {
            return res.status(400).json({ error: 'Invalid configuration structure' });
        }
        
        // Actualizar timestamp
        config.lastUpdated = new Date().toISOString();
        
        // Guardar nueva configuración
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log('Freemium configuration updated by admin');
        
        res.json({ 
            success: true, 
            message: 'Configuration saved successfully',
            lastUpdated: config.lastUpdated
        });
        
    } catch (error) {
        console.error('Error saving freemium config:', error);
        res.status(500).json({ error: 'Error saving configuration' });
    }
});

// Función para obtener configuración por defecto
function getDefaultFreemiumConfig() {
    return {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        plans: {
            free: {
                name: 'Gratuito',
                price: 0,
                description: 'Plan básico para usuarios nuevos',
                features: {
                    maxLines: { value: 5, type: 'number', category: 'drawing', description: 'Máximo número de líneas por táctica' },
                    maxTactics: { value: 3, type: 'number', category: 'storage', description: 'Máximo número de tácticas guardadas' },
                    maxAnimationDuration: { value: 10, type: 'number', category: 'animation', description: 'Duración máxima de videos en segundos' },
                    export: { value: 'watermark', type: 'string', category: 'export', description: 'Tipo de exportación' },
                    audioRecording: { value: false, type: 'boolean', category: 'animation', description: 'Capacidad de grabar audio' }
                }
            },
            premium: {
                name: 'Premium',
                price: 9.99,
                description: 'Plan completo para usuarios regulares',
                features: {
                    maxLines: { value: -1, type: 'number', category: 'drawing', description: 'Líneas ilimitadas' },
                    maxTactics: { value: -1, type: 'number', category: 'storage', description: 'Tácticas ilimitadas' },
                    maxAnimationDuration: { value: 120, type: 'number', category: 'animation', description: 'Videos hasta 2 minutos' },
                    export: { value: 'hd', type: 'string', category: 'export', description: 'Exportación sin marca de agua' },
                    audioRecording: { value: true, type: 'boolean', category: 'animation', description: 'Grabación de audio profesional' }
                }
            }
        },
        categories: {
            drawing: { name: 'Herramientas de Dibujo', icon: '🎨', description: 'Limitaciones relacionadas con el sistema de dibujo' },
            animation: { name: 'Sistema de Animación', icon: '🎬', description: 'Limitaciones de videos y animaciones' },
            storage: { name: 'Almacenamiento', icon: '💾', description: 'Limitaciones de guardado y sincronización' },
            export: { name: 'Exportación', icon: '📤', description: 'Limitaciones de exportación y compartir' }
        },
        adminSettings: {
            allowConfigChanges: true,
            requireAdminAuth: true,
            logConfigChanges: true,
            backupBeforeChanges: true
        }
    };
}

// Obtener plan y características del usuario
app.get('/api/user/plan', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const userPlan = user.isPremium ? 'premium' : 'free';
        const features = planFeatures[userPlan];
        
        res.json({
            plan: userPlan,
            features: features,
            isPremium: user.isPremium,
            premiumExpires: user.premiumExpires,
            email: user.email
        });
    } catch (error) {
        console.error('Error getting user plan:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificar acceso a una característica específica
app.post('/api/feature/check', authenticateToken, (req, res) => {
    try {
        const { feature, value } = req.body;
        const user = users.get(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const userPlan = user.isPremium ? 'premium' : 'free';
        const userFeatures = planFeatures[userPlan];
        
        if (!userFeatures.hasOwnProperty(feature)) {
            return res.status(400).json({ error: 'Característica no válida' });
        }
        
        const featureValue = userFeatures[feature];
        let canAccess = true;
        let reason = null;
        
        // Verificar según el tipo de característica
        if (typeof featureValue === 'boolean') {
            canAccess = featureValue;
            reason = canAccess ? null : 'Feature disabled in current plan';
        } else if (typeof featureValue === 'number' && value !== undefined) {
            canAccess = featureValue === -1 || value <= featureValue;
            reason = canAccess ? null : `Limit exceeded: ${value} > ${featureValue}`;
        } else if (Array.isArray(featureValue) && value !== undefined) {
            canAccess = featureValue.includes(value);
            reason = canAccess ? null : `Value not allowed: ${value}`;
        } else if (featureValue === 'all') {
            canAccess = true;
        }
        
        res.json({
            canAccess: canAccess,
            feature: feature,
            currentPlan: userPlan,
            featureValue: featureValue,
            requestedValue: value,
            reason: reason,
            requiredPlan: canAccess ? null : getMinimumPlanFor(feature)
        });
    } catch (error) {
        console.error('Error checking feature:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Guardar táctica con verificación de límites
app.post('/api/tactics/save', authenticateToken, checkFeatureAccess('maxTactics'), (req, res) => {
    try {
        const { tacticData } = req.body;
        const user = users.get(req.user.userId);
        
        if (!user.savedTactics) {
            user.savedTactics = [];
        }
        
        // Verificar límite si no es ilimitado
        const maxTactics = req.userFeatures.maxTactics;
        if (maxTactics !== -1 && user.savedTactics.length >= maxTactics) {
            return res.status(403).json({
                error: 'Tactics limit reached',
                current: user.savedTactics.length,
                max: maxTactics,
                requiredPlan: 'premium'
            });
        }
        
        // Guardar táctica
        const tacticId = `tactic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTactic = {
            id: tacticId,
            data: tacticData,
            createdAt: new Date(),
            userId: user.id
        };
        
        user.savedTactics.push(newTactic);
        
        res.json({
            success: true,
            tacticId: tacticId,
            message: 'Táctica guardada exitosamente',
            tacticsCount: user.savedTactics.length,
            maxTactics: maxTactics
        });
    } catch (error) {
        console.error('Error saving tactic:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Validar animación con verificación de límites
app.post('/api/animation/validate', authenticateToken, (req, res) => {
    try {
        const { duration, frames, hasAudio } = req.body;
        const user = users.get(req.user.userId);
        const userPlan = user.isPremium ? 'premium' : 'free';
        const features = planFeatures[userPlan];
        
        const violations = [];
        
        // Verificar duración
        if (features.maxAnimationDuration !== -1 && duration > features.maxAnimationDuration) {
            violations.push({
                feature: 'maxAnimationDuration',
                limit: features.maxAnimationDuration,
                requested: duration,
                message: `Duración máxima: ${features.maxAnimationDuration} segundos`
            });
        }
        
        // Verificar frames
        if (features.maxAnimationFrames !== -1 && frames > features.maxAnimationFrames) {
            violations.push({
                feature: 'maxAnimationFrames',
                limit: features.maxAnimationFrames,
                requested: frames,
                message: `Frames máximos: ${features.maxAnimationFrames}`
            });
        }
        
        // Verificar audio
        if (hasAudio && !features.audioRecording) {
            violations.push({
                feature: 'audioRecording',
                message: 'Audio no disponible en plan gratuito'
            });
        }
        
        const isValid = violations.length === 0;
        
        res.json({
            isValid: isValid,
            violations: violations,
            currentPlan: userPlan,
            requiredPlan: isValid ? null : 'premium'
        });
    } catch (error) {
        console.error('Error validating animation:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener estadísticas de uso del usuario
app.get('/api/user/usage', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const userPlan = user.isPremium ? 'premium' : 'free';
        const features = planFeatures[userPlan];
        
        // Calcular estadísticas actuales
        const savedTactics = user.savedTactics || [];
        const deviceCount = Array.from(devices.values())
            .filter(device => device.userId === user.id).length;
        
        const usage = {
            plan: userPlan,
            tactics: {
                current: savedTactics.length,
                max: features.maxTactics,
                percentage: features.maxTactics === -1 ? 0 : (savedTactics.length / features.maxTactics) * 100
            },
            devices: {
                current: deviceCount,
                max: features.maxDevices,
                percentage: features.maxDevices === -1 ? 0 : (deviceCount / features.maxDevices) * 100
            },
            lastActivity: user.lastActivity,
            premiumExpires: user.premiumExpires,
            isPremium: user.isPremium
        };
        
        res.json(usage);
    } catch (error) {
        console.error('Error getting user usage:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Freemium corriendo en puerto ${PORT}`);
    console.log(` API Base: http://localhost:${PORT}/api`);
});

// Datos de prueba (solo para desarrollo)
if (process.env.NODE_ENV !== 'production') {
    // Crear usuario de prueba
    const testUser = new User('test@simulador.com', 'password123');
    testUser.isPremium = true;
    testUser.premiumExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    users.set(testUser.id, testUser);
    
    console.log('👤 Usuario de prueba creado: test@simulador.com / password123');
}

module.exports = app;
