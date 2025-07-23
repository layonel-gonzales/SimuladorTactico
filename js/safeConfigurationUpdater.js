/**
 * ==========================================
 * 🎛️ MÓDULO DE CONFIGURACIÓN - ARQUITECTURA SEGURA
 * ==========================================
 * Diseño que permite actualizaciones sin afectar estilos o funcionalidad
 */

class SafeConfigurationUpdater {
    constructor() {
        this.safeUpdateMethods = {
            // Métodos seguros que NO afectan CSS o funcionalidad core
            visibility: this.updateElementVisibility.bind(this),
            content: this.updateElementContent.bind(this),
            attributes: this.updateDataAttributes.bind(this),
            order: this.updateElementOrder.bind(this)
        };
        
        // Elementos protegidos que NO deben ser modificados
        this.protectedElements = new Set([
            'unified-single-bottom-menu', // Menú principal
            'football-field', // Canvas del campo
            'drawing-canvas' // Canvas de dibujo
        ]);
        
        // Clases CSS protegidas
        this.protectedClasses = new Set([
            'btn', 'btn-primary', 'btn-secondary', // Bootstrap
            'player-token', 'squad-player-item', // Core del juego
            'modal', 'fade', 'show' // Modales
        ]);
    }

    /**
     * Actualiza visibilidad de elementos sin afectar CSS
     */
    updateElementVisibility(elementId, visible) {
        const element = this.findElementSafely(elementId);
        if (!element) {
            console.log(`[CONFIG] ❌ Elemento no encontrado: ${elementId}`);
            return false;
        }

        // Usar data-attribute para tracking
        element.setAttribute('data-config-visible', visible);
        
        // Para tutorial-btn usar clases específicas que pueden sobrescribir media queries
        if (element.classList.contains('tutorial-btn')) {
            if (visible) {
                element.classList.remove('config-hidden');
                element.classList.add('config-visible');
                // También remover la clase hidden del modeManager si existe
                element.classList.remove('hidden');
                element.style.display = 'flex';
            } else {
                element.classList.remove('config-visible');
                element.classList.add('config-hidden');
                element.style.display = 'none';
            }
        } else {
            // Para otros elementos usar display inline
            element.style.display = visible ? '' : 'none';
        }
        
        console.log(`[CONFIG] ✅ Visibilidad: ${elementId} -> ${visible}`);
        return true;
    }

    /**
     * Verificar si un tutorial debe mostrarse basado en el modo actual
     */
    shouldShowTutorialBasedOnMode(elementId) {
        if (!window.modeManager) return true; // Si no hay modeManager, permitir mostrar
        
        const currentMode = window.modeManager.currentMode;
        
        if (elementId === 'start-tutorial-drawing-btn') {
            return currentMode === 'drawing';
        } else if (elementId === 'start-tutorial-animation-btn') {
            return currentMode === 'animation';
        }
        
        return true; // Para otros elementos
    }

    /**
     * Manejar cambio de modo - verificar elementos pendientes
     */
    handleModeChange(newMode) {
        console.log(`[CONFIG] 🔄 Modo cambiado a: ${newMode}, verificando elementos pendientes`);
        
        // Revisar elementos con configuración pendiente
        const pendingElements = document.querySelectorAll('[data-config-pending-visible="true"]');
        
        pendingElements.forEach(element => {
            const elementId = element.id;
            const shouldShow = this.shouldShowTutorialBasedOnMode(elementId);
            
            if (shouldShow) {
                // Ahora sí puede mostrarse
                element.classList.remove('config-hidden', 'hidden');
                element.classList.add('config-visible');
                element.style.display = 'flex';
                element.removeAttribute('data-config-pending-visible');
                console.log(`[CONFIG] ✅ Elemento pendiente ahora visible: ${elementId}`);
            }
        });
        
        // También verificar elementos que deberían ocultarse por cambio de modo
        const tutorialElements = document.querySelectorAll('.tutorial-btn[data-config-visible="true"]');
        
        tutorialElements.forEach(element => {
            const elementId = element.id;
            const shouldShow = this.shouldShowTutorialBasedOnMode(elementId);
            const userWantsVisible = element.getAttribute('data-config-visible') === 'true';
            
            if (userWantsVisible && !shouldShow) {
                // El usuario quiere que sea visible pero el modo no lo permite
                element.classList.add('config-hidden');
                element.classList.remove('config-visible');
                element.style.display = 'none';
                element.setAttribute('data-config-pending-visible', 'true');
                console.log(`[CONFIG] ⏸️ Elemento pausado por cambio de modo: ${elementId}`);
            } else if (userWantsVisible && shouldShow) {
                // El usuario quiere que sea visible y el modo lo permite
                element.classList.remove('config-hidden', 'hidden');
                element.classList.add('config-visible');
                element.style.display = 'flex';
                element.removeAttribute('data-config-pending-visible');
            }
        });
    }

