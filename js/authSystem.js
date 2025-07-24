/**
 * 🔐 SISTEMA DE AUTENTICACIÓN TEMPORAL
 * 
 * Sistema simple de autenticación con clave fija para acceso temporal
 * a la aplicación Simulador Táctico.
 * 
 * Clave de acceso: Anibal2023
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

class AuthenticationSystem {
    constructor() {
        this.accessKey = 'Anibal2023';
        this.isAuthenticated = false;
        this.maxAttempts = 5;
        this.attempts = 0;
        this.isProcessing = false; // Nuevo: prevenir múltiples ejecuciones
        this.modalShown = false; // Nuevo: controlar si el modal ya se mostró
        this.validationTimeout = null; // Nuevo: controlar timeouts
        
        // TEMPORAL: Descomentado para reactivar autenticación
        // console.log('[Auth] Sistema de autenticación temporalmente deshabilitado');
        // this.emergencyBypass();
        // return;
        
        this.init();
    }

    init() {
        // IMPORTANTE: Limpiar cualquier sesión previa para forzar autenticación
        sessionStorage.removeItem('app_authenticated');
        
        // Verificar si ya está autenticado en la sesión
        const sessionAuth = sessionStorage.getItem('app_authenticated');
        if (sessionAuth === 'true') {
            this.isAuthenticated = true;
            this.hideAuthUI();
            this.enableApp();
            return;
        }

        // Esperar a que el DOM esté listo antes de configurar la UI
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupAuthFlow();
            });
        } else {
            this.setupAuthFlow();
        }
        
        console.log('[Auth] Sistema de autenticación iniciado');
    }

    setupAuthFlow() {
        console.log('[Auth] Configurando flujo de autenticación');
        
        // Verificar que los elementos existan
        const modal = document.getElementById('auth-modal');
        const overlay = document.getElementById('auth-overlay');
        
        console.log('[Auth] Elementos encontrados - Modal:', !!modal, 'Overlay:', !!overlay);
        
        if (!modal || !overlay) {
            console.error('[Auth] Elementos de autenticación no encontrados en el DOM');
            // Si no hay elementos de autenticación, permitir acceso
            this.enableApp();
            return;
        }

        // Configurar la interfaz de autenticación
        console.log('[Auth] Configurando UI de autenticación');
        this.setupAuthUI();
        
        console.log('[Auth] Mostrando modal de autenticación');
        this.showAuthModal();
        
        // Marcar el body como pendiente de autenticación
        console.log('[Auth] Marcando body como pendiente de autenticación');
        document.body.classList.add('auth-pending');
    }

    setupAuthUI() {
        const passwordInput = document.getElementById('access-password');
        const submitButton = document.getElementById('auth-submit');
        const errorDiv = document.getElementById('auth-error');

        if (!passwordInput || !submitButton) {
            console.error('[Auth] Elementos de autenticación no encontrados');
            // Si no se encuentran los elementos, permitir acceso
            this.enableApp();
            return;
        }

        // Event listener para el botón de envío (con seguridad anti-bypass)
        submitButton.addEventListener('click', () => {
            if (window.secureAuthValidation) {
                window.secureAuthValidation();
            } else {
                this.validateAccess();
            }
        });

        // Event listener para Enter en el input
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (window.secureAuthValidation) {
                    window.secureAuthValidation();
                } else {
                    this.validateAccess();
                }
            }
        });

        // Limpiar errores al escribir
        passwordInput.addEventListener('input', () => {
            if (errorDiv && !errorDiv.classList.contains('d-none')) {
                errorDiv.classList.add('d-none');
            }
        });

        // Focus automático en el input cuando se muestre el modal
        const authModal = document.getElementById('auth-modal');
        authModal.addEventListener('shown.bs.modal', () => {
            passwordInput.focus();
        });
    }

    validateAccess() {
        // Prevenir múltiples ejecuciones simultáneas
        if (this.isProcessing) {
            console.log('[Auth] Validación ya en proceso, ignorando clic múltiple');
            return;
        }
        
        console.log('[Auth] Validando acceso...');
        
        const passwordInput = document.getElementById('access-password');
        const submitButton = document.getElementById('auth-submit');
        const errorDiv = document.getElementById('auth-error');
        
        if (!passwordInput || !submitButton) {
            console.error('[Auth] Elementos no encontrados para validación');
            return;
        }

        const enteredPassword = passwordInput.value.trim();
        console.log('[Auth] Contraseña ingresada (longitud):', enteredPassword.length);
        console.log('[Auth] Clave esperada:', this.accessKey);
        console.log('[Auth] Intentos actuales:', this.attempts, '/', this.maxAttempts);
        
        // Verificar si se alcanzó el máximo de intentos
        if (this.attempts >= this.maxAttempts) {
            this.showError('Demasiados intentos fallidos. Recarga la página.');
            submitButton.disabled = true;
            return;
        }

        // Marcar como procesando y deshabilitar botón
        this.isProcessing = true;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificando...';

        // Limpiar timeout anterior si existe
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }

        // Simular un pequeño delay para la validación
        this.validationTimeout = setTimeout(() => {
            if (enteredPassword === this.accessKey) {
                console.log('[Auth] ✅ Contraseña CORRECTA');
                // Acceso correcto
                this.handleSuccessfulAuth();
            } else {
                console.log('[Auth] ❌ Contraseña INCORRECTA');
                // Acceso incorrecto
                this.attempts++;
                this.handleFailedAuth();
            }
            
            // Rehabilitar el botón y proceso
            this.isProcessing = false;
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Ingresar';
        }, 800);
    }

    handleSuccessfulAuth() {
        // Prevenir múltiples ejecuciones
        if (this.isAuthenticated) {
            console.log('[Auth] Usuario ya autenticado, evitando duplicados');
            return;
        }
        
        console.log('[Auth] 🎉 Acceso autorizado - Iniciando proceso de desbloqueo');
        
        // Marcar como autenticado
        this.isAuthenticated = true;
        sessionStorage.setItem('app_authenticated', 'true');
        console.log('[Auth] Estado actualizado - isAuthenticated:', this.isAuthenticated);
        
        // Mostrar overlay de éxito
        console.log('[Auth] Mostrando overlay de éxito...');
        this.showSuccessOverlay();
        
        // Ocultar modal después de un momento
        setTimeout(() => {
            console.log('[Auth] Ocultando modal...');
            this.hideAuthModal();
            
            console.log('[Auth] Ocultando interfaz...');
            this.hideAuthUI();
            
            console.log('[Auth] Habilitando aplicación...');
            this.enableApp();
            
            console.log('[Auth] ✅ Proceso de autenticación completado');
        }, 1500);
    }

    handleFailedAuth() {
        console.log(`[Auth] Intento fallido ${this.attempts}/${this.maxAttempts}`);
        
        const passwordInput = document.getElementById('access-password');
        const errorDiv = document.getElementById('auth-error');
        
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
        
        if (errorDiv) {
            if (this.attempts >= this.maxAttempts - 1) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Último intento disponible.';
            } else {
                errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>Clave incorrecta. Intentos restantes: ${this.maxAttempts - this.attempts}`;
            }
            errorDiv.classList.remove('d-none');
        }
    }

    showAuthModal() {
        // Prevenir múltiples ejecuciones
        if (this.modalShown) {
            console.log('[Auth] Modal ya mostrado, evitando duplicados');
            return;
        }
        
        console.log('[Auth] Intentando mostrar modal de autenticación');
        
        const authModal = document.getElementById('auth-modal');
        if (!authModal) {
            console.error('[Auth] Modal de autenticación no encontrado en el DOM');
            this.enableApp();
            return;
        }
        
        // Marcar como mostrado para prevenir duplicados
        this.modalShown = true;
        
        // USAR MÉTODO MANUAL DIRECTAMENTE para garantizar visibilidad
        console.log('[Auth] Usando método manual directo para garantizar visibilidad');
        this.showModalManually(authModal);
        
        // Verificar que el modal sea visible después de 1 segundo
        setTimeout(() => {
            const isVisible = authModal.offsetWidth > 0 && authModal.offsetHeight > 0;
            const hasShowClass = authModal.classList.contains('show');
            const displayStyle = authModal.style.display;
            
            console.log('[Auth] Verificación de visibilidad:');
            console.log('  - Modal visible (dimensiones):', isVisible);
            console.log('  - Clase "show":', hasShowClass);
            console.log('  - Display style:', displayStyle);
            
            if (!isVisible && !this.isAuthenticated) {
                console.error('[Auth] ⚠️ MODAL SIGUE INVISIBLE - Usando prompt de emergencia');
                this.useEmergencyPrompt();
            } else {
                console.log('[Auth] ✅ Modal confirmado como visible');
            }
        }, 1000);
    }

    useEmergencyPrompt() {
        // Prevenir múltiples ejecuciones del prompt de emergencia
        if (this.isProcessing || this.isAuthenticated) {
            console.log('[Auth] Prompt de emergencia ya ejecutándose o usuario autenticado');
            return;
        }
        
        console.log('[Auth] Usando prompt de emergencia como último recurso');
        this.isProcessing = true;
        
        // Ocultar modal fallido
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'none';
        }
        
        // Usar prompt nativo del navegador
        let attempts = 0;
        const maxAttempts = 5;
        
        const promptForPassword = () => {
            if (attempts >= maxAttempts) {
                alert('Demasiados intentos fallidos. Recarga la página para intentar de nuevo.');
                this.isProcessing = false;
                return;
            }
            
            const password = prompt('🔐 ACCESO REQUERIDO\n\nIngresa la clave de acceso para continuar:');
            
            if (password === null) {
                // Usuario canceló
                setTimeout(promptForPassword, 1000);
                return;
            }
            
            if (password === this.accessKey) {
                alert('✅ Acceso autorizado. La aplicación se cargará ahora.');
                this.isAuthenticated = true;
                sessionStorage.setItem('app_authenticated', 'true');
                this.isProcessing = false;
                this.enableApp();
            } else {
                attempts++;
                alert(`❌ Clave incorrecta. Intentos restantes: ${maxAttempts - attempts}`);
                if (attempts < maxAttempts) {
                    setTimeout(promptForPassword, 500);
                } else {
                    this.isProcessing = false;
                }
            }
        };
        
        // Mostrar prompt después de un pequeño delay
        setTimeout(promptForPassword, 500);
    }

    showModalManually(authModal) {
        console.log('[Auth] Mostrando modal manualmente con máxima prioridad');
        
        // AGREGAR CSS DE EMERGENCIA
        this.addEmergencyCSS();
        
        // FORZAR VISIBILIDAD ABSOLUTA
        authModal.style.display = 'block !important';
        authModal.style.zIndex = '9999999';
        authModal.style.position = 'fixed';
        authModal.style.top = '0';
        authModal.style.left = '0';
        authModal.style.width = '100%';
        authModal.style.height = '100%';
        authModal.style.visibility = 'visible';
        authModal.style.opacity = '1';
        authModal.classList.add('show');
        authModal.setAttribute('aria-hidden', 'false');
        
        // Asegurar que el modal-dialog esté visible
        const modalDialog = authModal.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.style.margin = '50px auto';
            modalDialog.style.position = 'relative';
            modalDialog.style.zIndex = '10000000';
            modalDialog.style.display = 'block';
            modalDialog.style.visibility = 'visible';
            modalDialog.style.opacity = '1';
        }
        
        // Asegurar que el modal-content esté visible
        const modalContent = authModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.display = 'block';
            modalContent.style.visibility = 'visible';
            modalContent.style.opacity = '1';
            modalContent.style.backgroundColor = 'white';
            modalContent.style.border = '1px solid #ccc';
            modalContent.style.borderRadius = '5px';
        }
        
        // Crear/actualizar backdrop con máxima prioridad
        let backdrop = document.getElementById('auth-modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'auth-modal-backdrop';
        backdrop.style.zIndex = '9999998';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0,0,0,0.8)';
        backdrop.style.display = 'block';
        backdrop.style.visibility = 'visible';
        backdrop.style.opacity = '1';
        document.body.appendChild(backdrop);
        
        // Focus en el input
        setTimeout(() => {
            const passwordInput = document.getElementById('access-password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }, 100);
        
        console.log('[Auth] Modal mostrado manualmente');
    }

    addEmergencyCSS() {
        // Añadir CSS de emergencia para forzar visibilidad del modal
        let emergencyStyle = document.getElementById('auth-emergency-styles');
        if (!emergencyStyle) {
            emergencyStyle = document.createElement('style');
            emergencyStyle.id = 'auth-emergency-styles';
            emergencyStyle.type = 'text/css';
            emergencyStyle.textContent = `
                /* ESTILOS DE EMERGENCIA PARA AUTENTICACIÓN */
                #auth-modal {
                    display: block !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 9999999 !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                
                #auth-modal .modal-dialog {
                    display: block !important;
                    margin: 50px auto !important;
                    position: relative !important;
                    z-index: 10000000 !important;
                    max-width: 500px !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                
                #auth-modal .modal-content {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    background-color: white !important;
                    border: 1px solid #ccc !important;
                    border-radius: 5px !important;
                    box-shadow: 0 0 20px rgba(0,0,0,0.5) !important;
                }
                
                #auth-modal-backdrop {
                    display: block !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 9999998 !important;
                    background-color: rgba(0,0,0,0.8) !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                
                /* Ocultar el resto de la aplicación */
                body.auth-pending > *:not(#auth-modal):not(#auth-modal-backdrop) {
                    visibility: hidden !important;
                    opacity: 0.1 !important;
                }
            `;
            document.head.appendChild(emergencyStyle);
            console.log('[Auth] CSS de emergencia añadido');
        }
    }

    hideAuthModal() {
        console.log('[Auth] Ocultando modal de autenticación');
        
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            // Remover todos los estilos forzados
            authModal.style.display = 'none !important';
            authModal.style.visibility = 'hidden !important';
            authModal.style.opacity = '0 !important';
            authModal.classList.remove('show');
            authModal.setAttribute('aria-hidden', 'true');
            
            // Remover backdrop manual si existe
            const backdrop = document.getElementById('auth-modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Remover CSS de emergencia
            const emergencyStyle = document.getElementById('auth-emergency-styles');
            if (emergencyStyle) {
                emergencyStyle.remove();
            }
            
            // Remover clase auth-pending del body
            document.body.classList.remove('auth-pending');
            
            console.log('[Auth] Modal ocultado correctamente');
        }
    }

    showSuccessOverlay() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="auth-overlay-content">
                    <div class="text-center">
                        <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                        <h4 class="text-success">¡Acceso Autorizado!</h4>
                        <p class="text-muted">Cargando aplicación...</p>
                    </div>
                </div>
            `;
        }
    }

    hideAuthUI() {
        console.log('[Auth] Ocultando toda la interfaz de autenticación');
        
        // Ocultar overlay
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'none !important';
            overlay.style.visibility = 'hidden !important';
            overlay.style.opacity = '0 !important';
            overlay.classList.add('hidden');
        }
        
        // Ocultar modal si aún está visible
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'none !important';
            authModal.style.visibility = 'hidden !important';
            authModal.style.opacity = '0 !important';
        }
        
        // Remover backdrop
        const backdrop = document.getElementById('auth-modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Remover CSS de emergencia
        const emergencyStyle = document.getElementById('auth-emergency-styles');
        if (emergencyStyle) {
            emergencyStyle.remove();
        }
        
        // Limpiar clases del body
        document.body.classList.remove('auth-pending');
        
        console.log('[Auth] Interfaz de autenticación completamente oculta');
    }

    enableApp() {
        // Remover clase de autenticación pendiente
        document.body.classList.remove('auth-pending');
        document.body.classList.add('auth-success');
        
        console.log('[Auth] Aplicación habilitada - Acceso concedido');
        
        // Opcional: Remover la clase de éxito después de la animación
        setTimeout(() => {
            document.body.classList.remove('auth-success');
        }, 1000);
    }

    // Método para cerrar sesión (opcional)
    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('app_authenticated');
        window.location.reload();
    }

    // Verificar estado de autenticación
    checkAuthStatus() {
        return this.isAuthenticated;
    }

    // Método de emergencia para deshabilitar autenticación
    emergencyBypass() {
        console.warn('[Auth] Bypass de emergencia activado');
        this.isAuthenticated = true;
        sessionStorage.setItem('app_authenticated', 'true');
        
        // Remover clases de autenticación del body
        if (document.body) {
            document.body.classList.remove('auth-pending');
            document.body.classList.add('auth-success');
        }
        
        // Ocultar elementos de autenticación si existen
        this.hideAuthUI();
        this.enableApp();
    }
}

