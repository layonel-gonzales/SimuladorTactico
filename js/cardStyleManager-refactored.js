/**
 * 🎨 GESTOR DE ESTILOS DE CARDS DE JUGADORES (REFACTORIZADO)
 * Usa el sistema modular StyleRegistry para cargar estilos dinámicamente
 */

class CardStyleManager {
    constructor() {
        this.currentStyle = 'classic';
        this.stylesLoaded = false;
        
        console.log('🎨 CardStyleManager inicializado (módular)');
        this.init();
    }

    /**
     * Inicializar el manager esperando a que los estilos se carguen
     */
    async init() {
        // Esperar a que styleRegistry esté disponible
        if (!window.styleRegistry) {
            console.warn('⚠️ StyleRegistry no disponible, reintentando...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.stylesLoaded = true;
        const stats = window.styleRegistry.getStats();
        console.log(`✅ CardStyleManager cargado: ${stats.cardStyles} estilos de card disponibles`);
        this.loadSavedStyle();
    }

    /**
     * Obtener todos los estilos disponibles del registro
     */
    getAvailableStyles() {
        if (!window.styleRegistry) return [];
        return window.styleRegistry.getAllCardStyles();
    }

    /**
     * Cambiar el estilo actual
     */
    setCurrentStyle(styleId) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        const style = window.styleRegistry.getCardStyle(styleId);
        if (!style) {
            console.warn(`❌ Estilo de card '${styleId}' no encontrado`);
            return false;
        }

        this.currentStyle = styleId;
        this.saveCurrentStyle();
        console.log(`🎴 Estilo de card cambiado a: ${style.name}`);
        
        window.dispatchEvent(new CustomEvent('cardStyleChanged', {
            detail: { styleId, style }
        }));
        
        return true;
    }

    /**
     * Obtener el estilo actual
     */
    getCurrentStyle() {
        if (!window.styleRegistry) return null;
        return window.styleRegistry.getCardStyle(this.currentStyle);
    }

    /**
     * Crear una card estilizada
     */
    createStyledCard(player, type = 'field', cardId, screenType) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return '';
        }

        const style = window.styleRegistry.getCardStyle(this.currentStyle);
        if (!style) {
            console.warn(`⚠️ Estilo de card no encontrado: ${this.currentStyle}`);
            return '';
        }

        try {
            return style.createFunction(player, type, cardId, screenType, style.theme, player.id);
        } catch (error) {
            console.error(`❌ Error creando card con estilo ${this.currentStyle}:`, error);
            
            // Fallback al estilo clásico
            const classicStyle = window.styleRegistry.getCardStyle('classic');
            if (classicStyle) {
                return classicStyle.createFunction(player, type, cardId, screenType, classicStyle.theme, player.id);
            }
            return '';
        }
    }

    /**
     * Registrar un nuevo estilo de card dinámicamente
     * Útil para agregar estilos en tiempo de ejecución
     */
    registerCustomStyle(styleId, styleConfig) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        return window.styleRegistry.registerCardStyle(styleId, styleConfig);
    }

    /**
     * Eliminar un estilo de card
     */
    removeStyle(styleId) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        if (this.currentStyle === styleId) {
            console.warn('⚠️ No se puede eliminar el estilo actual. Cambiando a "classic".');
            this.setCurrentStyle('classic');
        }

        return window.styleRegistry.removeCardStyle(styleId);
    }

    /**
     * Guardar el estilo actual en localStorage
     */
    saveCurrentStyle() {
        try {
            localStorage.setItem('selectedCardStyle', this.currentStyle);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el estilo de card:', error);
        }
    }

    /**
     * Cargar el estilo guardado del localStorage
     */
    loadSavedStyle() {
        try {
            const saved = localStorage.getItem('selectedCardStyle');
            if (saved && window.styleRegistry?.hasCardStyle(saved)) {
                this.currentStyle = saved;
                const style = window.styleRegistry.getCardStyle(saved);
                console.log(`🎴 Estilo de card cargado: ${style.name}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el estilo de card guardado:', error);
        }
    }

    /**
     * Obtener información del estilo actual
     */
    getCurrentStyleInfo() {
        return this.getCurrentStyle();
    }

    /**
     * Obtener el siguiente estilo en la lista
     */
    getNextStyle() {
        const styles = this.getAvailableStyles();
        if (styles.length === 0) return null;
        
        const currentIndex = styles.findIndex(s => s.id === this.currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        return styles[nextIndex];
    }

    /**
     * Obtener el estilo anterior en la lista
     */
    getPreviousStyle() {
        const styles = this.getAvailableStyles();
        if (styles.length === 0) return null;
        
        const currentIndex = styles.findIndex(s => s.id === this.currentStyle);
        const prevIndex = currentIndex === 0 ? styles.length - 1 : currentIndex - 1;
        return styles[prevIndex];
    }

    /**
     * Cambiar al siguiente estilo
     */
    nextStyle() {
        const next = this.getNextStyle();
        if (next) {
            this.setCurrentStyle(next.id);
        }
    }

    /**
     * Cambiar al estilo anterior
     */
    previousStyle() {
        const prev = this.getPreviousStyle();
        if (prev) {
            this.setCurrentStyle(prev.id);
        }
    }

    /**
     * Restaurar al estilo por defecto
     */
    resetToDefault() {
        this.setCurrentStyle('classic');
    }

    /**
     * Obtener opciones de configuración para el UI
     */
    getConfigurationOptions() {
        return {
            id: 'cardStyle',
            name: 'Estilo de Cards',
            description: 'Selecciona el estilo visual de las tarjetas de jugadores',
            type: 'select',
            current: this.currentStyle,
            options: this.getAvailableStyles().map(style => ({
                value: style.id,
                label: `${style.icon} ${style.name}`,
                description: style.description
            }))
        };
    }

    init() {
        console.log('🎨 CardStyleManager inicializado completamente (módular)');
    }
}

// Crear instancia global
window.cardStyleManager = new CardStyleManager();

console.log('✅ CardStyleManager disponible');
