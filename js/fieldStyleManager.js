// fieldStyleManager.js - Gestor de estilos de cancha
import { drawClassicField } from './fieldStyles/fieldStyleClassic.js';
import { drawModernField } from './fieldStyles/fieldStyleModern.js';
import { drawNightField } from './fieldStyles/fieldStyleNight.js';
import { drawRetroField } from './fieldStyles/fieldStyleRetro.js';
import { drawFootballField } from './fieldDrawer.js'; // Estilo original

export class FieldStyleManager {
    constructor() {
        this.currentStyle = 'original';
        this.styles = {
            'original': {
                name: 'Original',
                description: 'Estilo clásico del simulador',
                drawFunction: drawFootballField,
                icon: '⚽'
            },
            'classic': {
                name: 'Clásico',
                description: 'Campo tradicional de fútbol',
                drawFunction: drawClassicField,
                icon: '🏟️'
            },
            'modern': {
                name: 'Moderno',
                description: 'Diseño contemporáneo con efectos',
                drawFunction: drawModernField,
                icon: '✨'
            },
            'night': {
                name: 'Nocturno',
                description: 'Partido bajo las luces del estadio',
                drawFunction: drawNightField,
                icon: '🌙'
            },
            'retro': {
                name: 'Retro',
                description: 'Estilo vintage años 50-60',
                drawFunction: drawRetroField,
                icon: '📺'
            }
        };
        
        console.log('🎨 FieldStyleManager inicializado con', Object.keys(this.styles).length, 'estilos');
        this.loadSavedStyle();
    }

    /**
     * Obtener todos los estilos disponibles
     */
    getAvailableStyles() {
        return Object.keys(this.styles).map(key => ({
            id: key,
            ...this.styles[key]
        }));
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
        if (!this.styles[styleId]) {
            console.warn(`⚠️ Estilo de cancha no encontrado: ${styleId}`);
            return false;
        }

        this.currentStyle = styleId;
        this.saveCurrentStyle();
        
        console.log(`🎨 Estilo de cancha cambiado a: ${this.styles[styleId].name}`);
        
        // Redibujar la cancha inmediatamente
        this.redrawField();
        
        // Emitir evento personalizado
        const event = new CustomEvent('fieldStyleChanged', {
            detail: {
                styleId: styleId,
                styleName: this.styles[styleId].name
            }
        });
        document.dispatchEvent(event);
        
        return true;
    }

    /**
     * Dibujar la cancha con el estilo actual
     */
    drawField(canvas, ctx) {
        const style = this.styles[this.currentStyle];
        if (!style) {
            console.error(`❌ Estilo no encontrado: ${this.currentStyle}`);
            return;
        }

        try {
            style.drawFunction(canvas, ctx);
        } catch (error) {
            console.error(`❌ Error dibujando estilo ${this.currentStyle}:`, error);
            // Fallback al estilo original
            this.styles.original.drawFunction(canvas, ctx);
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
        console.log(`🎨 Campo redibujado con estilo: ${this.styles[this.currentStyle].name}`);
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
            if (savedStyle && this.styles[savedStyle]) {
                this.currentStyle = savedStyle;
                console.log(`✅ Estilo de cancha cargado: ${this.styles[savedStyle].name}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el estilo de cancha:', error);
        }
    }

    /**
     * Obtener información del estilo actual
     */
    getCurrentStyleInfo() {
        return this.styles[this.currentStyle];
    }

    /**
     * Previsualizar un estilo sin cambiarlo permanentemente
     */
    previewStyle(styleId, canvas, ctx) {
        const style = this.styles[styleId];
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
        this.setStyle('original');
        console.log('🔄 Estilo de cancha restaurado al original');
    }

    /**
     * Verificar si un estilo está disponible
     */
    isStyleAvailable(styleId) {
        return !!this.styles[styleId];
    }

    /**
     * Obtener el siguiente estilo en la lista (para navegación)
     */
    getNextStyle() {
        const styleIds = Object.keys(this.styles);
        const currentIndex = styleIds.indexOf(this.currentStyle);
        const nextIndex = (currentIndex + 1) % styleIds.length;
        return styleIds[nextIndex];
    }

    /**
     * Obtener el estilo anterior en la lista (para navegación)
     */
    getPreviousStyle() {
        const styleIds = Object.keys(this.styles);
        const currentIndex = styleIds.indexOf(this.currentStyle);
        const prevIndex = currentIndex === 0 ? styleIds.length - 1 : currentIndex - 1;
        return styleIds[prevIndex];
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

// Exportar para uso en módulos
export default FieldStyleManager;
