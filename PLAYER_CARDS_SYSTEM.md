# 🎴 Sistema Unificado de Cards de Jugador

## 📋 Descripción General

El **PlayerCardManager** es un sistema centralizado que gestiona todas las cards de jugador de forma unificada, tanto las que aparecen en el campo como las de la selección de plantilla. Proporciona acceso directo y controlado a todos los elementos: overall, foto, nombre, posición, dorsal, etc.

## 🎯 Beneficios del Sistema

- ✅ **Acceso Unificado**: Una sola API para manejar todas las cards
- ✅ **Identificadores Únicos**: Cada elemento tiene identificadores específicos
- ✅ **Configuración Global**: Cambios que afectan a todas las cards simultáneamente
- ✅ **Trazabilidad**: Seguimiento completo de todas las instancias
- ✅ **Escalabilidad**: Preparado para futuras funcionalidades

## 🏗️ Estructura de Cards

### Card en el Campo (`field`)
```html
<div class="player-token" data-card-id="field-card-123" data-player-id="123">
    <div class="minicard-overall player-card-element" 
         data-element="overall" 
         data-card-id="field-card-123"
         data-player-id="123">85</div>
    <div class="minicard-position player-card-element" 
         data-element="position" 
         data-card-id="field-card-123"
         data-player-id="123">ST</div>
    <img class="minicard-player-image player-card-element" 
         data-element="image" 
         data-card-id="field-card-123"
         data-player-id="123">
    <div class="minicard-name player-card-element" 
         data-element="name" 
         data-card-id="field-card-123"
         data-player-id="123">Messi</div>
    <div class="minicard-jersey-number player-card-element" 
         data-element="jersey" 
         data-card-id="field-card-123"
         data-player-id="123">10</div>
</div>
```

### Card en Selección (`selection`)
```html
<div class="squad-player-item" data-card-id="selection-card-123" data-player-id="123">
    <div class="minicard-overall player-card-element" 
         data-element="overall" 
         data-card-id="selection-card-123"
         data-player-id="123">85</div>
    <img class="player-card-element" 
         data-element="image" 
         data-card-id="selection-card-123"
         data-player-id="123">
    <div class="player-name player-card-element" 
         data-element="name" 
         data-card-id="selection-card-123"
         data-player-id="123">Messi</div>
</div>
```

## 🔧 API del PlayerCardManager

### Crear Cards
```javascript
// Crear card para el campo
const fieldCard = playerCardManager.createPlayerCard(player, 'field');

// Crear card para selección
const selectionCard = playerCardManager.createPlayerCard(player, 'selection');
```

### Acceder a Elementos
```javascript
// Obtener elemento específico
const overallElement = playerCardManager.getCardElement('field-card-123', 'overall');
const nameElement = playerCardManager.getCardElement('field-card-123', 'name');
const imageElement = playerCardManager.getCardElement('field-card-123', 'image');

// Obtener todas las cards de un jugador
const playerCards = playerCardManager.getCardsByPlayerId('123');
```

### Actualizar Elementos
```javascript
// Actualizar elemento específico
playerCardManager.updateCardElement('field-card-123', 'name', 'Nuevo Nombre');
playerCardManager.updateCardElement('field-card-123', 'overall', 90);

// Actualizar jugador en todas sus cards
playerCardManager.updatePlayerInAllCards('123', {
    name: 'Lionel Messi',
    image_url: 'nueva-foto.jpg',
    position: 'RW',
    jersey_number: 30
});
```

### Configuración Global
```javascript
// Cambiar configuración para todas las cards
playerCardManager.updateGlobalConfig({
    showOverall: false,      // Ocultar overall en todas las cards
    showPosition: true,      // Mostrar posición
    showPlayerName: true,    // Mostrar nombre
    showPlayerImage: false,  // Ocultar imagen
    showJerseyNumber: true   // Mostrar dorsal
});

// Obtener configuración actual
const config = playerCardManager.globalConfig;
```

