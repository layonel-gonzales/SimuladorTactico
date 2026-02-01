/**
 * ==========================================
 * 💳 PAYMENT ROUTES - Rutas de Pagos
 * ==========================================
 */

const express = require('express');
const PaymentModel = require('../models/paymentModel');
const UserModel = require('../models/userModel');
const { authenticateToken } = require('./authRoutes');
const { query } = require('../database');

const router = express.Router();

/**
 * GET /api/payments/plans - Obtener planes disponibles
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = await PaymentModel.getPlans();
        res.json({ plans });
    } catch (error) {
        console.error('[Payments] Error obteniendo planes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/payments/methods - Obtener métodos de pago del usuario
 */
router.get('/methods', authenticateToken, async (req, res) => {
    try {
        const methods = await PaymentModel.getPaymentMethods(req.user.userId);
        res.json({ methods });
    } catch (error) {
        console.error('[Payments] Error obteniendo métodos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /api/payments/methods - Agregar método de pago
 */
router.post('/methods', authenticateToken, async (req, res) => {
    try {
        const {
            tipoMetodoId, ultimosDigitos, marcaTarjeta, nombreTitular,
            mesExpiracion, anioExpiracion, stripePaymentMethodId,
            ciudad, pais, predeterminado
        } = req.body;
        
        const method = await PaymentModel.createPaymentMethod({
            usuarioId: req.user.userId,
            tipoMetodoId,
            ultimosDigitos,
            marcaTarjeta,
            nombreTitular,
            mesExpiracion,
            anioExpiracion,
            stripeCustomerId: `cus_${req.user.userId}`,
            stripePaymentMethodId,
            ciudad,
            pais,
            predeterminado
        });
        
        res.status(201).json({
            message: 'Método de pago agregado',
            method
        });
        
    } catch (error) {
        console.error('[Payments] Error agregando método:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/payments/subscription - Obtener suscripción activa
 */
router.get('/subscription', authenticateToken, async (req, res) => {
    try {
        const subscription = await PaymentModel.getActiveSubscription(req.user.userId);
        res.json({ subscription });
    } catch (error) {
        console.error('[Payments] Error obteniendo suscripción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /api/payments/subscribe - Crear suscripción / Upgrade
 */
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const { planId, metodoPagoId } = req.body;
        
        if (!planId || !metodoPagoId) {
            return res.status(400).json({
                error: 'planId y metodoPagoId son requeridos'
            });
        }
        
        // Obtener precio del plan
        const plansResult = await query(`
            SELECT * FROM Planes WHERE PlanId = @planId
        `, { planId });
        
        if (plansResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }
        
        const plan = plansResult.recordset[0];
        
        // Crear suscripción
        const fechaProximoPago = new Date();
        fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1);
        
        const subscription = await PaymentModel.createSubscription({
            usuarioId: req.user.userId,
            planId,
            metodoPagoId,
            stripeSubscriptionId: `sub_${Date.now()}`,
            fechaProximoPago
        });
        
        // Registrar pago
        const payment = await PaymentModel.createPayment({
            usuarioId: req.user.userId,
            suscripcionId: subscription.SuscripcionId,
            metodoPagoId,
            monto: plan.Precio,
            concepto: `Suscripción ${plan.Nombre}`,
            descripcion: `Pago mensual Plan ${plan.Nombre}`,
            stripePaymentIntentId: `pi_${Date.now()}`,
            numeroFactura: `INV-${Date.now()}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        // Log de actividad
        await query(`
            INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, DatosJson, IpAddress)
            VALUES (@userId, 'upgrade', @desc, @json, @ip)
        `, {
            userId: req.user.userId,
            desc: `Upgrade a ${plan.Nombre}`,
            json: JSON.stringify({ planId, precio: plan.Precio }),
            ip: req.ip
        });
        
        // Obtener features actualizadas
        const features = await UserModel.getUserPlanFeatures(req.user.userId);
        
        res.status(201).json({
            message: `Suscripción a ${plan.Nombre} exitosa`,
            subscription,
            payment,
            features
        });
        
    } catch (error) {
        console.error('[Payments] Error en suscripción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /api/payments/cancel - Cancelar suscripción
 */
router.post('/cancel', authenticateToken, async (req, res) => {
    try {
        const { motivo } = req.body;
        
        const subscription = await PaymentModel.getActiveSubscription(req.user.userId);
        
        if (!subscription || subscription.PlanCodigo === 'free') {
            return res.status(400).json({
                error: 'No hay suscripción activa para cancelar'
            });
        }
        
        const cancelled = await PaymentModel.cancelSubscription(
            subscription.SuscripcionId,
            motivo || 'Cancelado por usuario'
        );
        
        // Log de actividad
        await query(`
            INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, DatosJson, IpAddress)
            VALUES (@userId, 'cancel_subscription', @desc, @json, @ip)
        `, {
            userId: req.user.userId,
            desc: 'Suscripción cancelada',
            json: JSON.stringify({ motivo }),
            ip: req.ip
        });
        
        res.json({
            message: 'Suscripción cancelada. Ahora tienes el plan gratuito.',
            subscription: cancelled
        });
        
    } catch (error) {
        console.error('[Payments] Error cancelando:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/payments/history - Historial de pagos
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const history = await PaymentModel.getPaymentHistory(
            req.user.userId,
            page,
            limit
        );
        
        res.json(history);
        
    } catch (error) {
        console.error('[Payments] Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/payments/features - Obtener características del plan actual
 */
router.get('/features', authenticateToken, async (req, res) => {
    try {
        const features = await UserModel.getUserPlanFeatures(req.user.userId);
        
        if (!features) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({ features });
        
    } catch (error) {
        console.error('[Payments] Error obteniendo features:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
