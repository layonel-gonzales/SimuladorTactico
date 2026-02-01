# 🗄️ Base de Datos - Simulador Táctico

## Requisitos

- SQL Server 2019 o superior (o SQL Server Express)
- SQL Server Management Studio (SSMS)
- Node.js 18+

## Configuración Paso a Paso

### 1️⃣ Crear la Base de Datos

1. Abre **SQL Server Management Studio**
2. Conéctate a tu servidor local (generalmente `localhost` o `.\SQLEXPRESS`)
3. Abre el archivo `create_database.sql`
4. Ejecuta el script completo (F5)

```
📁 database/
   ├── create_database.sql    <- Ejecutar primero
   └── insert_test_data.sql   <- Ejecutar segundo
```

### 2️⃣ Insertar Datos de Prueba

1. Abre el archivo `insert_test_data.sql`
2. Ejecuta el script completo

### 3️⃣ Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Base de datos SQL Server
DB_SERVER=localhost        # o .\SQLEXPRESS
DB_NAME=SimuladorTacticoDB
DB_USER=sa
DB_PASSWORD=TuPasswordAqui # Tu contraseña de SQL Server
DB_PORT=1433
DB_ENCRYPT=false
```

### 4️⃣ Verificar Conexión

```bash
node server/test-db.js
```

### 5️⃣ Iniciar el Servidor

```bash
npm start
```

---

## 📊 Estructura de la Base de Datos

### Diagrama ER

```
┌─────────────────┐     ┌─────────────────┐
│     Planes      │     │    Usuarios     │
├─────────────────┤     ├─────────────────┤
│ PlanId (PK)     │◄────│ UsuarioId (PK)  │
│ Nombre          │     │ Email           │
│ Codigo          │     │ PasswordHash    │
│ Precio          │     │ Nombre          │
│ MaxJugadores    │     │ PlanId (FK)     │
│ MaxLineas       │     │ ...             │
│ ...             │     └────────┬────────┘
└─────────────────┘              │
                                 │
┌─────────────────┐     ┌────────┴────────┐
│TiposMetodoPago  │     │  Suscripciones  │
├─────────────────┤     ├─────────────────┤
│ TipoMetodoId    │◄────│ SuscripcionId   │
│ Nombre          │     │ UsuarioId (FK)  │
│ Codigo          │     │ PlanId (FK)     │
└────────┬────────┘     │ Estado          │
         │              └────────┬────────┘
         │                       │
┌────────┴────────┐     ┌────────┴────────┐
│  MetodosPago    │     │     Pagos       │
├─────────────────┤     ├─────────────────┤
│ MetodoPagoId    │◄────│ PagoId (PK)     │
│ UsuarioId (FK)  │     │ UsuarioId (FK)  │
│ TipoMetodoId(FK)│     │ SuscripcionId   │
│ UltimosDigitos  │     │ Monto           │
│ MarcaTarjeta    │     │ EstadoPagoId    │
└─────────────────┘     └─────────────────┘
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `Planes` | Planes de suscripción (free, premium, pro) |
| `Usuarios` | Datos de usuarios registrados |
| `TiposMetodoPago` | Tipos: crédito, débito, PayPal, etc. |
| `MetodosPago` | Tarjetas guardadas del usuario |
| `Suscripciones` | Suscripciones activas e históricas |
| `EstadosPago` | Estados: pendiente, completado, fallido |
| `Pagos` | Historial de transacciones |
| `Dispositivos` | Dispositivos registrados por usuario |
| `Sesiones` | Sesiones activas |
| `JugadoresPersonalizados` | Jugadores creados por usuarios |
| `LogActividad` | Auditoría de acciones |

---

## 👥 Usuarios de Prueba

| Email | Password | Plan |
|-------|----------|------|
| `usuario_gratis@test.com` | `Test123456` | Gratuito |
| `usuario_premium@test.com` | `Premium123` | Premium |
| `entrenador_pro@test.com` | `ProCoach2024` | Pro |

---

## 🔌 API Endpoints

### Autenticación

```
POST /api/auth/register   - Registrar usuario
POST /api/auth/login      - Iniciar sesión
GET  /api/auth/me         - Obtener usuario actual
POST /api/auth/logout     - Cerrar sesión
```

### Pagos

```
GET  /api/payments/plans        - Obtener planes
GET  /api/payments/methods      - Métodos de pago del usuario
POST /api/payments/methods      - Agregar método de pago
GET  /api/payments/subscription - Suscripción activa
POST /api/payments/subscribe    - Suscribirse a plan
POST /api/payments/cancel       - Cancelar suscripción
GET  /api/payments/history      - Historial de pagos
GET  /api/payments/features     - Features del plan actual
```

---

## 🧪 Probar con Postman

### Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
    "email": "usuario_premium@test.com",
    "password": "Premium123"
}
```

### Obtener Features del Plan

```http
GET http://localhost:3000/api/payments/features
Authorization: Bearer <token_del_login>
```

---

## ❓ Solución de Problemas

### Error: "Failed to connect to localhost:1433"

1. Verifica que SQL Server esté ejecutándose
2. Abre **SQL Server Configuration Manager**
3. Habilita **TCP/IP** en Protocolos de SQL Server
4. Reinicia el servicio de SQL Server

### Error: "Login failed for user 'sa'"

1. La autenticación mixta debe estar habilitada
2. Verifica la contraseña en `.env`
3. En SSMS: Click derecho en servidor > Properties > Security > SQL Server and Windows Authentication mode

### Error: "Database 'SimuladorTacticoDB' does not exist"

Ejecuta `create_database.sql` en SSMS antes de iniciar el servidor.
