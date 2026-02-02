/**
 * ==========================================
 * 🌓 GESTOR DE TEMAS - MODO CLARO/OSCURO
 * ==========================================
 * Controla el cambio entre modo claro y oscuro
 * utilizando CSS custom properties y localStorage
 * para persistir la preferencia del usuario.
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Tema por defecto
        this.toggleButton = null;
        this.themeIcon = null;
        
        this.init();
    }
    
    /**
     * Inicializa el gestor de temas
     */
    init() {
        // Esperar a que el DOM esté cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Configura los elementos y eventos
     */
    setup() {
        this.toggleButton = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        
        if (!this.toggleButton || !this.themeIcon) {
            console.warn('Elementos de tema no encontrados en el DOM');
            return;
        }
        
        // Cargar tema guardado o usar preferencia del sistema
        this.loadSavedTheme();
        
        // Configurar evento de clic
        this.toggleButton.addEventListener('click', () => this.toggleTheme());
        
        // Escuchar cambios en la preferencia del sistema
        this.listenToSystemPreference();
        
    }
    
    /**
     * Carga el tema guardado en localStorage o usa la preferencia del sistema
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('soccer-tactics-theme');
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Detectar preferencia del sistema
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                this.currentTheme = 'light';
            } else {
                this.currentTheme = 'dark';
            }
        }
        
        this.applyTheme(this.currentTheme);
    }
    
    /**
     * Aplica el tema especificado
     * @param {string} theme - 'light' o 'dark'
     */
    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            this.themeIcon.className = 'fas fa-moon';
            this.toggleButton.title = 'Cambiar a modo oscuro';
        } else {
            html.removeAttribute('data-theme');
            this.themeIcon.className = 'fas fa-sun';
            this.toggleButton.title = 'Cambiar a modo claro';
        }
        
        this.currentTheme = theme;
        
        // Guardar en localStorage
        localStorage.setItem('soccer-tactics-theme', theme);
        
        // Emitir evento personalizado para otros componentes
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: theme }
        }));
    }
    
    /**
     * Cambia entre modo claro y oscuro
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Animación del botón
        this.animateToggle();
    }
    
    /**
     * Animación visual del botón toggle
     */
    animateToggle() {
        if (!this.toggleButton) return;
        
        this.toggleButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.toggleButton.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.toggleButton.style.transform = 'scale(1)';
            }, 150);
        }, 100);
    }
    
    /**
     * Escucha cambios en la preferencia del sistema
     */
    listenToSystemPreference() {
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Solo cambiar si no hay preferencia guardada explícitamente
            const savedTheme = localStorage.getItem('soccer-tactics-theme');
            if (!savedTheme) {
                const systemTheme = e.matches ? 'light' : 'dark';
                this.applyTheme(systemTheme);
            }
        });
    }
    
    /**
     * Obtiene el tema actual
     * @returns {string} El tema actual ('light' o 'dark')
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Establece un tema específico
     * @param {string} theme - 'light' o 'dark'
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
        } else {
            console.warn('Tema no válido. Use "light" o "dark".');
        }
    }
}

// Inicializar el gestor de temas globalmente
window.themeManager = new ThemeManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
