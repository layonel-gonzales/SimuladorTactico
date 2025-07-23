/**
 * ==========================================
 * 📋 FASE 2: PERSONALIZACIÓN DE CONTENIDO
 * ==========================================
 * Modificación segura de textos y contenidos de elementos
 */

class ConfigurationManagerPhase2 extends ConfigurationManagerPhase1 {
    constructor() {
        super();
        this.phase2Features = {
            contentModification: true,
            playerCardCustomization: true,
            tooltipCustomization: true,
            textAbbreviation: true
        };
    }

    /**
     * FASE 2: Personalización de contenido
     */
    initializePhase2() {
        console.log('🚀 Inicializando Configuración - Fase 2');
        
        // Inicializar Fase 1 primero
        this.initializePhase1();
        
        // Nuevas funcionalidades de Fase 2
        this.setupContentCustomization();
        this.setupPlayerCardCustomization();
        this.setupTooltipCustomization();
        
        console.log('✅ Fase 2 completada');
    }

    /**
     * Personalización de contenido de elementos
     */
    setupContentCustomization() {
        const contentConfig = this.userPreferences.content || {};
        
        // Personalizar textos de botones
        if (contentConfig.buttonTexts) {
            this.applyButtonTextCustomization(contentConfig.buttonTexts);
        }
        
        // Personalizar formato de contador
        if (contentConfig.frameCounterFormat) {
            this.applyFrameCounterFormat(contentConfig.frameCounterFormat);
        }
    }

