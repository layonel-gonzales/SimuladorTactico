# Modo Desarrollo - Acceso sin Autenticación

## 🚀 Descripción

Se ha implementado un sistema automático de autenticación para facilitar el desarrollo y testing de la aplicación. El sistema detecta automáticamente cuándo se está ejecutando en modo desarrollo o GitHub Pages y proporciona acceso completo a todas las funciones premium.

## ✅ Detección Automática

El sistema se activa automáticamente en los siguientes casos:

1. **GitHub Pages**: `kmeza.github.io`
2. **Localhost**: `localhost` o `127.0.0.1`
3. **Modo Desarrollo Explícito**: Cuando `localStorage.getItem('DEVELOPMENT_MODE') === 'true'`

## 🔐 Credenciales de Prueba

Cuando se activa el modo desarrollo, automáticamente se configura:

```javascript
{
    email: 'test@simulador.app',
    role: 'admin',
    plan: 'pro',
    permissions: 'all'
}
```

## 🎯 Privilegios Otorgados (Plan PRO)

### Táctico
- ✅ 22 jugadores (2 equipos completos)
- ✅ 8 formaciones disponibles
- ✅ Jugadores personalizados sin límite

### Dibujo
- ✅ Líneas sin límite
- ✅ Todos los colores disponibles
- ✅ Colores personalizados

### Animación
- ✅ Frames de animación sin límite
- ✅ Duración de animación sin límite
- ✅ Grabación de audio con pantalla

### Estilos
- ✅ Todos los estilos de campo
- ✅ Todas las variantes de tarjetas

### Exportar/Compartir
- ✅ Exportar sin marca de agua
- ✅ Exportar a JSON
- ✅ Compartir en redes sociales

## 🛠️ Activación Manual

Si necesita forzar el modo desarrollo en cualquier navegador:

**En la consola del navegador (F12):**
```javascript
localStorage.setItem('DEVELOPMENT_MODE', 'true');
window.location.reload();
```

## 🔄 Desactivación

Para volver al modo normal de autenticación:

**En la consola del navegador:**
```javascript
localStorage.clear();
window.location.reload();
```

## 📝 Código Relevante

### En `index.html`

```javascript
function isGitHubPagesDev() {
    return window.location.hostname === 'kmeza.github.io' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           localStorage.getItem('DEVELOPMENT_MODE') === 'true';
}

function setupDevelopmentMode() {
    const testUser = {
        email: 'test@simulador.app',
        role: 'admin',
        plan: 'pro',
        permissions: 'all'
    };
    
    localStorage.setItem('auth_token', 'dev-token-' + Date.now());
    localStorage.setItem('user_email', testUser.email);
    localStorage.setItem('user_role', testUser.role);
    localStorage.setItem('user_plan', testUser.plan);
    localStorage.setItem('user_permissions', testUser.permissions);
}
```

### En `freemiumController.js`

El sistema verifica si `user_plan === 'pro'` en localStorage y otorga todos los privilegios:

```javascript
if (userPlan === 'pro') {
    // Plan PRO COMPLETO - Todos los privilegios
    this.userPlan = {
        name: 'pro',
        features: {
            maxPlayers: { value: 22 },
            maxLines: { value: -1 },  // Sin límite
            maxAnimationFrames: { value: -1 },
            audioRecording: { value: true },
            // ... más características
        }
    };
}
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Este sistema está diseñado SOLO para desarrollo y GitHub Pages.

- En entornos de producción con backend, este código se ignorará
- El servidor validará los tokens reales
- Las credenciales `pro` solo son válidas en localStorage local
- No se envían credenciales falsas al servidor en solicitudes reales

## 📱 Uso en GitHub Pages

Cuando la aplicación se despliega a `kmeza.github.io`, el sistema:

1. Detecta automáticamente que está en GitHub Pages
2. Configura credenciales de prueba automáticamente
3. Carga la configuración estática desde `freemiumConfigManager.js`
4. Proporciona acceso completo sin requerir autenticación

## 🧪 Testing

Para testing completo sin restricciones:

1. Abre `index.html` en tu navegador local
2. Verás automáticamente acceso como `test@simulador.app (👑 Premium)`
3. Prueba todas las funciones sin limitaciones
4. El botón "Cerrar sesión" limpia localStorage y requiere autenticación

## 📊 Estado de LocalStorage

Cuando el modo desarrollo está activo, localStorage contiene:

```
auth_token: "dev-token-1234567890"
user_email: "test@simulador.app"
user_role: "admin"
user_plan: "pro"
user_permissions: "all"
DEVELOPMENT_MODE: "true" (solo si fue manual)
```

---

**Última actualización**: Sistema implementado para facilitar testing en GitHub Pages y desarrollo local.
