# 🚀 **QUICK START GUIDE PARA TESTER**
**Configuración Rápida del Entorno de Testing**

---

## ⚡ **SETUP INICIAL (5 MINUTOS)**

### **1. Verificar Estructura del Proyecto**
```bash
# Verifica que tienes estos archivos principales:
C:\Users\layon\OneDrive\Escritorio\SimuladorTactico\
├── index.html                    ← App principal
├── admin-panel.html              ← Panel admin  
├── dev-panel.html                ← Panel desarrollo
├── payment-test.html             ← Testing pagos
├── config/freemium-config.json   ← Configuración
└── server/freemium-server.js     ← Servidor
```

### **2. Iniciar Servidor (OBLIGATORIO)**
```bash
# Abrir PowerShell en el directorio del proyecto
cd "C:\Users\layon\OneDrive\Escritorio\SimuladorTactico"

# Iniciar servidor
node server/freemium-server.js

# Deberías ver: "🚀 Servidor Freemium corriendo en puerto 3001"
```

### **3. URLs de Testing Principales**
```
✅ App Principal:      http://localhost:3001
✅ Panel Admin:        http://localhost:3001/admin-panel.html  
✅ Panel Desarrollo:   http://localhost:3001/dev-panel.html
✅ Testing Pagos:      http://localhost:3001/payment-test.html
```

---

## 🎯 **TESTING RÁPIDO DIARIO (15 MINUTOS)**

### **⚡ Smoke Test (5 min)**
1. **App Principal** → ¿Carga sin errores?
2. **Dibujar 3 líneas** → ¿Funciona el dibujo?
3. **Cargar jugadores 4-4-2** → ¿Aparecen los jugadores?
4. **Intentar dibujar línea #6** → ¿Aparece modal de upgrade?
5. **Abrir Panel Admin** → Password: `SimuladorTactico2025!`

### **💰 Test Sistema Pagos (5 min)**
1. Ir a `http://localhost:3001/payment-test.html`
2. Verificar banner "MODO PRUEBA"
3. Hacer clic en "Probar Premium" 
4. Verificar simulación exitosa
5. Hacer clic en "Simular Webhook: Pago Exitoso"

### **⚙️ Test Configuración (5 min)**
1. En Panel Admin, cambiar límite de líneas de 5 a 3
2. Guardar configuración
3. Volver a app principal
4. Intentar dibujar línea #4 → ¿Bloqueada?
5. Restaurar límite a 5

---

## 🔍 **TESTING SEMANAL COMPLETO**

### **Día 1: Funcionalidades Core**
- ✅ Sistema de dibujo completo
- ✅ Gestión de jugadores y formaciones  
- ✅ Limitaciones freemium básicas

### **Día 2: Sistema de Animaciones**
- ✅ Creación de animaciones
- ✅ Controles de reproducción
- ✅ Límites de duración y frames

### **Día 3: Sistema de Pagos**
- ✅ Testing completo en payment-test.html
- ✅ Simulación de webhooks
- ✅ Flujos de upgrade

### **Día 4: Administración y Configuración**
- ✅ Panel admin completo
- ✅ Modificación de configuraciones
- ✅ Backup y restore

### **Día 5: Cross-Browser y Performance**
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Tiempos de carga
- ✅ Stress testing

---

## 🐛 **REPORTE RÁPIDO DE BUGS**

### **Bug Crítico (Inmediato)**
```
🔴 CRÍTICO - [Descripción breve]
Pasos: 1. 2. 3.
Error: [Qué pasa mal]
Esperado: [Qué debería pasar]
```

### **Bug Normal**
```
🟡 MEDIO - [Descripción breve]  
Módulo: [Área afectada]
Reproducible: Sí/No
Evidencia: Screenshot adjunto
```

---

## 📱 **ATAJOS DE TESTING**

### **Comandos de Consola Útiles**
```javascript
// Ver estado del sistema freemium
freemiumController.getDebugInfo()

// Cambiar plan manualmente  
freemiumController.setPlan('premium')

// Ver configuración actual
freemiumController.currentConfig

// Simular limitación alcanzada
freemiumController.checkLimit('maxLines', 6)
```

### **URLs Directas para Testing**
```
Admin Panel: http://localhost:3001/admin-panel.html?direct=true
Dev Tools:   http://localhost:3001/dev-panel.html
Payment Test: http://localhost:3001/payment-test.html
Config Test: http://localhost:3001/config-test.html
```

---

## ⚠️ **PROBLEMAS COMUNES**

### **Problema: "Cannot GET /"**
**Solución**: Asegúrate de que el servidor esté ejecutándose
```bash
# En PowerShell, desde el directorio del proyecto:
cd "C:\Users\layon\OneDrive\Escritorio\SimuladorTactico"
npm install  # Solo la primera vez
npm start    # o node server/freemium-server.js
```

### **Problema: "EADDRINUSE port 3001"**
**Solución**: El puerto está ocupado
```bash
# Encontrar y terminar proceso en puerto 3001
netstat -ano | findstr :3001
taskkill /PID [número_de_proceso] /F
```

### **Error: "Configuration not loaded"**  
**Solución**: Verifica que existe `config/freemium-config.json`

### **Error: "Payment system not available"**
**Solución**: Estás en `payment-test.html` en localhost? Debe mostrar "MODO PRUEBA"

### **Limitaciones no funcionan**
**Solución**: 
1. Revisar consola por errores
2. Ejecutar `freemiumController.getDebugInfo()` 
3. Verificar que configuración está cargada

---

## 📋 **CHECKLIST PRE-TESTING**

**Antes de empezar cada sesión:**
- [ ] Servidor ejecutándose (`npm start` desde la raíz del proyecto)
- [ ] App principal carga (`http://localhost:3001`)  
- [ ] Sin errores críticos en consola
- [ ] Panel admin accesible
- [ ] Templates de reporte preparados

**Al finalizar cada sesión:**
- [ ] Todos los bugs documentados
- [ ] Estado actual del sistema anotado
- [ ] Prioridades para mañana definidas
- [ ] Evidencia guardada (screenshots, videos)

---

## 🎯 **MÉTRICAS DE ÉXITO**

### **Sistema Estable**
- ✅ 95%+ test cases pasan
- ✅ 0 bugs críticos abiertos  
- ✅ Carga < 3 segundos
- ✅ Funciona en 4 navegadores principales

### **Sistema Listo para Producción**
- ✅ 99%+ test cases pasan
- ✅ 0 bugs críticos/altos abiertos
- ✅ Performance optimizada
- ✅ Seguridad validada

---

## 📞 **CONTACTO DESARROLLADOR**

**Para bugs críticos o bloqueos:**
- 🔴 **Inmediato**: Screenshot + descripción breve
- 🟠 **Urgente**: Reporte completo mismo día  
- 🟡 **Normal**: Reporte en próxima actualización

**Información siempre incluir:**
- URL exacta donde ocurre
- Pasos para reproducir  
- Screenshot/video
- Navegador y versión
- Mensaje de error (si existe)

---

## 🚀 **¡LISTO PARA TESTING!**

**Tu workflow diario:**
1. **Iniciar servidor** (5 min)
2. **Smoke test** (15 min)  
3. **Testing específico** (45 min)
4. **Documentar bugs** (15 min)
5. **Planning mañana** (5 min)

**¡Encuentra todos los bugs antes que los usuarios! 🐛🔍**
