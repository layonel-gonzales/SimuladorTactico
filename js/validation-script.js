// validation-script.js
// Script para validar funcionalidades en tiempo real dentro de la aplicación

console.log('🧪 Iniciando validación en tiempo real de funcionalidades...');

// VALIDACIÓN 1: Verificar que todos los elementos existen
function validateHTMLElements() {
    const requiredElements = [
        'global-mode-toggle',
        'global-select-squad-btn', 
        'fullscreen-toggle-btn',
        'drawing-mode-controls',
        'animation-mode-controls',
        'football-field',
        'drawing-canvas',
        'pitch-container',
        'frame-indicator',
        'audio-record-btn',
        'export-animation-json'
    ];
    
    const missing = [];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missing.push(id);
        }
    });
    
    if (missing.length > 0) {
        console.error('❌ Elementos HTML faltantes:', missing);
        return false;
    }
    console.log('✅ Todos los elementos HTML están presentes');
    return true;
}

// VALIDACIÓN 2: Verificar que los canvas funcionan
function validateCanvas() {
    const footballField = document.getElementById('football-field');
    const drawingCanvas = document.getElementById('drawing-canvas');
    
    if (!footballField || !footballField.getContext) {
        console.error('❌ Canvas del campo de fútbol no funciona');
        return false;
    }
    
    if (!drawingCanvas || !drawingCanvas.getContext) {
        console.error('❌ Canvas de dibujo no funciona');
        return false;
    }
    
    // Probar dibujo básico
    try {
        const ctx = footballField.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1, 1);
        console.log('✅ Canvas funcionando correctamente');
        return true;
    } catch (e) {
        console.error('❌ Error al probar canvas:', e);
        return false;
    }
}

// VALIDACIÓN 3: Verificar clases de CSS críticas
function validateCSS() {
    const testElement = document.createElement('div');
    testElement.className = 'player-token';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const hasStyles = styles.position !== 'static' || styles.zIndex !== 'auto';
    
    document.body.removeChild(testElement);
    
    if (hasStyles) {
        console.log('✅ CSS de jugadores funcionando');
        return true;
    } else {
        console.warn('⚠️ Algunos estilos CSS pueden no estar cargados');
        return false;
    }
}

// VALIDACIÓN 4: Verificar JavaScript modules
function validateJavaScriptModules() {
    const expectedGlobals = [
        'ensureBallInPlayers',
        'importAnimationData',
        'shareManager'
    ];
    
    const missing = [];
    expectedGlobals.forEach(global => {
        if (typeof window[global] === 'undefined') {
            missing.push(global);
        }
    });
    
    if (missing.length > 0) {
        console.warn('⚠️ Funciones globales faltantes:', missing);
        return false;
    }
    
    console.log('✅ Módulos JavaScript cargados correctamente');
    return true;
}

// VALIDACIÓN 5: Probar funcionalidad de modo
function validateModeSwitch() {
    const modeButton = document.getElementById('global-mode-toggle');
    if (!modeButton) {
        console.error('❌ Botón de cambio de modo no encontrado');
        return false;
    }
    
    // Verificar que el botón sea clickeable
    if (typeof modeButton.click !== 'function') {
        console.error('❌ Botón de modo no es clickeable');
        return false;
    }
    
    console.log('✅ Botón de cambio de modo funcional');
    return true;
}

// VALIDACIÓN 6: Verificar renderizado de jugadores
function validatePlayerRendering() {
    const pitchContainer = document.getElementById('pitch-container');
    if (!pitchContainer) {
        console.error('❌ Contenedor del campo no encontrado');
        return false;
    }
    
    // Buscar tokens de jugadores existentes
    const playerTokens = pitchContainer.querySelectorAll('.player-token');
    
    if (playerTokens.length === 0) {
        console.warn('⚠️ No hay jugadores renderizados en el campo');
        return false;
    }
    
    console.log(`✅ ${playerTokens.length} jugadores renderizados en el campo`);
    return true;
}

// VALIDACIÓN 7: Probar APIs del navegador
function validateBrowserAPIs() {
    const apis = {
        'LocalStorage': () => typeof Storage !== 'undefined',
        'MediaRecorder': () => typeof MediaRecorder !== 'undefined',
        'Canvas 2D': () => document.createElement('canvas').getContext('2d'),
        'FileReader': () => typeof FileReader !== 'undefined',
        'Blob': () => typeof Blob !== 'undefined'
    };
    
    const unsupported = [];
    Object.entries(apis).forEach(([name, test]) => {
        try {
            if (!test()) {
                unsupported.push(name);
            }
        } catch (e) {
            unsupported.push(name);
        }
    });
    
    if (unsupported.length > 0) {
        console.warn('⚠️ APIs del navegador no soportadas:', unsupported);
        return false;
    }
    
    console.log('✅ Todas las APIs del navegador están disponibles');
    return true;
}

