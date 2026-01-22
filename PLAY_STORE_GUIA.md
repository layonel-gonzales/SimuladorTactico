# 🚀 PRÓXIMOS PASOS: PUBLICAR EN PLAY STORE

Ahora que tu proyecto tiene un sistema modular sólido, es momento de prepararlo para Play Store.

---

## 1️⃣ INSTALACIÓN DE CAPACITOR (Para convertir PWA en APK)

### Paso 1: Instalar Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init

# Te pedirá:
# - App name: "Simulador Táctico"
# - App ID: com.simulador.tactico (importante para Play Store)
# - Directory: . (punto, en la raíz)
```

### Paso 2: Instalar plataforma Android
```bash
npm install @capacitor/android
npx cap add android
```

### Paso 3: Configurar capacitor.config.json
```json
{
  "appId": "com.simulador.tactico",
  "appName": "Simulador Táctico",
  "webDir": ".",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "server": {
    "androidScheme": "https"
  }
}
```

### Paso 4: Sincronizar cambios
```bash
npm run build  # Si tienes build script, sino ignora
npx cap sync
```

---

## 2️⃣ BACKEND PARA PLAY STORE

El servidor local (`localhost:3000`) **no funcionará en móvil**. Necesitas un backend remoto.

### Opción A: Firebase Auth (Más fácil para MVP)
```bash
# 1. Crear proyecto en https://firebase.google.com
# 2. Instalar SDK
npm install firebase

# 3. Inicializar en tu app
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "your-project.firebaseapp.com",
  // ... resto de config
};

firebase.initializeApp(firebaseConfig);
```

Cambiar `js/freemiumAuthSystem-simple.js`:
```javascript
// En lugar de fetch a localhost:3000
// Usar firebase.auth().signInWithEmailAndPassword()
```

### Opción B: Heroku (Backend Express remoto)
```bash
# 1. Crear cuenta en https://www.heroku.com
# 2. Deployar tu servidor
heroku login
heroku create simulador-tactico
git push heroku main

# 3. Cambiar API URL en freemiumAuthSystem-simple.js
this.apiUrl = 'https://simulador-tactico.herokuapp.com/api';
```

### Opción C: Railway.app (Más fácil que Heroku)
```bash
# 1. Crear cuenta en https://railway.app
# 2. Conectar repositorio GitHub
# 3. Deploy automático
# 4. Actualizar URL
this.apiUrl = 'https://your-railway-app.up.railway.app/api';
```

---

## 3️⃣ CONFIGURACIÓN PARA PLAY STORE

### Crear archivo `package.android.json` (metadatos)
```json
{
  "appName": "Simulador Táctico",
  "appId": "com.simulador.tactico",
  "versionCode": 1,
  "versionName": "1.0.0",
  "minSdkVersion": 24,
  "targetSdkVersion": 34,
  "permissions": [
    "INTERNET",
    "WRITE_EXTERNAL_STORAGE",
    "READ_EXTERNAL_STORAGE",
    "CAMERA"
  ]
}
```

### Crear Iconos (Requerido)
```
Necesitas múltiples tamaños:
- icon-192.png (192x192)
- icon-512.png (512x512)
- icon-1024.png (1024x1024 para Play Store)

Ubicación: img/icon-*.png
```

### Crear Screenshot para Play Store
- Mínimo 2 screenshots
- Tamaño: 1080x1920 px (portrait)
- Mostrar: campo, jugadores, estilos, UI

---

## 4️⃣ COMPILAR APK

### Debug (Para testear en dispositivo)
```bash
npx cap open android

# Se abre Android Studio
# Build → Build Bundle(s) / APK(s) → Build APK(s)
# Archivo genera en: android/app/build/outputs/apk/debug/
```

### Release (Para Play Store)
```bash
# 1. Generar keystore (solo primera vez)
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# 2. En Android Studio
# Build → Build Bundle(s) / APK(s) → Build Bundle(s)
# Seleccionar release
# Seleccionar keystore (release-key.jks)
# Contraseña: (que creaste arriba)

# Archivo genera: android/app/build/outputs/bundle/release/
```

---

## 5️⃣ PUBLICAR EN PLAY STORE

### Crear cuenta Google Play
1. Ir a https://play.google.com/apps/publish
2. Pagar tarifa de desarrollador ($25 USD, una sola vez)
3. Crear nuevo proyecto

### Llenar información de la app
```
Información básica:
- Nombre: Simulador Táctico
- Descripción: App para crear y simular tácticas de fútbol
- Categoría: Deportes
- Contenido: PEGI 3

Capturas de pantalla:
- 2 mínimo de 1080x1920

Icono de app:
- 512x512 PNG

