#!/usr/bin/env node
/**
 * 📚 EJEMPLOS DE USO - SISTEMA MODULAR DE ESTILOS
 * 
 * Este archivo contiene ejemplos prácticos y funcionales
 * para usar el sistema modular de estilos en tu proyecto.
 * 
 * COPIAR Y PEGAR en consola del navegador (F12)
 */

// ============================================
// EJEMPLO 1: Obtener Información del Sistema
// ============================================

console.group('📊 ESTADÍSTICAS DEL SISTEMA');

// Ver cuántos estilos están registrados
const stats = window.styleRegistry.getStats();
console.log('Estilos registrados:', stats);
// Output: { cardStyles: 4, fieldStyles: 5, total: 9 }

// Listar todos los estilos de card disponibles
const cardStyles = window.cardStyleManager.getAvailableStyles();
console.table(cardStyles.map(s => ({ id: s.id, name: s.name, icon: s.icon })));

// Listar todos los estilos de campo disponibles
const fieldStyles = window.fieldStyleManager.getAvailableStyles();
console.table(fieldStyles.map(s => ({ id: s.id, name: s.name, icon: s.icon })));

console.groupEnd();

// ============================================
// EJEMPLO 2: Cambiar Estilo Actual
// ============================================

console.group('🎨 CAMBIAR ESTILOS');

// Cambiar estilo de cards
console.log('Estilo actual de cards:', window.cardStyleManager.currentStyle);
window.cardStyleManager.setCurrentStyle('modern');
console.log('Nuevo estilo de cards:', window.cardStyleManager.currentStyle);

// Cambiar estilo de campo
console.log('Estilo actual de campo:', window.fieldStyleManager.currentStyle);
window.fieldStyleManager.setStyle('night');
console.log('Nuevo estilo de campo:', window.fieldStyleManager.currentStyle);

// El campo se redibuja automáticamente
window.fieldStyleManager.redrawField();

console.groupEnd();

// ============================================
// EJEMPLO 3: Navegar Entre Estilos
// ============================================

console.group('🔄 NAVEGACIÓN ENTRE ESTILOS');

// Obtener siguiente estilo
const nextCard = window.cardStyleManager.getNextStyle();
console.log('Próximo estilo de cards:', nextCard.name);
window.cardStyleManager.setCurrentStyle(nextCard.id);

// Obtener estilo anterior
const prevField = window.fieldStyleManager.getPreviousStyle();
console.log('Estilo anterior de campo:', prevField.name);
window.fieldStyleManager.setStyle(prevField.id);

// Atajo: cambiar directamente
window.cardStyleManager.nextStyle(); // Al siguiente
window.fieldStyleManager.previousStyle(); // Al anterior

console.groupEnd();

// ============================================
// EJEMPLO 4: Obtener Información de Estilo
// ============================================

console.group('ℹ️ INFORMACIÓN DE ESTILO');

// Obtener información del estilo actual
const currentCardStyle = window.cardStyleManager.getCurrentStyle();
console.log('Estilo actual de cards:', currentCardStyle);
// Output: {
//   id: 'modern',
//   name: 'Moderno',
//   description: 'Diseño limpio y contemporáneo',
//   icon: '✨',
//   theme: { primary: '#2c3e50', secondary: '#ecf0f1', accent: '#3498db' },
//   createFunction: function...
// }

const currentFieldStyle = window.fieldStyleManager.getCurrentStyleInfo();
console.log('Estilo actual de campo:', currentFieldStyle);

// Acceder a componentes del tema
console.log('Color primario:', currentCardStyle.theme.primary);
console.log('Color secundario:', currentCardStyle.theme.secondary);
console.log('Color acentuado:', currentCardStyle.theme.accent);

console.groupEnd();

// ============================================
// EJEMPLO 5: Crear Card con Estilo Actual
// ============================================

console.group('🎴 CREAR CARD CON ESTILO');

// Jugador de ejemplo
const player = {
    id: 'player-123',
    name: 'Juan Pérez',
    number: 10,
    position: 'Delantero',
    rating: 88,
    image: 'img/default_player.png'
};

// Crear card para campo
const fieldCard = window.cardStyleManager.createStyledCard(player, 'field');
console.log('Card para campo (', window.cardStyleManager.currentStyle, '):', fieldCard.substring(0, 100) + '...');

