// 🔧 DIAGNÓSTICO COMPLETO DEL SISTEMA DE AUTENTICACIÓN
// Este script verifica cada componente del sistema paso a paso

console.log('%c🔧 INICIANDO DIAGNÓSTICO COMPLETO', 'color: #ff6b00; font-weight: bold; font-size: 16px;');

// 1. Verificar dependencias
function checkDependencies() {
    console.log('\n📋 1. VERIFICANDO DEPENDENCIAS:');
    
    const bootstrapAvailable = typeof window.bootstrap !== 'undefined';
    const fontAwesome = !!document.querySelector('link[href*="font-awesome"]');
    
    console.log('  ✓ Bootstrap disponible:', bootstrapAvailable);
    console.log('  ✓ Font Awesome disponible:', fontAwesome);
    
    return { bootstrap: bootstrapAvailable, fontAwesome };
}

// 2. Verificar elementos DOM
function checkDOMElements() {
    console.log('\n📋 2. VERIFICANDO ELEMENTOS DOM:');
    
    const modal = document.getElementById('auth-modal');
    const overlay = document.getElementById('auth-overlay');
    const passwordInput = document.getElementById('access-password');
    const submitButton = document.getElementById('auth-submit');
    const errorDiv = document.getElementById('auth-error');
    
    console.log('  ✓ Modal (#auth-modal):', !!modal);
    console.log('  ✓ Overlay (#auth-overlay):', !!overlay);
    console.log('  ✓ Input contraseña (#access-password):', !!passwordInput);
    console.log('  ✓ Botón envío (#auth-submit):', !!submitButton);
    console.log('  ✓ Div error (#auth-error):', !!errorDiv);
    
    return { modal, overlay, passwordInput, submitButton, errorDiv };
}

// 3. Verificar sistema de autenticación
function checkAuthSystem() {
    console.log('\n📋 3. VERIFICANDO SISTEMA DE AUTENTICACIÓN:');
    
    const authSystem = window.authSystem;
    const authSystemExists = !!authSystem;
    const isAuthenticated = authSystem ? authSystem.isAuthenticated : false;
    const sessionAuth = sessionStorage.getItem('app_authenticated');
    
    console.log('  ✓ window.authSystem existe:', authSystemExists);
    console.log('  ✓ Estado autenticado:', isAuthenticated);
    console.log('  ✓ Sesión en localStorage:', sessionAuth);
    
    if (authSystem) {
        console.log('  ✓ Clave configurada:', authSystem.accessKey);
        console.log('  ✓ Intentos actuales:', authSystem.attempts);
        console.log('  ✓ Máximo intentos:', authSystem.maxAttempts);
    }
    
    return { authSystemExists, isAuthenticated, sessionAuth };
}

// 4. Verificar CSS y estilos
function checkStyles() {
    console.log('\n📋 4. VERIFICANDO ESTILOS CSS:');
    
    const modalStyles = window.getComputedStyle(document.getElementById('auth-modal') || document.body);
    const overlayStyles = window.getComputedStyle(document.getElementById('auth-overlay') || document.body);
    
    console.log('  ✓ Modal display:', modalStyles.display);
    console.log('  ✓ Overlay display:', overlayStyles.display);
    
    // Verificar si hay estilos de autenticación cargados
    const authStylesExist = Array.from(document.styleSheets).some(sheet => {
        try {
            return Array.from(sheet.cssRules).some(rule => 
                rule.selectorText && rule.selectorText.includes('auth-')
            );
        } catch (e) {
            return false;
        }
    });
    
    console.log('  ✓ Estilos de autenticación cargados:', authStylesExist);
    
    return { modalDisplay: modalStyles.display, overlayDisplay: overlayStyles.display, authStylesExist };
}

