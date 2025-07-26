/**
 * ==========================================
 * 🔍 VALIDADOR DE IDs ÚNICOS
 * ==========================================
 * Sistema para validar y gestionar IDs únicos en la aplicación
 * Evita duplicados y conflictos entre elementos del DOM
 */

class UniqueIdValidator {
    constructor() {
        this.registeredIds = new Set();
        this.idCounters = new Map();
        this.init();
    }
    
    init() {
        console.log('🔍 UniqueIdValidator iniciado');
        this.scanExistingIds();
    }
    
    /**
     * Escanea IDs existentes en el DOM
     */
    scanExistingIds() {
        const elementsWithId = document.querySelectorAll('[id]');
        elementsWithId.forEach(element => {
            this.registeredIds.add(element.id);
        });
        console.log(`🔍 Encontrados ${this.registeredIds.size} IDs existentes`);
    }
    
    /**
     * Genera un ID único basado en un prefijo
     * @param {string} prefix - Prefijo para el ID
     * @returns {string} ID único generado
     */
    generateUniqueId(prefix = 'element') {
        let counter = this.idCounters.get(prefix) || 0;
        let candidateId;
        
        do {
            counter++;
            candidateId = `${prefix}-${counter}`;
        } while (this.registeredIds.has(candidateId));
        
        this.idCounters.set(prefix, counter);
        this.registeredIds.add(candidateId);
        
        return candidateId;
    }
    
    /**
     * Valida si un ID es único
     * @param {string} id - ID a validar
     * @returns {boolean} True si es único, false si ya existe
     */
    isUnique(id) {
        return !this.registeredIds.has(id);
    }
    
    /**
     * Registra un ID como usado
     * @param {string} id - ID a registrar
     * @returns {boolean} True si se registró, false si ya existía
     */
    registerIId(id) {
        if (this.registeredIds.has(id)) {
            console.warn(`🔍 ID '${id}' ya está registrado`);
            return false;
        }
        
        this.registeredIds.add(id);
        return true;
    }
    
    /**
     * Libera un ID para reutilización
     * @param {string} id - ID a liberar
     */
    releaseId(id) {
        this.registeredIds.delete(id);
        console.log(`🔍 ID '${id}' liberado`);
    }
    
    /**
     * Valida y corrige IDs duplicados en el DOM
     */
    validateAndFixDuplicates() {
        const elementsWithId = document.querySelectorAll('[id]');
        const seenIds = new Set();
        let duplicatesFixed = 0;
        
        elementsWithId.forEach(element => {
            const currentId = element.id;
            
            if (seenIds.has(currentId)) {
                // ID duplicado encontrado
                const newId = this.generateUniqueId(currentId);
                element.id = newId;
                duplicatesFixed++;
                console.warn(`🔍 ID duplicado '${currentId}' cambiado a '${newId}'`);
            } else {
                seenIds.add(currentId);
            }
        });
        
        if (duplicatesFixed > 0) {
            console.log(`🔍 Se corrigieron ${duplicatesFixed} IDs duplicados`);
        }
        
        return duplicatesFixed;
    }
    
    /**
     * Obtiene estadísticas del validador
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            totalRegisteredIds: this.registeredIds.size,
            counters: Object.fromEntries(this.idCounters),
            allIds: Array.from(this.registeredIds).sort()
        };
    }
    
    /**
     * Limpia todos los IDs registrados
     */
    clear() {
        this.registeredIds.clear();
        this.idCounters.clear();
        console.log('🔍 Validador de IDs limpiado');
    }
    
    /**
     * Debug: Muestra información del validador
     */
    debug() {
        console.group('🔍 UniqueIdValidator Debug');
        console.log('📊 Estadísticas:', this.getStats());
        console.groupEnd();
    }
}

// Instancia global
window.uniqueIdValidator = new UniqueIdValidator();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniqueIdValidator;
}
