# 🚀 SISTEMA FREEMIUM - SIMULADOR TÁCTICO

Sistema completo de autenticación freemium con gestión de suscripciones y límite de dispositivos.

## 📋 Características

- ✅ **Autenticación JWT** - Sistema seguro de tokens
- ✅ **Gestión de dispositivos** - Máximo 3 por usuario premium
- ✅ **Suscripciones con Stripe** - Pagos recurrentes seguros
- ✅ **Modelo freemium** - Funciones básicas gratis, premium de pago
- ✅ **Backend escalable** - Node.js + Express
- ✅ **Frontend responsivo** - Bootstrap 5 + JavaScript modular

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │    Backend      │    │     Stripe      │
│                 │    │                 │    │                 │
│ • login-freemium│◄──►│ freemium-server │◄──►│ • Checkout      │
│ • premiumUI     │    │ • JWT Auth      │    │ • Webhooks      │
│ • deviceManager │    │ • Device mgmt   │    │ • Subscriptions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Configuración Rápida

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `env.example` a `.env` y completa:

```bash
cp env.example .env
```

Edita `.env`:
```env
PORT=3000
JWT_SECRET=tu_jwt_secret_super_seguro
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
NODE_ENV=development
```

### 3. Configurar Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Obtén tus claves de API (test para desarrollo)
3. Configura un webhook endpoint: `http://tu-servidor.com/api/stripe/webhook`
4. Eventos requeridos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

### 4. Iniciar el Servidor

```bash
node server/freemium-server.js
```

### 5. Configurar el Frontend

Actualiza la URL del API en `js/freemiumAuthSystem.js`:

```javascript
getApiBaseUrl() {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:3000/api';
    } else {
        return 'https://tu-servidor-produccion.com/api';
    }
}
```

## 📁 Estructura de Archivos

```
SimuladorTactico/
├── server/
│   └── freemium-server.js          # Backend principal
├── js/
│   ├── freemiumAuthSystem.js       # Sistema de autenticación
│   ├── deviceManagerPremium.js     # Gestión de dispositivos
│   └── premiumUI.js                # Interfaz de usuario premium
├── login-freemium.html             # Nueva página de login
├── env.example                     # Plantilla de configuración
└── package.json                    # Dependencias actualizadas
```

## 🎯 Flujo de Usuario

### Registro/Login
1. Usuario ingresa email/contraseña
2. Sistema genera deviceId único
3. Backend valida credenciales
4. Si es premium: verifica límite de 3 dispositivos
5. Genera JWT token
6. Redirige a la aplicación

### Actualización a Premium
1. Usuario hace clic en "Actualizar a Premium"
2. Redirige a Stripe Checkout
3. Pago exitoso → Webhook actualiza estado
4. Usuario obtiene acceso completo

### Gestión de Dispositivos
1. Usuario puede ver dispositivos registrados
2. Puede desvincular dispositivos antiguos
3. Límite: máximo 3 dispositivos activos

## 🔧 Integración con tu App Existente

### 1. Reemplazar Sistema de Auth Actual

En tu `index.html`, reemplaza:

```html
<!-- Antes -->
<script src="js/authSystem.js"></script>

<!-- Después -->
<script type="module" src="js/freemiumAuthSystem.js"></script>
<script type="module" src="js/premiumUI.js"></script>
```

### 2. Proteger Funciones Premium

```javascript
// Verificar acceso premium antes de funciones avanzadas
function enableAdvancedFeature() {
    if (!window.freemiumAuth.canAccessPremium()) {
        // Mostrar modal de upgrade
        window.premiumUI.showPremiumModal();
        return;
    }
    
    // Ejecutar función premium
    actualAdvancedFeature();
}
```

### 3. Añadir Botones de Gestión

```html
<!-- Botón en tu UI existente -->
<button class="btn btn-outline-primary" data-premium-modal>
    <i class="fas fa-crown me-1"></i>
    Gestionar Premium
</button>
```

## 🧪 Testing

### Usuario de Prueba (Development)
- **Email**: test@simulador.com
- **Contraseña**: password123
- **Estado**: Premium activo por 30 días

### Endpoints de Testing

```bash
# Verificar salud del servidor
curl http://localhost:3000/api/health

# Login de prueba
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@simulador.com",
    "password": "password123",
    "deviceId": "test-device-123",
    "deviceInfo": {"browser": "Test"}
  }'
```

## 🚢 Despliegue en Producción

### 1. Variables de Entorno Seguras

```env
NODE_ENV=production
JWT_SECRET=clave_super_segura_64_chars_minimo
STRIPE_SECRET_KEY=sk_live_tu_clave_real
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_real_produccion
DATABASE_URL=tu_base_datos_produccion
```

### 2. Base de Datos Real

Reemplaza el `Map()` en memoria por una base de datos real:

```javascript
// Opciones recomendadas:
// - MongoDB Atlas (NoSQL)
// - PostgreSQL (SQL)
// - Firebase Firestore
// - Supabase
```

### 3. Stripe en Vivo

1. Cambia las claves de test por las de producción
2. Actualiza el webhook endpoint
3. Ajusta los precios en `freemium-server.js`

## 💰 Configuración de Precios

En `freemium-server.js`, línea ~150:

```javascript
line_items: [{
    price_data: {
        currency: 'usd',
        product_data: {
            name: 'Simulador Táctico Premium',
            description: 'Acceso completo a todas las funciones'
        },
        unit_amount: 999, // $9.99 USD (en centavos)
        recurring: {
            interval: 'month' // month, year, week
        }
    },
    quantity: 1
}]
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT tokens con expiración
- ✅ Rate limiting en endpoints
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Webhooks verificados con Stripe

## 🆘 Solución de Problemas

### Error CORS
```javascript
// En freemium-server.js, ajustar CORS:
app.use(cors({
    origin: ['http://localhost:8080', 'https://tu-dominio.com'],
    credentials: true
}));
```

### Error de Módulos ES6
```html
<!-- Asegurar type="module" en scripts -->
<script type="module" src="js/freemiumAuthSystem.js"></script>
```

### Stripe Webhooks No Funcionan
1. Verificar URL pública accesible
2. Verificar eventos configurados
3. Verificar STRIPE_WEBHOOK_SECRET

## 📞 Soporte

Para soporte adicional:
1. Revisar logs del servidor: `node server/freemium-server.js`
2. Abrir DevTools para errores de frontend
3. Verificar configuración de Stripe Dashboard

## 📈 Próximas Funciones

- [ ] Portal de cliente de Stripe
- [ ] Análisis de uso
- [ ] Notificaciones por email
- [ ] Prueba gratuita de 7 días
- [ ] Planes anuales con descuento
- [ ] API para integración con terceros

---

**¡Tu sistema freemium está listo! 🎉**

Ahora tienes una base sólida para monetizar tu Simulador Táctico con un modelo de suscripción profesional.