### Estadísticas del Sistema
```javascript
// Obtener estadísticas completas
const stats = playerCardManager.getStats();
console.log(stats);
/*
{
    totalCards: 15,
    fieldCards: 11,
    selectionCards: 4,
    fieldCardIds: ["field-card-1", "field-card-2", ...],
    selectionCardIds: ["selection-card-1", ...],
    globalConfig: { showOverall: true, ... }
}
*/
```

## 🎮 Casos de Uso para Configuración Global

### 1. Ocultar/Mostrar Overall
```javascript
// Para un modo más limpio sin estadísticas
playerCardManager.updateGlobalConfig({ showOverall: false });
```

### 2. Modo Solo Nombres
```javascript
// Mostrar solo nombres de jugadores
playerCardManager.updateGlobalConfig({
    showOverall: false,
    showPosition: false,
    showJerseyNumber: false,
    showPlayerImage: true,
    showPlayerName: true
});
```

### 3. Modo Minimalista
```javascript
// Solo imágenes
playerCardManager.updateGlobalConfig({
    showOverall: false,
    showPosition: false,
    showJerseyNumber: false,
    showPlayerImage: true,
    showPlayerName: false
});
```

### 4. Modo Completo
```javascript
// Mostrar todos los elementos
playerCardManager.updateGlobalConfig({
    showOverall: true,
    showPosition: true,
    showJerseyNumber: true,
    showPlayerImage: true,
    showPlayerName: true
});
```

## 🔍 Selección de Elementos

### Por Data Attributes
```javascript
// Seleccionar todos los elementos overall
document.querySelectorAll('[data-element="overall"]');

// Seleccionar elementos de un jugador específico
document.querySelectorAll('[data-player-id="123"]');

// Seleccionar elemento específico de una card
document.querySelector('[data-card-id="field-card-123"][data-element="name"]');
```

### Usando CSS Selectors
```css
/* Estilizar todos los elementos overall */
.player-card-element[data-element="overall"] {
    background: gold;
}

/* Estilizar elementos de un jugador específico */
.player-card-element[data-player-id="123"] {
    border: 2px solid blue;
}

/* Hover effects para elementos editables */
.player-card-element:hover {
    transform: scale(1.05);
}
```

## 🎨 Clases CSS Disponibles

### Elementos Base
- `.player-card-element` - Clase base para todos los elementos de card
- `.minicard-overall` - Elemento de overall
- `.minicard-position` - Elemento de posición
- `.minicard-player-image` - Imagen del jugador
- `.minicard-name` - Nombre del jugador
- `.minicard-jersey-number` - Número de dorsal

### Estados
- `.editing` - Elemento en modo edición
- `[data-editable="true"]` - Elemento marcado como editable

## 🚀 Preparación para Módulo de Configuración

El sistema está **completamente preparado** para un módulo de configuración global que permita:

1. **Interfaz Visual**: Toggles para mostrar/ocultar elementos
2. **Personalización**: Cambiar estilos, colores, tamaños
3. **Profiles**: Guardar y cargar configuraciones predefinidas
4. **Import/Export**: Compartir configuraciones
5. **Real-time Preview**: Ver cambios en tiempo real

### Ejemplo de Integración Futura
```javascript
// El módulo de configuración podrá hacer:
ConfigurationModule.apply({
    profile: 'minimal',
    elements: {
        overall: { show: false },
        name: { show: true, fontSize: '14px' },
        image: { show: true, borderRadius: '10px' }
    }
});
```

## 🧪 Testing y Demo

Usa las funciones de demo incluidas:

```javascript
// En la consola del navegador:
showPlayerCardStats();                    // Ver estadísticas
getPlayerCardElement('123', 'overall');   // Obtener elemento específico
playerCardDemo.demonstrateAccess();       // Demo de acceso
playerCardDemo.demonstrateUpdate();       // Demo de actualización
```

## 📝 Notas Importantes

1. **Compatibilidad**: El sistema mantiene compatibilidad con el código existente
2. **Performance**: Utiliza Map() para acceso O(1) a las cards
3. **Memory**: Limpia automáticamente cards removidas del DOM
4. **Accessibility**: Incluye atributos ARIA y títulos descriptivos
5. **Mobile**: Optimizado para touch events y responsive design

¡El sistema está **listo para el módulo de configuración global**! 🎉
