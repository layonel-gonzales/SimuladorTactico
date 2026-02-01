/**
 * 🎨 SISTEMA DE REGISTRO MODULAR DE ESTILOS
 * Permite registrar, cargar y gestionar estilos dinámicamente
 * sin modificar el código principal.
 */

class StyleRegistry {
    constructor() {
        this.cardStyles = new Map();
        this.fieldStyles = new Map();
    }

    /**
     * Registrar un estilo de card
     * @param {string} id - ID único del estilo
     * @param {object} styleConfig - Configuración del estilo
     *   - name: nombre visible
     *   - description: descripción
     *   - icon: emoji o icono
     *   - theme: objeto con colores (primary, secondary, accent)
     *   - createFunction: función(player, type, cardId, screenType, theme, playerId) => HTML
     */
    registerCardStyle(id, styleConfig) {
        if (!id || !styleConfig || !styleConfig.createFunction) {
            console.error('❌ Configuración de estilo de card inválida:', id);
            return false;
        }

        this.cardStyles.set(id, {
            id,
            name: styleConfig.name || 'Estilo sin nombre',
            description: styleConfig.description || '',
            icon: styleConfig.icon || '🎴',
            theme: styleConfig.theme || {},
            createFunction: styleConfig.createFunction
        });

        return true;
    }

    /**
     * Registrar un estilo de campo
     * @param {string} id - ID único del estilo
     * @param {object} styleConfig - Configuración del estilo
     *   - name: nombre visible
     *   - description: descripción
     *   - icon: emoji o icono
     *   - drawFunction: función(canvas, ctx) => void
     */
    registerFieldStyle(id, styleConfig) {
        if (!id || !styleConfig || !styleConfig.drawFunction) {
            console.error('❌ Configuración de estilo de campo inválida:', id);
            return false;
        }

        this.fieldStyles.set(id, {
            id,
            name: styleConfig.name || 'Estilo sin nombre',
            description: styleConfig.description || '',
            icon: styleConfig.icon || '⚽',
            drawFunction: styleConfig.drawFunction
        });

        return true;
    }

    /**
     * Obtener estilo de card
     */
    getCardStyle(id) {
        return this.cardStyles.get(id) || null;
    }

    /**
     * Obtener estilo de campo
     */
    getFieldStyle(id) {
        return this.fieldStyles.get(id) || null;
    }

    /**
     * Obtener todos los estilos de card
     */
    getAllCardStyles() {
        return Array.from(this.cardStyles.values());
    }

    /**
     * Obtener todos los estilos de campo
     */
    getAllFieldStyles() {
        return Array.from(this.fieldStyles.values());
    }

    /**
     * Eliminar un estilo de card
     */
    removeCardStyle(id) {
        if (this.cardStyles.has(id)) {
            this.cardStyles.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Eliminar un estilo de campo
     */
    removeFieldStyle(id) {
        if (this.fieldStyles.has(id)) {
            this.fieldStyles.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Verificar si existe un estilo de card
     */
    hasCardStyle(id) {
        return this.cardStyles.has(id);
    }

    /**
     * Verificar si existe un estilo de campo
     */
    hasFieldStyle(id) {
        return this.fieldStyles.has(id);
    }

    /**
     * Obtener cantidad de estilos registrados
     */
    getStats() {
        return {
            cardStyles: this.cardStyles.size,
            fieldStyles: this.fieldStyles.size,
            total: this.cardStyles.size + this.fieldStyles.size
        };
    }
}

// Crear instancia global singleton
window.styleRegistry = new StyleRegistry();
