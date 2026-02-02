/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎴 CARD STYLE MANAGER - GESTOR DE ESTILOS DE CARDS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Controla los estilos visuales de las cards de jugadores (HTML).
 * CAPA SUPERIOR: z-index 20
 * 
 * IMPORTANTE: Este archivo debe cargarse DESPUÉS de:
 * - styleRegistry.js
 * - Todos los archivos cardStyles/*.js
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

class CardStyleManager {
    constructor() {
        this.currentStyle = 'classic';
        this.stylesLoaded = false;
        
        // Verificar que styleRegistry esté disponible
        if (!window.styleRegistry) {
            console.error('❌ CardStyleManager: styleRegistry no está disponible. Verifica el orden de carga de scripts.');
            return;
        }
        
        this.stylesLoaded = true;
        this.loadSavedStyle();
        
        const stats = window.styleRegistry.getStats();
        
        // Emitir evento de que está listo
        window.dispatchEvent(new CustomEvent('cardStyleManagerReady'));
    }

    /**
     * Obtener todos los estilos disponibles del registro
     */
    getAvailableStyles() {
        if (!window.styleRegistry) return [];
        return window.styleRegistry.getAllCardStyles();
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
        return window.styleRegistry.getCardStyle(this.currentStyle);
    }

    /**
     * Cambiar el estilo de las cards
     */
    setCurrentStyle(styleId) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return false;
        }

        const style = window.styleRegistry.getCardStyle(styleId);
        if (!style) {
            console.warn(`⚠️ Estilo de card no encontrado: ${styleId}`);
            return false;
        }

        this.currentStyle = styleId;
        this.saveCurrentStyle();
        
        // Actualizar todas las cards existentes
        this.updateAllCards();
        
        // Emitir evento personalizado
        document.dispatchEvent(new CustomEvent('cardStyleChanged', {
            detail: { styleId, styleName: style.name }
        }));
        
        return true;
    }

    /**
     * Crear una card con el estilo actual
     */
    createStyledCard(player, type = 'field', cardId = null, screenType = 'desktop', theme = 'dark', playerId = null) {
        if (!window.styleRegistry) {
            console.error('❌ StyleRegistry no disponible');
            return this.createFallbackCard(player);
        }

        const style = window.styleRegistry.getCardStyle(this.currentStyle);
        if (!style || !style.createFunction) {
            console.warn(`⚠️ Estilo no encontrado o sin createFunction: ${this.currentStyle}`);
            return this.createFallbackCard(player);
        }

        try {
            return style.createFunction(player, type, cardId, screenType, theme, playerId);
        } catch (error) {
            console.error(`❌ Error creando card con estilo ${this.currentStyle}:`, error);
            return this.createFallbackCard(player);
        }
    }

    /**
     * Card de fallback en caso de error
     */
    createFallbackCard(player) {
        const name = player.name || `Jugador ${player.number || '?'}`;
        return `
            <div class="minicard-overall" data-card-style="fallback">
                <div style="background: #333; padding: 8px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: white;">${player.number || '?'}</div>
                    <div style="font-size: 10px; color: #ccc; overflow: hidden; text-overflow: ellipsis;">${name}</div>
                </div>
            </div>
        `;
    }

    /**
     * Actualizar todas las cards existentes en el DOM
     */
    updateAllCards() {
        // Buscar todas las cards de jugadores en el campo
        const playerTokens = document.querySelectorAll('.player-token');
        
        playerTokens.forEach(token => {
            const playerId = token.dataset.playerId;
            if (playerId && window.playerManager) {
                const player = window.playerManager.getPlayerById(playerId);
                if (player) {
                    const newCardHtml = this.createStyledCard(player, 'field', null, 'desktop', 'dark', playerId);
                    const cardContainer = token.querySelector('.minicard-overall, .card-content');
                    if (cardContainer) {
                        cardContainer.outerHTML = newCardHtml;
                    }
                }
            }
        });
    }

    /**
     * Guardar el estilo actual en localStorage
     */
    saveCurrentStyle() {
        try {
            localStorage.setItem('cardStyle', this.currentStyle);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el estilo:', error);
        }
    }

    /**
     * Cargar el estilo guardado
     */
    loadSavedStyle() {
        try {
            const saved = localStorage.getItem('cardStyle');
            if (saved && window.styleRegistry?.getCardStyle(saved)) {
                this.currentStyle = saved;
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
}

// Crear instancia global
window.cardStyleManager = new CardStyleManager();