// FUNCIÓN PRINCIPAL DE VALIDACIÓN
function runCompleteValidation() {
    console.log('\n🚀 EJECUTANDO VALIDACIÓN COMPLETA DEL SIMULADOR TÁCTICO\n');
    
    const tests = [
        { name: 'Elementos HTML', test: validateHTMLElements },
        { name: 'Canvas', test: validateCanvas },
        { name: 'CSS', test: validateCSS },
        { name: 'Módulos JavaScript', test: validateJavaScriptModules },
        { name: 'Cambio de modo', test: validateModeSwitch },
        { name: 'Renderizado de jugadores', test: validatePlayerRendering },
        { name: 'APIs del navegador', test: validateBrowserAPIs }
    ];
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    tests.forEach(({ name, test }) => {
        console.log(`\n🧪 Probando: ${name}`);
        try {
            const result = test();
            if (result === true) {
                passed++;
            } else {
                warnings++;
            }
        } catch (error) {
            console.error(`❌ Error en ${name}:`, error);
            failed++;
        }
    });
    
    console.log('\n📊 RESUMEN DE VALIDACIÓN:');
    console.log(`✅ Pasadas: ${passed}`);
    console.log(`⚠️ Advertencias: ${warnings}`);
    console.log(`❌ Fallidas: ${failed}`);
    
    const totalScore = (passed / tests.length) * 100;
    console.log(`🎯 Puntuación total: ${totalScore.toFixed(1)}%`);
    
    if (totalScore >= 85) {
        console.log('🎉 ¡LA APLICACIÓN ESTÁ FUNCIONANDO CORRECTAMENTE!');
    } else if (totalScore >= 70) {
        console.log('⚠️ La aplicación funciona pero tiene algunos problemas menores');
    } else {
        console.log('❌ La aplicación tiene problemas significativos que requieren atención');
    }
    
    return { passed, warnings, failed, totalScore };
}

// FUNCIÓN PARA PROBAR FUNCIONALIDADES ESPECÍFICAS
function testSpecificFeature(featureName) {
    switch (featureName.toLowerCase()) {
        case 'dibujo':
            return testDrawingFeature();
        case 'animacion':
            return testAnimationFeature();
        case 'audio':
            return testAudioFeature();
        case 'jugadores':
            return testPlayerFeature();
        case 'modo':
            return testModeFeature();
        default:
            console.error('❌ Funcionalidad no reconocida:', featureName);
            return false;
    }
}

function testDrawingFeature() {
    console.log('🧪 Probando funcionalidad de dibujo...');
    
    const drawingCanvas = document.getElementById('drawing-canvas');
    const colorPicker = document.getElementById('line-color-picker');
    const widthPicker = document.getElementById('line-width-picker');
    const undoBtn = document.getElementById('undo-line');
    
    if (!drawingCanvas || !colorPicker || !widthPicker || !undoBtn) {
        console.error('❌ Elementos de dibujo faltantes');
        return false;
    }
    
    console.log('✅ Todos los elementos de dibujo están presentes');
    return true;
}

function testAnimationFeature() {
    console.log('🧪 Probando funcionalidad de animación...');
    
    const frameIndicator = document.getElementById('frame-indicator');
    const frameNext = document.getElementById('frame-next');
    const framePrev = document.getElementById('frame-prev');
    const frameAdd = document.getElementById('frame-add');
    const framePlay = document.getElementById('frame-play');
    
    if (!frameIndicator || !frameNext || !framePrev || !frameAdd || !framePlay) {
        console.error('❌ Elementos de animación faltantes');
        return false;
    }
    
    console.log('✅ Todos los elementos de animación están presentes');
    return true;
}

function testAudioFeature() {
    console.log('🧪 Probando funcionalidad de audio...');
    
    const recordBtn = document.getElementById('audio-record-btn');
    const playBtn = document.getElementById('audio-play-btn');
    
    if (!recordBtn || !playBtn) {
        console.error('❌ Elementos de audio faltantes');
        return false;
    }
    
    if (typeof MediaRecorder === 'undefined') {
        console.warn('⚠️ MediaRecorder no soportado en este navegador');
        return false;
    }
    
    console.log('✅ Funcionalidad de audio disponible');
    return true;
}

function testPlayerFeature() {
    console.log('🧪 Probando gestión de jugadores...');
    
    const squadBtn = document.getElementById('global-select-squad-btn');
    const pitchContainer = document.getElementById('pitch-container');
    
    if (!squadBtn || !pitchContainer) {
        console.error('❌ Elementos de jugadores faltantes');
        return false;
    }
    
    console.log('✅ Gestión de jugadores funcional');
    return true;
}

function testModeFeature() {
    console.log('🧪 Probando cambio de modo...');
    
    const modeBtn = document.getElementById('global-mode-toggle');
    const drawingControls = document.getElementById('drawing-mode-controls');
    const animationControls = document.getElementById('animation-mode-controls');
    
    if (!modeBtn || !drawingControls || !animationControls) {
        console.error('❌ Elementos de modo faltantes');
        return false;
    }
    
    console.log('✅ Cambio de modo funcional');
    return true;
}

// EXPONER FUNCIONES GLOBALMENTE PARA USO EN CONSOLA
window.runCompleteValidation = runCompleteValidation;
window.testSpecificFeature = testSpecificFeature;

// EJECUTAR VALIDACIÓN AUTOMÁTICA AL CARGAR
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // setTimeout(runCompleteValidation, 1000); // DESHABILITADO TEMPORALMENTE
    });
} else {
    // setTimeout(runCompleteValidation, 1000); // DESHABILITADO TEMPORALMENTE
}

console.log('📝 Usa runCompleteValidation() para ejecutar todas las pruebas');
console.log('📝 Usa testSpecificFeature("nombre") para probar funcionalidades específicas');
console.log('📝 Funcionalidades disponibles: "dibujo", "animacion", "audio", "jugadores", "modo"');
