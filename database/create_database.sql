-- ==========================================
-- 🗄️ SIMULADOR TÁCTICO - BASE DE DATOS
-- ==========================================
-- Script para crear la base de datos completa en SQL Server
-- Ejecutar en SQL Server Management Studio
-- ==========================================

-- Crear la base de datos
USE master;
GO

-- Eliminar si existe (solo para desarrollo)
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'SimuladorTacticoDB')
BEGIN
    ALTER DATABASE SimuladorTacticoDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SimuladorTacticoDB;
END
GO

CREATE DATABASE SimuladorTacticoDB;
GO

USE SimuladorTacticoDB;
GO

-- ==========================================
-- TABLA: Planes de Suscripción
-- ==========================================
CREATE TABLE Planes (
    PlanId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE,
    Codigo NVARCHAR(20) NOT NULL UNIQUE,  -- 'free', 'premium', 'pro'
    Precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    MonedaCodigo NVARCHAR(3) NOT NULL DEFAULT 'USD',
    Descripcion NVARCHAR(500),
    
    -- Límites del plan
    MaxJugadores INT NOT NULL DEFAULT 11,
    MaxLineas INT NOT NULL DEFAULT 10,  -- -1 = ilimitado
    MaxFramesAnimacion INT NOT NULL DEFAULT 5,
    MaxDuracionVideo INT NOT NULL DEFAULT 15,  -- segundos, -1 = ilimitado
    MaxJugadoresPersonalizados INT NOT NULL DEFAULT 5,
    MaxDispositivos INT NOT NULL DEFAULT 3,
    
    -- Características booleanas
    TodasFormaciones BIT NOT NULL DEFAULT 0,
    TodosColores BIT NOT NULL DEFAULT 0,
    TodosEstilosCancha BIT NOT NULL DEFAULT 0,
    TodosEstilosTarjeta BIT NOT NULL DEFAULT 0,
    GrabacionAudio BIT NOT NULL DEFAULT 0,
    ExportacionHD BIT NOT NULL DEFAULT 0,
    CompartirRedes BIT NOT NULL DEFAULT 0,
    ExportacionJSON BIT NOT NULL DEFAULT 0,
    MultiplesEquipos BIT NOT NULL DEFAULT 0,
    AccesoAPI BIT NOT NULL DEFAULT 0,
    SoportePrioritario BIT NOT NULL DEFAULT 0,
    
    -- Colaboración (0 = no permitido)
    MaxColaboradores INT NOT NULL DEFAULT 0,
    
    -- Metadata
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ==========================================
-- TABLA: Usuarios
-- ==========================================
CREATE TABLE Usuarios (
    UsuarioId INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Identificación
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Nombre NVARCHAR(100),
    Apellido NVARCHAR(100),
    NombreUsuario NVARCHAR(50) UNIQUE,
    
    -- Avatar/Foto
    FotoUrl NVARCHAR(500),
    
    -- Teléfono (opcional para verificación)
    Telefono NVARCHAR(20),
    TelefonoVerificado BIT NOT NULL DEFAULT 0,
    
    -- Estado de cuenta
    EmailVerificado BIT NOT NULL DEFAULT 0,
    TokenVerificacion NVARCHAR(255),
    TokenExpiracion DATETIME2,
    
    -- Plan actual
    PlanId INT NOT NULL DEFAULT 1,  -- Por defecto: Plan Gratuito
    
    -- Fechas
    FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
    UltimoAcceso DATETIME2,
    FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Estado
    Activo BIT NOT NULL DEFAULT 1,
    Bloqueado BIT NOT NULL DEFAULT 0,
    MotivoBloqueo NVARCHAR(500),
    
    -- Preferencias
    Idioma NVARCHAR(10) DEFAULT 'es',
    ZonaHoraria NVARCHAR(50) DEFAULT 'America/Santiago',
    RecibirNotificaciones BIT NOT NULL DEFAULT 1,
    RecibirMarketing BIT NOT NULL DEFAULT 0,
    
    -- OAuth (para login con Google, Facebook, etc.)
    GoogleId NVARCHAR(255),
    FacebookId NVARCHAR(255),
    AppleId NVARCHAR(255),
    
    -- Foreign Keys
    CONSTRAINT FK_Usuarios_Planes FOREIGN KEY (PlanId) REFERENCES Planes(PlanId)
);
GO

-- Índices para búsquedas frecuentes
CREATE INDEX IX_Usuarios_Email ON Usuarios(Email);
CREATE INDEX IX_Usuarios_PlanId ON Usuarios(PlanId);
CREATE INDEX IX_Usuarios_FechaRegistro ON Usuarios(FechaRegistro);
GO

-- ==========================================
-- TABLA: Tipos de Método de Pago
-- ==========================================
CREATE TABLE TiposMetodoPago (
    TipoMetodoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE,
    Codigo NVARCHAR(20) NOT NULL UNIQUE,  -- 'credit', 'debit', 'paypal', etc.
    Descripcion NVARCHAR(200),
    IconoUrl NVARCHAR(500),
    Activo BIT NOT NULL DEFAULT 1,
    Orden INT NOT NULL DEFAULT 0
);
GO

-- ==========================================
-- TABLA: Métodos de Pago del Usuario
-- ==========================================
CREATE TABLE MetodosPago (
    MetodoPagoId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    TipoMetodoId INT NOT NULL,
    
    -- Datos de la tarjeta (tokenizados/enmascarados)
    UltimosDigitos NVARCHAR(4),  -- Solo últimos 4 dígitos
    MarcaTarjeta NVARCHAR(20),   -- Visa, Mastercard, etc.
    NombreTitular NVARCHAR(100),
    MesExpiracion INT,
    AnioExpiracion INT,
    
    -- Token de Stripe/PayPal para procesar pagos
    TokenPago NVARCHAR(255),
    StripeCustomerId NVARCHAR(255),
    StripePaymentMethodId NVARCHAR(255),
    
    -- Dirección de facturación
    DireccionLinea1 NVARCHAR(200),
    DireccionLinea2 NVARCHAR(200),
    Ciudad NVARCHAR(100),
    Estado NVARCHAR(100),
    CodigoPostal NVARCHAR(20),
    Pais NVARCHAR(100),
    
    -- Estado
    Predeterminado BIT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys
    CONSTRAINT FK_MetodosPago_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT FK_MetodosPago_TiposMetodo FOREIGN KEY (TipoMetodoId) REFERENCES TiposMetodoPago(TipoMetodoId)
);
GO

CREATE INDEX IX_MetodosPago_UsuarioId ON MetodosPago(UsuarioId);
GO

-- ==========================================
-- TABLA: Suscripciones
-- ==========================================
CREATE TABLE Suscripciones (
    SuscripcionId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    PlanId INT NOT NULL,
    MetodoPagoId INT,  -- Puede ser NULL para plan gratuito
    
    -- Stripe
    StripeSubscriptionId NVARCHAR(255),
    StripePriceId NVARCHAR(255),
    
    -- Fechas
    FechaInicio DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaFin DATETIME2,  -- NULL = sin fecha de fin (activa)
    FechaProximoPago DATETIME2,
    FechaCancelacion DATETIME2,
    
    -- Período de prueba
    EnPeriodoPrueba BIT NOT NULL DEFAULT 0,
    FechaFinPrueba DATETIME2,
    
    -- Estado: 'active', 'cancelled', 'expired', 'past_due', 'trialing'
    Estado NVARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Cancelación
    MotivoCancelacion NVARCHAR(500),
    CanceladoPorUsuario BIT NOT NULL DEFAULT 0,
    
    -- Metadata
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys
    CONSTRAINT FK_Suscripciones_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT FK_Suscripciones_Planes FOREIGN KEY (PlanId) REFERENCES Planes(PlanId),
    CONSTRAINT FK_Suscripciones_MetodosPago FOREIGN KEY (MetodoPagoId) REFERENCES MetodosPago(MetodoPagoId)
);
GO

CREATE INDEX IX_Suscripciones_UsuarioId ON Suscripciones(UsuarioId);
CREATE INDEX IX_Suscripciones_Estado ON Suscripciones(Estado);
GO

-- ==========================================
-- TABLA: Estados de Pago
-- ==========================================
CREATE TABLE EstadosPago (
    EstadoPagoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE,
    Codigo NVARCHAR(20) NOT NULL UNIQUE,  -- 'pending', 'completed', 'failed', 'refunded'
    Descripcion NVARCHAR(200),
    ColorHex NVARCHAR(7)  -- Para UI: #00FF00
);
GO

-- ==========================================
-- TABLA: Pagos (Historial de transacciones)
-- ==========================================
CREATE TABLE Pagos (
    PagoId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    SuscripcionId INT,
    MetodoPagoId INT,
    EstadoPagoId INT NOT NULL,
    
    -- Montos
    Monto DECIMAL(10,2) NOT NULL,
    MontoImpuesto DECIMAL(10,2) NOT NULL DEFAULT 0,
    MontoTotal DECIMAL(10,2) NOT NULL,
    MonedaCodigo NVARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Descripción
    Concepto NVARCHAR(200) NOT NULL,
    Descripcion NVARCHAR(500),
    
    -- IDs externos (Stripe, PayPal, etc.)
    StripePaymentIntentId NVARCHAR(255),
    StripeChargeId NVARCHAR(255),
    StripeInvoiceId NVARCHAR(255),
    PaypalTransactionId NVARCHAR(255),
    
    -- Facturación
    NumeroFactura NVARCHAR(50),
    FacturaUrl NVARCHAR(500),
    
    -- Reembolso
    Reembolsado BIT NOT NULL DEFAULT 0,
    MontoReembolsado DECIMAL(10,2) DEFAULT 0,
    FechaReembolso DATETIME2,
    MotivoReembolso NVARCHAR(500),
    
    -- Fechas
    FechaPago DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- IP y metadata de seguridad
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    
    -- Foreign Keys
    CONSTRAINT FK_Pagos_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT FK_Pagos_Suscripciones FOREIGN KEY (SuscripcionId) REFERENCES Suscripciones(SuscripcionId),
    CONSTRAINT FK_Pagos_MetodosPago FOREIGN KEY (MetodoPagoId) REFERENCES MetodosPago(MetodoPagoId),
    CONSTRAINT FK_Pagos_EstadosPago FOREIGN KEY (EstadoPagoId) REFERENCES EstadosPago(EstadoPagoId)
);
GO

CREATE INDEX IX_Pagos_UsuarioId ON Pagos(UsuarioId);
CREATE INDEX IX_Pagos_FechaPago ON Pagos(FechaPago);
CREATE INDEX IX_Pagos_EstadoPagoId ON Pagos(EstadoPagoId);
GO

-- ==========================================
-- TABLA: Dispositivos del Usuario
-- ==========================================
CREATE TABLE Dispositivos (
    DispositivoId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    
    -- Identificación del dispositivo
    DeviceId NVARCHAR(255) NOT NULL,
    Nombre NVARCHAR(100),
    Tipo NVARCHAR(50),  -- 'mobile', 'tablet', 'desktop'
    Sistema NVARCHAR(50),  -- 'iOS', 'Android', 'Windows', etc.
    Version NVARCHAR(50),
    
    -- Token para notificaciones push
    PushToken NVARCHAR(500),
    
    -- Estado
    Activo BIT NOT NULL DEFAULT 1,
    UltimoAcceso DATETIME2,
    FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT FK_Dispositivos_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT UQ_Dispositivos_Usuario_Device UNIQUE (UsuarioId, DeviceId)
);
GO

-- ==========================================
-- TABLA: Sesiones de Usuario
-- ==========================================
CREATE TABLE Sesiones (
    SesionId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    DispositivoId INT,
    
    -- Token de sesión
    Token NVARCHAR(500) NOT NULL UNIQUE,
    RefreshToken NVARCHAR(500),
    
    -- Fechas
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaExpiracion DATETIME2 NOT NULL,
    UltimaActividad DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Seguridad
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    
    -- Estado
    Activo BIT NOT NULL DEFAULT 1,
    CerradaManualmente BIT NOT NULL DEFAULT 0,
    
    -- Foreign Keys
    CONSTRAINT FK_Sesiones_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT FK_Sesiones_Dispositivos FOREIGN KEY (DispositivoId) REFERENCES Dispositivos(DispositivoId)
);
GO

CREATE INDEX IX_Sesiones_UsuarioId ON Sesiones(UsuarioId);
CREATE INDEX IX_Sesiones_Token ON Sesiones(Token);
GO

-- ==========================================
-- TABLA: Jugadores Personalizados
-- ==========================================
CREATE TABLE JugadoresPersonalizados (
    JugadorId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    
    -- Datos del jugador
    Nombre NVARCHAR(100) NOT NULL,
    NumeroPlayera INT,
    Posicion NVARCHAR(10),  -- GK, CB, RB, LB, CDM, CM, CAM, RW, LW, ST
    
    -- Estadísticas (0-99)
    Pace INT DEFAULT 70,
    Shooting INT DEFAULT 70,
    Passing INT DEFAULT 70,
    Dribbling INT DEFAULT 70,
    Defending INT DEFAULT 70,
    Physical INT DEFAULT 70,
    
    -- Imagen
    FotoUrl NVARCHAR(500),
    
    -- Equipo personalizado
    EquipoNombre NVARCHAR(100),
    
    -- Metadata
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT FK_JugadoresPersonalizados_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);
GO

CREATE INDEX IX_JugadoresPersonalizados_UsuarioId ON JugadoresPersonalizados(UsuarioId);
GO

-- ==========================================
-- TABLA: Log de Actividad (Auditoría)
-- ==========================================
CREATE TABLE LogActividad (
    LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT,
    
    -- Acción
    Accion NVARCHAR(100) NOT NULL,  -- 'login', 'logout', 'upgrade', 'payment', etc.
    Descripcion NVARCHAR(500),
    
    -- Datos adicionales en JSON
    DatosJson NVARCHAR(MAX),
    
    -- Contexto
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    
    -- Fecha
    FechaEvento DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key (opcional porque puede haber logs sin usuario)
    CONSTRAINT FK_LogActividad_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);
GO

CREATE INDEX IX_LogActividad_UsuarioId ON LogActividad(UsuarioId);
CREATE INDEX IX_LogActividad_FechaEvento ON LogActividad(FechaEvento);
CREATE INDEX IX_LogActividad_Accion ON LogActividad(Accion);
GO

-- ==========================================
-- INSERTAR DATOS INICIALES
-- ==========================================

-- Insertar Planes
INSERT INTO Planes (Nombre, Codigo, Precio, Descripcion, MaxJugadores, MaxLineas, MaxFramesAnimacion, MaxDuracionVideo, MaxJugadoresPersonalizados, MaxDispositivos, TodasFormaciones, TodosColores, TodosEstilosCancha, TodosEstilosTarjeta, GrabacionAudio, ExportacionHD, CompartirRedes, ExportacionJSON, MultiplesEquipos, AccesoAPI, SoportePrioritario, MaxColaboradores)
VALUES 
    ('Gratuito', 'free', 0.00, 'Plan básico para usuarios nuevos', 11, 10, 5, 15, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    ('Premium', 'premium', 9.99, 'Plan completo para entusiastas', 22, -1, -1, 120, -1, 10, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0),
    ('Pro', 'pro', 19.99, 'Plan profesional para entrenadores y clubes', 22, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5);
GO

-- Insertar Tipos de Método de Pago
INSERT INTO TiposMetodoPago (Nombre, Codigo, Descripcion, Orden)
VALUES 
    ('Tarjeta de Crédito', 'credit', 'Visa, Mastercard, American Express', 1),
    ('Tarjeta de Débito', 'debit', 'Tarjetas de débito bancarias', 2),
    ('PayPal', 'paypal', 'Cuenta de PayPal', 3),
    ('Google Pay', 'google_pay', 'Pago con Google Pay', 4),
    ('Apple Pay', 'apple_pay', 'Pago con Apple Pay', 5);
GO

-- Insertar Estados de Pago
INSERT INTO EstadosPago (Nombre, Codigo, Descripcion, ColorHex)
VALUES 
    ('Pendiente', 'pending', 'El pago está siendo procesado', '#FFA500'),
    ('Completado', 'completed', 'El pago se realizó exitosamente', '#00FF00'),
    ('Fallido', 'failed', 'El pago no pudo ser procesado', '#FF0000'),
    ('Reembolsado', 'refunded', 'El pago fue reembolsado', '#808080'),
    ('Cancelado', 'cancelled', 'El pago fue cancelado', '#FF6600');
GO

PRINT '✅ Base de datos SimuladorTacticoDB creada exitosamente';
PRINT '✅ Tablas creadas: Planes, Usuarios, TiposMetodoPago, MetodosPago, Suscripciones, EstadosPago, Pagos, Dispositivos, Sesiones, JugadoresPersonalizados, LogActividad';
PRINT '✅ Datos iniciales insertados';
GO
