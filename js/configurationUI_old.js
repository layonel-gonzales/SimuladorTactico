// configurationUI.js
// Interfaz de configuración completa del simulador

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
                            <input class="form-check-input" type="checkbox" id="show-player-photo" checked>
                            <label class="form-check-label" for="show-player-photo">
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
                            <input class="form-check-input" type="checkbox" id="show-player-team" checked>
                            <label class="form-check-label" for="show-player-team">
                                <i class="fas fa-shield-alt me-1"></i>Equipo
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

    createPlayerFiltersPanel() {
        return `
            <div class="tab-pane fade show active" id="player-filters-panel" role="tabpanel">
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-filter me-2"></i>Filtros de Jugadores
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="position-filter" class="form-label">Posición</label>
                                    <select class="form-select" id="position-filter">
                                        <option value="">Todas las posiciones</option>
                                        <option value="GK">Portero (GK)</option>
                                        <option value="DEF">Defensa (DEF)</option>
                                        <option value="MID">Centrocampista (MID)</option>
                                        <option value="ATT">Delantero (ATT)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="team-filter" class="form-label">Equipo</label>
                                    <select class="form-select" id="team-filter">
                                        <option value="">Todos los equipos</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="overall-range" class="form-label">Overall mínimo: <span id="overall-value">50</span></label>
                                    <input type="range" class="form-range" id="overall-range" min="40" max="99" value="50">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-search me-2"></i>Búsqueda
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="player-search" class="form-label">Buscar jugador</label>
                                    <input type="text" class="form-control" id="player-search" placeholder="Nombre del jugador...">
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="include-custom-players" checked>
                                    <label class="form-check-label" for="include-custom-players">
                                        Incluir jugadores personalizados
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createTeamsManagementPanel() {
        return `
            <div class="tab-pane fade" id="teams-management-panel" role="tabpanel">
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-plus me-2"></i>Crear Equipo
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="team-name" class="form-label">Nombre del equipo</label>
                                    <input type="text" class="form-control" id="team-name" placeholder="Mi Equipo">
                                </div>
                                <div class="mb-3">
                                    <label for="team-formation" class="form-label">Formación</label>
                                    <select class="form-select" id="team-formation">
                                        <option value="4-4-2">4-4-2</option>
                                        <option value="4-3-3">4-3-3</option>
                                        <option value="3-5-2">3-5-2</option>
                                        <option value="5-3-2">5-3-2</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" id="create-team-btn">
                                    <i class="fas fa-plus me-1"></i>Crear Equipo
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-list me-2"></i>Equipos Guardados
                                </h6>
                            </div>
                            <div class="card-body">
                                <div id="saved-teams-list">
                                    <p class="text-muted">No hay equipos guardados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createInterfaceSettingsPanel() {
        return `
            <div class="tab-pane fade" id="interface-settings-panel" role="tabpanel">
                <div class="row g-4">
                    <!-- Configuraciones de visualización -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-eye me-2"></i>Visualización de Jugadores
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="show-player-overalls" checked>
                                    <label class="form-check-label" for="show-player-overalls">
                                        Mostrar Overall de jugadores
                                    </label>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="show-player-photos" checked>
                                    <label class="form-check-label" for="show-player-photos">
                                        Mostrar fotos de jugadores
                                    </label>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="compact-player-list">
                                    <label class="form-check-label" for="compact-player-list">
                                        Lista compacta de jugadores
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Configuraciones de animación -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-play me-2"></i>Animaciones
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="animation-speed" class="form-label">Velocidad por defecto</label>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="range" class="form-range" id="animation-speed" min="0.5" max="2.0" step="0.1" value="1.0">
                                        <span class="badge bg-primary" id="speed-value">1.0x</span>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="show-animation-trails" checked>
                                    <label class="form-check-label" for="show-animation-trails">
                                        Mostrar estelas en animaciones
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Configuraciones generales -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-cog me-2"></i>General
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="auto-save" checked>
                                    <label class="form-check-label" for="auto-save">
                                        Guardar automáticamente
                                    </label>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="show-tutorial-hints" checked>
                                    <label class="form-check-label" for="show-tutorial-hints">
                                        Mostrar consejos del tutorial
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Información del sistema -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-info-circle me-2"></i>Información
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <strong>Versión:</strong> 2.1.0
                                </div>
                                <div class="mb-2">
                                    <strong>Jugadores disponibles:</strong> <span id="available-players-count">0</span>
                                </div>
                                <div class="mb-2">
                                    <strong>Jugadores personalizados:</strong> <span id="custom-players-count">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createBackupSettingsPanel() {
        return `
            <div class="tab-pane fade" id="backup-settings-panel" role="tabpanel">
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-download me-2"></i>Exportar Datos
                                </h6>
                            </div>
                            <div class="card-body">
                                <p>Descarga una copia de seguridad de tus datos.</p>
                                <button class="btn btn-success mb-2 w-100" id="export-all-btn">
                                    <i class="fas fa-download me-1"></i>Exportar Todo
                                </button>
                                <button class="btn btn-outline-success mb-2 w-100" id="export-custom-players-btn">
                                    <i class="fas fa-users me-1"></i>Solo Jugadores Personalizados
                                </button>
                                <button class="btn btn-outline-success w-100" id="export-settings-btn">
                                    <i class="fas fa-cogs me-1"></i>Solo Configuración
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-upload me-2"></i>Importar Datos
                                </h6>
                            </div>
                            <div class="card-body">
                                <p>Restaura datos desde un archivo de respaldo.</p>
                                <input type="file" class="form-control mb-3" id="import-file" accept=".json">
                                <button class="btn btn-primary w-100" id="import-data-btn">
                                    <i class="fas fa-upload me-1"></i>Importar Archivo
                                </button>
                                <div class="alert alert-warning mt-3">
                                    <small><i class="fas fa-exclamation-triangle me-1"></i>
                                    La importación sobrescribirá los datos actuales.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // === EVENT HANDLERS ===

    setupModalEventListeners() {
        // Event listeners se configurarán aquí
        const modal = document.getElementById('configuration-modal');
        
        modal.addEventListener('shown.bs.modal', () => {
            this.refreshAllPanels();
        });

        // Configurar todos los event listeners de los controles
        this.setupPlayerFilterListeners();
        this.setupTeamManagementListeners();
        this.setupInterfaceListeners();
        this.setupBackupListeners();
    }

    setupPlayerFilterListeners() {
        // Los event listeners específicos se implementarán aquí
    }

    setupTeamManagementListeners() {
        // Los event listeners específicos se implementarán aquí
    }

    setupInterfaceListeners() {
        // Los event listeners específicos se implementarán aquí
    }

    setupBackupListeners() {
        // Los event listeners específicos se implementarán aquí
    }

    // === MÉTODOS AUXILIARES ===

    openConfigurationModal() {
        this.createConfigurationModal();
        const modal = new bootstrap.Modal(document.getElementById('configuration-modal'));
        modal.show();
    }

    refreshAllPanels() {
        // Actualizar todos los paneles cuando se abra el modal
        this.updatePlayerFilters();
        this.updateTeamsList();
        this.updateInterfaceSettings();
        this.updateSystemInfo();
    }

    updatePlayerFilters() {
        // Actualizar filtros de jugadores
    }

    updateTeamsList() {
        // Actualizar lista de equipos
    }

    updateInterfaceSettings() {
        // Actualizar configuraciones de interfaz
    }

    updateSystemInfo() {
        // Actualizar información del sistema
        const availableCount = document.getElementById('available-players-count');
        const customCount = document.getElementById('custom-players-count');
        
        if (availableCount) {
            availableCount.textContent = this.playerManager?.getAllPlayers()?.length || 0;
        }
        
        if (customCount) {
            customCount.textContent = this.customPlayersManager?.getAllPlayers()?.length || 0;
        }
    }

    handleConfigurationChange(e) {
        // Manejar cambios en la configuración
        console.log('[ConfigurationUI] Configuración cambiada:', e.detail.key, '=', e.detail.value);
    }

    // === UTILIDADES ===

    showNotification(message, type = 'info') {
        // Mostrar notificación
        console.log(`[ConfigurationUI] ${type.toUpperCase()}: ${message}`);
    }
}

// Hacer disponible globalmente para debugging
window.configurationUI = null;