// Crear card para squad
const squadCard = window.cardStyleManager.createStyledCard(player, 'squad');
console.log('Card para squad:', squadCard.substring(0, 100) + '...');

// Insertar en la página
const container = document.createElement('div');
container.innerHTML = squadCard;
console.log('Card generada:', container.firstChild);

console.groupEnd();

// ============================================
// EJEMPLO 6: Registrar Estilo Personalizado
// ============================================

console.group('➕ REGISTRAR NUEVO ESTILO');

// Crear un estilo personalizado
const miEstilo = {
    name: 'Mi Estilo Personalizado',
    description: 'Estilo creado en tiempo de ejecución',
    icon: '⭐',
    theme: {
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff'
    },
    createFunction: (player, type, cardId, screenType, theme, playerId) => {
        const bg = type === 'field' ? 'width: 80px; height: 100px' : 'width: 100%; height: auto';
        return `
            <div style="${bg}; background: ${theme.primary}; color: ${theme.secondary}; 
                        padding: 8px; border-radius: 8px; text-align: center; border: 2px solid ${theme.accent};">
                <div style="font-weight: bold;">${player.name}</div>
                <div style="font-size: 0.8em;">Rating: ${player.rating}</div>
            </div>
        `;
    }
};

// Registrar el estilo
const registered = window.cardStyleManager.registerCustomStyle('mystyle', miEstilo);
console.log('Estilo registrado:', registered ? '✅ Éxito' : '❌ Error');

// Usar el nuevo estilo
window.cardStyleManager.setCurrentStyle('mystyle');
console.log('Estilo actual ahora es: mystyle');

// Probar creando una card
const customCard = window.cardStyleManager.createStyledCard(player, 'field');
console.log('Card con estilo personalizado:', customCard);

console.groupEnd();

// ============================================
// EJEMPLO 7: Eventos de Cambio de Estilo
// ============================================

console.group('📡 ESCUCHAR EVENTOS');

// Escuchar cambio de estilo de cards
window.addEventListener('cardStyleChanged', (event) => {
    console.log('Estilo de card cambió a:', event.detail.styleId);
    console.log('Información:', event.detail.style);
});

// Escuchar cambio de estilo de campo
document.addEventListener('fieldStyleChanged', (event) => {
    console.log('Estilo de campo cambió a:', event.detail.styleId);
    console.log('Nombre:', event.detail.styleName);
});

// Cambiar estilo y ver el evento
console.log('Cambiando a estilo "classic"...');
window.cardStyleManager.setCurrentStyle('classic');

console.groupEnd();

// ============================================
// EJEMPLO 8: Guardar y Cargar Preferencias
// ============================================

console.group('💾 PERSISTENCIA');

// Guardar preferencia actual (se hace automáticamente, pero puedes hacerlo manual)
window.cardStyleManager.saveCurrentStyle();
window.fieldStyleManager.saveCurrentStyle();
console.log('Preferencias guardadas en localStorage');

// Cargar preferencias (se hace automáticamente al cargar, pero puedes hacerlo manual)
window.cardStyleManager.loadSavedStyle();
window.fieldStyleManager.loadSavedStyle();
console.log('Preferencias cargadas desde localStorage');

// Ver lo que se guardó
console.log('Estilo de card guardado:', localStorage.getItem('selectedCardStyle'));
console.log('Estilo de campo guardado:', localStorage.getItem('fieldStyle'));

console.groupEnd();

// ============================================
// EJEMPLO 9: Eliminar Estilo Personalizado
// ============================================

console.group('🗑️ ELIMINAR ESTILOS');

// Verificar que existe
const hasStyle = window.styleRegistry.hasCardStyle('mystyle');
console.log('¿Existe "mystyle"?', hasStyle);

// Eliminar estilo
if (hasStyle) {
    const deleted = window.cardStyleManager.removeStyle('mystyle');
    console.log('Estilo eliminado:', deleted ? '✅ Éxito' : '❌ Error');
    console.log('Estilo actual ahora es:', window.cardStyleManager.currentStyle);
}

console.groupEnd();

// ============================================
// EJEMPLO 10: Crear Selector de Estilos (UI)
// ============================================

console.group('🎛️ CREAR UI DE SELECTOR');

