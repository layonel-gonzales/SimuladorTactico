# ⚽ Simulador Táctico de Fútbol

Sistema completo de simulación táctica de fútbol con funcionalidades avanzadas de dibujo, animación y sistema freemium de autenticación.

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
npm start
```

### Acceso al Sistema
- **Aplicación Principal**: http://localhost:3000
- **Login Premium**: http://localhost:3000/login.html
- **Usuario de Prueba**: `test@simulador.com` / `password123`

## 🎮 Funcionalidades Principales

### ⚽ Simulador Táctico Interactivo
- **Campo de fútbol HTML5 Canvas** con jugadores movibles
- **Dos modos principales:**
  - 🎨 **Modo Dibujo**: Líneas, flechas, diagramas tácticos
  - 🎬 **Modo Animación**: Secuencias de movimiento con audio

### 🎨 Herramientas de Dibujo
- ✅ **Líneas personalizables** (color, grosor)
- ✅ **Borrador selectivo** (eliminar líneas específicas)
- ✅ **Deshacer/Rehacer** con historial completo
- ✅ **Limpieza completa** del canvas
- ✅ **Paleta de colores** extendida
- ✅ **Compartir como imagen** (PNG/JPG)

### 🎬 Sistema de Animación Avanzado
- ✅ **Creación de frames secuenciales** de movimiento
- ✅ **Reproducción fluida** de animaciones
- ✅ **Grabación de audio/narración** sincronizada
- ✅ **Exportación a video MP4** con audio
- ✅ **Exportación/Importación JSON** completa
- ✅ **Controles de reproducción** (play, pause, velocidad)

### 👥 Gestión Completa de Jugadores
- ✅ **Plantillas predefinidas** (múltiples formaciones)
- ✅ **Jugadores personalizados** con editor completo
- ✅ **Tarjetas de jugador** con foto y estadísticas
- ✅ **Formaciones tácticas** (4-4-2, 4-3-3, etc.)
- ✅ **Drag & Drop** para mover jugadores
- ✅ **Filtros por equipo y posición**

### 🎓 Sistema Tutorial Interactivo
- ✅ **Tutorial paso a paso** para modo dibujo (7 pasos)
- ✅ **Tutorial completo** para modo animación (12 pasos)
- ✅ **Tooltips profesionales** con posicionamiento inteligente
- ✅ **Overlay selectivo** que preserva visibilidad del menú
- ✅ **Navegación fluida** entre pasos

### 🔧 Configuración Avanzada
- ✅ **Panel de configuración** completo con 6 categorías
- ✅ **Temas visual** (claro/oscuro/automático)
- ✅ **Colores de acento** personalizables
- ✅ **Modo compacto** para interfaces pequeñas
- ✅ **Alto contraste** para accesibilidad
- ✅ **Confirmación de acciones** configurable

### 📱 Características Premium
- ✅ **Sistema de autenticación JWT** con Node.js/Express
- ✅ **Control de dispositivos** (máximo 3 por usuario premium)
- ✅ **Base de datos de usuarios** con bcrypt
- ✅ **Integración con Stripe** para pagos
- ✅ **Rate limiting** y seguridad avanzada

## 🛠️ Tecnologías y Librerías

### Frontend
- **HTML5 Canvas** - Renderizado del campo y dibujo
- **Bootstrap 5** - Framework CSS responsivo
- **JavaScript ES6+** - Lógica de aplicación modular
- **Font Awesome** - Iconografía completa
- **Web Audio API** - Grabación y reproducción de audio
- **MediaRecorder API** - Captura de video del canvas
- **Shepherd.js Custom** - Sistema tutorial personalizado

### Backend
- **Node.js** - Runtime del servidor
- **Express.js** - Framework web
- **JSON Web Tokens (JWT)** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Stripe** - Procesamiento de pagos
- **CORS** - Control de acceso cross-origin
- **Express Rate Limit** - Control de tasa de peticiones
- **UUID** - Generación de identificadores únicos

### Base de Datos
- **En memoria (Map)** - Para desarrollo
- **Preparado para MongoDB/PostgreSQL** - Para producción

## 📁 Estructura del Proyecto

```
📦 SimuladorTactico/
├── 📂 server/
│   ├── freemium-server.js       # Servidor principal con autenticación
│   └── license-server.js        # Servidor de licencias (backup)
├── 📂 js/
│   ├── main.js                  # Punto de entrada principal
│   ├── animationManager.js      # Sistema completo de animaciones
│   ├── drawingManager.js        # Herramientas de dibujo
│   ├── playerManager.js         # Gestión de jugadores
│   ├── uiManager.js             # Interfaz de usuario
│   ├── modeManager.js           # Coordinador de modos
│   ├── tutorialManager.js       # Sistema tutorial personalizado
│   ├── configurationUI.js      # Panel de configuración
│   ├── customPlayersManager.js  # Jugadores personalizados
│   ├── audioManager.js          # Grabación de audio
│   ├── shareManager.js          # Exportación y compartir
│   ├── fieldDrawer.js           # Renderizado del campo
│   ├── ballDrawingManager.js    # Dibujo con estela del balón
│   ├── freemiumAuthSystem-simple.js # Autenticación frontend
│   ├── paymentManager.js        # Gestión de pagos Stripe
│   ├── fullscreenManager.js     # Pantalla completa
│   ├── orientationManager.js    # Manejo de orientación móvil
│   ├── themeManager.js          # Gestión de temas
│   ├── deviceIdManager.js       # Control de dispositivos
│   └── libs/
│       └── simple-tutorial.js   # Tutorial personalizado (300+ líneas)
├── 📂 css/
│   └── estilo.css               # Estilos principales unificados
├── 📂 img/                      # Recursos gráficos
├── 📄 index.html                # Aplicación principal
├── 📄 login.html                # Página de autenticación premium
├── 📄 package.json              # Dependencias del proyecto
└── 📄 .env                      # Variables de entorno
```

## 🔑 Flujo del Sistema

### 1. Autenticación (login.html)
```
Usuario accede → Verificación de credenciales → JWT Token → Redirección a index.html
```
- **Frontend**: Formulario de login con validación
- **Backend**: Verificación bcrypt + generación JWT
- **Control de dispositivos**: Máximo 3 dispositivos por usuario premium
- **Rate limiting**: Protección contra ataques de fuerza bruta

### 2. Aplicación Principal (index.html)
```
Carga inicial → Verificación JWT → Inicialización de módulos → Tutorial (primera vez)
```
- **Verificación automática** de autenticación al cargar
- **Inicialización modular** de todos los gestores
- **Tutorial automático** para nuevos usuarios
- **Interfaz responsiva** con orientación móvil

### 3. Modos de Operación

#### 🎨 Modo Dibujo
```
Seleccionar jugadores → Dibujar líneas tácticas → Configurar herramientas → Exportar
```
- **Tutorial de 7 pasos**: Deshacer → Rehacer → Limpiar → Color → Grosor → Borrar → Compartir
- **Herramientas avanzadas**: Paleta de colores, grosores variables, borrador selectivo
- **Exportación**: PNG/JPG con opciones de calidad

#### 🎬 Modo Animación
```
Grabar movimientos → Crear frames → Agregar audio → Reproducir → Exportar video
```
- **Tutorial de 12 pasos**: Grabar → Nuevo Frame → Navegación → Reproducir → Audio → Exportar
- **Sistema de frames**: Navegación fluida, indicador de posición
- **Audio sincronizado**: Grabación y reproducción con la animación
- **Exportación múltiple**: MP4, JSON para reutilización

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de nuevo usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/user/status` - Estado del usuario actual

