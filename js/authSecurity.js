/**
 * Sistema de Seguridad para el Simulador Táctico
 * Funciones para prevenir bypass de autenticación por clics múltiples
 * @version 1.0.0
 */

console.log('[Security] Cargando sistema de seguridad...');

// Función para resetear el estado del sistema de autenticación
window.resetAuthSystem = function() {
    console.log('🔄 RESETEANDO SISTEMA DE AUTENTICACIÓN...');
    
    if (window.authSystem) {
        // Limpiar timeouts activos
        if (window.authSystem.validationTimeout) {
            clearTimeout(window.authSystem.validationTimeout);
            window.authSystem.validationTimeout = null;
        }
        
        // Resetear variables de control
        window.authSystem.isProcessing = false;
        window.authSystem.modalShown = false;
        window.authSystem.isAuthenticated = false;
        window.authSystem.attempts = 0;
        
        // Limpiar sesión
        sessionStorage.removeItem('app_authenticated');
        
        console.log('✅ Sistema de autenticación reseteado');
    } else {
        console.log('❌ AuthSystem no disponible');
    }
};

// Función para prevenir clics múltiples (debounce)
window.safeAuthClick = function() {
    console.log('🛡️ VALIDACIÓN SEGURA ACTIVADA...');
    
    if (window.authSystem && !window.authSystem.isProcessing) {
        window.authSystem.validateAccess();
    } else {
        console.log('⚠️ Validación ya en proceso o sistema no disponible');
    }
};

// Función para validar integridad del sistema
window.validateAuthIntegrity = function() {
    console.log('🔍 VALIDANDO INTEGRIDAD DEL SISTEMA...');
    
    const sessionAuth = sessionStorage.getItem('app_authenticated');
    const systemAuth = window.authSystem ? window.authSystem.isAuthenticated : false;
    
    console.log('  - Sesión storage:', sessionAuth);
    console.log('  - Sistema auth:', systemAuth);
    
    // Si hay discrepancia, resetear todo
    if (sessionAuth === 'true' && !systemAuth) {
        console.log('⚠️ DISCREPANCIA DETECTADA - Reseteando...');
        window.resetAuthSystem();
        return false;
    }
    
    console.log('✅ Integridad del sistema verificada');
    return true;
};

// Interceptor para prevenir bypass por eventos múltiples
let authEventCount = 0;
let lastAuthEventTime = 0;
const AUTH_EVENT_COOLDOWN = 1000; // 1 segundo

window.secureAuthValidation = function() {
    const currentTime = Date.now();
    
    // Verificar cooldown
    if (currentTime - lastAuthEventTime < AUTH_EVENT_COOLDOWN) {
        authEventCount++;
        console.log(`[Security] ⚠️ Evento rápido detectado #${authEventCount} - Ignorando`);
        
        // Si hay demasiados eventos rápidos, resetear sistema
        if (authEventCount > 5) {
            console.log('[Security] 🚨 ATAQUE DE CLICS MÚLTIPLES DETECTADO - Reseteando sistema');
            window.resetAuthSystem();
            authEventCount = 0;
        }
        return false;
    }
    
    // Resetear contador si ha pasado suficiente tiempo
    authEventCount = 0;
    lastAuthEventTime = currentTime;
    
    // Validar integridad antes de proceder
    if (!window.validateAuthIntegrity()) {
        return false;
    }
    
    // Proceder con validación segura
    return window.safeAuthClick();
};

// Monitor de eventos sospechosos
let suspiciousEventCount = 0;
const MAX_SUSPICIOUS_EVENTS = 10;

document.addEventListener('click', function(event) {
    // Monitorear clics en elementos de autenticación
    if (event.target && (
        event.target.id === 'auth-submit' ||
        event.target.closest('#auth-submit') ||
        event.target.closest('#auth-modal')
    )) {
        const clickInterval = Date.now() - lastAuthEventTime;
        
        if (clickInterval < 200) { // Clics muy rápidos
            suspiciousEventCount++;
            console.log(`[Security] 🚨 Clic sospechoso detectado #${suspiciousEventCount}`);
            
            if (suspiciousEventCount > MAX_SUSPICIOUS_EVENTS) {
                console.log('[Security] 🚨 COMPORTAMIENTO SOSPECHOSO - Bloqueando sistema');
                event.preventDefault();
                event.stopPropagation();
                window.resetAuthSystem();
                alert('⚠️ Comportamiento sospechoso detectado. El sistema ha sido reseteado por seguridad.');
                return false;
            }
        } else {
            // Resetear contador si los clics son normales
            suspiciousEventCount = 0;
        }
    }
});

// Función para verificar estado cada cierto tiempo
setInterval(function() {
    if (window.authSystem && window.authSystem.isAuthenticated) {
        // Verificar que la sesión coincida
        const sessionAuth = sessionStorage.getItem('app_authenticated');
        if (sessionAuth !== 'true') {
            console.log('[Security] 🚨 SESIÓN COMPROMETIDA - Reseteando autenticación');
            window.authSystem.isAuthenticated = false;
            window.authSystem.showAuthModal();
        }
    }
}, 5000); // Verificar cada 5 segundos

console.log('[Security] ✅ Sistema de seguridad cargado y activo');
