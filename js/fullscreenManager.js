// fullscreenManager.js
// Gestor para controlar el modo pantalla completa

export default class FullscreenManager {
    constructor() {
        this.isFullscreen = false;
        this.init();
    }
    
    init() {
        this.setupFullscreenButton();
        this.setupFullscreenEvents();
    }
    
    setupFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        } else {
            console.warn('[FullscreenManager] Botón de pantalla completa no encontrado');
        }
    }
    
    setupFullscreenEvents() {
        // Escuchar cambios de pantalla completa
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('MSFullscreenChange', () => {
            this.handleFullscreenChange();
        });
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        this.isFullscreen = isCurrentlyFullscreen;
        this.updateButtonIcon();
    }
    
    updateButtonIcon() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle-btn');
        const icon = fullscreenBtn?.querySelector('i');
        
        if (icon) {
            if (this.isFullscreen) {
                icon.className = 'fas fa-compress';
                fullscreenBtn.title = 'Salir de pantalla completa';
            } else {
                icon.className = 'fas fa-expand';
                fullscreenBtn.title = 'Pantalla completa';
            }
        }
    }
    
    // Método para verificar si el navegador soporta pantalla completa
    isFullscreenSupported() {
        return !!(
            document.documentElement.requestFullscreen ||
            document.documentElement.webkitRequestFullscreen ||
            document.documentElement.mozRequestFullScreen ||
            document.documentElement.msRequestFullscreen
        );
    }
    
    // Método para obtener el estado actual
    getFullscreenState() {
        return this.isFullscreen;
    }
}

// Función global para acceso desde consola (debugging)
window.toggleFullscreen = function() {
    if (window.fullscreenManager) {
        window.fullscreenManager.toggleFullscreen();
    }
};
