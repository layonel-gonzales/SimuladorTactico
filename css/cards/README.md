# 🎴 SISTEMA MODULAR DE CSS PARA CARDS

## 📋 Descripción General

Este directorio contiene todos los estilos CSS para las cards de jugadores, organizados de forma modular y escalable.

**Localización:** `css/cards/`

---

## 📁 Estructura de Archivos

```
css/cards/
├── README.md                    ← Este archivo
├── card-base.css               ← Contenedor base (.player-token, .squad-player-item)
├── card-modern.css             ← Estilo moderno (diseño limpio y contemporáneo)
├── card-fifa.css               ← Estilo FIFA (inspirado en cartas FIFA)
├── card-retro.css              ← Estilo retro (vintage años 80-90)
└── card-responsive.css         ← Media queries y opciones de accesibilidad
```

---

## 📚 Descripción de Cada Archivo

### 1️⃣ `card-base.css` (102 líneas)
**Propósito:** Definir la estructura base de todas las cards

**Clases principales:**
- `.player-token` - Card en el campo
- `.squad-player-item` - Card en modal de selección
- `.player-card-element` - Elemento genérico dentro de una card
- `.minicard-*` - Elementos individuales (overall, position, name, etc.)

**Contiene:**
- Dimensiones responsivas
- Estados básicos (hover, dragging, selected)
- Estructura y layout
- Transiciones globales

**Uso:**
```css
/* Se carga PRIMERO - proporciona la base */
<link rel="stylesheet" href="css/cards/card-base.css">
```

---

### 2️⃣ `card-modern.css` (196 líneas)
**Propósito:** Estilo visual moderno y limpio

**Tema:**
```css
--card-primary: #2c3e50    /* Azul oscuro */
--card-secondary: #ecf0f1  /* Gris claro */
--card-accent: #3498db     /* Azul brillante */
```

**Clases principales:**
- `.card-style-modern` - Contenedor del estilo
- `.modern-card-bg` - Fondo con gradiente
- `.modern-selection-card` - Card en modal
- `.modern-skill-bars` - Barras de habilidad

**Características:**
- Gradientes suaves
- Bordes redondeados
- Sombras elegantes
- Efectos hover llamativos

---

### 3️⃣ `card-fifa.css` (274 líneas)
**Propósito:** Estilo inspirado en cartas coleccionables FIFA

**Tema:**
```css
--card-primary: #1a1a1a    /* Negro puro */
--card-secondary: #ffffff  /* Blanco */
--card-accent: #00ff88     /* Verde neón */
```

**Clases principales:**
- `.card-style-fifa` - Contenedor del estilo
- `.fifa-card-container` - Card en campo
- `.fifa-rating-badge` - Badge de rareza (gold, silver, bronze, common)
- `.fifa-player-details` - Detalles del jugador
- `.fifa-selection-card` - Card en modal

**Características:**
- Colores de rareza dinámicos
- Gradientes con patrón
- Luz neón verde neon
- Efecto futurista

---

### 4️⃣ `card-retro.css` (381 líneas)
**Propósito:** Estilo vintage de los años 80-90

**Tema:**
```css
--card-primary: #8b4513       /* Marrón */
--card-secondary: #f4e4bc     /* Crema */
--card-accent: #ff6b35        /* Naranja quemado */
```

**Clases principales:**
- `.card-style-retro` - Contenedor del estilo
- `.retro-card-body` - Cuerpo del card
- `.retro-corner-decoration` - Decoraciones de esquina
- `.retro-selection-card` - Card en modal
- `.retro-skill-meter` - Medidor de habilidad

**Características:**
- Bordes dobles y decoraciones
- Efectos sepia en imágenes
- Tipografía monoespaciada
- Patrones y texturas retro

---

### 5️⃣ `card-responsive.css` (274 líneas)
**Propósito:** Adaptabilidad en diferentes dispositivos y preferencias de usuario

**Media Queries:**
- `(max-width: 768px)` - Tablets
- `(max-width: 480px)` - Móviles pequeños
- `(orientation: portrait/landscape)` - Orientación del dispositivo
- `(min-width: 1920px)` - Pantallas grandes