// Función de utilidad para otros módulos
window.confirmCriticalAction = function(message) {
    const settings = window.configurationSettings || {};
    const confirmEnabled = settings.confirmActions !== false; // Por defecto true
    
    if (confirmEnabled) {
        return confirm(message);
    }
    return true; // Si las confirmaciones están deshabilitadas, permitir la acción
};

// Función de emergencia global para deshabilitar autenticación
// Función global para depuración del modal
window.debugAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    const overlay = document.getElementById('auth-overlay');
    const backdrop = document.getElementById('auth-modal-backdrop');
    const emergencyCSS = document.getElementById('auth-emergency-styles');
    
    console.log('🔍 ESTADO DEL MODAL DE AUTENTICACIÓN:');
    console.log('  Modal existe:', !!modal);
    if (modal) {
        console.log('  Modal display:', modal.style.display);
        console.log('  Modal visibility:', modal.style.visibility);
        console.log('  Modal opacity:', modal.style.opacity);
        console.log('  Modal classes:', modal.className);
        console.log('  Modal visible (dimensiones):', modal.offsetWidth > 0 && modal.offsetHeight > 0);
    }
    
    console.log('  Overlay existe:', !!overlay);
    if (overlay) {
        console.log('  Overlay display:', overlay.style.display);
        console.log('  Overlay visible:', overlay.offsetWidth > 0 && overlay.offsetHeight > 0);
    }
    
    console.log('  Backdrop existe:', !!backdrop);
    console.log('  CSS emergencia activo:', !!emergencyCSS);
    console.log('  Body classes:', document.body.className);
    
    if (window.authSystem) {
        console.log('  AuthSystem autenticado:', window.authSystem.isAuthenticated);
        console.log('  Sesión guardada:', sessionStorage.getItem('app_authenticated'));
    }
};

