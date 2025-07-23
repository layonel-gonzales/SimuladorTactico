/**
 * ==========================================
 * 🔍 SISTEMA DE VALIDACIÓN EN CAPAS
 * ==========================================
 * Asegura que las actualizaciones sean seguras antes de aplicarlas
 */

class LayeredValidationSystem {
    constructor() {
        this.validationLayers = [
            this.validateElementExists.bind(this),
            this.validateElementNotProtected.bind(this),
            this.validateOperationSafe.bind(this),
            this.validateNoSideEffects.bind(this)
        ];
    }

    /**
     * Ejecuta todas las capas de validación
     */
    async validateUpdate(elementId, operation, value) {
        const context = {
            elementId,
            operation,
            value,
            element: null,
            warnings: [],
            errors: []
        };

        // Ejecutar cada capa de validación
        for (const validator of this.validationLayers) {
            const result = await validator(context);
            if (!result.valid) {
                return result;
            }
        }

        return { valid: true, context };
    }

    /**
     * Capa 1: Verificar que el elemento existe
     */
    validateElementExists(context) {
        const element = this.findElement(context.elementId);
        
        if (!element) {
            return {
                valid: false,
                error: `Elemento no encontrado: ${context.elementId}`,
                layer: 'existence'
            };
        }

        context.element = element;
        return { valid: true };
    }

    /**
     * Capa 2: Verificar que el elemento no esté protegido
     */
    validateElementNotProtected(context) {
        const protectedElements = [
            'unified-single-bottom-menu',
            'football-field',
            'drawing-canvas'
        ];

        const protectedClasses = [
            'modal-backdrop',
            'navbar',
            'critical-function'
        ];

        // Verificar ID protegido
        if (protectedElements.includes(context.element.id)) {
            return {
                valid: false,
                error: `Elemento protegido: ${context.elementId}`,
                layer: 'protection'
            };
        }

        // Verificar clases protegidas
        for (const protectedClass of protectedClasses) {
            if (context.element.classList.contains(protectedClass)) {
                return {
                    valid: false,
                    error: `Elemento con clase protegida: ${protectedClass}`,
                    layer: 'protection'
                };
            }
        }

        return { valid: true };
    }

    /**
     * Capa 3: Verificar que la operación sea segura
     */
    validateOperationSafe(context) {
        const safeOperations = {
            'visibility': ['none', 'block', 'inline', 'flex'],
            'content': this.validateContentSafe.bind(this),
            'attributes': this.validateAttributesSafe.bind(this)
        };

        if (!safeOperations[context.operation]) {
            return {
                valid: false,
                error: `Operación no permitida: ${context.operation}`,
                layer: 'operation'
            };
        }

        // Validación específica por tipo de operación
        if (typeof safeOperations[context.operation] === 'function') {
            return safeOperations[context.operation](context);
        }

        // Validación simple para arrays de valores permitidos
        if (Array.isArray(safeOperations[context.operation])) {
            if (!safeOperations[context.operation].includes(context.value)) {
                return {
                    valid: false,
                    error: `Valor no permitido para ${context.operation}: ${context.value}`,
                    layer: 'operation'
                };
            }
        }

        return { valid: true };
    }

    /**
     * Validar contenido seguro
     */
    validateContentSafe(context) {
        // Solo texto plano, sin HTML
        if (typeof context.value !== 'string') {
            return {
                valid: false,
                error: 'El contenido debe ser texto plano',
                layer: 'content-safety'
            };
        }

        // Verificar que no contenga tags HTML
        if (/<[^>]*>/g.test(context.value)) {
            return {
                valid: false,
                error: 'No se permite HTML en el contenido',
                layer: 'content-safety'
            };
        }

        // Verificar longitud razonable
        if (context.value.length > 200) {
            return {
                valid: false,
                error: 'Contenido demasiado largo (máximo 200 caracteres)',
                layer: 'content-safety'
            };
        }

        return { valid: true };
    }

