/**
 * ==========================================
 * 💳 PAYMENT MODEL - Modelo de Pagos
 * ==========================================
 * Operaciones para pagos y suscripciones
 * ==========================================
 */

const { query } = require('../database');

class PaymentModel {
    
    /**
     * Crear método de pago
     */
    static async createPaymentMethod(data) {
        const {
            usuarioId, tipoMetodoId, ultimosDigitos, marcaTarjeta, nombreTitular,
            mesExpiracion, anioExpiracion, stripeCustomerId, stripePaymentMethodId,
            ciudad, pais, predeterminado = false
        } = data;
        
        // Si es predeterminado, quitar el predeterminado de otros
        if (predeterminado) {
            await query(`
                UPDATE MetodosPago SET Predeterminado = 0 WHERE UsuarioId = @usuarioId
            `, { usuarioId });
        }
        
        const result = await query(`
            INSERT INTO MetodosPago (
                UsuarioId, TipoMetodoId, UltimosDigitos, MarcaTarjeta, NombreTitular,
                MesExpiracion, AnioExpiracion, StripeCustomerId, StripePaymentMethodId,
                Ciudad, Pais, Predeterminado
            )
            OUTPUT INSERTED.*
            VALUES (
                @usuarioId, @tipoMetodoId, @ultimosDigitos, @marcaTarjeta, @nombreTitular,
                @mesExpiracion, @anioExpiracion, @stripeCustomerId, @stripePaymentMethodId,
                @ciudad, @pais, @predeterminado
            )
        `, {
            usuarioId, tipoMetodoId, ultimosDigitos, marcaTarjeta, nombreTitular,
            mesExpiracion, anioExpiracion, stripeCustomerId, stripePaymentMethodId,
            ciudad, pais, predeterminado
        });
        
        return result.recordset[0];
    }
    
    /**
     * Obtener métodos de pago del usuario
     */
    static async getPaymentMethods(usuarioId) {
        const result = await query(`
            SELECT 
                mp.MetodoPagoId, mp.UltimosDigitos, mp.MarcaTarjeta, mp.NombreTitular,
                mp.MesExpiracion, mp.AnioExpiracion, mp.Predeterminado, mp.Activo,
                tmp.Nombre as TipoNombre, tmp.Codigo as TipoCodigo
            FROM MetodosPago mp
            INNER JOIN TiposMetodoPago tmp ON mp.TipoMetodoId = tmp.TipoMetodoId
            WHERE mp.UsuarioId = @usuarioId AND mp.Activo = 1
            ORDER BY mp.Predeterminado DESC, mp.FechaCreacion DESC
        `, { usuarioId });
        
        return result.recordset;
    }
    
    /**
     * Crear suscripción
     */
    static async createSubscription(data) {
        const {
            usuarioId, planId, metodoPagoId, stripeSubscriptionId,
            fechaProximoPago, enPeriodoPrueba = false, fechaFinPrueba
        } = data;
        
        // Cancelar suscripciones anteriores activas
        await query(`
            UPDATE Suscripciones 
            SET Estado = 'cancelled', FechaCancelacion = GETDATE(), FechaModificacion = GETDATE()
            WHERE UsuarioId = @usuarioId AND Estado = 'active'
        `, { usuarioId });
        
        const result = await query(`
            INSERT INTO Suscripciones (
                UsuarioId, PlanId, MetodoPagoId, StripeSubscriptionId,
                FechaInicio, FechaProximoPago, EnPeriodoPrueba, FechaFinPrueba, Estado
            )
            OUTPUT INSERTED.*
            VALUES (
                @usuarioId, @planId, @metodoPagoId, @stripeSubscriptionId,
                GETDATE(), @fechaProximoPago, @enPeriodoPrueba, @fechaFinPrueba, 'active'
            )
        `, {
            usuarioId, planId, metodoPagoId, stripeSubscriptionId,
            fechaProximoPago, enPeriodoPrueba, fechaFinPrueba
        });
        
        // Actualizar plan del usuario
        await query(`
            UPDATE Usuarios SET PlanId = @planId, FechaModificacion = GETDATE()
            WHERE UsuarioId = @usuarioId
        `, { usuarioId, planId });
        
        return result.recordset[0];
    }
    
    /**
     * Obtener suscripción activa del usuario
     */
    static async getActiveSubscription(usuarioId) {
        const result = await query(`
            SELECT 
                s.SuscripcionId, s.FechaInicio, s.FechaFin, s.FechaProximoPago,
                s.EnPeriodoPrueba, s.FechaFinPrueba, s.Estado,
                p.PlanId, p.Nombre as PlanNombre, p.Codigo as PlanCodigo, p.Precio as PlanPrecio
            FROM Suscripciones s
            INNER JOIN Planes p ON s.PlanId = p.PlanId
            WHERE s.UsuarioId = @usuarioId AND s.Estado IN ('active', 'trialing')
            ORDER BY s.FechaCreacion DESC
        `, { usuarioId });
        
        return result.recordset[0] || null;
    }
    
