/**
 * ==========================================
 * 🔒 FREEMIUM CONTROLLER - CONTROL DE LIMITACIONES
 * ==========================================
 * Sistema de verificación y control de límites para el modelo freemium
 */

class FreemiumController {
    constructor() {
        this.userPlan = null;
        this.currentCounts = {
            lines: 0,
            tactics: 0,
            animations: 0,
            animationDuration: 0
        };
        this.init();
    }
    
    async init() {
        console.log('[FreemiumController] Inicializando...');
        await this.loadUserPlan();
        this.setupLimitationChecks();
        this.setupProgressIndicators();
        console.log('[FreemiumController] Plan del usuario:', this.userPlan?.name);
    }
    
    async loadUserPlan() {
        try {
            console.log('[FreemiumController] Cargando plan del usuario...');
            
            // Primero verificar si tenemos el config manager
            if (window.freemiumConfigManager) {
                await freemiumConfigManager.loadConfig();
                
                // Obtener plan del usuario desde el paymentManager o autenticación
                let userPlanName = 'free'; // Por defecto
                
                if (window.paymentManager) {
                    const currentPlan = await paymentManager.getCurrentUserPlan();
                    userPlanName = currentPlan?.name || 'free';
                }
                
                // Cargar datos del plan desde la configuración dinámica
                const planData = await freemiumConfigManager.getPlan(userPlanName);
                
                this.userPlan = {
                    name: userPlanName,
                    ...planData
                };
                
                console.log('[FreemiumController] Plan cargado desde configuración dinámica:', this.userPlan);
            } else {
                // Fallback al sistema anterior si no hay config manager
                console.warn('[FreemiumController] ConfigManager no disponible, usando configuración estática');
                await this.loadStaticUserPlan();
            }
        } catch (error) {
            console.error('[FreemiumController] Error cargando plan:', error);
            // Plan gratuito por defecto en caso de error
            await this.loadStaticUserPlan();
        }
    }
    
    async loadStaticUserPlan() {
        // Método de fallback con configuración estática
        if (window.paymentManager) {
            this.userPlan = await paymentManager.getCurrentUserPlan();
        } else {
            // Plan por defecto si no hay autenticación
            this.userPlan = {
                name: 'free',
                features: {
                    maxLines: { value: 5 },
                    maxTactics: { value: 3 },
                    maxAnimationDuration: { value: 10 },
                    maxAnimationFrames: { value: 5 },
                    maxAnimations: { value: 1 },
                    formations: { value: ['4-4-2', '4-3-3'] },
                    colors: { value: ['#ff0000', '#0000ff', '#00ff00'] },
                    export: { value: 'watermark' },
                    audioRecording: { value: false },
                    jsonExport: { value: false },
                    socialShare: { value: false }
                }
            };
        }
    }
    
    // ==========================================
    // VERIFICACIONES DE LÍMITES
    // ==========================================
    
    canDrawLine() {
        const currentLines = this.getCurrentLineCount();
        const maxLines = this.getFeatureValue('maxLines');
        
        console.log(`[FreemiumController] Verificando líneas: ${currentLines}/${maxLines}`);
        
        if (maxLines !== -1 && currentLines >= maxLines) {
            this.showUpgradeModal('drawing_limit', {
                current: currentLines,
                max: maxLines
            });
            return false;
        }
        
        this.updateProgressIndicator('lines', currentLines, maxLines);
        return true;
    }
    
    canCreateAnimation() {
        const currentAnimations = this.getCurrentAnimationCount();
        const maxAnimations = this.getFeatureValue('maxSimultaneousAnimations');
        
        console.log(`[FreemiumController] Verificando animaciones: ${currentAnimations}/${maxAnimations}`);
        
        if (maxAnimations !== -1 && currentAnimations >= maxAnimations) {
            this.showUpgradeModal('animation_limit', {
                current: currentAnimations,
                max: maxAnimations
            });
            return false;
        }
        
        return true;
    }
    
    canExtendAnimationDuration(additionalSeconds) {
        const currentDuration = this.currentCounts.animationDuration;
        const maxDuration = this.getFeatureValue('maxAnimationDuration');
        const newDuration = currentDuration + additionalSeconds;
        
        if (maxDuration !== -1 && newDuration > maxDuration) {
            this.showUpgradeModal('duration_limit', {
                current: currentDuration,
                max: maxDuration,
                requested: newDuration
            });
            return false;
        }
        
        this.updateProgressIndicator('duration', newDuration, maxDuration);
        return true;
    }
    
