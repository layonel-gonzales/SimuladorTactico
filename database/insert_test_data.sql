-- ==========================================
-- 🧪 DATOS DE PRUEBA - SIMULADOR TÁCTICO
-- ==========================================
-- Ejecutar DESPUÉS de create_database.sql
-- ==========================================

USE SimuladorTacticoDB;
GO

-- ==========================================
-- USUARIO 1: Plan GRATUITO
-- ==========================================

-- Insertar usuario gratuito
INSERT INTO Usuarios (
    Email, PasswordHash, Nombre, Apellido, NombreUsuario, 
    EmailVerificado, PlanId, FechaRegistro, UltimoAcceso, Activo
)
VALUES (
    'usuario_gratis@test.com',
    -- Password: 'Test123456' hasheado con bcrypt
    '$2b$10$rQZ5V5qJ5R5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X',
    'Carlos',
    'González',
    'carlosg_free',
    1,  -- Email verificado
    1,  -- Plan Gratuito (PlanId = 1)
    DATEADD(MONTH, -2, GETDATE()),  -- Registrado hace 2 meses
    GETDATE(),  -- Último acceso hoy
    1
);

DECLARE @UsuarioGratisId INT = SCOPE_IDENTITY();

-- Crear suscripción gratuita
INSERT INTO Suscripciones (UsuarioId, PlanId, FechaInicio, Estado)
VALUES (@UsuarioGratisId, 1, DATEADD(MONTH, -2, GETDATE()), 'active');

-- Agregar dispositivo
INSERT INTO Dispositivos (UsuarioId, DeviceId, Nombre, Tipo, Sistema, UltimoAcceso)
VALUES (@UsuarioGratisId, 'device_free_001', 'iPhone de Carlos', 'mobile', 'iOS', GETDATE());

-- Agregar algunos jugadores personalizados (máximo 5 para plan gratuito)
INSERT INTO JugadoresPersonalizados (UsuarioId, Nombre, NumeroPlayera, Posicion, Pace, Shooting, Passing, Dribbling, Defending, Physical)
VALUES 
    (@UsuarioGratisId, 'Mi Delantero', 9, 'ST', 88, 90, 75, 85, 30, 80),
    (@UsuarioGratisId, 'Mi Mediocampista', 10, 'CAM', 75, 80, 88, 86, 45, 70),
    (@UsuarioGratisId, 'Mi Defensa', 4, 'CB', 65, 40, 60, 50, 90, 88);

-- Log de actividad
INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, IpAddress)
VALUES 
    (@UsuarioGratisId, 'register', 'Usuario registrado con plan gratuito', '192.168.1.100'),
    (@UsuarioGratisId, 'login', 'Inicio de sesión desde iOS', '192.168.1.100');

PRINT '✅ Usuario GRATUITO creado: usuario_gratis@test.com / Test123456';

-- ==========================================
-- USUARIO 2: Plan PREMIUM (con pagos)
-- ==========================================

-- Insertar usuario premium
INSERT INTO Usuarios (
    Email, PasswordHash, Nombre, Apellido, NombreUsuario, 
    EmailVerificado, PlanId, FechaRegistro, UltimoAcceso, Activo
)
VALUES (
    'usuario_premium@test.com',
    -- Password: 'Premium123' hasheado con bcrypt
    '$2b$10$rQZ5V5qJ5R5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X',
    'María',
    'Rodríguez',
    'maria_premium',
    1,  -- Email verificado
    2,  -- Plan Premium (PlanId = 2)
    DATEADD(MONTH, -6, GETDATE()),  -- Registrado hace 6 meses
    GETDATE(),
    1
);

DECLARE @UsuarioPremiumId INT = SCOPE_IDENTITY();

-- Agregar método de pago (Tarjeta de Crédito)
INSERT INTO MetodosPago (
    UsuarioId, TipoMetodoId, UltimosDigitos, MarcaTarjeta, NombreTitular,
    MesExpiracion, AnioExpiracion, StripeCustomerId, StripePaymentMethodId,
    Ciudad, Pais, Predeterminado
)
VALUES (
    @UsuarioPremiumId,
    1,  -- Tarjeta de Crédito
    '4242',
    'Visa',
    'MARIA RODRIGUEZ',
    12,
    2027,
    'cus_test_premium_maria',
    'pm_test_visa_maria',
    'Santiago',
    'Chile',
    1  -- Método predeterminado
);

DECLARE @MetodoPagoPremiumId INT = SCOPE_IDENTITY();