    /**
     * Validar atributos seguros
     */
    validateAttributesSafe(context) {
        const safeAttributePrefixes = ['data-config-', 'data-user-', 'aria-'];
        const safeAttributes = ['title', 'alt'];

        for (const [key] of Object.entries(context.value)) {
            const isSafePrefix = safeAttributePrefixes.some(prefix => key.startsWith(prefix));
            const isSafeAttribute = safeAttributes.includes(key);

            if (!isSafePrefix && !isSafeAttribute) {
                return {
                    valid: false,
                    error: `Atributo no permitido: ${key}`,
                    layer: 'attribute-safety'
                };
            }
        }

        return { valid: true };
    }

    /**
     * Capa 4: Verificar que no haya efectos secundarios
     */
    validateNoSideEffects(context) {
        // Simular el cambio para detectar efectos secundarios
        const originalState = this.captureElementState(context.element);
        
        try {
            // Aplicar cambio temporalmente
            this.applyChangeTemporarily(context);
            
            // Verificar que otros elementos no se vean afectados
            const sideEffects = this.detectSideEffects(originalState);
            
            // Revertir cambio temporal
            this.revertTemporaryChange(context.element, originalState);
            
            if (sideEffects.length > 0) {
                return {
                    valid: false,
                    error: `Efectos secundarios detectados: ${sideEffects.join(', ')}`,
                    layer: 'side-effects'
                };
            }

        } catch (error) {
            // Revertir en caso de error
            this.revertTemporaryChange(context.element, originalState);
            return {
                valid: false,
                error: `Error durante validación: ${error.message}`,
                layer: 'side-effects'
            };
        }

        return { valid: true };
    }

    /**
     * Helpers para validación de efectos secundarios
     */
    captureElementState(element) {
        return {
            display: element.style.display,
            textContent: element.textContent,
            attributes: Object.fromEntries(
                Array.from(element.attributes).map(attr => [attr.name, attr.value])
            )
        };
    }

    applyChangeTemporarily(context) {
        switch (context.operation) {
            case 'visibility':
                context.element.style.display = context.value === false ? 'none' : '';
                break;
            case 'content':
                context.element.textContent = context.value;
                break;
            case 'attributes':
                for (const [key, value] of Object.entries(context.value)) {
                    context.element.setAttribute(key, value);
                }
                break;
        }
    }

    revertTemporaryChange(element, originalState) {
        element.style.display = originalState.display;
        element.textContent = originalState.textContent;
        
        // Remover atributos añadidos y restaurar originales
        Array.from(element.attributes).forEach(attr => {
            if (!originalState.attributes[attr.name]) {
                element.removeAttribute(attr.name);
            }
        });
        
        for (const [key, value] of Object.entries(originalState.attributes)) {
            element.setAttribute(key, value);
        }
    }

    detectSideEffects(originalState) {
        const sideEffects = [];
        
        // Verificar que el layout no se haya roto
        const body = document.body;
        if (body.scrollHeight !== body.originalScrollHeight) {
            sideEffects.push('layout-change');
        }
        
        // Verificar que no hayan aparecido errores en consola
        // (esto requeriría implementación adicional de monitoreo)
        
        return sideEffects;
    }

    findElement(elementId) {
        return document.getElementById(elementId) || 
               document.querySelector(`[data-unique-id="${elementId}"]`) ||
               document.querySelector(`[data-card-id="${elementId}"]`);
    }
}

// Integración con el sistema de configuración
class SecureConfigurationManager {
    constructor() {
        this.validator = new LayeredValidationSystem();
        this.updater = new SafeConfigurationUpdater();
    }

    async updateElement(elementId, operation, value) {
        // Validar antes de actualizar
        const validation = await this.validator.validateUpdate(elementId, operation, value);
        
        if (!validation.valid) {
            console.warn(`🚫 Actualización bloqueada: ${validation.error}`);
            return { success: false, error: validation.error, layer: validation.layer };
        }

        // Aplicar actualización si es segura
        try {
            const result = this.updater[`update${operation.charAt(0).toUpperCase() + operation.slice(1)}`](
                elementId, value
            );
            
            return { success: result, elementId, operation, value };
        } catch (error) {
            console.error(`❌ Error aplicando actualización: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

export { LayeredValidationSystem, SecureConfigurationManager };
