/**
 * ==========================================
 * 👤 USER MODEL - Modelo de Usuario
 * ==========================================
 * Operaciones CRUD para usuarios
 * ==========================================
 */

const { query } = require('../database');
const bcrypt = require('bcrypt');

class UserModel {
    
    /**
     * Crear nuevo usuario
     */
    static async create(userData) {
        const { email, password, nombre, apellido, nombreUsuario } = userData;
        
        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const result = await query(`
            INSERT INTO Usuarios (Email, PasswordHash, Nombre, Apellido, NombreUsuario, PlanId, FechaRegistro)
            OUTPUT INSERTED.UsuarioId, INSERTED.Email, INSERTED.Nombre, INSERTED.Apellido, INSERTED.PlanId, INSERTED.FechaRegistro
            VALUES (@email, @passwordHash, @nombre, @apellido, @nombreUsuario, 1, GETDATE())
        `, {
            email,
            passwordHash,
            nombre: nombre || null,
            apellido: apellido || null,
            nombreUsuario: nombreUsuario || null
        });
        
        // Crear suscripción gratuita automáticamente
        if (result.recordset.length > 0) {
            const userId = result.recordset[0].UsuarioId;
            await query(`
                INSERT INTO Suscripciones (UsuarioId, PlanId, FechaInicio, Estado)
                VALUES (@userId, 1, GETDATE(), 'active')
            `, { userId });
        }
        
        return result.recordset[0];
    }
    
    /**
     * Buscar usuario por email
     */
    static async findByEmail(email) {
        const result = await query(`
            SELECT 
                u.UsuarioId, u.Email, u.PasswordHash, u.Nombre, u.Apellido, 
                u.NombreUsuario, u.FotoUrl, u.EmailVerificado, u.PlanId,
                u.FechaRegistro, u.UltimoAcceso, u.Activo, u.Bloqueado,
                p.Nombre as PlanNombre, p.Codigo as PlanCodigo, p.Precio as PlanPrecio
            FROM Usuarios u
            INNER JOIN Planes p ON u.PlanId = p.PlanId
            WHERE u.Email = @email AND u.Activo = 1
        `, { email });
        
        return result.recordset[0] || null;
    }
    
    /**
     * Buscar usuario por ID
     */
    static async findById(userId) {
        const result = await query(`
            SELECT 
                u.UsuarioId, u.Email, u.Nombre, u.Apellido, 
                u.NombreUsuario, u.FotoUrl, u.EmailVerificado, u.PlanId,
                u.FechaRegistro, u.UltimoAcceso, u.Activo,
                p.Nombre as PlanNombre, p.Codigo as PlanCodigo, p.Precio as PlanPrecio,
                p.MaxJugadores, p.MaxLineas, p.MaxFramesAnimacion, p.MaxDuracionVideo,
                p.MaxJugadoresPersonalizados, p.MaxDispositivos,
                p.TodasFormaciones, p.TodosColores, p.TodosEstilosCancha, p.TodosEstilosTarjeta,
                p.GrabacionAudio, p.ExportacionHD, p.CompartirRedes, p.ExportacionJSON,
                p.MultiplesEquipos, p.AccesoAPI, p.SoportePrioritario, p.MaxColaboradores
            FROM Usuarios u
            INNER JOIN Planes p ON u.PlanId = p.PlanId
            WHERE u.UsuarioId = @userId AND u.Activo = 1
        `, { userId });
        
        return result.recordset[0] || null;
    }
    
    /**
     * Verificar contraseña
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    
    /**
     * Fake password check para prevenir timing attacks
     * Simula el tiempo de verificación cuando el usuario no existe
     */
    static async fakePasswordCheck() {
        const fakeHash = '$2b$10$abcdefghijklmnopqrstuvwxyz012345678901234567890';
        await bcrypt.compare('fakepassword', fakeHash).catch(() => {});
    }
    