-- Crear suscripción premium
INSERT INTO Suscripciones (
    UsuarioId, PlanId, MetodoPagoId, StripeSubscriptionId,
    FechaInicio, FechaProximoPago, Estado
)
VALUES (
    @UsuarioPremiumId,
    2,  -- Premium
    @MetodoPagoPremiumId,
    'sub_test_premium_maria',
    DATEADD(MONTH, -3, GETDATE()),  -- Suscripción hace 3 meses
    DATEADD(MONTH, 1, GETDATE()),   -- Próximo pago en 1 mes
    'active'
);

DECLARE @SuscripcionPremiumId INT = SCOPE_IDENTITY();

-- Registrar pagos históricos (3 meses de Premium)
INSERT INTO Pagos (
    UsuarioId, SuscripcionId, MetodoPagoId, EstadoPagoId,
    Monto, MontoImpuesto, MontoTotal, Concepto, Descripcion,
    StripePaymentIntentId, StripeChargeId, NumeroFactura, FechaPago
)
VALUES 
    -- Pago 1 (hace 3 meses)
    (@UsuarioPremiumId, @SuscripcionPremiumId, @MetodoPagoPremiumId, 2,
     9.99, 0, 9.99, 'Suscripción Premium', 'Pago mensual Plan Premium',
     'pi_test_001', 'ch_test_001', 'INV-2025-001', DATEADD(MONTH, -3, GETDATE())),
    
    -- Pago 2 (hace 2 meses)
    (@UsuarioPremiumId, @SuscripcionPremiumId, @MetodoPagoPremiumId, 2,
     9.99, 0, 9.99, 'Suscripción Premium', 'Pago mensual Plan Premium',
     'pi_test_002', 'ch_test_002', 'INV-2025-002', DATEADD(MONTH, -2, GETDATE())),
    
    -- Pago 3 (hace 1 mes)
    (@UsuarioPremiumId, @SuscripcionPremiumId, @MetodoPagoPremiumId, 2,
     9.99, 0, 9.99, 'Suscripción Premium', 'Pago mensual Plan Premium',
     'pi_test_003', 'ch_test_003', 'INV-2025-003', DATEADD(MONTH, -1, GETDATE()));

-- Dispositivos (Premium puede tener hasta 10)
INSERT INTO Dispositivos (UsuarioId, DeviceId, Nombre, Tipo, Sistema, UltimoAcceso)
VALUES 
    (@UsuarioPremiumId, 'device_premium_001', 'MacBook de María', 'desktop', 'macOS', GETDATE()),
    (@UsuarioPremiumId, 'device_premium_002', 'iPad Pro', 'tablet', 'iPadOS', DATEADD(DAY, -1, GETDATE())),
    (@UsuarioPremiumId, 'device_premium_003', 'iPhone 15', 'mobile', 'iOS', GETDATE());

-- Jugadores personalizados (Premium = ilimitados)
INSERT INTO JugadoresPersonalizados (UsuarioId, Nombre, NumeroPlayera, Posicion, Pace, Shooting, Passing, Dribbling, Defending, Physical, EquipoNombre)
VALUES 
    (@UsuarioPremiumId, 'Alexis Sánchez', 7, 'RW', 85, 82, 78, 88, 40, 75, 'Mi Equipo Soñado'),
    (@UsuarioPremiumId, 'Arturo Vidal', 8, 'CM', 78, 80, 82, 80, 82, 88, 'Mi Equipo Soñado'),
    (@UsuarioPremiumId, 'Claudio Bravo', 1, 'GK', 45, 20, 55, 40, 85, 75, 'Mi Equipo Soñado'),
    (@UsuarioPremiumId, 'Gary Medel', 17, 'CDM', 72, 55, 70, 65, 86, 85, 'Mi Equipo Soñado'),
    (@UsuarioPremiumId, 'Eduardo Vargas', 11, 'ST', 82, 78, 65, 80, 35, 72, 'Mi Equipo Soñado'),
    (@UsuarioPremiumId, 'Charles Aránguiz', 20, 'CM', 75, 72, 85, 82, 78, 80, 'Mi Equipo Soñado'),
    (@UsuarioPremiumId, 'Mauricio Isla', 4, 'RB', 82, 55, 72, 75, 78, 80, 'Mi Equipo Soñado');

-- Log de actividad
INSERT INTO LogActividad (UsuarioId, Accion, Descripcion, IpAddress, DatosJson)
VALUES 
    (@UsuarioPremiumId, 'register', 'Usuario registrado', '192.168.1.200', NULL),
    (@UsuarioPremiumId, 'upgrade', 'Upgrade a Premium', '192.168.1.200', '{"from": "free", "to": "premium"}'),
    (@UsuarioPremiumId, 'payment', 'Pago procesado correctamente', '192.168.1.200', '{"amount": 9.99, "currency": "USD"}'),
    (@UsuarioPremiumId, 'login', 'Inicio de sesión desde macOS', '192.168.1.200', NULL);