// Función para forzar ocultación del modal
window.forceHideAuthModal = function() {
    console.log('🔧 FORZANDO OCULTACIÓN DEL MODAL...');
    
    if (window.authSystem) {
        window.authSystem.isAuthenticated = true;
        sessionStorage.setItem('app_authenticated', 'true');
        window.authSystem.hideAuthModal();
        window.authSystem.hideAuthUI();
        window.authSystem.enableApp();
        console.log('✅ Modal forzadamente ocultado');
    } else {
        console.log('❌ AuthSystem no disponible');
    }
};

// Función global para desactivar autenticación (emergencia)
window.disableAuth = function() {
    console.log('[Auth] Deshabilitando autenticación por comando de emergencia');
    if (window.authSystem) {
        window.authSystem.emergencyBypass();
    } else {
        // Si no existe el sistema, crear uno temporal y hacer bypass
        sessionStorage.setItem('app_authenticated', 'true');
        document.body.classList.remove('auth-pending');
        document.body.classList.add('auth-success');
        
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        const modal = document.getElementById('auth-modal');
        if (modal && typeof window.bootstrap !== 'undefined') {
            const modalInstance = window.bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    }
};

// Inicializar el sistema de autenticación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar mensaje en consola sobre el sistema de autenticación
    console.log('%c🔐 SISTEMA DE AUTENTICACIÓN ACTIVADO', 'color: #ff6b00; font-weight: bold; font-size: 14px;');
    console.log('%c📝 Clave de acceso requerida: Anibal2023', 'color: #0066cc; font-weight: bold;');
    console.log('%c⚠️  Para desactivar temporalmente, usar: disableAuth() en consola', 'color: #666; font-style: italic;');
    
    // Crear instancia global del sistema de autenticación
    window.authSystem = new AuthenticationSystem();
    
    // Timeout de emergencia: si después de 10 segundos no se ha autenticado y no hay modal visible,
    // permitir acceso automáticamente
    setTimeout(() => {
        if (window.authSystem && !window.authSystem.isAuthenticated) {
            const modal = document.getElementById('auth-modal');
            const modalInstance = (modal && typeof window.bootstrap !== 'undefined') ? 
                window.bootstrap.Modal.getInstance(modal) : null;
            
            // Si no hay modal visible o hay algún problema, hacer bypass
            if (!modalInstance || !modal.classList.contains('show')) {
                console.warn('[Auth] Timeout alcanzado - activando bypass de emergencia');
                window.authSystem.emergencyBypass();
            }
        }
    }, 10000); // 10 segundos
});

