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

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'simulador_tactico_secret_2025';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        users: users.size,
        devices: devices.size
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Freemium corriendo en puerto ${PORT}`);
    console.log(`📊 Panel de admin: http://localhost:${PORT}/admin`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
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