    canUseColor(color) {
        const allowedColors = this.getFeatureValue('colors');
        
        if (allowedColors !== 'all' && Array.isArray(allowedColors)) {
            if (!allowedColors.includes(color)) {
                this.showUpgradeModal('color_limit', { requestedColor: color });
                return false;
            }
        }
        
        return true;
    }
    
    canUseFormation(formation) {
        const allowedFormations = this.getFeatureValue('formations');
        
        if (allowedFormations !== 'all' && Array.isArray(allowedFormations)) {
            if (!allowedFormations.includes(formation)) {
                this.showUpgradeModal('formation_limit', { requestedFormation: formation });
                return false;
            }
        }
        
        return true;
    }
    
    canRecordAudio() {
        const audioRecording = this.getFeatureValue('audioRecording');
        if (!audioRecording) {
            this.showUpgradeModal('audio_limit');
            return false;
        }
        return true;
    }
    
    canExportWithoutWatermark() {
        const exportType = this.getFeatureValue('export');
        return exportType === 'hd';
    }
    
    canExportJSON() {
        const jsonExport = this.getFeatureValue('jsonExport');
        if (!jsonExport) {
            this.showUpgradeModal('json_export_limit');
            return false;
        }
        return true;
    }
    
    canShareToSocial() {
        const socialShare = this.getFeatureValue('socialShare');
        if (!socialShare) {
            this.showUpgradeModal('social_share_limit');
            return false;
        }
        return true;
    }
    
    // ==========================================
    // CONTADORES DINÁMICOS
    // ==========================================
    
    getCurrentLineCount() {
        // Integración con drawingManager
        if (window.drawingManager && window.drawingManager.lines) {
            return window.drawingManager.lines.length;
        }
        return this.currentCounts.lines;
    }
    
    getCurrentTacticCount() {
        // Eliminado: No guardamos tácticas, solo trabajamos en tiempo real
        return 0;
    }
    
    getCurrentAnimationCount() {
        // Integración con animationManager
        if (window.animationManager && window.animationManager.animations) {
            return window.animationManager.animations.length;
        }
        return this.currentCounts.animations;
    }
    
    // ==========================================
    // MODALES DE UPGRADE
    // ==========================================
    
