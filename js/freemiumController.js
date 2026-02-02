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
        await this.loadUserPlan();
        this.setupLimitationChecks();
        this.setupProgressIndicators();
    }
    
    async loadUserPlan() {
        try {
            if (window.freemiumConfigManager) {
                await freemiumConfigManager.loadConfig();
                
                // Obtener plan del usuario desde el config manager
                const currentPlan = await freemiumConfigManager.getCurrentUserPlan();
                
                this.userPlan = {
                    name: currentPlan.name || 'free',
                    ...currentPlan
                };
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
            // Plan GRATUITO por defecto - valores según plan freemium v2.0
            this.userPlan = {
                name: 'free',
                features: {
                    // Táctico
                    maxPlayers: { value: 11 },              // Un equipo
                    formations: { value: ['4-4-2', '4-3-3', '3-5-2'] },  // 3 formaciones
                    maxCustomPlayers: { value: 5 },         // 5 jugadores personalizados
                    
                    // Dibujo
                    maxLines: { value: 10 },                // 10 líneas
                    colors: { value: ['#ff0000', '#0000ff', '#ffff00'] },
                    
                    // Animación
                    maxAnimationFrames: { value: 5 },       // 5 frames
                    maxAnimationDuration: { value: 15 },    // 15 segundos
                    audioRecording: { value: false },
                    
                    // Estilos
                    fieldStyles: { value: ['classic', 'modern'] },
                    cardStyles: { value: ['classic', 'fifa'] },
                    
                    // Exportar/Compartir
                    export: { value: 'watermark' },
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
    
    // ==========================================
    // VERIFICACIONES DE ESTILOS
    // ==========================================
    
    canUseFieldStyle(styleId) {
        const allowedStyles = this.getFeatureValue('fieldStyles');
        
        // Si es 'all' o -1, permitir todos
        if (allowedStyles === 'all' || allowedStyles === -1) {
            return true;
        }
        
        // Si es array, verificar si está incluido
        if (Array.isArray(allowedStyles)) {
            if (!allowedStyles.includes(styleId)) {
                this.showUpgradeModal('field_style_limit', { requestedStyle: styleId });
                return false;
            }
        }
        
        return true;
    }
    
    canUseCardStyle(styleId) {
        const allowedStyles = this.getFeatureValue('cardStyles');
        
        // Si es 'all' o -1, permitir todos
        if (allowedStyles === 'all' || allowedStyles === -1) {
            return true;
        }
        
        // Si es array, verificar si está incluido
        if (Array.isArray(allowedStyles)) {
            if (!allowedStyles.includes(styleId)) {
                this.showUpgradeModal('card_style_limit', { requestedStyle: styleId });
                return false;
            }
        }
        
        return true;
    }
    
    // ==========================================
    // VERIFICACIONES DE JUGADORES
    // ==========================================
    
    canAddMorePlayers(currentCount) {
        const maxPlayers = this.getFeatureValue('maxPlayers');
        
        if (maxPlayers !== -1 && currentCount >= maxPlayers) {
            this.showUpgradeModal('players_limit', {
                current: currentCount,
                max: maxPlayers
            });
            return false;
        }
        
        return true;
    }
    
    canAddCustomPlayer() {
        const currentCustomPlayers = this.getCurrentCustomPlayerCount();
        const maxCustomPlayers = this.getFeatureValue('maxCustomPlayers');
        
        if (maxCustomPlayers !== -1 && currentCustomPlayers >= maxCustomPlayers) {
            this.showUpgradeModal('custom_players_limit', {
                current: currentCustomPlayers,
                max: maxCustomPlayers
            });
            return false;
        }
        
        return true;
    }
    
    getCurrentCustomPlayerCount() {
        // Integración con customPlayersManager
        if (window.customPlayersManager && window.customPlayersManager.customPlayers) {
            return window.customPlayersManager.customPlayers.length;
        }
        return 0;
    }
    
    // ==========================================
    // VERIFICACIONES DE ANIMACIÓN
    // ==========================================
    
    canAddAnimationFrame() {
        const currentFrames = this.getCurrentFrameCount();
        const maxFrames = this.getFeatureValue('maxAnimationFrames');
        
        if (maxFrames !== -1 && currentFrames >= maxFrames) {
            this.showUpgradeModal('frames_limit', {
                current: currentFrames,
                max: maxFrames
            });
            return false;
        }
        
        return true;
    }
    
    getCurrentFrameCount() {
        // Integración con animationManager
        if (window.animationManager && window.animationManager.frames) {
            return window.animationManager.frames.length;
        }
        return 0;
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
            },
            
            // Nuevos modales para estilos y jugadores
            field_style_limit: {
                title: '🏟️ ¡Desbloquea Todos los Estilos de Cancha!',
                message: 'El plan gratuito incluye solo 2 estilos de cancha.',
                benefits: [
                    '✅ 4 estilos de cancha profesionales',
                    '✅ Estilo Night para presentaciones',
                    '✅ Estilo Retro vintage',
                    '✅ Nuevos estilos cada mes'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🏟️'
            },
            
            card_style_limit: {
                title: '🃏 ¡Desbloquea Todos los Estilos de Tarjeta!',
                message: 'El plan gratuito incluye solo 2 estilos de tarjeta.',
                benefits: [
                    '✅ 4 estilos de tarjeta profesionales',
                    '✅ Estilo Moderno minimalista',
                    '✅ Estilo Retro clásico',
                    '✅ Nuevos estilos cada mes'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🃏'
            },
            
            players_limit: {
                title: '⚽ ¡Juega con Dos Equipos!',
                message: `Has alcanzado el límite de ${data.max} jugadores en cancha.`,
                benefits: [
                    '✅ 22 jugadores (dos equipos completos)',
                    '✅ Simula partidos reales',
                    '✅ Tácticas defensivas y ofensivas',
                    '✅ Rivales en cancha'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '⚽'
            },
            
            custom_players_limit: {
                title: '👤 ¡Crea Jugadores Ilimitados!',
                message: `Has alcanzado el límite de ${data.max} jugadores personalizados.`,
                benefits: [
                    '✅ Jugadores personalizados ilimitados',
                    '✅ Crea tu equipo completo',
                    '✅ Estadísticas personalizadas',
                    '✅ Fotos de jugadores'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '👤'
            },
            
            frames_limit: {
                title: '🎬 ¡Más Frames para tus Animaciones!',
                message: `Has alcanzado el límite de ${data.max} frames por animación.`,
                benefits: [
                    '✅ Frames ilimitados',
                    '✅ Animaciones más fluidas',
                    '✅ Tácticas complejas paso a paso',
                    '✅ Videos profesionales'
                ],
                cta: 'Upgrade a Premium - $9.99/mes',
                icon: '🎬'
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
        if (window.freemiumConfigManager) {
            await freemiumConfigManager.reloadConfig();
            await this.loadUserPlan();
            this.setupProgressIndicators();
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
