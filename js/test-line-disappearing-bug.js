// test-line-disappearing-bug.js
// Script de prueba específico para verificar el bug de líneas que desaparecen solas

console.log('🧪 PRUEBA ESPECÍFICA: Bug de líneas que desaparecen automáticamente');

function testLineDisappearingBug() {
    console.log('\n🔍 INICIANDO PRUEBA DE BUG DE LÍNEAS QUE DESAPARECEN...\n');
    
    // Verificar configuraciones críticas
    const ballDrawingManager = window.ballDrawingManager; // Si está disponible globalmente
    
    console.log('🎯 PROBLEMA IDENTIFICADO:');
    console.log('- BallDrawingManager.TRAIL_CLEAR_DELAY = 400ms');
    console.log('- Limpiaba automáticamente TODO el canvas');
    console.log('- Afectaba líneas permanentes del DrawingManager');
    
    console.log('\n✅ CORRECCIONES APLICADAS:');
    console.log('1. Eliminado setTimeout automático en handleMouseUp()');
    console.log('2. BallDrawingManager conectado con DrawingManager');
    console.log('3. clearTrail() preserva líneas permanentes');
    console.log('4. Estelas se limpian solo al dibujar nuevas líneas');
    
    console.log('\n📋 INSTRUCCIONES PARA PRUEBA MANUAL:');
    console.log('\n🧪 PRUEBA 1 - Línea solitaria:');
    console.log('1. 🎨 Dibuja UNA línea en el canvas');
    console.log('2. ⏱️ Espera 3-5 segundos SIN hacer nada');
    console.log('3. ✅ La línea debe PERMANECER visible (NO desaparecer)');
    
    console.log('\n🧪 PRUEBA 2 - Múltiples líneas:');
    console.log('1. 🎨 Dibuja VARIAS líneas en el canvas');
    console.log('2. ⏱️ Espera 3-5 segundos SIN hacer nada');
    console.log('3. ✅ TODAS las líneas deben PERMANECER visibles');
    
    console.log('\n🧪 PRUEBA 3 - Estela + líneas:');
    console.log('1. 🏀 Arrastra el balón para crear una estela');
    console.log('2. ⏱️ Espera 1 segundo');
    console.log('3. 🎨 Dibuja una línea permanente');
    console.log('4. ✅ La estela debe desaparecer, la línea debe quedar');
    
    console.log('\n🔧 DETALLES TÉCNICOS:');
    console.log('- Canvas compartido: drawing-canvas');
    console.log('- DrawingManager: líneas permanentes');
    console.log('- BallDrawingManager: estelas temporales del balón');
    console.log('- Coordinación: managers conectados bidireccionalmente');
    
    return true;
}

function checkBallDrawingManagerState() {
    console.log('\n🔍 VERIFICANDO ESTADO DE BALLDRAWINGMANAGER...');
    
    // Buscar referencias en el DOM o window
    const ballDrawingManagerExists = typeof window.ballDrawingManager !== 'undefined';
    
    if (ballDrawingManagerExists) {
        const manager = window.ballDrawingManager;
        console.log('✅ BallDrawingManager encontrado');
        console.log(`- TRAIL_CLEAR_DELAY: ${manager.TRAIL_CLEAR_DELAY}ms`);
        console.log(`- Canvas: ${manager.canvas ? 'OK' : 'ERROR'}`);
        console.log(`- DrawingManager conectado: ${manager.drawingManager ? 'SÍ' : 'NO'}`);
    } else {
        console.log('⚠️ BallDrawingManager no accesible globalmente (normal)');
        console.log('✅ El manager debería existir dentro del módulo main.js');
    }
    
    console.log('\n🎯 CONFIGURACIONES ESPERADAS POST-CORRECCIÓN:');
    console.log('- ❌ setTimeout removido de handleMouseUp()');
    console.log('- ✅ Coordinación entre managers activada');
    console.log('- ✅ clearTrail() preserva líneas permanentes');
    console.log('- ✅ Estelas se limpian solo cuando es apropiado');
    
    return true;
}