// Exportar para uso en módulos ES6 si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationSystem;
}

// Función global para depuración del modal
window.debugAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    const overlay = document.getElementById('auth-overlay');
    const backdrop = document.getElementById('auth-modal-backdrop');
    const emergencyCSS = document.getElementById('auth-emergency-styles');
    
    console.log('🔍 ESTADO DEL MODAL DE AUTENTICACIÓN:');
    console.log('  Modal existe:', !!modal);
    if (modal) {
        console.log('  Modal display:', modal.style.display);
        console.log('  Modal visibility:', modal.style.visibility);
        console.log('  Modal opacity:', modal.style.opacity);
        console.log('  Modal classes:', modal.className);
        console.log('  Modal visible (dimensiones):', modal.offsetWidth > 0 && modal.offsetHeight > 0);
    }
    
    console.log('  Overlay existe:', !!overlay);
    if (overlay) {
        console.log('  Overlay display:', overlay.style.display);
        console.log('  Overlay visible:', overlay.offsetWidth > 0 && overlay.offsetHeight > 0);
    }
    
    console.log('  Backdrop existe:', !!backdrop);
    console.log('  CSS emergencia activo:', !!emergencyCSS);
    console.log('  Body classes:', document.body.className);
    
    if (window.authSystem) {
        console.log('  AuthSystem autenticado:', window.authSystem.isAuthenticated);
        console.log('  Sesión guardada:', sessionStorage.getItem('app_authenticated'));
    }
};

// Función para forzar ocultación del modal
window.forceHideAuthModal = function() {
    console.log('🔧 FORZANDO OCULTACIÓN DEL MODAL...');
    
    if (window.authSystem) {
        window.authSystem.isAuthenticated = true;
        sessionStorage.setItem('app_authenticated', 'true');
        window.authSystem.hideAuthModal();
        window.authSystem.hideAuthUI();
        window.authSystem.enableApp();
        console.log('✅ Modal forzadamente ocultado');
    } else {
        console.log('❌ AuthSystem no disponible');
    }
};
