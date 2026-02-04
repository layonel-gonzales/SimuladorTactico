/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 TESTING & DEBUGGING - VIDEO EXPORT WORKFLOW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Guía práctica para testear el nuevo sistema de exportación de videos
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ VERIFICACIÓN RÁPIDA (Ejecutar en console)
// ═══════════════════════════════════════════════════════════════════════════

/*
 * En la consola del navegador (F12 → Console), ejecuta:
 */

// ✅ Verificar que VideoExportWorkflow está cargado
console.log('¿VideoExportWorkflow cargada?', typeof VideoExportWorkflow !== 'undefined');

// ✅ Verificar que animationManager está disponible
console.log('¿animationManager existe?', typeof animationManager !== 'undefined');

// ✅ Verificar que audioManager está disponible
console.log('¿audioManager existe?', typeof audioManager !== 'undefined');

// ✅ Verificar que hay frames
if (typeof animationManager !== 'undefined') {
    console.log(`Frames cargados: ${animationManager.frames.length}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ INICIAR FLUJO MANUALMENTE
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Si necesitas iniciar la exportación desde consola:
 */

async function testVideoExport() {
    try {
        console.log('🚀 Iniciando test de exportación de video...');
        
        // Verificar requisitos
        if (!animationManager || animationManager.frames.length < 2) {
            console.error('❌ No hay suficientes frames para exportar');
            return;
        }
        
        // Crear workflow si no existe
        if (!window.videoExportWorkflow) {
            window.videoExportWorkflow = new VideoExportWorkflow(
                animationManager,
                audioManager
            );
        }
        
        // Iniciar flujo
        console.log('📹 Iniciando captura de video...');
        await window.videoExportWorkflow.startExportWorkflow();
        
        console.log('✅ Test completado exitosamente');
    } catch (error) {
        console.error('❌ Error en test:', error);
    }
}

// Ejecutar: testVideoExport()

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ VERIFICACIÓN POR PASOS
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Para testear cada paso independientemente:
 */

// PASO 1: Testear captura de canvas
async function testCanvasCapture() {
    console.log('🎨 Testeando captura de canvas...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    // Dibujar algo simple
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.fillText('Canvas funcionando', 50, 50);
    
    // Intentar capturar stream
    try {
        const stream = canvas.captureStream(30);
        console.log('✅ Canvas stream creado:', stream.getVideoTracks().length, 'track(s)');
        
        // Detener tracks
        stream.getTracks().forEach(track => track.stop());
    } catch (error) {
        console.error('❌ Error creando canvas stream:', error);
    }
}

// Ejecutar: testCanvasCapture()

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ VERIFICACIÓN DE AUDIO
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Para testear el sistema de audio:
 */

async function testAudioRecording() {
    console.log('🎤 Testeando grabación de audio...');
    
    try {
        // Verificar soporte
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ getUserMedia no soportado en este navegador');
            return;
        }
        
        // Solicitar permiso
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Permiso de micrófono otorgado');
        
        // Detener stream
        stream.getTracks().forEach(track => track.stop());
        
        // Test audioManager
        if (typeof audioManager !== 'undefined') {
            console.log('✅ audioManager disponible');
            console.log('   Métodos:', {
                startRecording: typeof audioManager.startRecording,
                stopRecording: typeof audioManager.stopRecording,
                getAudioBlob: typeof audioManager.getAudioBlob
            });
        }
        
    } catch (error) {
        console.error('❌ Error en test de audio:', error.message);
    }
}

// Ejecutar: testAudioRecording()

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ VERIFICACIÓN DE PERMISOS
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Verificar qué permisos están otorgados:
 */

async function checkPermissions() {
    console.log('🔐 Verificando permisos del navegador...');
    
    const results = {
        camera: 'No verificado',
        microphone: 'No verificado',
        displayCapture: 'No soportado'
    };
    
    // Camera
    try {
        const streamCamera = await navigator.mediaDevices.getUserMedia({ video: true });
        streamCamera.getTracks().forEach(t => t.stop());
        results.camera = '✅ Permitido';
    } catch (e) {
        results.camera = `❌ ${e.name}`;
    }
    
    // Microphone
    try {
        const streamAudio = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamAudio.getTracks().forEach(t => t.stop());
        results.microphone = '✅ Permitido';
    } catch (e) {
        results.microphone = `❌ ${e.name}`;
    }
    
    // Display Capture
    if (navigator.mediaDevices.getDisplayMedia) {
        results.displayCapture = '✅ Soportado (pero no se usa en nuevo workflow)';
    }
    
    console.table(results);
}

// Ejecutar: checkPermissions()

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ LOGS DETALLADOS DURANTE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Para ver logs detallados, abre la consola (F12) y ejecuta:
 * 
 * testVideoExport()
 * 
 * Verás mensajes como:
 * 
 * 🎬 [VideoExportWorkflow] Iniciando flujo de exportación...
 * 📹 [Paso 1] Capturando animación a video...
 * ✅ Video capturado: 12.50 MB
 * 🎤 [Paso 2] Grabando audio sincronizado...
 * ⏱️ Audio grabándose durante 8500ms
 * ✅ Audio grabado: 425.32 KB
 * ✅ [VideoExportWorkflow] ¡Exportación completada!
 */

// ═══════════════════════════════════════════════════════════════════════════
// 7️⃣ DEBUGGING DE CANVAS
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Si el canvas no se renderiza correctamente, verifica:
 */

function debugCanvasRendering() {
    console.log('🔍 Debuggeando renderizado de canvas...');
    
    // Verificar método captureFrameToCanvas
    if (typeof animationManager !== 'undefined') {
        const hasMethod = typeof animationManager.captureFrameToCanvas === 'function';
        console.log('✅ animationManager.captureFrameToCanvas existe:', hasMethod);
        
        // Verificar frames
        console.log('📋 Frames disponibles:', animationManager.frames.length);
        
        if (animationManager.frames.length > 0) {
            const firstFrame = animationManager.frames[0];
            console.log('📍 Primer frame:', firstFrame);
        }
    }
}

// Ejecutar: debugCanvasRendering()

// ═══════════════════════════════════════════════════════════════════════════
// 8️⃣ CHECKLIST PRE-EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Antes de exportar, verifica esto:
 */

function preExportChecklist() {
    console.log('✅ CHECKLIST PRE-EXPORTACIÓN\n');
    
    const checks = {
        '1. ¿Hay frames?': animationManager && animationManager.frames.length >= 2,
        '2. ¿Browser soporta Canvas?': document.createElement('canvas').getContext('2d') !== null,
        '3. ¿Browser soporta getUserMedia?': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        '4. ¿Browser soporta MediaRecorder?': typeof MediaRecorder !== 'undefined',
        '5. ¿VideoExportWorkflow cargada?': typeof VideoExportWorkflow !== 'undefined',
        '6. ¿animationManager cargado?': typeof animationManager !== 'undefined',
        '7. ¿audioManager cargado?': typeof audioManager !== 'undefined'
    };
    
    Object.entries(checks).forEach(([check, result]) => {
        const emoji = result ? '✅' : '❌';
        console.log(`${emoji} ${check}`);
    });
    
    // Resumen
    const allPassed = Object.values(checks).every(v => v === true);
    console.log('\n' + (allPassed ? '✅ LISTO PARA EXPORTAR' : '❌ REVISAR PROBLEMAS'));
}

// Ejecutar: preExportChecklist()

// ═══════════════════════════════════════════════════════════════════════════
// 9️⃣ GUÍA DE ERRORES COMUNES
// ═══════════════════════════════════════════════════════════════════════════

/*
 * 
 * ERROR 1: "NotAllowedError"
 * → Usuario denegó permisos de micrófono o captura
 * → SOLUCIÓN: Verificar permisos del navegador
 * 
 * ERROR 2: "NotSupportedError"
 * → Browser no soporta MediaRecorder o getUserMedia
 * → SOLUCIÓN: Usar navegador moderno (Chrome, Firefox, Edge)
 * 
 * ERROR 3: "No se encontró el contenedor del campo"
 * → Falta #pitch-container en HTML
 * → SOLUCIÓN: Verificar que index.html tiene el contenedor
 * 
 * ERROR 4: "Canvas es null"
 * → captureFrameToCanvas() retorna null
 * → SOLUCIÓN: Verificar animationManager.drawingManager
 * 
 * ERROR 5: "Audio no sincronizado"
 * → La duración calculada no coincide con frames
 * → SOLUCIÓN: Ajustar speedInput en animationManager
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🔟 SCRIPT DE TESTING AUTOMÁTICO
// ═══════════════════════════════════════════════════════════════════════════

/*
 * Script completo para testing:
 */

async function fullTestSuite() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 FULL TEST SUITE - Video Export Workflow');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Test 1: Checklist
    console.log('📋 TEST 1: Pre-Export Checklist');
    preExportChecklist();
    console.log('\n');
    
    // Test 2: Canvas
    console.log('🎨 TEST 2: Canvas Rendering');
    debugCanvasRendering();
    console.log('\n');
    
    // Test 3: Audio
    console.log('🎤 TEST 3: Audio Recording');
    await testAudioRecording();
    console.log('\n');
    
    // Test 4: Permissions
    console.log('🔐 TEST 4: Browser Permissions');
    await checkPermissions();
    console.log('\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TESTING COMPLETADO');
    console.log('═══════════════════════════════════════════════════════════');
}

// Ejecutar TODA la suite: fullTestSuite()

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR FUNCIONES DE TEST
// ═══════════════════════════════════════════════════════════════════════════

// Hacer funciones disponibles globalmente
window.VideoExportTesting = {
    testVideoExport,
    testCanvasCapture,
    testAudioRecording,
    checkPermissions,
    debugCanvasRendering,
    preExportChecklist,
    fullTestSuite
};

console.log('✅ VideoExportTesting funciones cargadas');
console.log('📚 Usa: VideoExportTesting.fullTestSuite() para test completo');
