/**
 * ==========================================
 * ⚙️ FREEMIUM CONFIG MANAGER
 * ==========================================
 * Gestor de configuración dinámica para el sistema freemium
 */

class FreemiumConfigManager {
    constructor() {
        this.config = null;
        this.configPath = 'config/freemium-config.json';
        this.isLoaded = false;
        this.cache = new Map();
        this.lastLoadTime = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        
        this.init();
    }
    
    async init() {
        await this.loadConfig();
        this.setupAutoRefresh();
    }
    
    // ==========================================
    // CARGA Y GESTIÓN DE CONFIGURACIÓN
    // ==========================================
    
    async loadConfig() {
        try {

            if (this.isConfigCacheValid()) {
                return this.config;
            }
            
            // Intentar cargar desde el servidor primero (para desarrollo con backend)
            let response;
            try {
                response = await fetch('/api/config');
                if (response.ok) {
                    this.config = await response.json();
                } else {
                    throw new Error(`Server response: ${response.status}`);
                }
            } catch (serverError) {
                // Fallback a archivo local (para GitHub Pages)
                try {
                    response = await fetch(this.configPath);
                    if (!response.ok) {
                        throw new Error(`Error loading local config: ${response.status}`);
                    }
                    this.config = await response.json();
                } catch (localError) {
                    // Último recurso: usar configuración estática hardcodeada (GitHub Pages sin archivos)
                    this.config = this.getStaticConfig();
                }
            }
            
            this.isLoaded = true;
            this.lastLoadTime = Date.now();
            this.validateConfig();
            this.updateCache();    
            return this.config;
        } catch (error) {
            console.error('[FreemiumConfigManager] Error cargando configuración:', error);
            
            // Fallback a configuración estática
            if (!this.config) {
                this.config = this.getStaticConfig();
            }
            
            return this.config;
        }
    }
    
    isConfigCacheValid() {
        return this.config && 
               this.lastLoadTime && 
               (Date.now() - this.lastLoadTime) < this.cacheTimeout;
    }
    
    validateConfig() {
        if (!this.config || !this.config.plans) {
            throw new Error('Configuración inválida: falta estructura de planes');
        }
        
        // En GitHub Pages solo necesitamos el plan 'free'
        if (this.config.environment === 'github-pages') {
            if (!this.config.plans['free']) {
                console.warn('[FreemiumConfigManager] Plan free no encontrado');
            }
        } else {
            // En desarrollo esperamos todos los planes
            const requiredPlans = ['free', 'premium', 'pro'];
            for (const plan of requiredPlans) {
                if (!this.config.plans[plan]) {
                    console.warn(`[FreemiumConfigManager] Plan requerido no encontrado: ${plan}`);
                }
            }
        }
    }
    
    updateCache() {
        // Limpiar cache anterior
        this.cache.clear();
        
        // Pre-procesar datos frecuentemente usados
        for (const [planName, planData] of Object.entries(this.config.plans)) {
            const cacheKey = `plan_${planName}`;
            this.cache.set(cacheKey, {
                ...planData,
                processed: true,
                cachedAt: Date.now()
            });
        }
    }
    
    setupAutoRefresh() {
        // Recargar configuración cada 5 minutos
        setInterval(() => {
            this.loadConfig();
        }, this.cacheTimeout);
    }
    
    // ==========================================
    // MÉTODOS PÚBLICOS - PLANES
    // ==========================================
    