    /**
     * Verificar la preferencia del usuario para un tutorial específico
     */
    getUserTutorialPreference(elementId) {
        const element = this.findElementSafely(elementId);
        if (!element) return null;
        
        const configVisible = element.getAttribute('data-config-visible');
        const pendingVisible = element.getAttribute('data-config-pending-visible');
        
        if (configVisible === 'true' || pendingVisible === 'true') {
            return true; // Usuario quiere que sea visible
        } else if (configVisible === 'false') {
            return false; // Usuario quiere que sea oculto
        }
        
        return null; // Sin preferencia específica del usuario
    }

    /**
     * Actualiza contenido de elementos de forma segura
     */
    updateElementContent(elementId, newContent, elementType = 'text') {
        const element = this.findElementSafely(elementId);
        if (!element) return false;

        // Backup del contenido original
        if (!element.hasAttribute('data-original-content')) {
            element.setAttribute('data-original-content', element.textContent);
        }

        switch(elementType) {
            case 'text':
                element.textContent = newContent;
                break;
            case 'html':
                // Solo si es seguro (elementos específicos)
                if (this.isHtmlUpdateSafe(element)) {
                    element.innerHTML = newContent;
                }
                break;
            case 'attribute':
                // Actualizar atributos específicos
                element.setAttribute('title', newContent);
                break;
        }

        element.setAttribute('data-config-modified', 'true');
        console.log(`✅ Contenido actualizado: ${elementId}`);
        return true;
    }

    /**
     * Actualiza atributos de datos sin afectar funcionalidad
     */
    updateDataAttributes(elementId, attributes) {
        const element = this.findElementSafely(elementId);
        if (!element) return false;

        // Solo permitir actualización de data-attributes seguros
        const safeAttributes = ['data-config-', 'data-user-', 'title', 'aria-label'];
        
        for (const [key, value] of Object.entries(attributes)) {
            if (safeAttributes.some(safe => key.startsWith(safe))) {
                element.setAttribute(key, value);
                console.log(`✅ Atributo actualizado: ${elementId}.${key} = ${value}`);
            } else {
                console.warn(`⚠️ Atributo no seguro ignorado: ${key}`);
            }
        }

        return true;
    }

    /**
     * Verificar si un elemento está visible actualmente
     */
    isElementVisible(elementId) {
        const element = this.findElementSafely(elementId);
        if (!element) return false;

        // Para tutorial-btn verificar clases primero
        if (element.classList.contains('tutorial-btn')) {
            // Si el usuario lo configuró como oculto, está oculto
            if (element.classList.contains('config-hidden')) {
                return false;
            }
            
            // Si está marcado como visible por configuración
            if (element.classList.contains('config-visible')) {
                return true;
            }
            
            // Si el usuario quiere que sea visible pero está pendiente por el modo
            if (element.getAttribute('data-config-pending-visible') === 'true') {
                return false; // Técnicamente no está visible aunque el usuario quiera
            }
            
            // Si no hay configuración específica, usar el estado actual del DOM
            if (element.classList.contains('hidden')) {
                return false;
            }
        }

        // Verificar estilo inline
        if (element.style.display === 'none') {
            return false;
        }

        // Verificar computed style como fallback
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.display !== 'none';
    }

    /**
     * Actualiza el orden de elementos de forma segura (Fase 3)
     */
    updateElementOrder(elementId, newPosition, siblingSelector = null) {
        const element = this.findElementSafely(elementId);
        if (!element) return false;

        const parent = element.parentElement;
        if (!parent) {
            console.warn(`⚠️ No se puede reordenar elemento sin padre: ${elementId}`);
            return false;
        }

        try {
            // Backup de la posición original
            if (!element.hasAttribute('data-original-position')) {
                const siblings = Array.from(parent.children);
                const originalIndex = siblings.indexOf(element);
                element.setAttribute('data-original-position', originalIndex.toString());
            }

            // Reordenar elemento
            if (typeof newPosition === 'number') {
                const siblings = Array.from(parent.children);
                const targetIndex = Math.min(newPosition, siblings.length - 1);
                const targetSibling = siblings[targetIndex];
                
                if (targetSibling && targetSibling !== element) {
                    parent.insertBefore(element, targetIndex < siblings.indexOf(element) ? targetSibling : targetSibling.nextSibling);
                }
            } else if (siblingSelector) {
                const targetSibling = parent.querySelector(siblingSelector);
                if (targetSibling) {
                    parent.insertBefore(element, targetSibling);
                }
            }

            element.setAttribute('data-config-reordered', 'true');
            console.log(`✅ Orden actualizado: ${elementId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error reordenando elemento ${elementId}:`, error);
            return false;
        }
    }

