// configurationUI.js
// Interfaz de configuración de elementos visuales del simulador

export default class ConfigurationUI {
    constructor(configurationManager, customPlayersManager, playerManager) {
        this.configurationManager = configurationManager;
        this.customPlayersManager = customPlayersManager;
        this.playerManager = playerManager;
        
        this.init();
        
        // Escuchar cambios de configuración
        window.addEventListener('configurationChanged', this.handleConfigurationChange.bind(this));
        
        // Escuchar cambios de modo para actualizar botones de tutorial
        document.addEventListener('modeChanged', this.handleModeChange.bind(this));
        
        console.log('[ConfigurationUI] Inicializado correctamente');
    }

    init() {
        this.setupEventListeners();
        // Aplicar configuraciones guardadas al inicializar
        setTimeout(() => this.applySavedSettings(), 1000);
    }

    setupEventListeners() {
        // Los event listeners se configurarán cuando se cree el modal
    }

    // === INTERFAZ PRINCIPAL ===

    createConfigurationModal() {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('configuration-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <!-- Modal de Configuración de Interfaz -->
            <div class="modal fade custom-z-index-modal" id="configuration-modal" style="z-index: 9999;" tabindex="-1" aria-labelledby="configurationModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="configurationModalLabel">
                                <i class="fas fa-desktop me-2"></i>Configuración de Interfaz
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-4">
                                ${this.createPlayerCardSettingsCard()}
                                ${this.createTutorialSettingsCard()}
                                ${this.createDrawingSettingsCard()}
                                ${this.createAnimationSettingsCard()}
                                ${this.createGeneralSettingsCard()}
                                ${this.createThemeSettingsCard()}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-warning" id="reset-all-settings-btn">
                                <i class="fas fa-undo me-1"></i>Restablecer Todo
                            </button>
                            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                                <i class="fas fa-check me-1"></i>Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.setupModalEventListeners();
    }

    // ==================== CARDS DE CONFIGURACIÓN DE INTERFAZ ====================

    createPlayerCardSettingsCard() {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-primary">
                    <div class="card-header bg-primary text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-id-card me-2"></i>Tarjeta de Jugador
                        </h6>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted mb-3">
                            Controla qué elementos se muestran en las tarjetas de jugadores
                        </p>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="show-player-image" checked>
                            <label class="form-check-label" for="show-player-image">
                                <i class="fas fa-camera me-1"></i>Foto del jugador
                            </label>
                        </div>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="show-player-name" checked>
                            <label class="form-check-label" for="show-player-name">
                                <i class="fas fa-user me-1"></i>Nombre del jugador
                            </label>
                        </div>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="show-player-overall" checked>
                            <label class="form-check-label" for="show-player-overall">
                                <i class="fas fa-star me-1"></i>Overall (puntuación)
                            </label>
                        </div>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="show-player-position" checked>
                            <label class="form-check-label" for="show-player-position">
                                <i class="fas fa-map-marker-alt me-1"></i>Posición
                            </label>
                        </div>
                        
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="show-player-jersey" checked>
                            <label class="form-check-label" for="show-player-jersey">
                                <i class="fas fa-hashtag me-1"></i>Número de camiseta
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createTutorialSettingsCard() {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-info">
                    <div class="card-header bg-info text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-graduation-cap me-2"></i>Tutorial
                        </h6>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted mb-3">
                            Controla la visibilidad de los botones de tutorial
                        </p>
                        
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="show-tutorial-buttons" checked>
                            <label class="form-check-label" for="show-tutorial-buttons">
                                <i class="fas fa-hand-pointer me-1"></i>Mostrar botones de tutorial
                            </label>
                            <small class="form-text text-muted d-block mt-1">
                                Botones de ayuda según el modo actual
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createDrawingSettingsCard() {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-warning">
                    <div class="card-header bg-warning text-dark">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-pen me-2"></i>Herramientas de Dibujo
                        </h6>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted mb-3">
                            Configura las opciones por defecto del dibujo
                        </p>
                        
                        <div class="mb-3">
                            <label for="default-line-color" class="form-label">
                                <i class="fas fa-palette me-1"></i>Color por defecto
                            </label>
                            <input type="color" class="form-control form-control-color" id="default-line-color" value="#ffff00">
                        </div>
                        
                        <div class="mb-3">
                            <label for="default-line-thickness" class="form-label">
                                <i class="fas fa-ruler me-1"></i>Grosor por defecto
                            </label>
                            <input type="range" class="form-range" id="default-line-thickness" min="1" max="15" value="6">
                            <small class="form-text text-muted">Valor: <span id="thickness-value">6</span>px</small>
                        </div>
                        
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="show-drawing-toolbar" checked>
                            <label class="form-check-label" for="show-drawing-toolbar">
                                <i class="fas fa-tools me-1"></i>Mostrar barra de herramientas
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createAnimationSettingsCard() {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-success">
                    <div class="card-header bg-success text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-play me-2"></i>Animaciones
                        </h6>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted mb-3">
                            Controla las animaciones y transiciones
                        </p>
                        
                        <div class="mb-3">
                            <label for="animation-speed" class="form-label">
                                <i class="fas fa-tachometer-alt me-1"></i>Velocidad de animación
                            </label>
                            <input type="range" class="form-range" id="animation-speed" 
                                   min="0.25" max="3" step="0.25" value="1">
                            <div class="d-flex justify-content-between small text-muted">
                                <span>0.25x (Muy lenta)</span>
                                <span id="speed-value">1x</span>
                                <span>3x (Muy rápida)</span>
                            </div>
                        </div>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="smooth-movements" checked>
                            <label class="form-check-label" for="smooth-movements">
                                <i class="fas fa-water me-1"></i>Movimientos suaves
                            </label>
                        </div>
                        
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="fade-transitions" checked>
                            <label class="form-check-label" for="fade-transitions">
                                <i class="fas fa-eye me-1"></i>Transiciones de entrada/salida
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createGeneralSettingsCard() {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-secondary">
                    <div class="card-header bg-secondary text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-cog me-2"></i>General
                        </h6>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted mb-3">
                            Configuraciones generales de la interfaz
                        </p>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="confirm-actions-toggle">
                            <label class="form-check-label" for="confirm-actions-toggle">
                                <i class="fas fa-exclamation-triangle me-1"></i>Confirmar acciones destructivas
                            </label>
                            <small class="form-text text-muted d-block">
                                Solicitar confirmación antes de borrar líneas, reiniciar animaciones, etc.
                            </small>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="compact-mode-toggle">
                            <label class="form-check-label" for="compact-mode-toggle">
                                <i class="fas fa-compress me-1"></i>Modo compacto
                            </label>
                            <small class="form-text text-muted d-block">
                                Ocultar separadores verticales para aprovechar mejor el espacio
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createThemeSettingsCard() {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-dark">
                    <div class="card-header bg-dark text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-paint-brush me-2"></i>Tema Visual
                        </h6>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted mb-3">
                            Personaliza la apariencia visual
                        </p>
                        
                        <div class="mb-3">
                            <label class="form-label">
                                <i class="fas fa-moon me-1"></i>Modo de color
                            </label>
                            <div class="btn-group w-100" role="group">
                                <input type="radio" class="btn-check" name="theme-mode" id="theme-auto" checked>
                                <label class="btn btn-outline-secondary btn-sm" for="theme-auto">Auto</label>
                                
                                <input type="radio" class="btn-check" name="theme-mode" id="theme-light">
                                <label class="btn btn-outline-secondary btn-sm" for="theme-light">Claro</label>
                                
                                <input type="radio" class="btn-check" name="theme-mode" id="theme-dark">
                                <label class="btn btn-outline-secondary btn-sm" for="theme-dark">Oscuro</label>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="accent-color" class="form-label">
                                <i class="fas fa-star me-1"></i>Color de acento
                            </label>
                            <input type="color" class="form-control form-control-color" id="accent-color" value="#0d6efd">
                        </div>
                        
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="high-contrast">
                            <label class="form-check-label" for="high-contrast">
                                <i class="fas fa-adjust me-1"></i>Alto contraste
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // === EVENT HANDLERS ===

    setupModalEventListeners() {
        const modal = document.getElementById('configuration-modal');
        
        modal.addEventListener('shown.bs.modal', () => {
            this.loadCurrentSettings();
        });

        // Configurar event listeners para cada card
        this.setupPlayerCardListeners();
        this.setupTutorialListeners();
        this.setupDrawingListeners();
        this.setupAnimationListeners();
        this.setupGeneralListeners();
        
        // Botón de reset
        const resetBtn = document.getElementById('reset-all-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAllSettings());
        }
    }

    setupPlayerCardListeners() {
        // Checkboxes de elementos de la tarjeta de jugador
        const playerElements = [
            'show-player-image',
            'show-player-name', 
            'show-player-overall',
            'show-player-position',
            'show-player-jersey'
        ];

        playerElements.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updatePlayerCardDisplay();
                });
            }
        });
    }

    setupTutorialListeners() {
        // Checkbox de mostrar botones de tutorial
        const showTutorialButtons = document.getElementById('show-tutorial-buttons');
        if (showTutorialButtons) {
            showTutorialButtons.addEventListener('change', () => {
                this.updateTutorialButtonsVisibility();
            });
        }
    }

    setupDrawingListeners() {
        // Color por defecto de línea
        const defaultLineColor = document.getElementById('default-line-color');
        if (defaultLineColor) {
            defaultLineColor.addEventListener('change', () => {
                this.updateDrawingSettings();
            });
        }

        // Grosor por defecto de línea
        const defaultLineThickness = document.getElementById('default-line-thickness');
        const thicknessValue = document.getElementById('thickness-value');
        if (defaultLineThickness && thicknessValue) {
            defaultLineThickness.addEventListener('input', (e) => {
                thicknessValue.textContent = e.target.value;
                this.updateDrawingSettings();
            });
        }

        // Mostrar barra de herramientas de dibujo
        const showDrawingToolbar = document.getElementById('show-drawing-toolbar');
        if (showDrawingToolbar) {
            showDrawingToolbar.addEventListener('change', () => {
                this.updateDrawingToolbarVisibility();
            });
        }
    }

    setupAnimationListeners() {
        // Velocidad de animación con display dinámico
        const animationSpeed = document.getElementById('animation-speed');
        const speedValue = document.getElementById('speed-value');
        if (animationSpeed && speedValue) {
            animationSpeed.addEventListener('input', (e) => {
                speedValue.textContent = `${e.target.value}x`;
                this.updateAnimationSettings();
            });
        }

        // Movimientos suaves
        const smoothMovements = document.getElementById('smooth-movements');
        if (smoothMovements) {
            smoothMovements.addEventListener('change', () => {
                this.updateAnimationSettings();
            });
        }

        // Transiciones de entrada/salida
        const fadeTransitions = document.getElementById('fade-transitions');
        if (fadeTransitions) {
            fadeTransitions.addEventListener('change', () => {
                this.updateAnimationSettings();
            });
        }
    }

    setupGeneralListeners() {
        // Confirmar acciones
        const confirmActionsToggle = document.getElementById('confirm-actions-toggle');
        if (confirmActionsToggle) {
            confirmActionsToggle.addEventListener('change', (e) => {
                this.updateGeneralSettings();
            });
        }

        // Modo compacto
        const compactModeToggle = document.getElementById('compact-mode-toggle');
        if (compactModeToggle) {
            compactModeToggle.addEventListener('change', (e) => {
                this.updateGeneralSettings();
            });
        }
    }

    // === MÉTODOS DE CARGA Y ACTUALIZACIÓN ===

    loadCurrentSettings() {
        // Cargar configuraciones actuales desde localStorage o valores por defecto
        this.loadPlayerCardSettings();
        this.loadTutorialSettings();
        this.loadDrawingSettings();
        this.loadAnimationSettings();
        this.loadGeneralSettings();
    }

    loadPlayerCardSettings() {
        const settings = JSON.parse(localStorage.getItem('playerCardSettings')) || {
            showImage: true,
            showName: true,
            showOverall: true,
            showPosition: true,
            showJersey: true
        };

        document.getElementById('show-player-image').checked = settings.showImage;
        document.getElementById('show-player-name').checked = settings.showName;
        document.getElementById('show-player-overall').checked = settings.showOverall;
        document.getElementById('show-player-position').checked = settings.showPosition;
        document.getElementById('show-player-jersey').checked = settings.showJersey;
    }

    loadTutorialSettings() {
        // Cargar configuración de mostrar botones de tutorial
        const showTutorialButtons = localStorage.getItem('showTutorialButtons');
        const showButtonsElement = document.getElementById('show-tutorial-buttons');
        if (showButtonsElement) {
            showButtonsElement.checked = showTutorialButtons === 'true' || showTutorialButtons === null; // Por defecto true
        }
    }

    loadDrawingSettings() {
        // Cargar color por defecto
        const defaultLineColor = localStorage.getItem('defaultLineColor') || '#ffff00';
        const colorElement = document.getElementById('default-line-color');
        if (colorElement) {
            colorElement.value = defaultLineColor;
        }

        // Cargar grosor por defecto
        const defaultLineThickness = localStorage.getItem('defaultLineThickness') || '6';
        const thicknessElement = document.getElementById('default-line-thickness');
        const thicknessValueElement = document.getElementById('thickness-value');
        if (thicknessElement) {
            thicknessElement.value = defaultLineThickness;
        }
        if (thicknessValueElement) {
            thicknessValueElement.textContent = defaultLineThickness;
        }

        // Cargar visibilidad de barra de herramientas
        const showDrawingToolbar = localStorage.getItem('showDrawingToolbar');
        const toolbarElement = document.getElementById('show-drawing-toolbar');
        if (toolbarElement) {
            toolbarElement.checked = showDrawingToolbar === 'true' || showDrawingToolbar === null; // Por defecto true
        }
    }

    loadAnimationSettings() {
        // Cargar velocidad de animación
        const animationSpeed = localStorage.getItem('animationSpeed') || '1';
        const speedElement = document.getElementById('animation-speed');
        const speedValueElement = document.getElementById('speed-value');
        if (speedElement) {
            speedElement.value = animationSpeed;
        }
        if (speedValueElement) {
            speedValueElement.textContent = `${animationSpeed}x`;
        }

        // Cargar movimientos suaves
        const smoothMovements = localStorage.getItem('smoothMovements');
        const smoothElement = document.getElementById('smooth-movements');
        if (smoothElement) {
            smoothElement.checked = smoothMovements === 'true' || smoothMovements === null; // Por defecto true
        }

        // Cargar transiciones de entrada/salida
        const fadeTransitions = localStorage.getItem('fadeTransitions');
        const fadeElement = document.getElementById('fade-transitions');
        if (fadeElement) {
            fadeElement.checked = fadeTransitions === 'true' || fadeTransitions === null; // Por defecto true
        }
    }

    loadGeneralSettings() {
        // Cargar confirmar acciones (por defecto false)
        const confirmActions = localStorage.getItem('confirmActions') === 'true';
        const confirmElement = document.getElementById('confirm-actions-toggle');
        if (confirmElement) {
            confirmElement.checked = confirmActions;
        }

        // Cargar modo compacto (por defecto false)
        const compactMode = localStorage.getItem('compactMode') === 'true';
        const compactElement = document.getElementById('compact-mode-toggle');
        if (compactElement) {
            compactElement.checked = compactMode;
        }

        // Aplicar configuraciones al cargar
        this.applyGeneralSettings();
    }

    updatePlayerCardDisplay() {
        const settings = {
            showImage: document.getElementById('show-player-image').checked,
            showName: document.getElementById('show-player-name').checked,
            showOverall: document.getElementById('show-player-overall').checked,
            showPosition: document.getElementById('show-player-position').checked,
            showJersey: document.getElementById('show-player-jersey').checked
        };

        localStorage.setItem('playerCardSettings', JSON.stringify(settings));
        
        // Aplicar cambios inmediatamente
        this.applyPlayerCardSettings(settings);
    }

    resetAllSettings() {
        if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
            // Limpiar localStorage
            localStorage.removeItem('playerCardSettings');

            // Recargar configuraciones por defecto
            this.loadCurrentSettings();
            
            // Aplicar configuraciones
            this.updatePlayerCardDisplay();

            console.log('[ConfigurationUI] Configuraciones restablecidas');
        }
    }

    // === MÉTODOS DE APLICACIÓN ===

    applyPlayerCardSettings(settings) {
        // Crear o actualizar estilos CSS para controlar la visibilidad
        this.updatePlayerCardStyles(settings);
        
        console.log('[ConfigurationUI] Configuración de tarjetas aplicada:', settings);
    }

    updatePlayerCardStyles(settings) {
        // Crear o actualizar un elemento <style> con las reglas CSS
        let styleElement = document.getElementById('player-card-visibility-styles');
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'player-card-visibility-styles';
            styleElement.type = 'text/css';
            document.head.appendChild(styleElement);
        }

        // Construir CSS con reglas que usen !important para sobreescribir otros estilos
        const cssRules = [];
        
        // Imagen del jugador
        const imageDisplay = settings.showImage ? 'block' : 'none';
        cssRules.push(`
            .player-card-element[data-element="image"],
            .minicard-player-image {
                display: ${imageDisplay} !important;
                visibility: ${settings.showImage ? 'visible' : 'hidden'} !important;
            }
        `);

        // Nombre del jugador
        const nameDisplay = settings.showName ? 'block' : 'none';
        cssRules.push(`
            .player-card-element[data-element="name"],
            .minicard-name,
            .player-name {
                display: ${nameDisplay} !important;
                visibility: ${settings.showName ? 'visible' : 'hidden'} !important;
            }
        `);

        // Overall del jugador
        const overallDisplay = settings.showOverall ? 'block' : 'none';
        cssRules.push(`
            .player-card-element[data-element="overall"],
            .minicard-overall {
                display: ${overallDisplay} !important;
                visibility: ${settings.showOverall ? 'visible' : 'hidden'} !important;
            }
        `);

        // Posición del jugador
        const positionDisplay = settings.showPosition ? 'block' : 'none';
        cssRules.push(`
            .player-card-element[data-element="position"],
            .minicard-position {
                display: ${positionDisplay} !important;
                visibility: ${settings.showPosition ? 'visible' : 'hidden'} !important;
            }
        `);

        // Número de camiseta
        const jerseyDisplay = settings.showJersey ? 'block' : 'none';
        cssRules.push(`
            .player-card-element[data-element="jersey"],
            .minicard-jersey-number {
                display: ${jerseyDisplay} !important;
                visibility: ${settings.showJersey ? 'visible' : 'hidden'} !important;
            }
        `);

        // Aplicar todas las reglas CSS
        styleElement.textContent = cssRules.join('\n');
    }

