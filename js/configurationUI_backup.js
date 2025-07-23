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
        console.log('[ConfigurationUI] Inicializado correctamente');
    }

    init() {
        this.setupEventListeners();
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
                            Controla la visibilidad y comportamiento de los tutoriales
                        </p>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="auto-show-tutorial" checked>
                            <label class="form-check-label" for="auto-show-tutorial">
                                <i class="fas fa-magic me-1"></i>Mostrar tutorial automáticamente
                            </label>
                            <small class="form-text text-muted d-block mt-1">
                                Se mostrará al cargar la aplicación
                            </small>
                        </div>
                        
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="show-tutorial-buttons" checked>
                            <label class="form-check-label" for="show-tutorial-buttons">
                                <i class="fas fa-hand-pointer me-1"></i>Mostrar botones de tutorial
                            </label>
                            <small class="form-text text-muted d-block mt-1">
                                Botones de ayuda en la interfaz
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
                            <input type="color" class="form-control form-control-color" id="default-line-color" value="#FF0000">
                        </div>
                        
                        <div class="mb-3">
                            <label for="default-line-thickness" class="form-label">
                                <i class="fas fa-ruler me-1"></i>Grosor por defecto
                            </label>
                            <input type="range" class="form-range" id="default-line-thickness" min="1" max="10" value="3">
                            <small class="form-text text-muted">Valor: <span id="thickness-value">3</span>px</small>
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
                            <select class="form-select" id="animation-speed">
                                <option value="slow">Lenta</option>
                                <option value="normal" selected>Normal</option>
                                <option value="fast">Rápida</option>
                                <option value="disabled">Deshabilitada</option>
                            </select>
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
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="show-tooltips" checked>
                            <label class="form-check-label" for="show-tooltips">
                                <i class="fas fa-question-circle me-1"></i>Mostrar tooltips
                            </label>
                        </div>
                        
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="confirm-actions" checked>
                            <label class="form-check-label" for="confirm-actions">
                                <i class="fas fa-exclamation-triangle me-1"></i>Confirmar acciones
                            </label>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="compact-mode">
                            <label class="form-check-label" for="compact-mode">
                                <i class="fas fa-compress me-1"></i>Modo compacto
                            </label>
                        </div>
                        
                        <div class="mb-2">
                            <label for="interface-language" class="form-label">
                                <i class="fas fa-language me-1"></i>Idioma
                            </label>
                            <select class="form-select form-select-sm" id="interface-language">
                                <option value="es" selected>Español</option>
                                <option value="en">English</option>
                                <option value="pt">Português</option>
                            </select>
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
        this.setupThemeListeners();
        
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
        // Checkbox de auto-mostrar tutorial
        const autoShowTutorial = document.getElementById('auto-show-tutorial');
        if (autoShowTutorial) {
            autoShowTutorial.addEventListener('change', () => {
                this.updateTutorialSettings();
            });
        }

        // Checkbox de mostrar botones de tutorial
        const showTutorialButtons = document.getElementById('show-tutorial-buttons');
        if (showTutorialButtons) {
            showTutorialButtons.addEventListener('change', () => {
                this.updateTutorialButtons();
            });
        }
    }

    setupDrawingListeners() {
        // Color por defecto
        const colorPicker = document.getElementById('default-line-color');
        if (colorPicker) {
            colorPicker.addEventListener('change', () => {
                this.updateDrawingDefaults();
            });
        }

        // Grosor por defecto
        const thicknessSlider = document.getElementById('default-line-thickness');
        const thicknessValue = document.getElementById('thickness-value');
        if (thicknessSlider) {
            thicknessSlider.addEventListener('input', (e) => {
                if (thicknessValue) {
                    thicknessValue.textContent = e.target.value;
                }
                this.updateDrawingDefaults();
            });
        }

        // Mostrar barra de herramientas
        const showToolbar = document.getElementById('show-drawing-toolbar');
        if (showToolbar) {
            showToolbar.addEventListener('change', () => {
                this.updateDrawingToolbar();
            });
        }
    }

    setupAnimationListeners() {
        // Velocidad de animación
        const animationSpeed = document.getElementById('animation-speed');
        if (animationSpeed) {
            animationSpeed.addEventListener('change', () => {
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
        // Tooltips
        const showTooltips = document.getElementById('show-tooltips');
        if (showTooltips) {
            showTooltips.addEventListener('change', () => {
                this.updateGeneralSettings();
            });
        }

        // Confirmar acciones
        const confirmActions = document.getElementById('confirm-actions');
        if (confirmActions) {
            confirmActions.addEventListener('change', () => {
                this.updateGeneralSettings();
            });
        }

        // Modo compacto
        const compactMode = document.getElementById('compact-mode');
        if (compactMode) {
            compactMode.addEventListener('change', () => {
                this.updateGeneralSettings();
            });
        }

        // Idioma
        const language = document.getElementById('interface-language');
        if (language) {
            language.addEventListener('change', () => {
                this.updateLanguage();
            });
        }
    }

    setupThemeListeners() {
        // Modo de tema
        const themeRadios = document.querySelectorAll('input[name="theme-mode"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateThemeSettings();
            });
        });

        // Color de acento
        const accentColor = document.getElementById('accent-color');
        if (accentColor) {
            accentColor.addEventListener('change', () => {
                this.updateThemeSettings();
            });
        }

        // Alto contraste
        const highContrast = document.getElementById('high-contrast');
        if (highContrast) {
            highContrast.addEventListener('change', () => {
                this.updateThemeSettings();
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
        this.loadThemeSettings();
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
        const settings = JSON.parse(localStorage.getItem('tutorialSettings')) || {
            autoShow: true,
            showButtons: true
        };

        document.getElementById('auto-show-tutorial').checked = settings.autoShow;
        document.getElementById('show-tutorial-buttons').checked = settings.showButtons;
    }

    loadDrawingSettings() {
        const settings = JSON.parse(localStorage.getItem('drawingSettings')) || {
            defaultColor: '#FF0000',
            defaultThickness: 3,
            showToolbar: true
        };

        document.getElementById('default-line-color').value = settings.defaultColor;
        document.getElementById('default-line-thickness').value = settings.defaultThickness;
        document.getElementById('thickness-value').textContent = settings.defaultThickness;
        document.getElementById('show-drawing-toolbar').checked = settings.showToolbar;
    }

    loadAnimationSettings() {
        const settings = JSON.parse(localStorage.getItem('animationSettings')) || {
            speed: 'normal',
            smoothMovements: true,
            fadeTransitions: true
        };

        document.getElementById('animation-speed').value = settings.speed;
        document.getElementById('smooth-movements').checked = settings.smoothMovements;
        document.getElementById('fade-transitions').checked = settings.fadeTransitions;
    }

    loadGeneralSettings() {
        const settings = JSON.parse(localStorage.getItem('generalSettings')) || {
            showTooltips: true,
            confirmActions: true,
            compactMode: false,
            language: 'es'
        };

        document.getElementById('show-tooltips').checked = settings.showTooltips;
        document.getElementById('confirm-actions').checked = settings.confirmActions;
        document.getElementById('compact-mode').checked = settings.compactMode;
        document.getElementById('interface-language').value = settings.language;
    }

    loadThemeSettings() {
        const settings = JSON.parse(localStorage.getItem('themeSettings')) || {
            mode: 'auto',
            accentColor: '#0d6efd',
            highContrast: false
        };

        document.getElementById('theme-' + settings.mode).checked = true;
        document.getElementById('accent-color').value = settings.accentColor;
        document.getElementById('high-contrast').checked = settings.highContrast;
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

    updateTutorialSettings() {
        const settings = {
            autoShow: document.getElementById('auto-show-tutorial').checked,
            showButtons: document.getElementById('show-tutorial-buttons').checked
        };

        localStorage.setItem('tutorialSettings', JSON.stringify(settings));
        this.applyTutorialSettings(settings);
    }

    updateTutorialButtons() {
        const showButtons = document.getElementById('show-tutorial-buttons').checked;
        
        // Mostrar/ocultar botones de tutorial
        const tutorialButtons = document.querySelectorAll('.tutorial-btn, #tutorial-btn, #help-btn');
        tutorialButtons.forEach(btn => {
            btn.style.display = showButtons ? 'block' : 'none';
        });
    }

    updateDrawingDefaults() {
        const settings = {
            defaultColor: document.getElementById('default-line-color').value,
            defaultThickness: document.getElementById('default-line-thickness').value,
            showToolbar: document.getElementById('show-drawing-toolbar').checked
        };

        localStorage.setItem('drawingSettings', JSON.stringify(settings));
        this.applyDrawingSettings(settings);
    }

    updateDrawingToolbar() {
        const showToolbar = document.getElementById('show-drawing-toolbar').checked;
        
        // Mostrar/ocultar barra de herramientas de dibujo
        const toolbar = document.querySelector('.drawing-toolbar, #drawing-controls');
        if (toolbar) {
            toolbar.style.display = showToolbar ? 'block' : 'none';
        }
    }

    updateAnimationSettings() {
        const settings = {
            speed: document.getElementById('animation-speed').value,
            smoothMovements: document.getElementById('smooth-movements').checked,
            fadeTransitions: document.getElementById('fade-transitions').checked
        };

        localStorage.setItem('animationSettings', JSON.stringify(settings));
        this.applyAnimationSettings(settings);
    }

    updateGeneralSettings() {
        const settings = {
            showTooltips: document.getElementById('show-tooltips').checked,
            confirmActions: document.getElementById('confirm-actions').checked,
            compactMode: document.getElementById('compact-mode').checked,
            language: document.getElementById('interface-language').value
        };

        localStorage.setItem('generalSettings', JSON.stringify(settings));
        this.applyGeneralSettings(settings);
    }

    updateLanguage() {
        const language = document.getElementById('interface-language').value;
        // Implementar cambio de idioma
        console.log('Cambiar idioma a:', language);
    }

    updateThemeSettings() {
        const mode = document.querySelector('input[name="theme-mode"]:checked')?.id?.replace('theme-', '') || 'auto';
        const settings = {
            mode: mode,
            accentColor: document.getElementById('accent-color').value,
            highContrast: document.getElementById('high-contrast').checked
        };

        localStorage.setItem('themeSettings', JSON.stringify(settings));
        this.applyThemeSettings(settings);
    }

    // === MÉTODOS DE APLICACIÓN ===

    applyPlayerCardSettings(settings) {
        // Crear o actualizar estilos CSS para controlar la visibilidad
        this.updatePlayerCardStyles(settings);
        
        // También aplicar directamente a elementos existentes por compatibilidad
        this.updateExistingPlayerCards(settings);
        
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
        if (!settings.showImage) {
            cssRules.push(`
                .player-card-element[data-element="image"],
                .minicard-player-image {
                    display: none !important;
                    visibility: hidden !important;
                }
            `);
        } else {
            cssRules.push(`
                .player-card-element[data-element="image"],
                .minicard-player-image {
                    display: block !important;
                    visibility: visible !important;
                }
            `);
        }

        // Nombre del jugador
        if (!settings.showName) {
            cssRules.push(`
                .player-card-element[data-element="name"],
                .minicard-name,
                .player-name {
                    display: none !important;
                    visibility: hidden !important;
                }
            `);
        } else {
            cssRules.push(`
                .player-card-element[data-element="name"],
                .minicard-name,
                .player-name {
                    display: block !important;
                    visibility: visible !important;
                }
            `);
        }

        // Overall del jugador
        if (!settings.showOverall) {
            cssRules.push(`
                .player-card-element[data-element="overall"],
                .minicard-overall {
                    display: none !important;
                    visibility: hidden !important;
                }
            `);
        } else {
            cssRules.push(`
                .player-card-element[data-element="overall"],
                .minicard-overall {
                    display: block !important;
                    visibility: visible !important;
                }
            `);
        }

        // Posición del jugador
        if (!settings.showPosition) {
            cssRules.push(`
                .player-card-element[data-element="position"],
                .minicard-position {
                    display: none !important;
                    visibility: hidden !important;
                }
            `);
        } else {
            cssRules.push(`
                .player-card-element[data-element="position"],
                .minicard-position {
                    display: block !important;
                    visibility: visible !important;
                }
            `);
        }

        // Número de camiseta
        if (!settings.showJersey) {
            cssRules.push(`
                .player-card-element[data-element="jersey"],
                .minicard-jersey-number {
                    display: none !important;
                    visibility: hidden !important;
                }
            `);
        } else {
            cssRules.push(`
                .player-card-element[data-element="jersey"],
                .minicard-jersey-number {
                    display: block !important;
                    visibility: visible !important;
                }
            `);
        }

        // Aplicar todas las reglas CSS
        styleElement.textContent = cssRules.join('\n');
    }

    updateExistingPlayerCards(settings) {
        // Buscar todas las tarjetas de jugador existentes usando múltiples selectores
        const selectors = [
            '.player-token',           // Tokens en el campo
            '.squad-player-item',      // Items en la lista de plantilla
            '.custom-player-card'      // Tarjetas personalizadas
        ];

        selectors.forEach(selector => {
            const cards = document.querySelectorAll(selector);
            cards.forEach(card => this.updateCardElements(card, settings));
        });

        // También buscar elementos específicos por data-element
        const elementTypes = [
            { setting: 'showImage', selector: '[data-element="image"]' },
            { setting: 'showName', selector: '[data-element="name"]' },
            { setting: 'showOverall', selector: '[data-element="overall"]' },
            { setting: 'showPosition', selector: '[data-element="position"]' },
            { setting: 'showJersey', selector: '[data-element="jersey"]' }
        ];

        elementTypes.forEach(({ setting, selector }) => {
            const elements = document.querySelectorAll(selector);
            const shouldShow = settings[setting];
            
            elements.forEach(element => {
                if (shouldShow) {
                    element.style.setProperty('display', 'block', 'important');
                    element.style.setProperty('visibility', 'visible', 'important');
                } else {
                    element.style.setProperty('display', 'none', 'important');
                    element.style.setProperty('visibility', 'hidden', 'important');
                }
            });
        });
    }

    updateCardElements(card, settings) {
        // Actualizar elementos específicos dentro de una tarjeta
        const elementMappings = [
            { setting: 'showImage', classes: ['.minicard-player-image', '.player-image', '[data-element="image"]'] },
            { setting: 'showName', classes: ['.minicard-name', '.player-name', '[data-element="name"]'] },
            { setting: 'showOverall', classes: ['.minicard-overall', '.player-overall', '[data-element="overall"]'] },
            { setting: 'showPosition', classes: ['.minicard-position', '.player-position', '[data-element="position"]'] },
            { setting: 'showJersey', classes: ['.minicard-jersey-number', '.player-jersey', '[data-element="jersey"]'] }
        ];

        elementMappings.forEach(({ setting, classes }) => {
            const shouldShow = settings[setting];
            
            classes.forEach(className => {
                const elements = card.querySelectorAll(className);
                elements.forEach(element => {
                    if (shouldShow) {
                        element.style.setProperty('display', 'block', 'important');
                        element.style.setProperty('visibility', 'visible', 'important');
                        element.classList.remove('d-none');
                    } else {
                        element.style.setProperty('display', 'none', 'important');
                        element.style.setProperty('visibility', 'hidden', 'important');
                        element.classList.add('d-none');
                    }
                });
            });
        });
    }

    applyTutorialSettings(settings) {
        // Aplicar configuraciones de tutorial
        if (window.tutorialManager) {
            window.tutorialManager.setAutoShow(settings.autoShow);
        }
        this.updateTutorialButtons();
    }

    applyDrawingSettings(settings) {
        // Aplicar configuraciones de dibujo
        if (window.drawingManager) {
            window.drawingManager.setDefaultColor(settings.defaultColor);
            window.drawingManager.setDefaultThickness(settings.defaultThickness);
        }
        this.updateDrawingToolbar();
    }

    applyAnimationSettings(settings) {
        // Aplicar configuraciones de animación
        if (window.animationManager) {
            window.animationManager.setSpeed(settings.speed);
            window.animationManager.setSmoothMovements(settings.smoothMovements);
            window.animationManager.setFadeTransitions(settings.fadeTransitions);
        }
    }

    applyGeneralSettings(settings) {
        // Aplicar configuraciones generales
        document.body.classList.toggle('compact-mode', settings.compactMode);
        document.body.classList.toggle('tooltips-disabled', !settings.showTooltips);
        document.body.classList.toggle('confirm-actions', settings.confirmActions);
    }

    applyThemeSettings(settings) {
        // Aplicar configuraciones de tema
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${settings.mode}`);
        
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }

        // Aplicar color de acento
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    }

    resetAllSettings() {
        if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
            // Limpiar localStorage
            localStorage.removeItem('playerCardSettings');
            localStorage.removeItem('tutorialSettings');
            localStorage.removeItem('drawingSettings');
            localStorage.removeItem('animationSettings');
            localStorage.removeItem('generalSettings');
            localStorage.removeItem('themeSettings');

            // Recargar configuraciones por defecto
            this.loadCurrentSettings();
            
            // Aplicar configuraciones
            this.updatePlayerCardDisplay();
            this.updateTutorialSettings();
            this.updateDrawingDefaults();
            this.updateAnimationSettings();
            this.updateGeneralSettings();
            this.updateThemeSettings();

            console.log('[ConfigurationUI] Configuraciones restablecidas');
        }
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

        // Cargar y aplicar configuraciones de tutorial
        const tutorialSettings = JSON.parse(localStorage.getItem('tutorialSettings')) || {
            autoShow: true,
            showButtons: true
        };
        this.applyTutorialSettings(tutorialSettings);

        // Cargar y aplicar configuraciones de dibujo
        const drawingSettings = JSON.parse(localStorage.getItem('drawingSettings')) || {
            defaultColor: '#FF0000',
            defaultThickness: 3,
            showToolbar: true
        };
        this.applyDrawingSettings(drawingSettings);

        // Cargar y aplicar configuraciones de animación
        const animationSettings = JSON.parse(localStorage.getItem('animationSettings')) || {
            speed: 'normal',
            smoothMovements: true,
            fadeTransitions: true
        };
        this.applyAnimationSettings(animationSettings);

        // Cargar y aplicar configuraciones generales
        const generalSettings = JSON.parse(localStorage.getItem('generalSettings')) || {
            showTooltips: true,
            confirmActions: true,
            compactMode: false,
            language: 'es'
        };
        this.applyGeneralSettings(generalSettings);

        // Cargar y aplicar configuraciones de tema
        const themeSettings = JSON.parse(localStorage.getItem('themeSettings')) || {
            mode: 'auto',
            accentColor: '#0d6efd',
            highContrast: false
        };
        this.applyThemeSettings(themeSettings);

        console.log('[ConfigurationUI] Configuraciones guardadas aplicadas');
    }

    handleConfigurationChange(event) {
        // Manejar cambios de configuración desde otros componentes
        console.log('[ConfigurationUI] Configuración cambiada:', event.detail);
    }
}

// Hacer disponible globalmente para debugging
window.configurationUI = null;
