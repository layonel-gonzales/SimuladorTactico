# 🎨 GUÍA DE SISTEMA MODULAR DE ESTILOS

## Descripción General

El proyecto ahora utiliza un **sistema modular de estilos** que permite agregar, modificar y eliminar estilos sin reprogramar archivos completos. Esto es ideal para un MVP que necesita escalabilidad en Play Store.

## Arquitectura

```
styleRegistry.js (Central)
    ├── CardStyles (Estilos de Cartas de Jugadores)
    │   ├── cardStyleClassic.js
    │   ├── cardStyleModern.js
    │   ├── cardStyleFifa.js
    │   └── cardStyleRetro.js
    │
    ├── FieldStyles (Estilos de Campos)
    │   ├── fieldStyleClassic.js
    │   ├── fieldStyleModern.js
    │   ├── fieldStyleNight.js
    │   └── fieldStyleRetro.js
    │
    └── Managers (Controladores)
        ├── cardStyleManager-refactored.js
        └── fieldStyleManager-refactored.js
```

## Cómo Funciona

### 1. **StyleRegistry** (Centro de Registro)
Archivo: `js/styleRegistry.js`

Es un singleton que actúa como registro central de todos los estilos:

```javascript
// Registrar un estilo de card
window.styleRegistry.registerCardStyle('miEstilo', {
    name: 'Mi Estilo',
    description: 'Descripción del estilo',
    icon: '🎴',
    theme: { primary: '#333', secondary: '#fff', accent: '#f00' },
    createFunction: function(player, type, cardId, screenType, theme, playerId) {
        // Retornar HTML de la card
        return '<div>...</div>';
    }
});

// Registrar un estilo de campo
window.styleRegistry.registerFieldStyle('miCampo', {
    name: 'Mi Campo',
    description: 'Descripción del campo',
    icon: '⚽',
    drawFunction: function(canvas, ctx) {
        // Dibujar el campo
    }
});
```

**Métodos disponibles:**
- `registerCardStyle(id, config)` - Registrar estilo de card
- `registerFieldStyle(id, config)` - Registrar estilo de campo
- `getCardStyle(id)` - Obtener estilo de card
- `getFieldStyle(id)` - Obtener estilo de campo
- `getAllCardStyles()` - Listar todos los estilos de card
- `getAllFieldStyles()` - Listar todos los estilos de campo
- `removeCardStyle(id)` - Eliminar estilo de card
- `removeFieldStyle(id)` - Eliminar estilo de campo

### 2. **CardStyleManager** (Gestor de Estilos de Cartas)
Archivo: `js/cardStyleManager-refactored.js`

Controla qué estilo de card se usa actualmente:

```javascript
// Cambiar estilo actual
window.cardStyleManager.setCurrentStyle('modern');

// Crear una card con el estilo actual
const html = window.cardStyleManager.createStyledCard(player, 'field');

// Obtener estilos disponibles
const styles = window.cardStyleManager.getAvailableStyles();

// Registrar un nuevo estilo dinámicamente
window.cardStyleManager.registerCustomStyle('custom', {
    name: 'Custom',
    description: 'Mi estilo personalizado',
    icon: '🎨',
    createFunction: (player, type, cardId, screenType, theme, playerId) => {
        return '<div>...</div>';
    }
});

// Eliminar un estilo
window.cardStyleManager.removeStyle('custom');
```

### 3. **FieldStyleManager** (Gestor de Estilos de Campos)
Archivo: `js/fieldStyleManager-refactored.js`

Controla qué estilo de campo se dibuja:

```javascript
// Cambiar estilo actual
window.fieldStyleManager.setStyle('modern');

// Dibujar el campo con el estilo actual
window.fieldStyleManager.drawField(canvas, ctx);

// Redibujar el campo
window.fieldStyleManager.redrawField();

// Obtener estilos disponibles
const styles = window.fieldStyleManager.getAvailableStyles();

// Registrar un nuevo estilo dinámicamente
window.fieldStyleManager.registerCustomStyle('custom', {
    name: 'Custom',
    description: 'Mi campo personalizado',
    icon: '🏟️',
    drawFunction: (canvas, ctx) => {
        // Dibujar el campo
    }
});

// Eliminar un estilo
window.fieldStyleManager.removeStyle('custom');
```

## Agregar un Nuevo Estilo

### Para Estilos de Cartas:

**1. Crear archivo `js/cardStyles/cardStyleNombreDelEstilo.js`:**