### Dispositivos
- `GET /api/devices` - Lista de dispositivos del usuario
- `DELETE /api/devices/:deviceId` - Desvincular dispositivo

### Pagos (Stripe)
- `POST /api/stripe/create-checkout-session` - Crear sesión de pago
- `POST /api/stripe/webhook` - Webhook de Stripe para confirmaciones

### Salud del Sistema
- `GET /api/health` - Estado del servidor y estadísticas

## 🎯 Características Técnicas Avanzadas

### Sistema Tutorial Personalizado
- **SimpleTutorial.js** - 300+ líneas de código personalizado
- **Overlay inteligente** que calcula altura del menú dinámicamente
- **Posicionamiento adaptativo** de tooltips
- **Navegación fluida** con historial

### Gestión de Estados
- **ModeManager** - Coordinación entre modo dibujo y animación
- **ConfigurationManager** - Persistencia de configuraciones en localStorage
- **PlayerManager** - Estado de jugadores y formaciones

### Optimizaciones de Rendimiento
- **Throttled events** para resize y orientación
- **Lazy loading** de componentes pesados
- **Canvas optimization** para dibujo fluido
- **Memory management** para grabación de audio/video

### Seguridad
- **JWT con expiración** (7 días)
- **Hash bcrypt** para contraseñas
- **Rate limiting** (100 requests/15min)
- **CORS configurado** para dominios específicos
- **Validación de entrada** en todos los endpoints

## 🚀 Despliegue

### Desarrollo
```bash
npm install
npm run dev  # Con nodemon para auto-reload
```

### Producción
```bash
npm run build-production  # Minificación y ofuscación
npm start
```

### Variables de Entorno (.env)
```env
PORT=3000
JWT_SECRET=tu_jwt_secret_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
NODE_ENV=production
```

---

**✅ Sistema completamente funcional con todas las características implementadas y documentadas**