    /**
     * Actualizar último acceso
     */
    static async updateLastAccess(userId) {
        await query(`
            UPDATE Usuarios 
            SET UltimoAcceso = GETDATE(), FechaModificacion = GETDATE()
            WHERE UsuarioId = @userId
        `, { userId });
    }
    
    /**
     * Actualizar plan del usuario
     */
    static async updatePlan(userId, planId) {
        const result = await query(`
            UPDATE Usuarios 
            SET PlanId = @planId, FechaModificacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE UsuarioId = @userId
        `, { userId, planId });
        
        return result.recordset[0];
    }
    
    /**
     * Obtener características del plan del usuario
     */
    static async getUserPlanFeatures(userId) {
        const result = await query(`
            SELECT 
                p.Codigo as planCode,
                p.Nombre as planName,
                p.MaxJugadores as maxPlayers,
                p.MaxLineas as maxLines,
                p.MaxFramesAnimacion as maxAnimationFrames,
                p.MaxDuracionVideo as maxAnimationDuration,
                p.MaxJugadoresPersonalizados as maxCustomPlayers,
                p.MaxDispositivos as maxDevices,
                CASE WHEN p.TodasFormaciones = 1 THEN 'all' ELSE '["4-4-2","4-3-3","3-5-2"]' END as formations,
                CASE WHEN p.TodosColores = 1 THEN 'all' ELSE '["#ff0000","#0000ff","#ffff00"]' END as colors,
                CASE WHEN p.TodosEstilosCancha = 1 THEN 'all' ELSE '["classic","modern"]' END as fieldStyles,
                CASE WHEN p.TodosEstilosTarjeta = 1 THEN 'all' ELSE '["classic","fifa"]' END as cardStyles,
                p.GrabacionAudio as audioRecording,
                CASE WHEN p.ExportacionHD = 1 THEN 'hd' ELSE 'watermark' END as export,
                p.CompartirRedes as socialShare,
                p.ExportacionJSON as jsonExport,
                p.MultiplesEquipos as multipleTeams,
                p.AccesoAPI as apiAccess,
                p.MaxColaboradores as collaboration
            FROM Usuarios u
            INNER JOIN Planes p ON u.PlanId = p.PlanId
            WHERE u.UsuarioId = @userId
        `, { userId });
        
        if (result.recordset.length === 0) return null;
        
        const features = result.recordset[0];
        
        // Parsear arrays JSON
        if (features.formations !== 'all') {
            features.formations = JSON.parse(features.formations);
        }
        if (features.colors !== 'all') {
            features.colors = JSON.parse(features.colors);
        }
        if (features.fieldStyles !== 'all') {
            features.fieldStyles = JSON.parse(features.fieldStyles);
        }
        if (features.cardStyles !== 'all') {
            features.cardStyles = JSON.parse(features.cardStyles);
        }
        
        // Convertir bits a booleanos
        features.audioRecording = !!features.audioRecording;
        features.socialShare = !!features.socialShare;
        features.jsonExport = !!features.jsonExport;
        features.multipleTeams = !!features.multipleTeams;
        features.apiAccess = !!features.apiAccess;
        
        return features;
    }
    
    /**
     * Listar todos los usuarios (admin)
     */
    static async findAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const result = await query(`
            SELECT 
                u.UsuarioId, u.Email, u.Nombre, u.Apellido, u.NombreUsuario,
                u.FechaRegistro, u.UltimoAcceso, u.Activo, u.Bloqueado,
                p.Nombre as PlanNombre, p.Codigo as PlanCodigo
            FROM Usuarios u
            INNER JOIN Planes p ON u.PlanId = p.PlanId
            ORDER BY u.FechaRegistro DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `, { offset, limit });
        
        // Obtener total
        const countResult = await query('SELECT COUNT(*) as total FROM Usuarios');
        
        return {
            users: result.recordset,
            total: countResult.recordset[0].total,
            page,
            limit,
            totalPages: Math.ceil(countResult.recordset[0].total / limit)
        };
    }
}

module.exports = UserModel;