```javascript
/**
 * 🎴 ESTILO PERSONALIZADO PARA CARDS DE JUGADORES
 * Descripción del estilo
 */

function createCustomCard(player, type = 'field', cardId, screenType, theme, playerId) {
    const actualPlayerId = playerId || player.id || 'unknown';
    
    if (type === 'field') {
        // HTML para cards en el campo
        return `
            <div class="custom-card" data-player-id="${actualPlayerId}">
                <div class="custom-header">${player.name}</div>
                <div class="custom-rating">${player.rating}</div>
            </div>
        `;
    } else {
        // HTML para cards en el squad
        return `
            <div class="custom-squad-card" data-player-id="${actualPlayerId}">
                <img src="${player.image}" alt="${player.name}">
                <span>${player.name}</span>
            </div>
        `;
    }
}

// Registrar automáticamente en el sistema
if (window.styleRegistry) {
    window.styleRegistry.registerCardStyle('custom', {
        name: 'Mi Estilo Personalizado',
        description: 'Una descripción interesante',
        icon: '🎨',
        theme: {
            primary: '#000',
            secondary: '#fff',
            accent: '#f00'
        },
        createFunction: createCustomCard
    });
}
```

**2. Agregar el script en `index.html`:**

El archivo se cargará automáticamente a través de `styleLoader.js` si lo agregas a la lista `cardStyleModules`.

O cargarlo manualmente en cualquier momento:

```html
<script src="js/cardStyles/cardStyleNombreDelEstilo.js"></script>
```

### Para Estilos de Campos:

**1. Crear archivo `js/fieldStyles/fieldStyleNombreDelEstilo.js`:**

```javascript
/**
 * ⚽ ESTILO DE CAMPO PERSONALIZADO
 * Descripción del estilo
 */

export function drawCustomField(canvas, ctx) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    
    canvas.width = cssWidth * window.devicePixelRatio;
    canvas.height = cssHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Dibujar el campo
    ctx.fillStyle = '#0a5c2a';
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Agregar más detalles...
}

// Registrar automáticamente en el sistema
if (window.styleRegistry) {
    window.styleRegistry.registerFieldStyle('custom', {
        name: 'Mi Campo Personalizado',
        description: 'Una descripción interesante',
        icon: '🏟️',
        drawFunction: drawCustomField
    });
}
```

**2. Importar en `js/fieldStyleManager-refactored.js` o `js/main.js`:**

```javascript
import { drawCustomField } from './fieldStyles/fieldStyleNombreDelEstilo.js';

// Se registrará automáticamente cuando se cargue
```

## Compatibilidad con Código Existente

El nuevo sistema es **100% compatible** con el código actual:

- **cardStyleManager**: Los managers antiguos siguen disponibles para referencia
- **FieldStyleManager**: Importable como módulo ES6 desde `main.js`
- **HTML/CSS**: Sin cambios; los nuevos managers usan las mismas clases CSS

## Casos de Uso

### Agregar un estilo dinámicamente en tiempo de ejecución:

```javascript
// Ej: Usuario sube un estilo personalizado
const customStyle = {
    name: 'Neon Retro',
    description: 'Un estilo Neon de los 80s',
    icon: '⚡',
    createFunction: (player, type, cardId, screenType, theme, playerId) => {
        // HTML personalizado
        return '<div>...</div>';
    }
};

window.cardStyleManager.registerCustomStyle('neon-retro', customStyle);
window.cardStyleManager.setCurrentStyle('neon-retro');
```

### Eliminar un estilo que no se usa:

```javascript
window.cardStyleManager.removeStyle('old-style');
window.fieldStyleManager.removeStyle('old-field');
```

### Verificar si un estilo está disponible:

```javascript
if (window.styleRegistry.hasCardStyle('fifa')) {
    console.log('Estilo FIFA disponible');
}
```

### Obtener estadísticas:

```javascript
const stats = window.styleRegistry.getStats();
console.log(`Cards: ${stats.cardStyles}, Campos: ${stats.fieldStyles}`);
```

## Para Play Store

**Ventajas del sistema modular:**
1. ✅ Fácil agregar nuevos estilos sin modificar código core
2. ✅ Posible crear editor de estilos para usuarios
3. ✅ Menor acoplamiento entre componentes
4. ✅ Fácil de testear cada estilo aisladamente
5. ✅ Preparado para marketplace de estilos

## Troubleshooting

### "StyleRegistry no está disponible"
- Verifica que `js/styleRegistry.js` se carga antes que los demás
- Espera a `DOMContentLoaded` antes de usar

### Un estilo no aparece en la lista
- Verifica que está registrado: `window.styleRegistry.getAllCardStyles()`
- Revisa la consola para errores

### El estilo no se aplica
- Verifica que `createStyledCard()` se está llamando
- Revisa el HTML generado con DevTools

## Próximos Pasos

1. **Crear UI para cambiar estilos** (ya existe en `cardStyleUI.js`, actualizar para nuevo sistema)
2. **Agregar estilos personalizados** (guardar/cargar desde localStorage o backend)
3. **Editor visual de estilos** (interfaz para crear estilos sin código)
4. **Marketplace de estilos** (comprar/descargar estilos en Play Store)