**Preferencias de Accesibilidad:**
- `(prefers-reduced-motion: reduce)` - Reduce animaciones
- `(prefers-contrast: more)` - Aumenta contraste
- `(prefers-color-scheme: dark/light)` - Esquema de color del sistema

**Contiene:**
- Ajustes de tamaño para diferentes pantallas
- Disminución de animaciones para accesibilidad
- Mejora de contraste según preferencias del usuario
- Optimización de layout responsivo

---

## 🎨 Cómo Funciona el Sistema

### Flujo de Carga
```
1. index.html carga los 5 archivos CSS en orden
   ├── card-base.css         (PRIMERO - estructura base)
   ├── card-modern.css       (estilos específicos)
   ├── card-fifa.css         (estilos específicos)
   ├── card-retro.css        (estilos específicos)
   └── card-responsive.css   (ÚLTIMO - media queries)

2. JavaScript genera HTML con clases correspondientes
   └── js/cardStyles/*.js genera clases como:
       - .card-style-modern, .modern-*
       - .card-style-fifa, .fifa-*
       - .card-style-retro, .retro-*

3. CSS se aplica según las clases presentes en el HTML
```

### Ejemplo: Card Moderna en Campo
```html
<!-- HTML generado por: js/cardStyles/cardStyleModern.js -->
<div class="minicard-overall card-style-modern">
  <div class="modern-card-bg">
    <div class="modern-image-frame">
      <img src="..." alt="Jugador">
    </div>
    <div class="modern-player-info">
      <span class="modern-name-text">Nombre del Jugador</span>
    </div>
  </div>
</div>
```

```css
/* CSS que se aplica -->
.minicard-overall { /* De card-base.css */ }
.card-style-modern { /* De card-modern.css */ }
.modern-card-bg { /* De card-modern.css */ }
.modern-image-frame { /* De card-modern.css */ }
@media (max-width: 768px) { /* De card-responsive.css */ }
```

---

## 🔄 Orden de Especificidad

1. **card-base.css** - Estilos generales y estructura
2. **card-[style].css** - Estilos específicos del tema (pueden sobrescribir base)
3. **card-responsive.css** - Media queries (sobrescriben todo lo anterior)

```css
/* Ejemplo de cascada */
.modern-image-frame {
    width: 32px;           /* De card-modern.css */
    height: 32px;          /* De card-modern.css */
}

@media (max-width: 768px) {
    .modern-image-frame {
        width: 28px;       /* De card-responsive.css - sobrescribe */
        height: 28px;      /* De card-responsive.css - sobrescribe */
    }
}
```

---

## 🎯 Cómo Agregar un Nuevo Estilo de Card

### Paso 1: Crear archivo CSS
```bash
css/cards/card-[nombre].css
```

### Paso 2: Seguir la estructura
```css
/**
 * [DESCRIPCIÓN DEL ESTILO]
 */

/* Contenedor principal */
.card-style-[nombre] {
    font-family: '...';
    color: var(--card-primary, #...);
}

/* Card para campo */
.[nombre]-card-bg {
    /* Estilos */
}

/* Card para selección */
.[nombre]-selection-card {
    /* Estilos */
}
```

### Paso 3: Cargar en index.html
```html
<!-- En el bloque de estilos de cards -->
<link rel="stylesheet" href="css/cards/card-[nombre].css">
```

### Paso 4: Crear función JavaScript
```javascript
// js/cardStyles/cardStyle[Nombre].js

function create[Nombre]Card(player, type, cardId, screenType, theme, playerId) {
    // Generar HTML con clases .card-style-[nombre] y .[nombre]-*
}

if (window.styleRegistry) {
    window.styleRegistry.registerCardStyle('[nombre]', {
        name: 'Nombre del Estilo',
        description: 'Descripción...',
        icon: '🎨',
        createFunction: create[Nombre]Card
    });
}
```

---

## 🛠️ Configuración de Temas

Cada estilo define sus propias variables de color:

```css
.card-style-moderno {
    --card-primary: #2c3e50;
    --card-secondary: #ecf0f1;
    --card-accent: #3498db;
}

/* Se heredan en todos los elementos hijos */
.moderno-position-badge {
    background: var(--card-accent);  /* #3498db */
}
```

