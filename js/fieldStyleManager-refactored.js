/**
 * 🏟️ GESTOR DE ESTILOS DE CAMPOS (REFACTORIZADO)
 * Usa el sistema modular StyleRegistry para cargar estilos dinámicamente
 */

export class FieldStyleManager {
    constructor() {
        this.currentStyle = 'classic';
        this.stylesLoaded = false;
        
        console.log('🎨 FieldStyleManager inicializado (módular)');
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
        console.log(`✅ FieldStyleManager cargado: ${stats.fieldStyles} estilos de campo disponibles`);
        this.loadSavedStyle();
    }

    /**
     * Obtener todos los estilos disponibles del registro
     */
    getAvailableStyles() {
        if (!window.styleRegistry) return [];
        return window.styleRegistry.getAllFieldStyles();
    }

    /**
     * Obtener el estilo actual
     */
    getCurrentStyle() {
        return this.currentStyle;
    }

    /**
     * Cambiar el estilo de la cancha
     */
    setStyle(styleId) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        const style = window.styleRegistry.getFieldStyle(styleId);
        if (!style) {
            console.warn(`⚠️ Estilo de cancha no encontrado: ${styleId}`);
            return false;
        }

        this.currentStyle = styleId;
        this.saveCurrentStyle();
        
        console.log(`🎨 Estilo de cancha cambiado a: ${style.name}`);
        
        // Redibujar la cancha inmediatamente
        this.redrawField();
        
        // Emitir evento personalizado
        const event = new CustomEvent('fieldStyleChanged', {
            detail: {
                styleId: styleId,
                styleName: style.name
            }
        });
        document.dispatchEvent(event);
        
        return true;
    }

    /**
     * Dibujar la cancha con el estilo actual
     */
    drawField(canvas, ctx) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return;
        }

        const style = window.styleRegistry.getFieldStyle(this.currentStyle);
        if (!style) {
            console.error(`❌ Estilo no encontrado: ${this.currentStyle}`);
            return;
        }

        try {
            style.drawFunction(canvas, ctx);
        } catch (error) {
            console.error(`❌ Error dibujando estilo ${this.currentStyle}:`, error);
            // Fallback al estilo clásico
            const classicStyle = window.styleRegistry.getFieldStyle('classic');
            if (classicStyle) {
                classicStyle.drawFunction(canvas, ctx);
            }
        }
    }

    /**
     * Redibujar la cancha actual
     */
    redrawField() {
        const canvas = document.getElementById('football-field');
        if (!canvas) {
            console.warn('⚠️ Canvas del campo no encontrado');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('⚠️ Contexto 2D no disponible');
            return;
        }

        this.drawField(canvas, ctx);
        const style = window.styleRegistry?.getFieldStyle(this.currentStyle);
        if (style) {
            console.log(`🎨 Campo redibujado con estilo: ${style.name}`);
        }
    }

    /**
     * Registrar un nuevo estilo de campo dinámicamente
     * Útil para agregar estilos en tiempo de ejecución
     */
    registerCustomStyle(styleId, styleConfig) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        return window.styleRegistry.registerFieldStyle(styleId, styleConfig);
    }

    /**
     * Eliminar un estilo de campo
     */
    removeStyle(styleId) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        if (this.currentStyle === styleId) {
            console.warn('⚠️ No se puede eliminar el estilo actual. Cambiando a "classic".');
            this.setStyle('classic');
        }

        return window.styleRegistry.removeFieldStyle(styleId);
    }

    /**
     * Guardar el estilo actual en localStorage
     */
    saveCurrentStyle() {
        try {
            localStorage.setItem('fieldStyle', this.currentStyle);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el estilo de cancha:', error);
        }
    }

    /**
     * Cargar el estilo guardado
     */
    loadSavedStyle() {
        try {
            const savedStyle = localStorage.getItem('fieldStyle');
            if (savedStyle && window.styleRegistry?.hasFieldStyle(savedStyle)) {
                this.currentStyle = savedStyle;
                const style = window.styleRegistry.getFieldStyle(savedStyle);
                console.log(`✅ Estilo de cancha cargado: ${style.name}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el estilo de cancha:', error);
        }
    }

    /**
     * Obtener información del estilo actual
     */
    getCurrentStyleInfo() {
        if (!window.styleRegistry) return null;
        return window.styleRegistry.getFieldStyle(this.currentStyle);
    }

    /**
     * Previsualizar un estilo sin cambiarlo permanentemente
     */
    previewStyle(styleId, canvas, ctx) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        const style = window.styleRegistry.getFieldStyle(styleId);
        if (!style) {
            console.warn(`⚠️ Estilo para preview no encontrado: ${styleId}`);
            return false;
        }

        try {
            style.drawFunction(canvas, ctx);
            return true;
        } catch (error) {
            console.error(`❌ Error en preview del estilo ${styleId}:`, error);
            return false;
        }
    }

    /**
     * Restaurar estilo por defecto
     */
    resetToDefault() {
        this.setStyle('classic');
        console.log('🔄 Estilo de cancha restaurado al clásico');
    }

    /**
     * Verificar si un estilo está disponible
     */
    isStyleAvailable(styleId) {
        if (!window.styleRegistry) return false;
        return window.styleRegistry.hasFieldStyle(styleId);
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
            this.setStyle(next.id);
        }
    }

    /**
     * Cambiar al estilo anterior
     */
    previousStyle() {
        const prev = this.getPreviousStyle();
        if (prev) {
            this.setStyle(prev.id);
        }
    }

    /**
     * Método para integración con el sistema de configuración
     */
    getConfigurationOptions() {
        return {
            id: 'fieldStyle',
            name: 'Estilo de Cancha',
            description: 'Selecciona el estilo visual del campo de fútbol',
            type: 'select',
            current: this.currentStyle,
            options: this.getAvailableStyles().map(style => ({
                value: style.id,
                label: `${style.icon} ${style.name}`,
                description: style.description
            }))
        };
    }
}

// Crear instancia global
window.fieldStyleManager = new FieldStyleManager();

console.log('✅ FieldStyleManager disponible globalmente');

// Event listeners para integración
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar estilo guardado al cargar
    if (window.fieldStyleManager) {
        // Esperar un poco para que el canvas esté listo
        setTimeout(() => {
            window.fieldStyleManager.redrawField();
        }, 500);
    }
});
