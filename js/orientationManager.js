// orientationManager.js
// Maneja la detección de orientación y muestra el mensaje de rotar dispositivo

export default class OrientationManager {
    constructor() {
        this.orientationMessage = null;
        this.isVisible = false;
        this.init();
    }
    
    init() {
        this.orientationMessage = document.getElementById('orientation-message');
        if (!this.orientationMessage) {
            console.error('OrientationManager: No se encontró el elemento #orientation-message');
            return;
        }
        
        this.checkOrientation();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Escuchar cambios de orientación
        window.addEventListener('orientationchange', () => {
            // Delay para esperar a que se complete el cambio
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
        
        // Escuchar cambios de tamaño de ventana (para desktop/mobile)
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
        
        // Verificar al cargar la página
        window.addEventListener('load', () => {
            this.checkOrientation();
        });
    }
    
    checkOrientation() {
        const isMobile = this.isMobileDevice();
        const isPortrait = this.isPortraitOrientation();
        
        // Mostrar mensaje solo si es móvil Y está en vertical
        const shouldShow = isMobile && isPortrait;
        
        if (shouldShow && !this.isVisible) {
            this.showMessage();
        } else if (!shouldShow && this.isVisible) {
            this.hideMessage();
        }
    }
    
    isMobileDevice() {
        // Verificar si es un dispositivo móvil
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUA = /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return isMobileUA || (isSmallScreen && isTouchDevice);
    }
    
    isPortraitOrientation() {
        // Verificar si está en orientación vertical
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180;
        }
        
        // Fallback para navegadores que no soportan screen.orientation
        return window.innerHeight > window.innerWidth;
    }
    

    showMessage() {
        if (!this.orientationMessage) return;
        this.orientationMessage.style.display = 'flex';
        this.isVisible = true;
        document.body.classList.add('orientation-locked');
        // Opcional: Vibrar el dispositivo si es compatible
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    hideMessage() {
        if (!this.orientationMessage) return;
        this.orientationMessage.style.display = 'none';
        this.isVisible = false;
        document.body.classList.remove('orientation-locked');
    }
    
    // Método público para forzar verificación
    forceCheck() {
        this.checkOrientation();
    }
    
    // Método para verificar si el mensaje está visible
    isMessageVisible() {
        return this.isVisible;
    }
}
