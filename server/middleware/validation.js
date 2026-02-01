/**
 * ==========================================
 * ✅ VALIDATION MIDDLEWARE
 * ==========================================
 * Validación de inputs con express-validator
 * ==========================================
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        
        console.warn('[Validation] Errores de validación:', {
            ip: req.ip,
            path: req.path,
            errors: errorMessages
        });
        
        return res.status(400).json({
            error: 'Error de validación',
            details: errorMessages
        });
    }
    next();
};

/**
 * Validaciones para registro de usuario
 */
const validateRegister = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Formato de email inválido')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('El email es demasiado largo'),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .isLength({ max: 128 }).withMessage('La contraseña es demasiado larga')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una minúscula')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),
    
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    
    body('apellido')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
    
    body('nombreUsuario')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
    handleValidationErrors
];

/**
 * Validaciones para login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Formato de email inválido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ max: 128 }).withMessage('Contraseña inválida'),
    
    handleValidationErrors
];

/**
 * Validaciones para método de pago
 */
const validatePaymentMethod = [
    body('tipoMetodoId')
        .notEmpty().withMessage('El tipo de método es requerido')
        .isInt({ min: 1 }).withMessage('Tipo de método inválido'),
    
    body('ultimosDigitos')
        .optional()
        .isLength({ min: 4, max: 4 }).withMessage('Los últimos 4 dígitos son requeridos')
        .matches(/^\d{4}$/).withMessage('Formato de dígitos inválido'),
    
    body('marcaTarjeta')
        .optional()
        .trim()
        .isIn(['visa', 'mastercard', 'amex', 'discover']).withMessage('Marca de tarjeta inválida'),
    
    body('nombreTitular')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Nombre del titular inválido')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    
    body('mesExpiracion')
        .optional()
        .isInt({ min: 1, max: 12 }).withMessage('Mes de expiración inválido'),
    
    body('anioExpiracion')
        .optional()
        .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
        .withMessage('Año de expiración inválido'),
    
    handleValidationErrors
];

/**
 * Validaciones para suscripción
 */
const validateSubscription = [
    body('planId')
        .notEmpty().withMessage('El plan es requerido')
        .isInt({ min: 1 }).withMessage('Plan inválido'),
    
    body('metodoPagoId')
        .notEmpty().withMessage('El método de pago es requerido')
        .isInt({ min: 1 }).withMessage('Método de pago inválido'),
    
    handleValidationErrors
];

/**
 * Validaciones para IDs en parámetros
 */
const validateIdParam = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID inválido'),
    
    handleValidationErrors
];

/**
 * Validaciones para paginación
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Número de página inválido'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Límite inválido (máximo 100)'),
    
    handleValidationErrors
];

/**
 * Sanitizador personalizado para texto
 */
const sanitizeText = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/<[^>]*>/g, '')  // Eliminar tags HTML
        .replace(/[<>"'`;]/g, '') // Eliminar caracteres peligrosos
        .trim();
};

/**
 * Validación de cambio de contraseña
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty().withMessage('La contraseña actual es requerida'),
    
    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[a-z]/).withMessage('Debe contener al menos una minúscula')
        .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('Debe contener al menos un número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Debe contener al menos un carácter especial')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('La nueva contraseña debe ser diferente a la actual');
            }
            return true;
        }),
    
    body('confirmPassword')
        .notEmpty().withMessage('La confirmación es requerida')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRegister,
    validateLogin,
    validatePaymentMethod,
    validateSubscription,
    validateIdParam,
    validatePagination,
    validatePasswordChange,
    sanitizeText
};
