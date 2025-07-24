/**
 * Sistema de Protección Simple y Efectivo
 * Redirige al login si no está autenticado
 */

(function() {
    'use strict';
    
    console.log('[SimpleAuth] Iniciando verificación...');
    
    // Verificar autenticación
    function isUserAuthenticated() {
        const auth = sessionStorage.getItem('app_authenticated');
        const time = sessionStorage.getItem('auth_timestamp');
        
        if (auth !== 'true' || !time) {
            console.log('[SimpleAuth] No autenticado');
            return false;
        }
        
        // Verificar expiración (1 hora)
        const elapsed = Date.now() - parseInt(time);
        const oneHour = 60 * 60 * 1000;
        
        if (elapsed > oneHour) {
            console.log('[SimpleAuth] Sesión expirada');
            sessionStorage.removeItem('app_authenticated');
            sessionStorage.removeItem('auth_timestamp');
            return false;
        }
        
        console.log('[SimpleAuth] ✅ Autenticado correctamente');
        return true;
    }
    
    // Redirigir al login
    function goToLogin() {
        console.log('[SimpleAuth] Redirigiendo al login...');
        window.location.replace('login.html');
    }
    
    // Verificación principal
    if (!isUserAuthenticated()) {
        goToLogin();
    } else {
        console.log('[SimpleAuth] ✅ Acceso autorizado');
        
        // Verificar periódicamente
        setInterval(() => {
            if (!isUserAuthenticated()) {
                console.log('[SimpleAuth] Sesión perdida');
                goToLogin();
            }
        }, 30000); // Cada 30 segundos
    }
    
})();
