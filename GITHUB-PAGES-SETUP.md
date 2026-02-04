# 📋 GUÍA PARA PUBLICAR EN GITHUB PAGES

## ✅ Requisitos Previos

1. Repositorio en GitHub
2. Git instalado en tu computadora
3. Terminal/PowerShell acceso

## 🚀 Método 1: Usando el Script (Recomendado)

### En Windows (PowerShell):
```powershell
cd c:\Users\kmeza\OneDrive\Desktop\SimuladorTactico
.\publish-gh-pages.ps1
```

### En Mac/Linux:
```bash
cd ~/Desktop/SimuladorTactico
chmod +x publish-gh-pages.sh
./publish-gh-pages.sh
```

## 🔧 Método 2: Manual (Paso a Paso)

### Paso 1: Clonar el repositorio (primera vez)
```bash
git clone https://github.com/tu-usuario/simulador-tactico.git
cd simulador-tactico
```

### Paso 2: Crear rama gh-pages
```bash
# Opción A: Si es la primera vez
git checkout -b gh-pages

# Opción B: Si ya existe
git checkout gh-pages
```

### Paso 3: Sincronizar cambios
```bash
# Traer cambios de main si es necesario
git merge main --allow-unrelated-histories
```

### Paso 4: Subir a GitHub
```bash
git push -u origin gh-pages
```

### Paso 5: Volver a main
```bash
git checkout main
```

## 🔐 Configurar GitHub Pages

Después de hacer push a gh-pages:

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú izquierdo, busca **Pages**
4. Selecciona:
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages` / `/ (root)`
5. Click en **Save**

## ✨ Verificar Publicación

Tu sitio estará disponible en:
```
https://tu-usuario.github.io/simulador-tactico
```

**Nota**: GitHub Pages puede tardar 5-10 minutos para actualizar

## 🧪 Probar en Diferentes Dispositivos

### Desde el mismo WiFi:
```
Escribe en navegador: https://tu-usuario.github.io/simulador-tactico
```

### Desde QR (para móviles):
```
Genera un QR de la URL y comparte
```

### Desde redes externas:
La URL funciona desde cualquier internet

## 📱 Probar en Móvil

1. Abre cualquier navegador (Chrome, Safari, Firefox)
2. Escribe la URL: `https://tu-usuario.github.io/simulador-tactico`
3. Permitir permisos de:
   - Pantalla/Grabación
   - Micrófono (si quieres audio)
4. Click en "Descargar" para probar grabación

## 🐛 Solución de Problemas

### "No se carga la página"
- Espera 10 minutos después de hacer push
- Limpia cache: Ctrl+Shift+Del (Chrome) o Cmd+Shift+Del (Safari)
- Usa modo incógnito

### "Falta CSS o imágenes"
- Abre la consola (F12)
- Busca errores 404
- Verifica que los archivos estén en el repositorio

### "No funciona grabación de audio"
- iOS: Necesita HTTPS (GitHub Pages lo proporciona ✅)
- Android: Necesita permiso de micrófono
- Desktop: Necesita permiso de pantalla

### "Datos no se guardan"
- Esto es normal en GitHub Pages (no hay backend)
- Los datos se guardan en localStorage del dispositivo
- Exporta JSON para mantener tus tácticas

## 📊 Monitoreo

GitHub Pages proporciona analytics en Settings → Pages

## 🔄 Actualizaciones

Para actualizar el sitio en GitHub Pages:

```bash
# Hacer cambios locales
# Commitear cambios
git add .
git commit -m "Descripción del cambio"

# Cambiar a rama gh-pages
git checkout gh-pages

# Sincronizar con main
git merge main

# Subir cambios
git push origin gh-pages

# Volver a main
git checkout main
```

## 🎯 Casos de Uso Recomendados

### Para Entrenamientos:
- Comparte el link con jugadores
- Ellos pueden ver la táctica en sus móviles
- Graban videos para análisis posterior

### Para Presentaciones:
- Abre en sala de conferencias
- Proyecta en pantalla
- Demo en vivo

### Para Desarrollo:
- Mantén `main` para cambios
- `gh-pages` para versión publicada
- Sincroniza cuando esté estable

## 📞 Soporte

Si tienes problemas:
1. Verifica que estés en la rama gh-pages correcta
2. Revisa la consola del navegador (F12)
3. Abre un issue en GitHub
4. Limpia cache y cookies

---

¡Tu Simulador Táctico está listo para ser compartido! 🚀⚽
