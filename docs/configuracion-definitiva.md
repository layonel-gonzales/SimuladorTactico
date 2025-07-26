# 🚀 **GUÍA DEFINITIVA DE CONFIGURACIÓN - SIMULADOR TÁCTICO**
**Manual de Setup Correcto para el Tester**

---

## ✅ **CONFIGURACIÓN CONFIRMADA Y VERIFICADA**

### **🔧 Setup Inicial (OBLIGATORIO)**

#### **1. Verificar Estructura del Proyecto**
```bash
# El proyecto debe estar en:
C:\Users\layon\OneDrive\Escritorio\SimuladorTactico\

# Archivos principales confirmados:
✅ server/freemium-server.js    # Servidor backend
✅ index.html                   # App principal  
✅ package.json                 # Configuración npm
✅ config/freemium-config.json  # Configuración freemium
```

#### **2. Instalar Dependencias (Solo Primera Vez)**
```bash
# Abrir PowerShell como ADMINISTRADOR
cd "C:\Users\layon\OneDrive\Escritorio\SimuladorTactico"

# Instalar dependencias
npm install

# Verificar instalación exitosa
npm list --depth=0
```

#### **3. Iniciar el Servidor**
```bash
# Comando principal (desde la raíz del proyecto)
npm start

# Deberías ver exactamente esto:
👤 Usuario de prueba creado: test@simulador.com / password123
🚀 Servidor Freemium corriendo en puerto 3001
📊 Panel de admin: http://localhost:3001/admin
🔗 API Base: http://localhost:3001/api
```

---

## 🌐 **URLS OFICIALES DE TESTING**

### **URLs Principales**
```
🏠 Aplicación Principal:    http://localhost:3001
🏠 Aplicación (directo):    http://localhost:3001/index.html
⚙️  Panel Admin:            http://localhost:3001/admin-panel.html
🔧 Panel Desarrollo:        http://localhost:3001/dev-panel.html
💳 Testing de Pagos:        http://localhost:3001/payment-test.html
```

### **APIs de Testing**
```
📊 Estado del servidor:     http://localhost:3001/api/health
⚙️  Configuración:          http://localhost:3001/api/config
👤 Usuario de prueba:       http://localhost:3001/api/user/status
```

---

## 🔑 **CREDENCIALES DE ACCESO**

### **Panel de Administración**
```
URL:      http://localhost:3001/admin-panel.html
Password: SimuladorTactico2025!
```

### **Usuario de Prueba del Servidor**
```
Email:    test@simulador.com
Password: password123
Plan:     Premium (activo)
```

### **Plans de Testing**
```
🆓 Gratuito: Acceso directo (sin login)
💎 Premium:  Simular upgrade en payment-test.html  
🏆 Pro:      Simular upgrade en payment-test.html
```

---

## ⚠️ **TROUBLESHOOTING CONFIRMADO**

### **Error: "EADDRINUSE port 3001"**
```bash
# 1. Encontrar proceso ocupando puerto
netstat -ano | findstr :3001

# 2. Terminar proceso (cambiar PID por el número real)
taskkill /PID [número_del_PID] /F

# 3. Reiniciar servidor
npm start
```

### **Error: "Cannot GET /"**
```bash
# Verificar que el servidor esté corriendo
# Debes ver el mensaje: "🚀 Servidor Freemium corriendo en puerto 3001"

# Si no está corriendo:
cd "C:\Users\layon\OneDrive\Escritorio\SimuladorTactico"
npm start
```

### **Error: "Module not found"**
```bash
# Instalar dependencias
npm install

# Si persiste, limpiar y reinstalar
rmdir /s node_modules
del package-lock.json
npm install
```

---

## 🧪 **VERIFICACIÓN RÁPIDA DEL SISTEMA**

### **Test de 2 Minutos (Ejecutar Siempre)**
```bash
# 1. Verificar servidor activo
curl.exe -s -o nul -w "%{http_code}" http://localhost:3001/index.html
# Resultado esperado: 200

# 2. Verificar API funcionando  
curl.exe -s http://localhost:3001/api/health
# Resultado esperado: {"status":"OK",...}

# 3. Verificar configuración cargada
curl.exe -s http://localhost:3001/api/config
# Resultado esperado: JSON con planes free, premium, pro
```

