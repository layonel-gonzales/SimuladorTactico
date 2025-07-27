# 🎨 Sistema de Estilos de Cancha - Documentación

## 📖 Descripción General

El Sistema de Estilos de Cancha permite personalizar la apariencia visual del campo de fútbol en el Simulador Táctico. Los usuarios pueden elegir entre diferentes estilos predefinidos a través de una interfaz intuitiva en el modal de configuración.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **FieldStyleManager** (`js/fieldStyleManager.js`)
   - Gestor central del sistema de estilos
   - Maneja la carga, aplicación y persistencia de estilos
   - Proporciona funcionalidad de preview

2. **FieldStyleIntegration** (`js/fieldStyleIntegration.js`)
   - Integra el sistema de estilos con la UI existente
   - Maneja la comunicación entre componentes
   - Proporciona botones y modales adicionales

3. **Estilos de Cancha** (`js/fieldStyles/`)
   - Implementaciones específicas de cada estilo visual
   - Modularidad para fácil extensión

## 🎨 Estilos Disponibles

### 1. 🏟️ Original
- **Archivo:** Función `drawFootballField` original
- **Descripción:** Estilo clásico del simulador
- **Características:** 
  - Verde tradicional con rayas
  - Líneas blancas estándar
  - Diseño limpio y minimalista

### 2. ⚽ Clásico
- **Archivo:** `js/fieldStyles/fieldStyleClassic.js`
- **Descripción:** Estilo tradicional de estadio
- **Características:**
  - Gradientes verdes más profundos
  - Líneas más definidas
  - Sombras suaves en las áreas

### 3. 🌟 Moderno
- **Archivo:** `js/fieldStyles/fieldStyleModern.js`
- **Descripción:** Diseño contemporáneo con efectos visuales
- **Características:**
  - Gradientes dinámicos
  - Efectos de iluminación
  - Bordes redondeados
  - Sombras avanzadas

### 4. 🌙 Nocturno
- **Archivo:** `js/fieldStyles/fieldStyleNight.js`
- **Descripción:** Ambientación de partido nocturno
- **Características:**
  - Colores más oscuros
  - Efectos de iluminación de estadio
  - Contraste elevado
  - Atmosfera nocturna realista

### 5. 🕰️ Retro
- **Archivo:** `js/fieldStyles/fieldStyleRetro.js`
- **Descripción:** Estilo vintage años 1950s
- **Características:**
  - Tonos sepia y marrones
  - Elementos cuadrados (spots de penalti)
  - Banderas de esquina en lugar de arcos
  - Textura de campo vintage

## 🔧 Configuración e Integración

### Modal de Configuración Principal

El sistema se integra en el modal de configuración principal (`index.html`) a través de:

```html
<!-- Pestaña Field en el modal de configuración -->
<div class="tab-pane fade" id="field-tab">
    <div class="field-config-section">
        <h6><i class="fas fa-palette me-2"></i>Estilo Visual</h6>
        <div class="row g-3">
            <div class="col-md-8">
                <label for="field-style-select" class="form-label">Estilo de Cancha:</label>
                <select class="form-select" id="field-style-select">
                    <!-- Opciones dinámicas -->
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Vista Previa:</label>
                <canvas id="field-preview-canvas" width="200" height="120"></canvas>
            </div>
        </div>
    </div>
</div>
```

### Inicialización en main.js

```javascript
// Importaciones
import FieldStyleManager from './fieldStyleManager.js';
import FieldStyleIntegration from './fieldStyleIntegration.js';

// Inicialización
const fieldStyleManager = new FieldStyleManager();
window.fieldStyleManager = fieldStyleManager;

const fieldStyleIntegration = new FieldStyleIntegration();
window.fieldStyleIntegration = fieldStyleIntegration;
```

### Integración con el Dibujado del Campo

```javascript
// En lugar de llamar directamente a drawFootballField:
if (window.fieldStyleManager) {
    window.fieldStyleManager.drawField(footballFieldCanvas, fieldCtx);
} else {
    drawFootballField(footballFieldCanvas, fieldCtx); // Fallback
}
```

## 🎮 Uso para el Usuario

### Acceso a la Configuración

1. **Modal Principal:** Botón "Configuración" → Pestaña "Campo"
2. **Botón Dedicado:** Botón "Estilos de Cancha" en el menú principal
3. **Modal Específico:** Modal dedicado solo para estilos

### Funcionalidades