    /**
     * Encuentra elementos de forma segura usando el sistema de IDs únicos
     */
    findElementSafely(identifier) {
        // Buscar por ID directo
        let element = document.getElementById(identifier);
        
        // Si no se encuentra, buscar por data-unique-id
        if (!element) {
            element = document.querySelector(`[data-unique-id="${identifier}"]`);
        }
        
        // Si no se encuentra, buscar por data-card-id
        if (!element) {
            element = document.querySelector(`[data-card-id="${identifier}"]`);
        }

        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: ${identifier}`);
            return null;
        }

        // Verificar que no sea un elemento protegido
        if (this.protectedElements.has(element.id)) {
            console.warn(`🔒 Elemento protegido, actualización bloqueada: ${identifier}`);
            return null;
        }

        return element;
    }

    /**
     * Verifica si es seguro actualizar HTML de un elemento
     */
    isHtmlUpdateSafe(element) {
        const safeElements = ['span', 'div', 'p'];
        const unsafeElements = ['script', 'iframe', 'object', 'embed'];
        
        if (unsafeElements.includes(element.tagName.toLowerCase())) {
            return false;
        }

        // Verificar que no contenga elementos críticos
        const criticalSelectors = ['button', 'input', 'select', 'canvas'];
        for (const selector of criticalSelectors) {
            if (element.querySelector(selector)) {
                return false;
            }
        }

        return safeElements.includes(element.tagName.toLowerCase());
    }

    /**
     * Restaura elemento a su estado original
     */
    restoreElement(elementId) {
        const element = this.findElementSafely(elementId);
        if (!element) return false;

        // Restaurar contenido original
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.textContent = originalContent;
        }

        // Restaurar posición original
        const originalPosition = element.getAttribute('data-original-position');
        if (originalPosition && element.hasAttribute('data-config-reordered')) {
            const parent = element.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                const targetIndex = parseInt(originalPosition);
                const targetSibling = siblings[targetIndex];
                
                if (targetSibling && targetSibling !== element) {
                    parent.insertBefore(element, targetIndex === 0 ? parent.firstChild : targetSibling);
                }
            }
        }

        // Remover atributos de configuración
        const configAttributes = [
            'data-config-visible', 'data-config-modified', 'data-user-custom',
            'data-config-reordered', 'data-original-position'
        ];
        configAttributes.forEach(attr => element.removeAttribute(attr));

        // Restaurar visibilidad
        if (element.classList.contains('tutorial-btn')) {
            element.classList.remove('config-hidden', 'config-visible');
        } else {
            element.style.display = '';
        }

        console.log(`[CONFIG] 🔄 Elemento restaurado: ${elementId}`);
        return true;
    }

    /**
     * Aplicar configuración completa de forma segura
     */
    applyConfiguration(config) {
        const results = {
            success: [],
            failed: [],
            skipped: []
        };

        for (const [elementId, settings] of Object.entries(config)) {
            try {
                if (settings.visible !== undefined) {
                    if (this.updateElementVisibility(elementId, settings.visible)) {
                        results.success.push(`${elementId}.visibility`);
                    } else {
                        results.failed.push(`${elementId}.visibility`);
                    }
                }

                if (settings.content !== undefined) {
                    if (this.updateElementContent(elementId, settings.content, settings.contentType)) {
                        results.success.push(`${elementId}.content`);
                    } else {
                        results.failed.push(`${elementId}.content`);
                    }
                }

                if (settings.attributes !== undefined) {
                    if (this.updateDataAttributes(elementId, settings.attributes)) {
                        results.success.push(`${elementId}.attributes`);
                    } else {
                        results.failed.push(`${elementId}.attributes`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error aplicando configuración a ${elementId}:`, error);
                results.failed.push(elementId);
            }
        }

        console.log('📊 Reporte de aplicación de configuración:', results);
        return results;
    }
}

// Ejemplo de uso seguro
const configUpdater = new SafeConfigurationUpdater();

// Configuración de ejemplo que NO afecta estilos ni funcionalidad
const exampleConfig = {
    'start-tutorial-drawing-btn': {
        visible: false,
        attributes: {
            'data-user-hidden': 'true',
            'title': 'Tutorial deshabilitado por el usuario'
        }
    },
    'desktop-field-overall-123': {
        content: 'OVR',
        contentType: 'text',
        attributes: {
            'data-config-format': 'abbreviated'
        }
    },
    'frame-indicator': {
        visible: true,
        attributes: {
            'data-user-preference': 'always-show'
        }
    }
};

// Aplicar configuración de forma segura
// configUpdater.applyConfiguration(exampleConfig);

console.log('🎛️ Sistema de configuración segura cargado');

// Hacer disponible globalmente
window.SafeConfigurationUpdater = SafeConfigurationUpdater;
