/**
 * Sistema de Protección de Acceso
 * Redirige al login si el usuario no está autenticado
 */

(function() {
    'use strict';
    
    console.log('[Protection] Verificando autenticación...');
    
    // Verificar autenticación inmediatamente
    function checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('app_authenticated');
        const authTime = sessionStorage.getItem('auth_timestamp');
        
        if (isAuthenticated !== 'true' || !authTime) {
            console.log('[Protection] ❌ Usuario no autenticado - Redirigiendo al login');
            redirectToLogin();
            return false;
        }
        
        // Verificar si la sesión ha expirado (1 hora)
        const timeDiff = Date.now() - parseInt(authTime);
        const hourInMs = 60 * 60 * 1000; // 1 hora
        
        if (timeDiff > hourInMs) {
            console.log('[Protection] ⏰ Sesión expirada - Redirigiendo al login');
            sessionStorage.removeItem('app_authenticated');
            sessionStorage.removeItem('auth_timestamp');
            redirectToLogin();
            return false;
        }
        
        console.log('[Protection] ✅ Usuario autenticado correctamente');
        return true;
    }
    
    // Función para redirigir al login
    function redirectToLogin() {
        console.log('[Protection] Iniciando redirección al login...');
        
        // Mostrar pantalla de carga en lugar de ocultar todo
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                z-index: 999999;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                    <h2>Acceso Requerido</h2>
                    <p>Redirigiendo al sistema de autenticación...</p>
                    <div style="margin-top: 2rem;">
                        <div style="border: 3px solid #ffffff40; border-top: 3px solid white; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Redirigir después de un momento para que el usuario vea el mensaje
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
    
    // Verificar al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Protection] DOM cargado, verificando autenticación...');
        if (!checkAuthentication()) {
            return; // Si no está autenticado, ya redirigió
        }
        console.log('[Protection] ✅ Autenticación verificada, cargando aplicación...');
    });
    
    // También verificar inmediatamente (por si DOMContentLoaded ya pasó)
    if (document.readyState === 'loading') {
        // El DOM aún se está cargando, esperar a DOMContentLoaded
        console.log('[Protection] Esperando a que el DOM se cargue...');
    } else {
        // El DOM ya está cargado
        console.log('[Protection] DOM ya cargado, verificando inmediatamente...');
        if (!checkAuthentication()) {
            // No está autenticado, la función ya maneja la redirección
        }
    }
    
    // Monitorear sesión cada 30 segundos
    setInterval(() => {
        if (!checkAuthentication()) {
            console.log('[Protection] Sesión perdida durante ejecución');
        }
    }, 30000);
    
    // Verificar al volver el foco a la ventana
    window.addEventListener('focus', () => {
        if (!checkAuthentication()) {
            console.log('[Protection] Sesión perdida al enfocar ventana');
        }
    });
    
    // Proteger contra manipulación del sessionStorage
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;
    
    sessionStorage.setItem = function(key, value) {
        if (key === 'app_authenticated' && value !== 'true') {
            console.log('[Protection] 🚨 Intento de manipulación de sesión detectado');
            redirectToLogin();
            return;
        }
        return originalSetItem.call(this, key, value);
    };
    
    sessionStorage.removeItem = function(key) {
        if (key === 'app_authenticated') {
            console.log('[Protection] 🚨 Sesión eliminada - Redirigiendo');
            redirectToLogin();
            return;
        }
        return originalRemoveItem.call(this, key);
    };
    
    console.log('[Protection] 🛡️ Sistema de protección activo');
})();