    /**
     * Personalizar textos de botones
     */
    applyButtonTextCustomization(buttonTexts) {
        const buttonMap = {
            'start-tutorial-drawing-btn': buttonTexts.drawingTutorial || 'Tutorial Dibujo',
            'start-tutorial-animation-btn': buttonTexts.animationTutorial || 'Tutorial Animación'
        };

        for (const [elementId, customText] of Object.entries(buttonMap)) {
            try {
                const button = document.getElementById(elementId);
                if (button) {
                    const textSpan = button.querySelector('.tutorial-text');
                    if (textSpan) {
                        this.safeUpdater.updateElementContent(textSpan.id || `${elementId}-text`, customText);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error personalizando texto de ${elementId}:`, error);
            }
        }
    }

    /**
     * Personalizar formato del contador de frames
     */
    applyFrameCounterFormat(format) {
        const frameIndicator = document.getElementById('frame-indicator');
        if (!frameIndicator) return;

        // Interceptar actualizaciones del contador
        const originalTextContent = frameIndicator.textContent;
        
        // Aplicar formato personalizado
        switch (format) {
            case 'minimal':
                // Solo números: "3/5" -> "3"
                this.setupFrameCounterInterceptor((current, total) => current.toString());
                break;
            case 'detailed':
                // Formato extendido: "3/5" -> "Frame 3 de 5"
                this.setupFrameCounterInterceptor((current, total) => `Frame ${current} de ${total}`);
                break;
            case 'percentage':
                // Porcentaje: "3/5" -> "60%"
                this.setupFrameCounterInterceptor((current, total) => `${Math.round((current/total)*100)}%`);
                break;
            default:
                // Formato estándar: "3/5"
                break;
        }
    }

    /**
     * Configurar interceptor para el contador de frames
     */
    setupFrameCounterInterceptor(formatter) {
        const frameIndicator = document.getElementById('frame-indicator');
        if (!frameIndicator) return;

        // Observar cambios en el contenido
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const content = frameIndicator.textContent;
                    const match = content.match(/(\d+)\/(\d+)/);
                    
                    if (match) {
                        const [, current, total] = match;
                        const formattedContent = formatter(parseInt(current), parseInt(total));
                        
                        if (formattedContent !== content) {
                            frameIndicator.textContent = formattedContent;
                        }
                    }
                }
            });
        });

        observer.observe(frameIndicator, {
            childList: true,
            characterData: true,
            subtree: true
        });

        console.log('📊 Interceptor de contador de frames configurado');
    }

    /**
     * Personalización de cards de jugadores
     */
    setupPlayerCardCustomization() {
        const cardConfig = this.userPreferences.playerCards || {};
        
        if (cardConfig.abbreviateOverall) {
            this.enableOverallAbbreviation();
        }
        
        if (cardConfig.hideJerseyNumbers) {
            this.hideJerseyNumbers();
        }
        
        if (cardConfig.customPositionNames) {
            this.applyCustomPositionNames(cardConfig.customPositionNames);
        }
    }

    /**
     * Abreviar overall en cards (99 -> OVR)
     */
    enableOverallAbbreviation() {
        // Buscar todos los elementos de overall en cards
        const overallElements = document.querySelectorAll('[data-element="overall"]');
        
        overallElements.forEach(element => {
            const originalContent = element.textContent;
            if (/^\d+$/.test(originalContent)) {
                this.safeUpdater.updateElementContent(
                    element.dataset.uniqueId || element.id, 
                    'OVR'
                );
                element.setAttribute('data-config-abbreviated', 'true');
                element.setAttribute('title', `Overall: ${originalContent}`);
            }
        });
        
        console.log('📊 Abreviación de overall habilitada');
    }

    /**
     * Ocultar números de camiseta
     */
    hideJerseyNumbers() {
        const jerseyElements = document.querySelectorAll('[data-element="jersey"]');
        
        jerseyElements.forEach(element => {
            this.safeUpdater.updateElementVisibility(
                element.dataset.uniqueId || element.id, 
                false
            );
        });
        
        console.log('🔢 Números de camiseta ocultos');
    }

    /**
     * Aplicar nombres de posición personalizados
     */
    applyCustomPositionNames(customNames) {
        const positionElements = document.querySelectorAll('[data-element="position"]');
        
        positionElements.forEach(element => {
            const currentPosition = element.textContent;
            const customName = customNames[currentPosition];
            
            if (customName) {
                this.safeUpdater.updateElementContent(
                    element.dataset.uniqueId || element.id, 
                    customName
                );
                element.setAttribute('data-config-custom-position', 'true');
                element.setAttribute('title', `Posición: ${currentPosition} (${customName})`);
            }
        });
        
        console.log('⚽ Nombres de posición personalizados aplicados');
    }

    /**
     * Configurar tooltips personalizados
     */
    setupTooltipCustomization() {
        const tooltipConfig = this.userPreferences.tooltips || {};
        
        if (tooltipConfig.enhanced) {
            this.enableEnhancedTooltips();
        }
        
        if (tooltipConfig.customMessages) {
            this.applyCustomTooltips(tooltipConfig.customMessages);
        }
    }

    /**
     * Habilitar tooltips mejorados
     */
    enableEnhancedTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title]');
        
        elementsWithTooltips.forEach(element => {
            const originalTitle = element.title;
            const enhancedTitle = this.enhanceTooltip(element, originalTitle);
            
            if (enhancedTitle !== originalTitle) {
                element.setAttribute('data-original-tooltip', originalTitle);
                element.title = enhancedTitle;
            }
        });
        
        console.log('💬 Tooltips mejorados habilitados');
    }

    /**
     * Mejorar tooltip con información adicional
     */
    enhanceTooltip(element, originalTooltip) {
        if (element.dataset.element === 'overall') {
            return `${originalTooltip} - Calculado basado en estadísticas del jugador`;
        }
        
        if (element.dataset.element === 'position') {
            return `${originalTooltip} - Haz clic para ver detalles del jugador`;
        }
        
        if (element.classList.contains('tutorial-btn')) {
            return `${originalTooltip} - Duración aprox: 2-3 minutos`;
        }
        
        return originalTooltip;
    }

    /**
     * Aplicar tooltips personalizados
     */
    applyCustomTooltips(customMessages) {
        for (const [elementId, message] of Object.entries(customMessages)) {
            try {
                this.safeUpdater.updateDataAttributes(elementId, {
                    'title': message,
                    'data-config-custom-tooltip': 'true'
                });
            } catch (error) {
                console.warn(`⚠️ Error aplicando tooltip personalizado a ${elementId}:`, error);
            }
        }
    }

    /**
     * APIs públicas para Fase 2
     */
    toggleOverallAbbreviation() {
        const isAbbreviated = document.querySelector('[data-config-abbreviated="true"]');
        
        if (isAbbreviated) {
            // Restaurar valores originales
            const overallElements = document.querySelectorAll('[data-config-abbreviated="true"]');
            overallElements.forEach(element => {
                const originalValue = element.title.match(/Overall: (\d+)/)?.[1];
                if (originalValue) {
                    this.safeUpdater.updateElementContent(
                        element.dataset.uniqueId || element.id, 
                        originalValue
                    );
                    element.removeAttribute('data-config-abbreviated');
                }
            });
        } else {
            this.enableOverallAbbreviation();
        }
        
        this.userPreferences.playerCards = this.userPreferences.playerCards || {};
        this.userPreferences.playerCards.abbreviateOverall = !isAbbreviated;
        this.savePreferences();
        
        return !isAbbreviated;
    }

    setFrameCounterFormat(format) {
        this.userPreferences.content = this.userPreferences.content || {};
        this.userPreferences.content.frameCounterFormat = format;
        this.applyFrameCounterFormat(format);
        this.savePreferences();
    }

    // Tests para Fase 2
    runPhase2Tests() {
        console.log('🧪 Ejecutando tests de Fase 2...');
        
        // Ejecutar tests de Fase 1 primero
        this.runPhase1Tests();
        
        const phase2Tests = [
            () => this.toggleOverallAbbreviation(),
            () => this.setFrameCounterFormat('detailed'),
            () => this.setFrameCounterFormat('minimal'),
            () => this.setFrameCounterFormat('standard'), // Restaurar
            () => this.toggleOverallAbbreviation() // Restaurar
        ];

        phase2Tests.forEach((test, index) => {
            try {
                test();
                console.log(`✅ Test Fase 2 - ${index + 1} exitoso`);
            } catch (error) {
                console.error(`❌ Test Fase 2 - ${index + 1} falló:`, error);
            }
        });
    }
}

export default ConfigurationManagerPhase2;
