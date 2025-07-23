// Backend seguro para manejo de licencias y pagos
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware de seguridad
const licenseValidator = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 validaciones por IP cada 15 min
    message: 'Demasiadas validaciones de licencia desde esta IP'
});

app.use(express.json({ limit: '10mb' }));
app.use('/validate-license', licenseValidator);

// Clave secreta para JWT (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-super-secreta-aqui';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'clave-encriptacion-32-caracteres';

class LicenseService {
    constructor() {
        this.activeLicenses = new Map(); // En producción usar base de datos
    }

    // Generar licencia después de pago exitoso
    generateLicense(email, plan, stripeCustomerId) {
        const now = new Date();
        const expires = new Date();
        
        // Configurar expiración según plan
        if (plan === 'monthly') {
            expires.setMonth(expires.getMonth() + 1);
        } else if (plan === 'yearly') {
            expires.setFullYear(expires.getFullYear() + 1);
        }

        const licenseData = {
            id: this.generateUniqueId(),
            email: email,
            plan: plan,
            created: now.toISOString(),
            expires: expires.toISOString(),
            stripeCustomerId: stripeCustomerId,
            features: this.getPlanFeatures(plan),
            checksum: null
        };

        // Generar checksum para validar integridad
        licenseData.checksum = this.generateChecksum(licenseData);
        
        return licenseData;
    }

    generateUniqueId() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateChecksum(licenseData) {
        const { checksum, ...dataToHash } = licenseData;
        return crypto
            .createHmac('sha256', JWT_SECRET)
            .update(JSON.stringify(dataToHash))
            .digest('hex');
    }

    getPlanFeatures(plan) {
        const features = {
            free: {
                maxTactics: 3,
                maxAnimationFrames: 3,
                formations: ['4-4-2', '4-3-3'],
                export: 'watermark',
                realPlayers: false,
                cloudSave: false
            },
            monthly: {
                maxTactics: -1,
                maxAnimationFrames: -1,
                formations: 'all',
                export: 'hd',
                realPlayers: true,
                cloudSave: true
            },
            yearly: {
                maxTactics: -1,
                maxAnimationFrames: -1,
                formations: 'all',
                export: 'hd',
                realPlayers: true,
                cloudSave: true,
                priority_support: true
            }
        };
        
        return features[plan] || features.free;
    }

    validateLicense(licenseData, clientFingerprint) {
        try {
            // Verificar integridad de la licencia
            const { checksum, ...dataToVerify } = licenseData;
            const expectedChecksum = this.generateChecksum({ ...dataToVerify, checksum: null });
            
            if (checksum !== expectedChecksum) {
                return { valid: false, reason: 'Licencia corrupta o modificada' };
            }

            // Verificar expiración
            if (licenseData.expires && new Date() > new Date(licenseData.expires)) {
                return { valid: false, reason: 'Licencia expirada' };
            }

            // En producción: verificar contra base de datos
            if (!this.activeLicenses.has(licenseData.id)) {
                // Simular validación de BD
                this.activeLicenses.set(licenseData.id, {
                    ...licenseData,
                    lastValidated: new Date().toISOString(),
                    validationCount: 1
                });
            } else {
                // Actualizar contador de validaciones
                const stored = this.activeLicenses.get(licenseData.id);
                stored.lastValidated = new Date().toISOString();
                stored.validationCount = (stored.validationCount || 0) + 1;
            }

            return {
                valid: true,
                license: {
                    plan: licenseData.plan,
                    expires: licenseData.expires,
                    features: licenseData.features
                }
            };

        } catch (error) {
            console.error('Error validando licencia:', error);
            return { valid: false, reason: 'Error interno de validación' };
        }
    }

    // Encriptar datos sensibles
    encrypt(text) {
        const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(encryptedText) {
        const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

const licenseService = new LicenseService();

// ENDPOINTS DE LA API

// Crear sesión de pago (Stripe Checkout)
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { planType, email } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: process.env[`STRIPE_PRICE_${planType.toUpperCase()}`],
                quantity: 1,
            }],
            success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/cancel`,
            customer_email: email,
            metadata: {
                planType: planType,
                timestamp: Date.now().toString()
            }
        });

        res.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Error creando sesión de pago:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Validar licencia
app.post('/validate-license', (req, res) => {
    try {
        const { license, fingerprint, timestamp } = req.body;
        const clientKey = req.headers['x-client-key'];

        // Verificar timestamp (no más de 5 minutos de diferencia)
        const timeDiff = Math.abs(Date.now() - timestamp);
        if (timeDiff > 5 * 60 * 1000) {
            return res.status(400).json({ 
                valid: false, 
                reason: 'Solicitud expirada' 
            });
        }

        const validation = licenseService.validateLicense(license, fingerprint);
        res.json(validation);

    } catch (error) {
        console.error('Error en validación:', error);
        res.status(500).json({ 
            valid: false, 
            reason: 'Error interno del servidor' 
        });
    }
});

// Activar licencia después de pago exitoso
app.post('/activate-license', async (req, res) => {
    try {
        const { token, email, fingerprint } = req.body;

        // En producción: verificar token contra base de datos de compras
        // Por ahora simulamos validación exitosa
        
        const license = licenseService.generateLicense(email, 'monthly', 'cus_example');
        
        res.json({
            success: true,
            license: license,
            message: 'Licencia activada exitosamente'
        });

    } catch (error) {
        console.error('Error activando licencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Webhook de Stripe para procesar pagos completados
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Procesar eventos de Stripe
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Pago completado:', session.id);
            
            // Generar y guardar licencia
            const license = licenseService.generateLicense(
                session.customer_details.email,
                session.metadata.planType,
                session.customer
            );
            
            // En producción: guardar en base de datos
            licenseService.activeLicenses.set(license.id, license);
            
            // Enviar email con licencia al usuario (opcional)
            // await sendLicenseEmail(session.customer_details.email, license);
            
            break;

        case 'customer.subscription.deleted':
            console.log('Suscripción cancelada');
            // Marcar licencia como inactiva
            break;

        default:
            console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        licenses: licenseService.activeLicenses.size
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de licencias corriendo en puerto ${PORT}`);
    console.log(`🔐 Modo: ${process.env.NODE_ENV || 'development'}`);
});