// Función para crear un selector HTML de estilos de cards
function createCardStyleSelector() {
    const styles = window.cardStyleManager.getAvailableStyles();
    const current = window.cardStyleManager.currentStyle;
    
    let html = '<select id="card-style-selector">';
    styles.forEach(style => {
        const selected = style.id === current ? 'selected' : '';
        html += `<option value="${style.id}" ${selected}>${style.icon} ${style.name}</option>`;
    });
    html += '</select>';
    
    return html;
}

// Función para crear un selector HTML de estilos de campos
function createFieldStyleSelector() {
    const styles = window.fieldStyleManager.getAvailableStyles();
    const current = window.fieldStyleManager.currentStyle;
    
    let html = '<select id="field-style-selector">';
    styles.forEach(style => {
        const selected = style.id === current ? 'selected' : '';
        html += `<option value="${style.id}" ${selected}>${style.icon} ${style.name}</option>`;
    });
    html += '</select>';
    
    return html;
}

// Crear contenedor
const selector = document.createElement('div');
selector.innerHTML = `
    <div style="padding: 10px; background: #f0f0f0; border-radius: 8px;">
        <label>Estilo de Cards: ${createCardStyleSelector()}</label><br><br>
        <label>Estilo de Campo: ${createFieldStyleSelector()}</label>
    </div>
`;

// Agregar event listeners
selector.querySelector('#card-style-selector').addEventListener('change', (e) => {
    window.cardStyleManager.setCurrentStyle(e.target.value);
});

selector.querySelector('#field-style-selector').addEventListener('change', (e) => {
    window.fieldStyleManager.setStyle(e.target.value);
});

console.log('Selector creado:', selector);
// Insertar en página: document.body.appendChild(selector);

console.groupEnd();

// ============================================
// EJEMPLO 11: Verificar Estilo Disponible
// ============================================

console.group('✔️ VERIFICACIONES');

// Verificar si estilo existe
const existsClassic = window.styleRegistry.hasCardStyle('classic');
console.log('¿Existe estilo "classic"?', existsClassic);

const existsCustom = window.styleRegistry.hasCardStyle('custom-inexistente');
console.log('¿Existe estilo "custom-inexistente"?', existsCustom);

// Obtener estilo específico
const fifaStyle = window.styleRegistry.getCardStyle('fifa');
console.log('Estilo FIFA:', fifaStyle ? fifaStyle.name : 'No encontrado');

console.groupEnd();

// ============================================
// EJEMPLO 12: Registrar Estilo de Campo
// ============================================

console.group('⚽ REGISTRAR ESTILO DE CAMPO');

// Crear función de dibujo
function drawCustomField(canvas, ctx) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    
    // Preparar canvas
    canvas.width = cssWidth * window.devicePixelRatio;
    canvas.height = cssHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Fondo gradiente
    const gradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1, '#00ff00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Línea central
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cssWidth / 2, 0);
    ctx.lineTo(cssWidth / 2, cssHeight);
    ctx.stroke();
}

// Registrar estilo
const fieldRegistered = window.fieldStyleManager.registerCustomStyle('gradient', {
    name: 'Gradiente',
    description: 'Campo con gradiente de colores',
    icon: '🌈',
    drawFunction: drawCustomField
});

console.log('Estilo de campo registrado:', fieldRegistered ? '✅' : '❌');

// Usar el estilo
window.fieldStyleManager.setStyle('gradient');
console.log('Campo dibujado con estilo "gradient"');

console.groupEnd();

// ============================================
// RESUMEN
// ============================================

console.group('📋 RESUMEN DE COMANDOS');
console.log(`
COMANDOS ÚTILES:

// Listar estilos
window.cardStyleManager.getAvailableStyles()
window.fieldStyleManager.getAvailableStyles()

// Cambiar estilo
window.cardStyleManager.setCurrentStyle('modern')
window.fieldStyleManager.setStyle('night')

// Siguiente/Anterior
window.cardStyleManager.nextStyle()
window.cardStyleManager.previousStyle()

// Registrar nuevo estilo
window.cardStyleManager.registerCustomStyle('id', { ... })
window.fieldStyleManager.registerCustomStyle('id', { ... })

// Eliminar estilo
window.cardStyleManager.removeStyle('id')
window.fieldStyleManager.removeStyle('id')

// Crear card
window.cardStyleManager.createStyledCard(player, 'field')

// Info del sistema
window.styleRegistry.getStats()
`);
console.groupEnd();

console.log('✅ Ejemplos cargados. Copia y pega los comandos en la consola.');
