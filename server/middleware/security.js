/**
 * ==========================================
 * 🔒 SECURITY MIDDLEWARE
 * ==========================================
 * Middleware de seguridad centralizado
 * ==========================================
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

/**
 * Configuración de Helmet (Headers de Seguridad)
 */
const helmetConfig = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "http://localhost:*", "https://api.stripe.com"],
            frameSrc: ["'self'", "https://js.stripe.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    // Previene clickjacking
    frameguard: { action: 'deny' },
    // Oculta el header X-Powered-By
    hidePoweredBy: true,
    // Previene MIME sniffing
    noSniff: true,
    // Protección XSS del navegador
    xssFilter: true,
    // HSTS (solo en producción)
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
    } : false,
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Rate Limiter General (API)
 * 100 requests por 15 minutos
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Demasiadas solicitudes. Por favor, intente más tarde.',
        retryAfter: 'Intente nuevamente en 15 minutos'
    },
    standardHeaders: true, // Incluye headers RateLimit-*
    legacyHeaders: false,
    // Skip en desarrollo si se desea
    skip: (req) => process.env.NODE_ENV === 'development' && req.path === '/api/health',
    // Handler personalizado
    handler: (req, res) => {
        console.warn(`[Security] Rate limit excedido - IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
            error: 'Demasiadas solicitudes',
            message: 'Has excedido el límite de solicitudes permitidas',
            retryAfter: Math.ceil(15 * 60) // segundos
        });
    }
});

/**
 * Rate Limiter para Login (más estricto)
 * 5 intentos por 15 minutos por IP
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
    message: {
        error: 'Demasiados intentos de inicio de sesión',
        message: 'Cuenta temporalmente bloqueada. Intente en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Key generator basado en IP + email (si está disponible)
    keyGenerator: (req) => {
        const email = req.body?.email || '';
        return `${req.ip}-${email.toLowerCase()}`;
    },
    handler: (req, res) => {
        console.warn(`[Security] Login rate limit - IP: ${req.ip}, Email: ${req.body?.email || 'N/A'}`);
        res.status(429).json({
            error: 'Demasiados intentos',
            message: 'Has excedido el límite de intentos de inicio de sesión. Intenta en 15 minutos.',
            retryAfter: 900
        });
    }
});

/**
 * Rate Limiter para Registro
 * 3 registros por hora por IP
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3,
    message: {
        error: 'Límite de registros excedido',
        message: 'Solo puedes crear 3 cuentas por hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`[Security] Register rate limit - IP: ${req.ip}`);
        res.status(429).json({
            error: 'Límite de registros excedido',
            message: 'Has alcanzado el límite de registros. Intenta en 1 hora.',
            retryAfter: 3600
        });
    }
});

/**
 * Rate Limiter para API de Pagos
 * 10 intentos por hora
 */
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10,
    message: {
        error: 'Límite de operaciones de pago excedido'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Middleware para sanitizar parámetros
 * Previene HTTP Parameter Pollution
 */
const parameterPollutionProtection = hpp({
    whitelist: ['sort', 'filter', 'fields'] // Parámetros permitidos como array
});

/**
 * Middleware para validar Content-Type en POST/PUT
 */
const validateContentType = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            // Permitir form-urlencoded para webhooks
            if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                return next();
            }
            // Solo para rutas API que requieren JSON
            if (req.path.startsWith('/api/') && !req.path.includes('webhook')) {
                return res.status(415).json({
                    error: 'Content-Type no soportado',
                    message: 'Se requiere application/json'
                });
            }
        }
    }
    next();
};

/**
 * Middleware para logging de seguridad
 */
const securityLogger = (req, res, next) => {
    // Log de requests sospechosos
    const suspiciousPatterns = [
        /(\.\.|\/\/)/,        // Path traversal
        /<script/i,           // XSS básico
        /union.*select/i,     // SQL injection básico
        /javascript:/i,       // JavaScript protocol
        /on\w+=/i            // Event handlers
    ];

    const fullUrl = req.originalUrl || req.url;
    const body = JSON.stringify(req.body || {});
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(fullUrl) || pattern.test(body)) {
            console.warn(`[Security] ⚠️ Patrón sospechoso detectado:`, {
                ip: req.ip,
                method: req.method,
                url: fullUrl,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
            break;
        }
    }
    
    next();
};

/**
 * Middleware para sanitizar inputs básicos
 */
const sanitizeInputs = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        sanitizeObject(req.params);
    }
    next();
};

/**
 * Función auxiliar para sanitizar objetos recursivamente
 */
function sanitizeObject(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            // Eliminar caracteres peligrosos básicos
            obj[key] = obj[key]
                .replace(/[<>]/g, '') // Prevenir tags HTML básicos
                .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    }
}

/**
 * Headers de seguridad adicionales personalizados
 */
const additionalSecurityHeaders = (req, res, next) => {
    // Prevenir caching de datos sensibles
    if (req.path.includes('/auth/') || req.path.includes('/payments/')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    
    // Header personalizado para identificar API
    res.set('X-API-Version', '1.0.0');
    
    next();
};

module.exports = {
    helmetConfig,
    generalLimiter,
    loginLimiter,
    registerLimiter,
    paymentLimiter,
    parameterPollutionProtection,
    validateContentType,
    securityLogger,
    sanitizeInputs,
    additionalSecurityHeaders
};