    showUpgradeModal(limitType, data = {}) {
        console.log(`[FreemiumController] Mostrando modal de upgrade: ${limitType}`, data);
        
        const modalConfigs = {
            drawing_limit: {
                title: '🎨 ¡Desbloquea el Dibujo Ilimitado!',
                message: `Has alcanzado el límite de ${data.max} líneas por táctica.`,
                benefits: [
                    '✅ Líneas ilimitadas para tácticas complejas',
                    '✅ Paleta de colores completa',
                    '✅ Herramientas avanzadas de dibujo'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🎨'
            },
            
            
            animation_limit: {
                title: '🎬 ¡Animaciones Múltiples Sin Límites!',
                message: 'Crea múltiples animaciones simultáneamente para tácticas complejas.',
                benefits: [
                    '✅ Animaciones simultáneas ilimitadas',
                    '✅ Sincronización perfecta entre movimientos',
                    '✅ Control avanzado de animaciones'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🎬'
            },
            
            duration_limit: {
                title: '⏱️ ¡Extiende la Duración de tus Videos!',
                message: `Las animaciones gratuitas están limitadas a ${data.max} segundos.`,
                benefits: [
                    '✅ Videos hasta 2 minutos',
                    '✅ Sin límites de duración',
                    '✅ Exportación profesional'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '⏱️'
            },
            
            color_limit: {
                title: '🎨 ¡Accede a Todos los Colores!',
                message: 'El plan gratuito incluye solo 3 colores básicos.',
                benefits: [
                    '✅ Paleta de colores completa',
                    '✅ Colores personalizados',
                    '✅ Herramientas de diseño avanzadas'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🎨'
            },
            
            formation_limit: {
                title: '⚽ ¡Todas las Formaciones para Cargar Jugadores!',
                message: 'Accede a más de 10 formaciones profesionales para cargar diferentes disposiciones de jugadores.',
                benefits: [
                    '✅ 15+ formaciones profesionales',
                    '✅ Formaciones por liga',
                    '✅ Plantillas personalizadas'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '⚽'
            },
            
            audio_limit: {
                title: '🎤 ¡Añade Audio Profesional!',
                message: 'Graba comentarios y efectos de sonido.',
                benefits: [
                    '✅ Grabación de audio HD',
                    '✅ Efectos de sonido',
                    '✅ Narración profesional'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🎤'
            },
            
            json_export_limit: {
                title: '💾 ¡Respaldo y Restauración!',
                message: 'Guarda tus tácticas en formato JSON.',
                benefits: [
                    '✅ Exportación en múltiples formatos',
                    '✅ Respaldo automático',
                    '✅ Transferencia entre dispositivos'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '💾'
            },
            
            social_share_limit: {
                title: '📱 ¡Comparte Directamente!',
                message: 'Comparte tus tácticas en redes sociales.',
                benefits: [
                    '✅ Compartir directo a redes sociales',
                    '✅ Enlaces personalizados',
                    '✅ Integración con plataformas'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '📱'
            }
        };
        
        const config = modalConfigs[limitType];
        if (config) {
            this.displayUpgradeModal(config);
            
            // Analytics
            if (window.analytics) {
                analytics.trackUpgradeModalShown(limitType);
            }
        }
    }
    
    displayUpgradeModal(config) {
        // Crear modal HTML
        const modalHTML = `
            <div id="freemium-upgrade-modal" class="freemium-modal-overlay">
                <div class="freemium-modal">
                    <div class="freemium-modal-header">
                        <span class="freemium-modal-icon">${config.icon}</span>
                        <h2>${config.title}</h2>
                        <button class="freemium-modal-close" onclick="freemiumController.closeUpgradeModal()">&times;</button>
                    </div>
                    <div class="freemium-modal-body">
                        <p class="freemium-modal-message">${config.message}</p>
                        <ul class="freemium-modal-benefits">
                            ${config.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="freemium-modal-footer">
                        <button class="freemium-upgrade-btn" onclick="freemiumController.redirectToUpgrade()">
                            ${config.cta}
                        </button>
                        <button class="freemium-cancel-btn" onclick="freemiumController.closeUpgradeModal()">
                            Continuar con plan gratuito
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        setTimeout(() => {
            const modal = document.getElementById('freemium-upgrade-modal');
            if (modal) {
                modal.classList.add('show');
            }
        }, 100);
    }
    
    closeUpgradeModal() {
        const modal = document.getElementById('freemium-upgrade-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    redirectToUpgrade() {
        // Cerrar modal
        this.closeUpgradeModal();
        
        // Redirigir a página de upgrade o abrir paymentManager
        if (window.paymentManager) {
            paymentManager.showUpgradeOptions();
        } else {
            // Fallback: redirigir a página de pricing
            window.location.href = '#upgrade';
        }
        
        // Analytics
        if (window.analytics) {
            analytics.trackUpgradeAttempt('modal_click');
        }
    }
    
    // ==========================================
    // INDICADORES DE PROGRESO
    // ==========================================
    
    setupProgressIndicators() {
        // Crear indicadores de progreso en la UI
        this.createProgressIndicators();
    }
    
    createProgressIndicators() {
        // Solo para plan gratuito
        if (this.userPlan.name !== 'free') return;
        
        const indicators = [
            {
                id: 'lines-progress',
                label: 'Líneas',
                max: this.userPlan.features.maxLines,
                current: this.getCurrentLineCount(),
                parent: 'drawing-toolbar'
            }
        ];
        
        indicators.forEach(indicator => {
            this.createProgressBar(indicator);
        });
    }
    
    createProgressBar(indicator) {
        const parentElement = document.getElementById(indicator.parent);
        if (!parentElement) return;
        
        const progressHTML = `
            <div class="freemium-progress-container" id="${indicator.id}-container">
                <div class="freemium-progress-label">
                    ${indicator.label}: ${indicator.current}/${indicator.max}
                </div>
                <div class="freemium-progress-bar">
                    <div class="freemium-progress-fill" id="${indicator.id}-fill" 
                         style="width: ${(indicator.current / indicator.max) * 100}%"></div>
                </div>
            </div>
        `;
        
        parentElement.insertAdjacentHTML('beforeend', progressHTML);
    }
    
    updateProgressIndicator(type, current, max) {
        if (max === -1) return; // No mostrar para ilimitado
        
        const progressFill = document.getElementById(`${type}-progress-fill`);
        const progressLabel = document.querySelector(`#${type}-progress-container .freemium-progress-label`);
        
        if (progressFill && progressLabel) {
            const percentage = (current / max) * 100;
            progressFill.style.width = `${percentage}%`;
            progressLabel.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${current}/${max}`;
            
            // Cambiar color según proximidad al límite
            if (percentage >= 100) {
                progressFill.classList.add('limit-reached');
            } else if (percentage >= 80) {
                progressFill.classList.add('warning');
            }
        }
    }
    
    // ==========================================
    // INTEGRACIÓN CON OTROS MANAGERS
    // ==========================================
    
    setupLimitationChecks() {
        // Hooks para drawingManager
        if (window.drawingManager) {
            const originalStartDrawing = window.drawingManager.startDrawing;
            window.drawingManager.startDrawing = (e) => {
                if (this.canDrawLine()) {
                    return originalStartDrawing.call(window.drawingManager, e);
                }
                return false;
            };
        }
        
        // Hooks para otros managers según sea necesario
        console.log('[FreemiumController] Limitation checks configurados');
    }
    
    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================
    
    getFeatureValue(featureName) {
        // Nuevo método para obtener valores de características de forma consistente
        if (!this.userPlan || !this.userPlan.features) {
            console.warn(`[FreemiumController] Plan o características no disponibles`);
            return null;
        }
        
        const feature = this.userPlan.features[featureName];
        
        // Si tenemos el nuevo formato con estructura de objeto
        if (feature && typeof feature === 'object' && feature.hasOwnProperty('value')) {
            return feature.value;
        }
        
        // Fallback al formato anterior (valor directo)
        return feature;
    }
    
    getFeature(featureName) {
        // Obtener el objeto completo de la característica (incluyendo metadata)
        if (!this.userPlan || !this.userPlan.features) {
            return null;
        }
        
        return this.userPlan.features[featureName];
    }
    
    async reloadConfiguration() {
        // Método para recargar la configuración dinámicamente
        console.log('[FreemiumController] Recargando configuración...');
        
        if (window.freemiumConfigManager) {
            await freemiumConfigManager.reloadConfig();
            await this.loadUserPlan();
            this.setupProgressIndicators();
            console.log('[FreemiumController] Configuración recargada exitosamente');
        } else {
            console.warn('[FreemiumController] ConfigManager no disponible para recarga');
        }
    }
    
    // ==========================================
    // MÉTODOS PÚBLICOS ACTUALIZADOS
    // ==========================================
    
    refreshUserPlan() {
        this.loadUserPlan();
    }
    
    getPlanName() {
        return this.userPlan?.name || 'free';
    }
    
    getFeature(featureName) {
        // Mantener compatibilidad con el método anterior
        return this.getFeatureValue(featureName);
    }
    
    isPremium() {
        const planName = this.getPlanName();
        return planName === 'premium' || planName === 'pro';
    }
    
    isFeatureAvailable(featureName) {
        const feature = this.getFeatureValue(featureName);
        if (typeof feature === 'boolean') {
            return feature;
        }
        if (typeof feature === 'number') {
            return feature !== 0;
        }
        if (Array.isArray(feature)) {
            return feature.length > 0;
        }
        return feature === 'all' || !!feature;
    }
    
    // ==========================================
    // MÉTODOS DE DEBUGGING Y ADMINISTRACIÓN
    // ==========================================
    
    getDebugInfo() {
        return {
            planName: this.getPlanName(),
            userPlan: this.userPlan,
            currentCounts: this.currentCounts,
            configManagerAvailable: !!window.freemiumConfigManager,
            paymentManagerAvailable: !!window.paymentManager,
            lastLoadTime: new Date().toISOString()
        };
    }
    
    async testFeatureAccess(featureName, testValue = null) {
        // Método para testing desde el panel de administración
        if (window.freemiumConfigManager) {
            return await freemiumConfigManager.canAccessFeature(
                this.getPlanName(), 
                featureName, 
                testValue
            );
        }
        
        // Fallback para testing local
        const feature = this.getFeatureValue(featureName);
        return {
            allowed: this.isFeatureAvailable(featureName),
            featureValue: feature,
            planName: this.getPlanName()
        };
    }
}

// Instancia global
window.freemiumController = new FreemiumController();

console.log('[FreemiumController] Módulo cargado correctamente');
