/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🏟️ FIELD STYLE MANAGER - GESTOR DE ESTILOS DE CAMPO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Controla los estilos visuales del campo de fútbol (Canvas 2D).
 * CAPA BASE: z-index 1
 * 
 * IMPORTANTE: Este archivo debe cargarse DESPUÉS de:
 * - styleRegistry.js
 * - Todos los archivos fieldStyles/*.js
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

class FieldStyleManager {
    constructor() {
        this.currentStyle = 'classic';
        this.stylesLoaded = false;
        this.canvas = null;
        this.ctx = null;
        
        // Verificar que styleRegistry esté disponible
        if (!window.styleRegistry) {
            console.error('❌ FieldStyleManager: styleRegistry no está disponible. Verifica el orden de carga de scripts.');
            return;
        }
        
        this.stylesLoaded = true;
        this.loadSavedStyle();
        
        const stats = window.styleRegistry.getStats();
        console.log(`✅ FieldStyleManager inicializado: ${stats.fieldStyles} estilos disponibles`);
        
        // Emitir evento de que está listo
        window.dispatchEvent(new CustomEvent('fieldStyleManagerReady'));
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
     * Obtener información del estilo actual
     */
    getCurrentStyleInfo() {
        if (!window.styleRegistry) return null;
        return window.styleRegistry.getFieldStyle(this.currentStyle);
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
        document.dispatchEvent(new CustomEvent('fieldStyleChanged', {
            detail: { styleId, styleName: style.name }
        }));
        
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

        // Guardar referencias para redibujado
        this.canvas = canvas;
        this.ctx = ctx;

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
        const canvas = this.canvas || document.getElementById('football-field');
        if (!canvas) {
            console.warn('⚠️ Canvas del campo no encontrado');
            return;
        }

        const ctx = this.ctx || canvas.getContext('2d');
        if (!ctx) {
            console.warn('⚠️ Contexto 2D no disponible');
            return;
        }

        // Obtener dimensiones actuales
        const rect = canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
        const dpr = window.devicePixelRatio || 1;
        
        // Configurar canvas para alta resolución
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        // Escalar contexto
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        this.drawField(canvas, ctx);
        
        const style = window.styleRegistry?.getFieldStyle(this.currentStyle);
        console.log(`🎨 Campo redibujado: ${style?.name || this.currentStyle}`);
    }

    /**
     * Guardar el estilo actual en localStorage
     */
    saveCurrentStyle() {
        try {
            localStorage.setItem('fieldStyle', this.currentStyle);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el estilo:', error);
        }
    }

    /**
     * Cargar el estilo guardado
     */
    loadSavedStyle() {
        try {
            const saved = localStorage.getItem('fieldStyle');
            if (saved && window.styleRegistry?.getFieldStyle(saved)) {
                this.currentStyle = saved;
                console.log(`📂 Estilo de cancha cargado: ${saved}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el estilo guardado:', error);
        }
    }

    /**
     * Obtener el siguiente estilo en la lista
     */
    getNextStyle() {
        const styles = this.getAvailableStyles();
        const currentIndex = styles.findIndex(s => s.id === this.currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        return styles[nextIndex];
    }

    /**
     * Obtener el estilo anterior en la lista
     */
    getPreviousStyle() {
        const styles = this.getAvailableStyles();
        const currentIndex = styles.findIndex(s => s.id === this.currentStyle);
        const prevIndex = (currentIndex - 1 + styles.length) % styles.length;
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
}

// Crear instancia global
window.fieldStyleManager = new FieldStyleManager();
console.log('✅ FieldStyleManager disponible globalmente');