    updateTutorialButtonsVisibility() {
        const showTutorialButtons = document.getElementById('show-tutorial-buttons').checked;
        
        // Guardar configuración
        localStorage.setItem('showTutorialButtons', showTutorialButtons.toString());
        
        // Aplicar estilos inmediatamente
        this.applyTutorialButtonsStyles(showTutorialButtons);
        
        console.log('[ConfigurationUI] Visibilidad de botones de tutorial configurada:', showTutorialButtons);
    }

    applyTutorialButtonsStyles(visible) {
        const styleId = 'tutorial-buttons-config-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.type = 'text/css';
            document.head.appendChild(styleElement);
        }

        // Obtener el modo actual del modeManager
        const currentMode = window.modeManager ? window.modeManager.currentMode : 'drawing';
        
        let styles = '';
        
        if (visible) {
            // Mostrar solo el botón del modo actual
            if (currentMode === 'drawing') {
                styles = `
                    /* Mostrar solo botón de tutorial de dibujo */
                    #start-tutorial-drawing-btn {
                        display: block !important;
                        visibility: visible !important;
                    }
                    
                    /* Ocultar botón de tutorial de animación */
                    #start-tutorial-animation-btn {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    
                    /* Otros elementos de tutorial */
                    .tutorial-btn:not(#start-tutorial-animation-btn),
                    .tutorial-text {
                        display: block !important;
                        visibility: visible !important;
                    }
                `;
            } else {
                styles = `
                    /* Mostrar solo botón de tutorial de animación */
                    #start-tutorial-animation-btn {
                        display: block !important;
                        visibility: visible !important;
                    }
                    
                    /* Ocultar botón de tutorial de dibujo */
                    #start-tutorial-drawing-btn {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    
                    /* Otros elementos de tutorial */
                    .tutorial-btn:not(#start-tutorial-drawing-btn),
                    .tutorial-text {
                        display: block !important;
                        visibility: visible !important;
                    }
                `;
            }
        } else {
            // Ocultar todos los botones de tutorial
            styles = `
                #start-tutorial-drawing-btn,
                #start-tutorial-animation-btn,
                .tutorial-btn,
                .tutorial-text {
                    display: none !important;
                    visibility: hidden !important;
                }
            `;
        }
        