- **Selección de Estilo:** Dropdown con todos los estilos disponibles
- **Vista Previa:** Canvas pequeño que muestra el estilo seleccionado
- **Aplicación Inmediata:** Los cambios se aplican en tiempo real
- **Persistencia:** El estilo seleccionado se guarda en localStorage

## 🛠️ Desarrollo y Extensión

### Agregar un Nuevo Estilo

1. **Crear el archivo de estilo:**
```javascript
// js/fieldStyles/fieldStyleCustom.js
export function drawFieldStyleCustom(canvas, ctx) {
    // Implementar dibujo personalizado
    // Usar misma firma que drawFootballField
}
```

2. **Registrar en FieldStyleManager:**
```javascript
// En fieldStyleManager.js, agregar al constructor:
this.styles.set('custom', {
    id: 'custom',
    name: 'Personalizado',
    icon: '🎨',
    description: 'Mi estilo personalizado',
    drawFunction: null // Se cargará dinámicamente
});
```

3. **Agregar importación dinámica:**
```javascript
// En loadStyleModules(), agregar:
case 'custom':
    const { drawFieldStyleCustom } = await import('./fieldStyles/fieldStyleCustom.js');
    return drawFieldStyleCustom;
```

### API de Eventos

El sistema emite eventos personalizados:

```javascript
// Escuchar cambios de estilo
document.addEventListener('fieldStyleChanged', (e) => {
    const { styleId, styleName } = e.detail;
    console.log(`Estilo cambiado a: ${styleName}`);
});

// Escuchar cuando se cargan los estilos
document.addEventListener('fieldStylesLoaded', (e) => {
    const { styles } = e.detail;
    console.log(`${styles.length} estilos disponibles`);
});
```

## 🧪 Testing

### Archivo de Prueba

Usar `test-field-styles.html` para probar el sistema:

```bash
# Abrir en navegador
open test-field-styles.html
```

### Funcionalidades de Test

- **Preview en Tiempo Real:** Canvas de prueba con todos los estilos
- **Log de Eventos:** Monitoreo de eventos del sistema
- **Estado del Sistema:** Verificación de componentes cargados
- **Integración Manual:** Test de funcionalidades específicas

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dispositivos
- **Desktop:** Funcionalidad completa
- **Tablet:** Interfaz adaptada
- **Mobile:** UI optimizada con botones simplificados

## 🔍 Troubleshooting

### Problemas Comunes

1. **Los estilos no se cargan:**
   - Verificar que los archivos estén en `js/fieldStyles/`
   - Comprobar errores en la consola del navegador
   - Verificar importaciones ES6

2. **El preview no funciona:**
   - Verificar que el canvas tenga contexto 2D
   - Comprobar dimensiones del canvas
   - Verificar que la función de dibujo sea válida

3. **La persistencia no funciona:**
   - Verificar localStorage del navegador
   - Comprobar que no esté en modo privado
   - Verificar permisos de almacenamiento

### Debug Mode

Activar modo debug en la configuración avanzada para ver indicadores visuales y logs detallados.

## 📝 Estructura de Archivos

```
SimuladorTactico/
├── js/
│   ├── fieldStyleManager.js           # Gestor principal
│   ├── fieldStyleIntegration.js       # Integración con UI
│   └── fieldStyles/                   # Estilos individuales
│       ├── fieldStyleClassic.js       # Estilo clásico
│       ├── fieldStyleModern.js        # Estilo moderno
│       ├── fieldStyleNight.js         # Estilo nocturno
│       └── fieldStyleRetro.js         # Estilo retro
├── css/
│   └── estilo.css                     # Estilos CSS (con sistema de estilos)
├── index.html                         # Modal de configuración integrado
├── test-field-styles.html            # Página de pruebas
└── FIELD_STYLES_SYSTEM.md           # Esta documentación
```

## 🚀 Próximas Mejoras

### Funcionalidades Planeadas

1. **Editor de Estilos:** Herramienta visual para crear estilos personalizados
2. **Importar/Exportar:** Compartir estilos entre usuarios
3. **Animaciones de Transición:** Transiciones suaves entre estilos
4. **Más Estilos:** Estadios famosos, condiciones climáticas, etc.
5. **Configuración Avanzada:** Personalización de colores, texturas, etc.

---

## 📞 Soporte

Para problemas o sugerencias relacionadas con el sistema de estilos de cancha, revisar:

1. **Consola del navegador:** Errores y warnings
2. **Archivo de test:** `test-field-styles.html` para diagnósticos
3. **Estado del sistema:** Modal de configuración → Avanzado → Modo Debug

---

*Documentación actualizada: Diciembre 2024*  
*Versión del Sistema: 1.0.0*