PRINT '✅ Usuario PREMIUM creado: usuario_premium@test.com / Premium123';

-- ==========================================
-- USUARIO 3: Plan PRO (con tarjeta de débito)
-- ==========================================

INSERT INTO Usuarios (
    Email, PasswordHash, Nombre, Apellido, NombreUsuario, 
    EmailVerificado, PlanId, FechaRegistro, UltimoAcceso, Activo
)
VALUES (
    'entrenador_pro@test.com',
    -- Password: 'ProCoach2024' hasheado
    '$2b$10$rQZ5V5qJ5R5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X',
    'Roberto',
    'Martínez',
    'coach_roberto',
    1,
    3,  -- Plan Pro (PlanId = 3)
    DATEADD(YEAR, -1, GETDATE()),  -- Cliente desde hace 1 año
    GETDATE(),
    1
);

DECLARE @UsuarioProId INT = SCOPE_IDENTITY();

-- Método de pago: Tarjeta de Débito
INSERT INTO MetodosPago (
    UsuarioId, TipoMetodoId, UltimosDigitos, MarcaTarjeta, NombreTitular,
    MesExpiracion, AnioExpiracion, StripeCustomerId, StripePaymentMethodId,
    Ciudad, Pais, Predeterminado
)
VALUES (
    @UsuarioProId,
    2,  -- Tarjeta de Débito
    '8888',
    'Mastercard',
    'ROBERTO MARTINEZ',
    6,
    2028,
    'cus_test_pro_roberto',
    'pm_test_debit_roberto',
    'Madrid',
    'España',
    1
);

DECLARE @MetodoPagoProId INT = SCOPE_IDENTITY();

-- Suscripción Pro
INSERT INTO Suscripciones (
    UsuarioId, PlanId, MetodoPagoId, StripeSubscriptionId,
    FechaInicio, FechaProximoPago, Estado
)
VALUES (
    @UsuarioProId,
    3,  -- Pro
    @MetodoPagoProId,
    'sub_test_pro_roberto',
    DATEADD(YEAR, -1, GETDATE()),
    DATEADD(MONTH, 1, GETDATE()),
    'active'
);

DECLARE @SuscripcionProId INT = SCOPE_IDENTITY();

-- Registrar último pago
INSERT INTO Pagos (
    UsuarioId, SuscripcionId, MetodoPagoId, EstadoPagoId,
    Monto, MontoImpuesto, MontoTotal, Concepto, Descripcion,
    StripePaymentIntentId, NumeroFactura, FechaPago
)
VALUES 
    (@UsuarioProId, @SuscripcionProId, @MetodoPagoProId, 2,
     19.99, 0, 19.99, 'Suscripción Pro', 'Pago mensual Plan Pro',
     'pi_test_pro_001', 'INV-2025-PRO-001', DATEADD(MONTH, -1, GETDATE()));

PRINT '✅ Usuario PRO creado: entrenador_pro@test.com / ProCoach2024';

-- ==========================================
-- RESUMEN DE DATOS DE PRUEBA
-- ==========================================

PRINT '';
PRINT '==========================================';
PRINT '📊 RESUMEN DE DATOS DE PRUEBA';
PRINT '==========================================';
PRINT '';

SELECT 
    'Usuarios' AS Tabla, 
    COUNT(*) AS Total 
FROM Usuarios
UNION ALL
SELECT 'Suscripciones', COUNT(*) FROM Suscripciones
UNION ALL
SELECT 'Métodos de Pago', COUNT(*) FROM MetodosPago
UNION ALL
SELECT 'Pagos', COUNT(*) FROM Pagos
UNION ALL
SELECT 'Dispositivos', COUNT(*) FROM Dispositivos
UNION ALL
SELECT 'Jugadores Personalizados', COUNT(*) FROM JugadoresPersonalizados
UNION ALL
SELECT 'Log Actividad', COUNT(*) FROM LogActividad;

PRINT '';
PRINT '==========================================';
PRINT '👥 CREDENCIALES DE PRUEBA';
PRINT '==========================================';
PRINT '1. GRATUITO: usuario_gratis@test.com / Test123456';
PRINT '2. PREMIUM:  usuario_premium@test.com / Premium123';
PRINT '3. PRO:      entrenador_pro@test.com / ProCoach2024';
PRINT '==========================================';
GO