        styleElement.textContent = styles;
    }

    updateDrawingSettings() {
        const defaultLineColor = document.getElementById('default-line-color').value;
        const defaultLineThickness = document.getElementById('default-line-thickness').value;
        
        // Guardar configuraciones
        localStorage.setItem('defaultLineColor', defaultLineColor);
        localStorage.setItem('defaultLineThickness', defaultLineThickness);
        
        // Aplicar inmediatamente al drawingManager si existe
        if (window.drawingManager) {
            window.drawingManager.lineProperties.color = defaultLineColor;
            window.drawingManager.lineProperties.width = parseInt(defaultLineThickness);
            window.drawingManager.applyContextProperties();
        }
        
        // También actualizar los controles de la interfaz principal Y disparar sus eventos
        const mainColorPicker = document.getElementById('line-color-picker');
        const mainWidthPicker = document.getElementById('line-width-picker');
        
        if (mainColorPicker) {
            mainColorPicker.value = defaultLineColor;
            // Disparar el evento 'input' para que main.js se entere del cambio
            mainColorPicker.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (mainWidthPicker) {
            mainWidthPicker.value = defaultLineThickness;
            // Disparar el evento 'input' para que main.js se entere del cambio
            mainWidthPicker.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        console.log('[ConfigurationUI] Configuración de dibujo actualizada:', { defaultLineColor, defaultLineThickness });
    }

    updateDrawingToolbarVisibility() {
        const showDrawingToolbar = document.getElementById('show-drawing-toolbar').checked;
        
        // Guardar configuración
        localStorage.setItem('showDrawingToolbar', showDrawingToolbar.toString());
        
        // Aplicar estilos inmediatamente
        this.applyDrawingToolbarStyles(showDrawingToolbar);
        
        console.log('[ConfigurationUI] Visibilidad de barra de herramientas de dibujo configurada:', showDrawingToolbar);
    }

    applyDrawingToolbarStyles(visible) {
        const styleId = 'drawing-toolbar-config-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.type = 'text/css';
            document.head.appendChild(styleElement);
        }

        const displayValue = visible ? 'flex' : 'none';
        
        const styles = `
            /* Barra de herramientas de dibujo */
            #drawing-mode-controls {
                display: ${displayValue} !important;
                visibility: ${visible ? 'visible' : 'hidden'} !important;
            }
            
            /* Elementos específicos de la barra de dibujo */
            #undo-line,
            #redo-line,
            #line-color-picker,
            #line-width-picker,
            #delete-line-mode,
            #clear-lines {
                display: ${visible ? 'inline-block' : 'none'} !important;
                visibility: ${visible ? 'visible' : 'hidden'} !important;
            }
        `;
        
        styleElement.textContent = styles;
    }

    updateAnimationSettings() {
        const animationSpeed = document.getElementById('animation-speed').value;
        const smoothMovements = document.getElementById('smooth-movements').checked;
        const fadeTransitions = document.getElementById('fade-transitions').checked;
        
        // Actualizar el display del valor de velocidad
        const speedValueElement = document.getElementById('speed-value');
        if (speedValueElement) {
            speedValueElement.textContent = `${animationSpeed}x`;
        }
        
        // Guardar configuraciones
        localStorage.setItem('animationSpeed', animationSpeed);
        localStorage.setItem('smoothMovements', smoothMovements.toString());
        localStorage.setItem('fadeTransitions', fadeTransitions.toString());
        
        // Aplicar inmediatamente las configuraciones
        this.applyAnimationSettings(animationSpeed, smoothMovements, fadeTransitions);
        
        console.log('[ConfigurationUI] Configuración de animación actualizada:', { 
            animationSpeed, smoothMovements, fadeTransitions 
        });
    }

    applyAnimationSettings(speed, smoothMovements, fadeTransitions) {
        // ⚠️ CRÍTICO: No modificar el speedInput del animationManager directamente
        // ya que puede interferir con la funcionalidad existente.
        // En su lugar, creamos un input temporal que el animationManager pueda leer
        
        // Crear o actualizar un input oculto para que animationManager lo lea
        let hiddenSpeedInput = document.getElementById('animation-speed-hidden');
        if (!hiddenSpeedInput) {
            hiddenSpeedInput = document.createElement('input');
            hiddenSpeedInput.type = 'hidden';
            hiddenSpeedInput.id = 'animation-speed-hidden';
            document.body.appendChild(hiddenSpeedInput);
        }
        hiddenSpeedInput.value = speed;
        
        // Actualizar la referencia del animationManager si existe
        if (window.animationManager) {
            // Solo reemplazar la referencia si no existe o es diferente
            if (!window.animationManager.speedInput || 
                window.animationManager.speedInput.id !== 'animation-speed-hidden') {
                window.animationManager.speedInput = hiddenSpeedInput;
            }
        }
        
        // Aplicar estilos CSS para movimientos suaves y transiciones
        this.applyAnimationStylesCSS(smoothMovements, fadeTransitions);
    }

    applyAnimationStylesCSS(smoothMovements, fadeTransitions) {
        const styleId = 'animation-config-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.type = 'text/css';
            document.head.appendChild(styleElement);
        }

        const smoothTransition = smoothMovements ? 'ease-in-out' : 'linear';
        const fadeOpacity = fadeTransitions ? '0.8' : '1';
        
        const styles = `
            /* Configuración de movimientos suaves */
            .player-card {
                transition: ${smoothMovements ? 'all 0.3s ease-in-out' : 'none'} !important;
            }
            
            .player-card.moving {
                transition: ${smoothMovements ? 'transform 0.5s ' + smoothTransition : 'none'} !important;
            }
            
            /* Configuración de transiciones de entrada/salida */
            .player-card.fade-in {
                opacity: ${fadeOpacity} !important;
                transition: ${fadeTransitions ? 'opacity 0.4s ease-in' : 'none'} !important;
            }
            
            .player-card.fade-out {
                opacity: ${fadeTransitions ? '0.3' : '1'} !important;
                transition: ${fadeTransitions ? 'opacity 0.4s ease-out' : 'none'} !important;
            }
        `;
        
        styleElement.textContent = styles;
    }

    updateGeneralSettings() {
        const confirmActions = document.getElementById('confirm-actions-toggle').checked;
        const compactMode = document.getElementById('compact-mode-toggle').checked;
        
        // Guardar configuraciones
        localStorage.setItem('confirmActions', confirmActions.toString());
        localStorage.setItem('compactMode', compactMode.toString());
        
        // Aplicar inmediatamente las configuraciones
        this.applyGeneralSettings();
        
        console.log('[ConfigurationUI] Configuración general actualizada:', { 
            confirmActions, compactMode 
        });
    }

    applyGeneralSettings() {
        const confirmActions = localStorage.getItem('confirmActions') === 'true';
        const compactMode = localStorage.getItem('compactMode') === 'true';
        
        // Aplicar configuración de confirmación de acciones
        this.setupActionConfirmations(confirmActions);
        
        // Aplicar configuración de modo compacto
        this.applyCompactMode(compactMode);
    }

    setupActionConfirmations(enabled) {
        // Almacenar el estado globalmente para acceso desde otras funciones
        window.configurationSettings = window.configurationSettings || {};
        window.configurationSettings.confirmActions = enabled;
        
        // Las confirmaciones se manejarán cuando se ejecuten las acciones críticas
        // mediante la función de utilidad confirmCriticalAction()
    }

    applyCompactMode(enabled) {
        const styleId = 'compact-mode-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.type = 'text/css';
            document.head.appendChild(styleElement);
        }

        const styles = enabled ? `
            /* Modo compacto activado - ocultar separadores verticales */
            .vertical-separator {
                display: none !important;
            }
            
            #drawing-separator-1,
            #animation-separator-1 {
                display: none !important;
            }
            
            /* Ajustar márgenes para aprovechar el espacio */
            .container-fluid {
                padding-left: 5px !important;
                padding-right: 5px !important;
            }
            
            .btn-group {
                margin-right: 2px !important;
            }
        ` : `
            /* Modo compacto desactivado - mostrar separadores */
            .vertical-separator {
                display: block !important;
            }
            
            #drawing-separator-1,
            #animation-separator-1 {
                display: block !important;
            }
        `;
        
        styleElement.textContent = styles;
    }

    // === INTERFAZ PÚBLICA ===

    openConfigurationModal() {
        this.createConfigurationModal();
        const modal = new bootstrap.Modal(document.getElementById('configuration-modal'));
        modal.show();
    }

    // Método público para aplicar configuraciones guardadas al inicializar
    applySavedSettings() {
        // Cargar y aplicar configuraciones de tarjetas de jugador
        const playerCardSettings = JSON.parse(localStorage.getItem('playerCardSettings')) || {
            showImage: true,
            showName: true,
            showOverall: true,
            showPosition: true,
            showJersey: true
        };
        this.applyPlayerCardSettings(playerCardSettings);

        // Cargar y aplicar configuraciones de botones de tutorial
        const showTutorialButtons = localStorage.getItem('showTutorialButtons');
        if (showTutorialButtons !== null) {
            const visible = showTutorialButtons === 'true';
            this.applyTutorialButtonsStyles(visible);
        } else {
            // Por defecto, mostrar botones de tutorial
            this.applyTutorialButtonsStyles(true);
        }

        // Cargar y aplicar configuraciones de dibujo
        const defaultLineColor = localStorage.getItem('defaultLineColor') || '#ffff00';
        const defaultLineThickness = localStorage.getItem('defaultLineThickness') || '6';
        
        // Aplicar al drawingManager si existe
        if (window.drawingManager) {
            window.drawingManager.lineProperties.color = defaultLineColor;
            window.drawingManager.lineProperties.width = parseInt(defaultLineThickness);
            window.drawingManager.applyContextProperties();
        }
        
        // Aplicar a los controles principales Y disparar eventos
        const mainColorPicker = document.getElementById('line-color-picker');
        const mainWidthPicker = document.getElementById('line-width-picker');
        
        if (mainColorPicker) {
            mainColorPicker.value = defaultLineColor;
            // Disparar el evento 'input' para que main.js se entere del cambio
            mainColorPicker.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (mainWidthPicker) {
            mainWidthPicker.value = defaultLineThickness;
            // Disparar el evento 'input' para que main.js se entere del cambio
            mainWidthPicker.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Cargar y aplicar visibilidad de barra de herramientas de dibujo
        const showDrawingToolbar = localStorage.getItem('showDrawingToolbar');
        if (showDrawingToolbar !== null) {
            const visible = showDrawingToolbar === 'true';
            this.applyDrawingToolbarStyles(visible);
        } else {
            // Por defecto, mostrar barra de herramientas
            this.applyDrawingToolbarStyles(true);
        }

        // Cargar y aplicar configuraciones de animación
        const animationSpeed = localStorage.getItem('animationSpeed') || '1';
        const smoothMovements = localStorage.getItem('smoothMovements');
        const fadeTransitions = localStorage.getItem('fadeTransitions');
        
        const smooth = smoothMovements === 'true' || smoothMovements === null; // Por defecto true
        const fade = fadeTransitions === 'true' || fadeTransitions === null; // Por defecto true
        
        this.applyAnimationSettings(animationSpeed, smooth, fade);

        // Cargar y aplicar configuraciones generales
        this.applyGeneralSettings();

        console.log('[ConfigurationUI] Configuraciones guardadas aplicadas');
    }

    handleConfigurationChange(event) {
        // Manejar cambios de configuración desde otros componentes
        console.log('[ConfigurationUI] Configuración cambiada:', event.detail);
    }

    handleModeChange(event) {
        // Cuando cambia el modo, actualizar qué botones de tutorial se muestran
        console.log('[ConfigurationUI] Modo cambiado:', event.detail);
        
        // Solo actualizar si los botones de tutorial están habilitados
        const showTutorialButtons = localStorage.getItem('showTutorialButtons');
        if (showTutorialButtons === 'true' || showTutorialButtons === null) {
            this.applyTutorialButtonsStyles(true);
        }
    }
}

// === FUNCIÓN DE UTILIDAD GLOBAL PARA CONFIRMACIONES ===

/**
 * Función de utilidad para confirmar acciones críticas
 * @param {string} message - Mensaje de confirmación a mostrar
 * @param {string} actionType - Tipo de acción (opcional, para logging)
 * @returns {boolean} - true si el usuario confirma, false si cancela
 */
function confirmCriticalAction(message, actionType = '') {
    // Verificar si las confirmaciones están habilitadas
    const confirmationsEnabled = window.configurationSettings?.confirmActions || false;
    
    if (!confirmationsEnabled) {
        return true; // Si las confirmaciones están deshabilitadas, proceder siempre
    }
    
    const confirmed = confirm(message);
    
    if (actionType) {
        console.log(`[ConfirmActions] ${actionType} - Usuario ${confirmed ? 'confirmó' : 'canceló'} la acción`);
    }
    
    return confirmed;
}

// Hacer disponible globalmente para debugging
window.configurationUI = null;
window.confirmCriticalAction = confirmCriticalAction;
