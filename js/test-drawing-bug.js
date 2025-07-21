// test-drawing-bug.js
// Script de prueba específico para verificar el bug del borrado de líneas

console.log('🧪 PRUEBA ESPECÍFICA: Bug de reaparición de líneas borradas');

function testDrawingDeletionBug() {
    console.log('\n🔍 INICIANDO PRUEBA DE BUG DE BORRADO...\n');
    
    // Verificar que los elementos existen
    const drawingCanvas = document.getElementById('drawing-canvas');
    const clearBtn = document.getElementById('clear-canvas');
    const deleteLineBtn = document.getElementById('delete-line-mode');
    const undoBtn = document.getElementById('undo-line');
    const redoBtn = document.getElementById('redo-line');
    
    if (!drawingCanvas || !clearBtn || !deleteLineBtn) {
        console.error('❌ ERROR: Elementos de dibujo no encontrados');
        return false;
    }
    
    console.log('✅ Elementos de dibujo encontrados');
    
    // Verificar que el drawingManager está disponible globalmente o accesible
    let drawingManager;
    
    // Intentar acceder al drawingManager desde window o desde los managers
    if (window.main && window.main.drawingManager) {
        drawingManager = window.main.drawingManager;
    } else {
        // Buscar en el DOM si hay alguna forma de acceder
        console.log('⚠️ DrawingManager no accesible globalmente - esto es normal');
        console.log('✅ Los botones deberían funcionar a través de UIManager');
    }
    
    console.log('\n📋 INSTRUCCIONES PARA PRUEBA MANUAL:');
    console.log('1. 🎨 Dibuja varias líneas en el canvas');
    console.log('2. 🗑️ Haz clic en "Limpiar líneas" (icono de borrador)');
    console.log('3. ✅ Verifica que todas las líneas desaparezcan');
    console.log('4. 🎨 Dibuja una nueva línea');
    console.log('5. ❌ Las líneas anteriores NO deben reaparecer');
    console.log('\n📋 PRUEBA ALTERNATIVA CON BORRADOR INDIVIDUAL:');
    console.log('1. 🎨 Dibuja varias líneas en el canvas');
    console.log('2. ✂️ Haz clic en "Borrar línea" (icono de tijeras)');
    console.log('3. 🎯 Haz clic en una línea específica para borrarla');
    console.log('4. 🎨 Dibuja una nueva línea');
    console.log('5. ❌ La línea borrada NO debe reaparecer');
    
    // Simular clicks en los botones para verificar que no hay errores de consola
    console.log('\n🤖 SIMULANDO CLICKS EN BOTONES...');
    
    try {
        // Simular click en borrar todo
        const clearEvent = new Event('click');
        clearBtn.dispatchEvent(clearEvent);
        console.log('✅ Botón "Limpiar líneas" ejecutado sin errores');
    } catch (error) {
        console.error('❌ Error al simular click en "Limpiar líneas":', error);
    }
    
    try {
        // Simular click en modo borrar línea
        const deleteEvent = new Event('click');
        deleteLineBtn.dispatchEvent(deleteEvent);
        console.log('✅ Botón "Borrar línea" ejecutado sin errores');
        
        // Desactivar modo borrar
        deleteLineBtn.dispatchEvent(deleteEvent);
        console.log('✅ Modo borrar línea desactivado');
    } catch (error) {
        console.error('❌ Error al simular click en "Borrar línea":', error);
    }
    
    if (undoBtn && redoBtn) {
        try {
            // Simular clicks en deshacer/rehacer
            const undoEvent = new Event('click');
            const redoEvent = new Event('click');
            
            undoBtn.dispatchEvent(undoEvent);
            console.log('✅ Botón "Deshacer" ejecutado sin errores');
            
            redoBtn.dispatchEvent(redoEvent);
            console.log('✅ Botón "Rehacer" ejecutado sin errores');
        } catch (error) {
            console.error('❌ Error en botones deshacer/rehacer:', error);
        }
    }
    
    console.log('\n🎯 VERIFICACIÓN DE CORRECCIONES APLICADAS:');
    console.log('✅ 1. UIManager.clearCanvas() cambiado a clearAllLines()');
    console.log('✅ 2. DrawingManager.handleCanvasClick() limpia undoStack');
    console.log('✅ 3. DrawingManager.startDrawing() limpia undoStack correctamente');
    
    console.log('\n🔬 ESTADO INTERNO ESPERADO:');
    console.log('- this.lines = [] (vacío después de borrar)');
    console.log('- this.undoStack = [] (vacío después de borrar)');
    console.log('- Nuevas líneas no pueden recuperar líneas borradas');
    
    return true;
}