### Cambiar colores de un tema
Solo modifica las variables CSS en el archivo correspondiente:

```css
/* card-modern.css */
.card-style-modern {
    --card-primary: #2c3e50;      /* Cambiar aquí */
    --card-secondary: #ecf0f1;    /* Cambiar aquí */
    --card-accent: #3498db;       /* Cambiar aquí */
}
```

---

## 📱 Responsive Design

El archivo `card-responsive.css` maneja todos los breakpoints:

```css
/* Tablets (768px y menos) */
@media (max-width: 768px) {
    .player-token { width: clamp(50px, 6vw, 90px); }
}

/* Móviles (480px y menos) */
@media (max-width: 480px) {
    .player-token { width: clamp(45px, 5vw, 75px); }
}

/* Desktop grande (1920px+) */
@media (min-width: 1920px) {
    .player-token { width: clamp(80px, 10vw, 150px); }
}
```

---

## ♿ Accesibilidad

### Reducir Animaciones
Para usuarios que prefieren menos movimiento:
```css
@media (prefers-reduced-motion: reduce) {
    .player-token * {
        transition: none !important;
    }
}
```

### Contraste Alto
Para usuarios que requieren mayor contraste:
```css
@media (prefers-contrast: more) {
    .modern-number-display {
        border: 1px solid currentColor;
        font-weight: bold;
    }
}
```

### Esquema de Color del Sistema
Respeta el tema oscuro/claro del dispositivo:
```css
@media (prefers-color-scheme: dark) {
    .player-token .minicard-overall {
        background-color: rgba(0, 0, 0, 0.9);
    }
}
```

---

## 🔍 Debugging

### Ver qué estilos se aplican
Abre las DevTools del navegador:
1. Haz clic derecho en una card → **Inspeccionar**
2. Mira las clases en la pestaña **Elements**
3. En la pestaña **Styles** verás qué archivos CSS se aplican

### Verificar orden de carga
En la consola del navegador:
```javascript
// Ver todos los stylesheets cargados
Array.from(document.styleSheets).forEach(s => console.log(s.href));
```

### Testear responsividad
```javascript
// Emular dispositivo en DevTools
DevTools → Toggle device toolbar (Ctrl+Shift+M)
```

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Total de líneas CSS | 1,227 |
| Total de archivos | 5 |
| Clases CSS | 92 |
| Media queries | 8 |
| Estilos de card | 4 |
| Elementos mincard base | 5 |

---

## 🚀 Rendimiento

**Ventajas de la estructura modular:**
- ✅ Mejor mantenibilidad
- ✅ Cacheo eficiente del navegador
- ✅ Posibilidad de carga condicional
- ✅ Menos conflictos de cascada CSS
- ✅ Código más legible y documentado

---

## 📝 Notas Importantes

1. **No modificar `card-base.css` ligeramente** - Cambios aquí afectan todos los estilos
2. **Siempre mantener el orden de carga** - card-base debe ir primero
3. **Usar variables CSS** - Facilita cambios de temas
4. **Testear en dispositivos reales** - `clamp()` se comporta diferente en algunos navegadores
5. **Verificar compatibilidad** - Algunos media queries pueden no funcionar en navegadores antiguos

---

## 🔗 Archivos Relacionados

- `index.html` - Carga los estilos CSS
- `js/cardStyles/*.js` - Genera HTML con las clases CSS
- `js/styleRegistry.js` - Registra los estilos disponibles
- `js/cardStyleManager-refactored.js` - Maneja el cambio de estilos
- `CARD_CSS_EXTRACTION.md` - Documentación de extracción original

---

## 📞 Soporte

Para preguntas sobre la estructura modular de CSS, consulta:
1. Este README
2. `CARD_CSS_EXTRACTION.md` (detalles de extracción)
3. Comentarios dentro de cada archivo CSS
4. DevTools del navegador (inspecciona las cards)

---

**Actualizado:** Febrero 2, 2026  
**Versión:** 1.0 (Modular)  
**Estado:** ✅ Producción