### **Test Visual (En el Navegador)**
1. **Abrir**: `http://localhost:3001`
2. **Verificar**: Aplicación carga sin errores
3. **Verificar**: No hay errores en consola (F12)
4. **Verificar**: Panel admin accesible con password

---

## 📋 **WORKFLOW DE TESTING DIARIO**

### **Inicio de Sesión (5 min)**
```bash
# 1. Abrir PowerShell en el directorio correcto
cd "C:\Users\layon\OneDrive\Escritorio\SimuladorTactico"

# 2. Verificar que no hay proceso corriendo en puerto 3001
netstat -ano | findstr :3001
# Si aparece algo, terminar proceso

# 3. Iniciar servidor
npm start

# 4. Verificar en navegador
# - http://localhost:3001 carga
# - No errores en consola
```

### **Testing Principal (Según Plan del Día)**
- **Funcional**: Usar casos TC001-TC029 del manual completo
- **Smoke Test**: 15 minutos de pruebas básicas
- **Regresión**: Verificar funcionalidades ya probadas

### **Fin de Sesión (2 min)**
```bash
# 1. Documentar bugs encontrados
# 2. Terminar servidor (Ctrl+C en PowerShell)
# 3. Guardar reportes de testing
```

---

## 🎯 **COMANDOS ESSENCIALES PARA EL TESTER**

### **Gestión del Servidor**
```bash
# Iniciar
npm start

# Verificar estado
netstat -ano | findstr :3001

# Terminar (en caso de problemas)
taskkill /PID [número] /F
```

### **Testing de APIs**
```bash
# Salud del sistema
curl.exe -s http://localhost:3001/api/health

# Configuración actual
curl.exe -s http://localhost:3001/api/config

# Verificar archivo principal
curl.exe -s -o nul -w "%{http_code}" http://localhost:3001/index.html
```

### **Comandos de Consola del Navegador**
```javascript
// Ver estado del sistema freemium
freemiumController.getDebugInfo()

// Cambiar plan para testing
freemiumController.setPlan('premium')

// Verificar limitación específica
freemiumController.checkLimit('maxLines', 6)
```

---

## 🔄 **STATUS ACTUAL DEL SISTEMA**

### **✅ VERIFICADO Y FUNCIONANDO**
- ✅ Servidor se inicia correctamente en puerto 3001
- ✅ Aplicación principal accesible 
- ✅ Panel admin funcional con password
- ✅ APIs del sistema responden correctamente
- ✅ Configuración freemium cargada
- ✅ Usuario de prueba creado automáticamente

### **📋 LISTO PARA TESTING**
- ✅ Todas las dependencias instaladas
- ✅ Servidor configurado correctamente
- ✅ URLs de testing funcionales
- ✅ Sistema de pagos en modo test
- ✅ Panel de desarrollo accesible

---

## 📞 **CONTACTO PARA SOPORTE**

**Si encuentras problemas no listados aquí:**

1. **🔴 CRÍTICO**: Screenshot + descripción inmediata
2. **🟠 URGENTE**: Reporte detallado mismo día  
3. **🟡 NORMAL**: Incluir en próximo reporte

**Información siempre incluir:**
- URL exacta del problema
- Mensaje de error completo
- Screenshot de la consola (F12)
- Navegador y versión
- Estado del servidor (corriendo/no corriendo)

---

## 🚀 **¡SISTEMA LISTO PARA TESTING PROFESIONAL!**

**Tu configuración está verificada y lista. Ahora puedes:**
- ✅ Ejecutar todos los casos de prueba del manual completo
- ✅ Usar las herramientas de testing de pagos
- ✅ Acceder al panel de administración  
- ✅ Reportar bugs con confianza total

**¡A encontrar esos bugs antes que los usuarios! 🐛🔍**