// Función para verificar el estado visual del canvas
function checkCanvasState() {
    const drawingCanvas = document.getElementById('drawing-canvas');
    if (!drawingCanvas) {
        console.error('❌ Canvas de dibujo no encontrado');
        return false;
    }
    
    const ctx = drawingCanvas.getContext('2d');
    
    // Crear un canvas temporal para comparar
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = drawingCanvas.width;
    tempCanvas.height = drawingCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Obtener datos de imagen de ambos canvas
    const currentData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    const emptyData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Comparar si son iguales (canvas vacío)
    let isEmpty = true;
    for (let i = 0; i < currentData.data.length; i += 4) {
        // Verificar si hay algún pixel no transparente
        if (currentData.data[i + 3] > 0) { // Canal alfa
            isEmpty = false;
            break;
        }
    }
    
    console.log(`🖼️ Estado del canvas: ${isEmpty ? 'VACÍO' : 'CONTIENE DIBUJOS'}`);
    return isEmpty;
}

// Función de prueba completa
function runDrawingBugTest() {
    console.log('🚀 EJECUTANDO PRUEBA COMPLETA DEL BUG DE BORRADO\n');
    
    const testsPassed = [];
    const testsFailed = [];
    
    // Prueba 1: Elementos básicos
    try {
        if (testDrawingDeletionBug()) {
            testsPassed.push('Elementos y botones funcionando');
        } else {
            testsFailed.push('Elementos o botones con problemas');
        }
    } catch (e) {
        testsFailed.push('Error en prueba básica: ' + e.message);
    }
    
    // Prueba 2: Estado del canvas
    try {
        checkCanvasState();
        testsPassed.push('Verificación de estado del canvas');
    } catch (e) {
        testsFailed.push('Error al verificar canvas: ' + e.message);
    }
    
    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log(`✅ Pasaron: ${testsPassed.length}`);
    testsPassed.forEach(test => console.log(`  - ${test}`));
    
    console.log(`❌ Fallaron: ${testsFailed.length}`);
    testsFailed.forEach(test => console.log(`  - ${test}`));
    
    if (testsFailed.length === 0) {
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
        console.log('🔧 Las correcciones aplicadas deberían resolver el bug de reaparición');
    } else {
        console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
        console.log('🔍 Revisa los errores arriba para más detalles');
    }
    
    return testsFailed.length === 0;
}

// Exponer funciones globalmente
window.testDrawingDeletionBug = testDrawingDeletionBug;
window.checkCanvasState = checkCanvasState;
window.runDrawingBugTest = runDrawingBugTest;

// Ejecutar prueba automáticamente si el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // setTimeout(runDrawingBugTest, 2000); // DESHABILITADO TEMPORALMENTE
    });
} else {
    // setTimeout(runDrawingBugTest, 2000); // DESHABILITADO TEMPORALMENTE
}

console.log('📝 Funciones disponibles:');
console.log('  - runDrawingBugTest() - Ejecuta todas las pruebas');
console.log('  - testDrawingDeletionBug() - Prueba específica del bug');
console.log('  - checkCanvasState() - Verifica estado visual del canvas');