// 5. Probar funcionalidad del modal
function testModalFunctionality() {
    console.log('\n📋 5. PROBANDO FUNCIONALIDAD DEL MODAL:');
    
    const modal = document.getElementById('auth-modal');
    if (!modal) {
        console.log('  ❌ No se puede probar: modal no encontrado');
        return false;
    }
    
    try {
        // Intentar mostrar modal con Bootstrap
        if (typeof window.bootstrap !== 'undefined') {
            console.log('  🔄 Probando modal con Bootstrap...');
            const bsModal = new window.bootstrap.Modal(modal, {
                backdrop: 'static',
                keyboard: false
            });
            
            // Mostrar por 2 segundos y luego ocultar
            bsModal.show();
            
            setTimeout(() => {
                bsModal.hide();
                console.log('  ✅ Modal Bootstrap funciona correctamente');
            }, 2000);
            
            return true;
        } else {
            console.log('  ⚠️ Bootstrap no disponible, probando manualmente...');
            
            // Mostrar manualmente
            modal.style.display = 'block';
            modal.classList.add('show');
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                console.log('  ✅ Modal manual funciona correctamente');
            }, 2000);
            
            return true;
        }
    } catch (error) {
        console.log('  ❌ Error al probar modal:', error);
        return false;
    }
}

// 6. Ejecutar diagnóstico completo
function runFullDiagnosis() {
    console.log('%c🔧 EJECUTANDO DIAGNÓSTICO COMPLETO', 'color: #0066cc; font-weight: bold;');
    
    const dependencies = checkDependencies();
    const domElements = checkDOMElements();
    const authSystem = checkAuthSystem();
    const styles = checkStyles();
    
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
    
    // Calcular puntuación
    let score = 0;
    let maxScore = 0;
    
    // Dependencias (peso: 2 puntos cada una)
    if (dependencies.bootstrap) score += 2;
    if (dependencies.fontAwesome) score += 1;
    maxScore += 3;
    
    // Elementos DOM (peso: 1 punto cada uno)
    Object.values(domElements).forEach(element => {
        if (element) score += 1;
        maxScore += 1;
    });
    
    // Sistema de autenticación (peso: 3 puntos)
    if (authSystem.authSystemExists) score += 3;
    maxScore += 3;
    
    // Estilos (peso: 2 puntos)
    if (styles.authStylesExist) score += 2;
    maxScore += 2;
    
    const percentage = Math.round((score / maxScore) * 100);
    
    console.log(`  🎯 Puntuación: ${score}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
        console.log('%c  ✅ SISTEMA COMPLETAMENTE FUNCIONAL', 'color: #00cc00; font-weight: bold;');
    } else if (percentage >= 70) {
        console.log('%c  ⚠️ SISTEMA MAYORMENTE FUNCIONAL - Revisar elementos faltantes', 'color: #ff9900; font-weight: bold;');
    } else {
        console.log('%c  ❌ SISTEMA CON PROBLEMAS GRAVES - Requiere atención', 'color: #cc0000; font-weight: bold;');
    }
    
    // Probar modal al final
    setTimeout(() => {
        testModalFunctionality();
    }, 1000);
    
    return { dependencies, domElements, authSystem, styles, score, maxScore, percentage };
}

// Exportar funciones para uso manual
window.authDiagnosis = {
    checkDependencies,
    checkDOMElements,
    checkAuthSystem,
    checkStyles,
    testModalFunctionality,
    runFullDiagnosis
};

// Ejecutar automáticamente si no estamos en la aplicación principal
if (!window.main) {
    console.log('🔄 Ejecutando diagnóstico automático en 5 segundos...');
    // Esperar más tiempo para que Bootstrap se cargue completamente
    setTimeout(() => {
        try {
            runFullDiagnosis();
        } catch (error) {
            console.log('❌ Error en diagnóstico automático:', error);
            console.log('📝 Usa authDiagnosis.runFullDiagnosis() para ejecutar manualmente');
        }
    }, 5000);
} else {
    console.log('📝 Usa authDiagnosis.runFullDiagnosis() para ejecutar el diagnóstico completo');
}