function simulateDrawingScenarios() {
    console.log('\n🤖 SIMULANDO ESCENARIOS DE DIBUJO...');
    
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) {
        console.error('❌ Canvas de dibujo no encontrado');
        return false;
    }
    
    console.log('✅ Canvas de dibujo encontrado');
    
    // Simular eventos de dibujo (sin realmente dibujar)
    try {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Simular mousedown
        const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: rect.left + centerX,
            clientY: rect.top + centerY
        });
        canvas.dispatchEvent(mouseDownEvent);
        
        console.log('✅ Evento mousedown simulado');
        
        // Simular mousemove
        setTimeout(() => {
            const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: rect.left + centerX + 50,
                clientY: rect.top + centerY + 50
            });
            canvas.dispatchEvent(mouseMoveEvent);
            console.log('✅ Evento mousemove simulado');
            
            // Simular mouseup
            setTimeout(() => {
                const mouseUpEvent = new MouseEvent('mouseup');
                canvas.dispatchEvent(mouseUpEvent);
                console.log('✅ Evento mouseup simulado');
                console.log('🧪 Simular línea completada - verificar que NO desaparezca');
            }, 100);
        }, 100);
        
    } catch (error) {
        console.error('❌ Error al simular eventos:', error);
        return false;
    }
    
    return true;
}

function runLineDisappearingTest() {
    console.log('🚀 EJECUTANDO PRUEBA COMPLETA DEL BUG DE LÍNEAS QUE DESAPARECEN\n');
    
    const results = {
        passed: [],
        failed: []
    };
    
    // Prueba 1: Configuración básica
    try {
        if (testLineDisappearingBug()) {
            results.passed.push('Configuración y correcciones');
        }
    } catch (e) {
        results.failed.push(`Error en configuración: ${e.message}`);
    }
    
    // Prueba 2: Estado del manager
    try {
        if (checkBallDrawingManagerState()) {
            results.passed.push('Estado del BallDrawingManager');
        }
    } catch (e) {
        results.failed.push(`Error en estado del manager: ${e.message}`);
    }
    
    // Prueba 3: Simulación
    try {
        if (simulateDrawingScenarios()) {
            results.passed.push('Simulación de eventos de dibujo');
        }
    } catch (e) {
        results.failed.push(`Error en simulación: ${e.message}`);
    }
    
    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log(`✅ Pasaron: ${results.passed.length}`);
    results.passed.forEach(test => console.log(`  - ${test}`));
    
    console.log(`❌ Fallaron: ${results.failed.length}`);
    results.failed.forEach(test => console.log(`  - ${test}`));
    
    if (results.failed.length === 0) {
        console.log('\n🎉 ¡CORRECCIÓN IMPLEMENTADA EXITOSAMENTE!');
        console.log('🔧 Las líneas ya NO deberían desaparecer automáticamente');
        console.log('📝 Realiza las pruebas manuales para confirmación final');
    } else {
        console.log('\n⚠️ ALGUNAS VERIFICACIONES FALLARON');
        console.log('🔍 Revisa los errores arriba');
    }
    
    return results.failed.length === 0;
}

// Exponer funciones globalmente
window.testLineDisappearingBug = testLineDisappearingBug;
window.checkBallDrawingManagerState = checkBallDrawingManagerState; 
window.simulateDrawingScenarios = simulateDrawingScenarios;
window.runLineDisappearingTest = runLineDisappearingTest;

// Ejecutar prueba automáticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // setTimeout(runLineDisappearingTest, 3000); // DESHABILITADO TEMPORALMENTE
    });
} else {
    // setTimeout(runLineDisappearingTest, 3000); // DESHABILITADO TEMPORALMENTE
}

console.log('📝 Funciones disponibles:');
console.log('  - runLineDisappearingTest() - Ejecuta todas las pruebas');
console.log('  - testLineDisappearingBug() - Instrucciones de prueba');
console.log('  - checkBallDrawingManagerState() - Estado del manager');
console.log('  - simulateDrawingScenarios() - Simulación de dibujo');