    /**
     * Registrar pago
     */
    static async createPayment(data) {
        const {
            usuarioId, suscripcionId, metodoPagoId, monto, montoImpuesto = 0,
            concepto, descripcion, stripePaymentIntentId, stripeChargeId,
            stripeInvoiceId, numeroFactura, ipAddress, userAgent
        } = data;
        
        const montoTotal = monto + montoImpuesto;
        
        const result = await query(`
            INSERT INTO Pagos (
                UsuarioId, SuscripcionId, MetodoPagoId, EstadoPagoId,
                Monto, MontoImpuesto, MontoTotal, Concepto, Descripcion,
                StripePaymentIntentId, StripeChargeId, StripeInvoiceId,
                NumeroFactura, FechaPago, IpAddress, UserAgent
            )
            OUTPUT INSERTED.*
            VALUES (
                @usuarioId, @suscripcionId, @metodoPagoId, 2,
                @monto, @montoImpuesto, @montoTotal, @concepto, @descripcion,
                @stripePaymentIntentId, @stripeChargeId, @stripeInvoiceId,
                @numeroFactura, GETDATE(), @ipAddress, @userAgent
            )
        `, {
            usuarioId, suscripcionId, metodoPagoId, monto, montoImpuesto, montoTotal,
            concepto, descripcion, stripePaymentIntentId, stripeChargeId,
            stripeInvoiceId, numeroFactura, ipAddress, userAgent
        });
        
        return result.recordset[0];
    }
    
    /**
     * Obtener historial de pagos
     */
    static async getPaymentHistory(usuarioId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        const result = await query(`
            SELECT 
                p.PagoId, p.Monto, p.MontoImpuesto, p.MontoTotal, p.MonedaCodigo,
                p.Concepto, p.Descripcion, p.NumeroFactura, p.FechaPago,
                p.Reembolsado, p.MontoReembolsado, p.FechaReembolso,
                ep.Nombre as EstadoNombre, ep.Codigo as EstadoCodigo, ep.ColorHex,
                mp.UltimosDigitos, mp.MarcaTarjeta
            FROM Pagos p
            INNER JOIN EstadosPago ep ON p.EstadoPagoId = ep.EstadoPagoId
            LEFT JOIN MetodosPago mp ON p.MetodoPagoId = mp.MetodoPagoId
            WHERE p.UsuarioId = @usuarioId
            ORDER BY p.FechaPago DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `, { usuarioId, offset, limit });
        
        // Total de pagos
        const countResult = await query(`
            SELECT COUNT(*) as total FROM Pagos WHERE UsuarioId = @usuarioId
        `, { usuarioId });
        
        return {
            payments: result.recordset,
            total: countResult.recordset[0].total,
            page,
            limit
        };
    }
    
    /**
     * Obtener todos los planes disponibles
     */
    static async getPlans() {
        const result = await query(`
            SELECT * FROM Planes WHERE Activo = 1 ORDER BY Precio ASC
        `);
        
        return result.recordset;
    }
    
    /**
     * Cancelar suscripción
     */
    static async cancelSubscription(suscripcionId, motivo) {
        const result = await query(`
            UPDATE Suscripciones 
            SET Estado = 'cancelled', 
                FechaCancelacion = GETDATE(), 
                MotivoCancelacion = @motivo,
                CanceladoPorUsuario = 1,
                FechaModificacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE SuscripcionId = @suscripcionId
        `, { suscripcionId, motivo });
        
        // Cambiar usuario a plan gratuito
        if (result.recordset.length > 0) {
            const usuarioId = result.recordset[0].UsuarioId;
            await query(`
                UPDATE Usuarios SET PlanId = 1, FechaModificacion = GETDATE()
                WHERE UsuarioId = @usuarioId
            `, { usuarioId });
            
            // Crear suscripción gratuita
            await query(`
                INSERT INTO Suscripciones (UsuarioId, PlanId, FechaInicio, Estado)
                VALUES (@usuarioId, 1, GETDATE(), 'active')
            `, { usuarioId });
        }
        
        return result.recordset[0];
    }
    
    /**
     * Procesar reembolso
     */
    static async refundPayment(pagoId, monto, motivo) {
        const result = await query(`
            UPDATE Pagos 
            SET Reembolsado = 1, 
                MontoReembolsado = @monto, 
                FechaReembolso = GETDATE(),
                MotivoReembolso = @motivo,
                EstadoPagoId = 4
            OUTPUT INSERTED.*
            WHERE PagoId = @pagoId
        `, { pagoId, monto, motivo });
        
        return result.recordset[0];
    }
}

module.exports = PaymentModel;