    async getPlan(planName) {
        await this.ensureConfigLoaded();
        
        const cacheKey = `plan_${planName}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const plan = this.config.plans[planName];
        if (!plan) {
            console.error(`[FreemiumConfigManager] Plan no encontrado: ${planName}`);
            return this.config.plans.free; // Fallback a plan gratuito
        }
        
        return plan;
    }
    
    async getAllPlans() {
        await this.ensureConfigLoaded();
        return this.config.plans;
    }
    
    async getPlanFeature(planName, featureName) {
        const plan = await this.getPlan(planName);
        if (!plan || !plan.features || !plan.features[featureName]) {
            console.warn(`[FreemiumConfigManager] Feature no encontrada: ${planName}.${featureName}`);
            return null;
        }
        
        return plan.features[featureName];
    }
    
    async getPlanFeatureValue(planName, featureName) {
        const feature = await this.getPlanFeature(planName, featureName);
        return feature ? feature.value : null;
    }
    
    async getCurrentUserPlan() {
        try {
            // Verificar localStorage primero
            const savedPlan = localStorage.getItem('userPlan');
            if (savedPlan) {
                const planData = JSON.parse(savedPlan);
                return {
                    name: planData.name || 'free',
                    ...planData
                };
            }
            
            // Si no hay plan guardado, verificar autenticación
            if (window.authSystem && window.authSystem.getCurrentUser) {
                const user = window.authSystem.getCurrentUser();
                if (user && user.plan) {
                    return await this.getPlan(user.plan);
                }
            }
            
            // Plan por defecto
            const freePlan = await this.getPlan('free');
            return {
                name: 'free',
                ...freePlan
            };
            
        } catch (error) {
            console.error('[FreemiumConfigManager] ❌ Error obteniendo plan del usuario:', error);
            return await this.getPlan('free'); // Fallback seguro
        }
    }
    
    // ==========================================
    // MÉTODOS PÚBLICOS - CARACTERÍSTICAS
    // ==========================================
    
    async getFeaturesByCategory(category) {
        await this.ensureConfigLoaded();
        
        const features = {};
        for (const [planName, planData] of Object.entries(this.config.plans)) {
            features[planName] = {};
            for (const [featureName, featureData] of Object.entries(planData.features)) {
                if (featureData.category === category) {
                    features[planName][featureName] = featureData;
                }
            }
        }
        
        return features;
    }
    
    async getCategories() {
        await this.ensureConfigLoaded();
        return this.config.categories || {};
    }
    
    async getCategory(categoryName) {
        const categories = await this.getCategories();
        return categories[categoryName] || null;
    }
    
    // ==========================================
    // MÉTODOS PÚBLICOS - COMPARACIÓN
    // ==========================================
    
    async comparePlans(planA, planB) {
        const planDataA = await this.getPlan(planA);
        const planDataB = await this.getPlan(planB);
        
        if (!planDataA || !planDataB) {
            throw new Error('Uno o ambos planes no existen');
        }
        
        const comparison = {
            planA: planA,
            planB: planB,
            differences: {},
            advantages: {
                [planA]: [],
                [planB]: []
            }
        };
        
        // Comparar características
        const allFeatures = new Set([
            ...Object.keys(planDataA.features),
            ...Object.keys(planDataB.features)
        ]);
        
        for (const feature of allFeatures) {
            const valueA = planDataA.features[feature]?.value;
            const valueB = planDataB.features[feature]?.value;
            
            if (valueA !== valueB) {
                comparison.differences[feature] = {
                    [planA]: valueA,
                    [planB]: valueB
                };
                
                // Determinar ventajas
                if (this.isFeatureBetter(valueA, valueB)) {
                    comparison.advantages[planA].push(feature);
                } else if (this.isFeatureBetter(valueB, valueA)) {
                    comparison.advantages[planB].push(feature);
                }
            }
        }
        
        return comparison;
    }
    
    isFeatureBetter(valueA, valueB) {
        // -1 significa ilimitado (mejor)
        if (valueA === -1 && valueB !== -1) return true;
        if (valueB === -1 && valueA !== -1) return false;
        
        // 'all' significa todo disponible (mejor que array)
        if (valueA === 'all' && Array.isArray(valueB)) return true;
        if (valueB === 'all' && Array.isArray(valueA)) return false;
        
        // true es mejor que false
        if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
            return valueA && !valueB;
        }
        
        // Números más altos son mejores (excepto -1)
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            if (valueA === -1) return true;
            if (valueB === -1) return false;
            return valueA > valueB;
        }
        
        return false;
    }
    
    // ==========================================
    // MÉTODOS PÚBLICOS - VALIDACIÓN
    // ==========================================
    
    async canAccessFeature(planName, featureName, requestedValue = null) {
        const featureValue = await this.getPlanFeatureValue(planName, featureName);
        
        if (featureValue === null) {
            return { allowed: false, reason: 'Feature not found' };
        }
        
        // Validación por tipo
        if (typeof featureValue === 'boolean') {
            return { allowed: featureValue, reason: featureValue ? null : 'Feature disabled' };
        }
        
        if (typeof featureValue === 'number') {
            if (featureValue === -1) {
                return { allowed: true, reason: null }; // Ilimitado
            }
            if (requestedValue !== null && requestedValue > featureValue) {
                return { 
                    allowed: false, 
                    reason: `Limit exceeded: ${requestedValue} > ${featureValue}`,
                    limit: featureValue,
                    requested: requestedValue
                };
            }
            return { allowed: true, reason: null };
        }
        
        if (featureValue === 'all') {
            return { allowed: true, reason: null };
        }
        
        if (Array.isArray(featureValue)) {
            if (requestedValue !== null && !featureValue.includes(requestedValue)) {
                return { 
                    allowed: false, 
                    reason: `Value not allowed: ${requestedValue}`,
                    allowedValues: featureValue
                };
            }
            return { allowed: true, reason: null };
        }
        
        return { allowed: true, reason: null };
    }
    
    async getMinimumPlanFor(featureName, requiredValue = true) {
        await this.ensureConfigLoaded();
        
        const planOrder = ['free', 'premium', 'pro'];
        
        for (const planName of planOrder) {
            const access = await this.canAccessFeature(planName, featureName, requiredValue);
            if (access.allowed) {
                return planName;
            }
        }
        
        return 'pro'; // Por defecto, requiere plan más alto
    }
    
    // ==========================================
    // MÉTODOS PRIVADOS
    // ==========================================
    
    async ensureConfigLoaded() {
        if (!this.isLoaded || !this.isConfigCacheValid()) {
            await this.loadConfig();
        }
    }
    
    /**
     * Configuración estática para GitHub Pages
     * Se usa como fallback cuando no hay conexión con el servidor
     */
    getStaticConfig() {
        return {
            "version": "2.0.0-gh-pages",
            "lastUpdated": new Date().toISOString(),
            "environment": "github-pages",
            "description": "Configuración estática para GitHub Pages - Todas las características desbloqueadas",
            "plans": {
                "free": {
                    "name": "GitHub Pages - Todas las características",
                    "price": 0,
                    "description": "Acceso completo sin backend",
                    "features": {
                        "maxPlayers": { "value": 22, "description": "Dos equipos completos", "type": "number", "category": "tactical" },
                        "formations": { "value": "all", "description": "Todas las formaciones", "type": "string", "category": "tactical" },
                        "maxCustomPlayers": { "value": -1, "description": "Jugadores ilimitados", "type": "number", "category": "tactical" },
                        "maxLines": { "value": -1, "description": "Líneas ilimitadas", "type": "number", "category": "drawing" },
                        "colors": { "value": "all", "description": "Todos los colores", "type": "string", "category": "drawing" },
                        "maxAnimationFrames": { "value": -1, "description": "Frames ilimitados", "type": "number", "category": "animation" },
                        "maxAnimationDuration": { "value": -1, "description": "Duración ilimitada", "type": "number", "category": "animation" },
                        "audioRecording": { "value": true, "description": "Grabación de audio", "type": "boolean", "category": "animation" },
                        "videoExport": { "value": true, "description": "Exportar video con audio", "type": "boolean", "category": "sharing" },
                        "jsonExport": { "value": true, "description": "Exportación JSON", "type": "boolean", "category": "sharing" },
                        "fieldStyles": { "value": "all", "description": "Todos los estilos de cancha", "type": "string", "category": "styles" },
                        "cardStyles": { "value": "all", "description": "Todos los estilos de tarjeta", "type": "string", "category": "styles" }
                    }
                }
            },
            "categories": {
                "tactical": { "name": "Sistema Táctico", "icon": "⚽", "description": "Jugadores, formaciones y posiciones" },
                "drawing": { "name": "Herramientas de Dibujo", "icon": "🎨", "description": "Líneas, colores y diseño" },
                "animation": { "name": "Animaciones", "icon": "🎬", "description": "Videos, frames y audio" },
                "styles": { "name": "Estilos Visuales", "icon": "🎭", "description": "Estilos de cancha y tarjetas" },
                "sharing": { "name": "Exportar", "icon": "📤", "description": "Exportación y descargas" }
            },
            "defaultPlan": "free",
            "settings": {
                "allowConfigChanges": false,
                "requireAdminAuth": false,
                "logConfigChanges": false,
                "backupBeforeChanges": false
            }
        };
    }
    
    getDefaultConfig() {
        return {
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            plans: {
                free: {
                    name: 'Gratuito',
                    price: 0,
                    features: {
                        maxLines: { value: 5, type: 'number', category: 'drawing' },
                        maxTactics: { value: 3, type: 'number', category: 'storage' },
                        maxAnimationDuration: { value: 10, type: 'number', category: 'animation' },
                        export: { value: 'watermark', type: 'string', category: 'export' },
                        audioRecording: { value: false, type: 'boolean', category: 'animation' }
                    }
                },
                premium: {
                    name: 'Premium',
                    price: 9.99,
                    features: {
                        maxLines: { value: -1, type: 'number', category: 'drawing' },
                        maxTactics: { value: -1, type: 'number', category: 'storage' },
                        maxAnimationDuration: { value: 120, type: 'number', category: 'animation' },
                        export: { value: 'hd', type: 'string', category: 'export' },
                        audioRecording: { value: true, type: 'boolean', category: 'animation' }
                    }
                }
            },
            categories: {
                drawing: { name: 'Dibujo', icon: '🎨' },
                storage: { name: 'Almacenamiento', icon: '💾' },
                animation: { name: 'Animación', icon: '🎬' },
                export: { name: 'Exportación', icon: '📤' }
            }
        };
    }
    
    // ==========================================
    // MÉTODOS PARA ADMINISTRACIÓN
    // ==========================================
    
    async saveConfig(newConfig, adminPassword) {
        try {
            
            // Validar configuración antes de enviar
            if (!newConfig.plans || !newConfig.categories) {
                throw new Error('Configuración inválida: estructura requerida faltante');
            }
            
            // Intentar guardar en el servidor
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                },
                body: JSON.stringify({
                    config: newConfig,
                    adminPassword: adminPassword
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Actualizar configuración local
            this.config = newConfig;
            this.lastLoadTime = Date.now();
            this.updateCache();
            return { success: true, message: 'Configuración guardada exitosamente' };
            
        } catch (error) {
            console.error('[FreemiumConfigManager] Error guardando configuración:', error);
            return { success: false, error: error.message };
        }
    }
    
    getConfigInfo() {
        return {
            isLoaded: this.isLoaded,
            lastLoadTime: this.lastLoadTime,
            cacheValid: this.isConfigCacheValid(),
            version: this.config?.version,
            plansCount: this.config?.plans ? Object.keys(this.config.plans).length : 0,
            categoriesCount: this.config?.categories ? Object.keys(this.config.categories).length : 0,
            hasServerConnection: true // Se determinará dinámicamente
        };
    }
    
    async reloadConfig() {
        this.lastLoadTime = null; // Forzar recarga
        return await this.loadConfig();
    }
    
    // Exportar configuración actual para debugging
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    
    // Verificar conectividad con el servidor
    async checkServerConnection() {
        try {
            const response = await fetch('/api/config', { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    // Crear respaldo de la configuración actual
    createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backup = {
            timestamp: timestamp,
            version: this.config?.version || '1.0.0',
            config: this.config,
            source: 'FreemiumConfigManager'
        };
        
        return JSON.stringify(backup, null, 2);
    }
}

// Instancia global
window.freemiumConfigManager = new FreemiumConfigManager();

// Para uso en Node.js/servidor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreemiumConfigManager;
}