Video de preview:
- Opcional pero recomendado

Privacidad:
- Política de privacidad (URL)
- Recolectarás datos de usuarios?
```

### Subir APK/Bundle
```
1. Click en "Create a new release"
2. Seleccionar "Production"
3. Subir Bundle (.aab) de Android Studio
4. Revisar cambios
5. Publicar
```

---

## 6️⃣ LISTA DE VERIFICACIÓN PRE-PUBLICACIÓN

- [ ] Sistema de autenticación funciona en móvil
- [ ] Backend remoto configurado y funcionando
- [ ] API URL apunta a backend remoto
- [ ] Dibujo de campo funciona en móvil
- [ ] Cards se crean correctamente en móvil
- [ ] Estilos carguen sin errores
- [ ] Orientación (portrait/landscape) funciona
- [ ] PWA offline funciona (service worker)
- [ ] Iconos en diferentes resoluciones
- [ ] Privacy policy en sitio web
- [ ] Terms of Service listos
- [ ] No hay console.errors en móvil
- [ ] Performance aceptable (<3s carga)
- [ ] Pruebas en Android 8+ mínimo

---

## 7️⃣ TESTING EN DISPOSITIVO REAL

Antes de publicar, prueba en móvil real:

```bash
# Conectar dispositivo Android vía USB
# Habilitar "Modo de desarrollador"

# En Android Studio
# Device Manager → Seleccionar tu dispositivo
# Build & Run

# O desde línea de comandos
npx cap run android
```

---

## 8️⃣ ALTERNATIVA: App Store iOS (Futuro)

Si quieres también en iOS:

```bash
# Instalar plataforma iOS
npm install @capacitor/ios
npx cap add ios

# Compilar
npx cap open ios

# En Xcode
# Product → Archive → Distribute App
```

Necesitarás:
- Mac (no se puede en Windows)
- Cuenta Apple Developer ($99/año)
- Certificados de desarrollo

---

## ⚠️ PROBLEMAS COMUNES

### "API calls fail on mobile"
**Solución**: Backend no es remoto. Sigue paso 2 (Firebase o Heroku).

### "Blank white screen en móvil"
**Solución**: 
```
1. Abre DevTools (F12) en Chrome
2. Remote debugging en tu móvil
3. Revisa errores en consola
4. Probablemente CORS o API no funciona
```

### "Estilos no cargan"
**Solución**:
```javascript
// En consola del móvil
window.styleRegistry.getStats()
// Si devuelve 0, estilos no cargaron
// Revisa que styleLoader.js se ejecutó
```

### "Rendimiento lento"
**Solución**:
```javascript
// Reduce número de estilos
// Optimiza imágenes (comprime a 100KB max)
// Usa lazy loading para cards
```

---

## 📊 ESTIMACIÓN DE TIEMPO

| Tarea | Tiempo | Dificultad |
|-------|--------|-----------|
| Instalar Capacitor | 15 min | ⭐ Fácil |
| Configurar backend | 30 min | ⭐⭐ Media |
| Compilar APK debug | 20 min | ⭐ Fácil |
| Testing en móvil | 1-2 hrs | ⭐⭐ Media |
| Compilar APK release | 20 min | ⭐ Fácil |
| Preparar Play Store | 1 hr | ⭐⭐⭐ Difícil |
| Publicar en Play Store | 5 min | ⭐ Fácil |
| **TOTAL** | **3-4 horas** | |

---

## 💡 TIPS FINALES

✅ **MVP mínimo**: Solo auth + campo + estilos  
✅ **Monetización**: Vende estilos premium en futuro  
✅ **Actualizaciones**: Deploy sin Play Store (vía API)  
✅ **Testing**: Firebase Testing Lab (gratis)  
✅ **Analytics**: Google Firebase Analytics  

---

## 📚 RECURSOS

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Play Store Guidelines](https://play.google.com/console/about/gettingstarted/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

---

## ✅ CHECKLIST FINAL

```
Antes de publicar:

□ Capacitor instalado
□ Backend remoto funcionando
□ APK compilado correctamente
□ Testing en dispositivo real OK
□ Google Play account creada
□ Iconos en todas las resoluciones
□ Screenshots listos
□ Descripción revisada
□ Privacy policy publicada
□ Email de soporte configurado
□ Presupuesto de marketing planeado

PUBLICAR → 🚀 Play Store

Después de publicar:

□ Monitorear reviews
□ Estar atento a crashes
□ Responder comentarios
□ Planear actualizaciones
□ Agregar más estilos
□ Monetización de estilos
```

---

**Estás a 3-4 horas de tener tu app en Play Store** 🎉

---

*Guía actualizada: 21 de Enero, 2026*
