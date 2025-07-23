// configurationUI.js
// Interfaz de usuario para el módulo de configuración

export default class ConfigurationUI {
    constructor(configurationManager, customPlayersManager, playerManager) {
        this.configurationManager = configurationManager;
        this.customPlayersManager = customPlayersManager;
        this.playerManager = playerManager;
        this.currentEditingTeam = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateFilterControls();
        console.log('[ConfigurationUI] Inicializado correctamente');
    }

    setupEventListeners() {
        // Escuchar cambios de configuración
        document.addEventListener('settingsChanged', (e) => {
            this.handleSettingChanged(e.detail);
        });

        // Event listeners para los modales y controles se configurarán cuando se abran
    }

    // === INTERFAZ PRINCIPAL ===

    createConfigurationModal() {
        const modalHtml = `
            <!-- Modal de Configuración -->
            <div class="modal fade custom-z-index-modal" id="configuration-modal" style="z-index: 9999;" tabindex="-1" aria-labelledby="configurationModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="configurationModalLabel">
                                <i class="fas fa-cogs me-2"></i>Configuración del Simulador
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Tabs de navegación -->
                            <ul class="nav nav-tabs mb-4" id="configurationTabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="player-filters-tab" data-bs-toggle="tab" data-bs-target="#player-filters-panel" type="button" role="tab">
                                        <i class="fas fa-filter me-1"></i>Filtros de Jugadores
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="teams-management-tab" data-bs-toggle="tab" data-bs-target="#teams-management-panel" type="button" role="tab">
                                        <i class="fas fa-shield-alt me-1"></i>Gestión de Equipos
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="interface-settings-tab" data-bs-toggle="tab" data-bs-target="#interface-settings-panel" type="button" role="tab">
                                        <i class="fas fa-palette me-1"></i>Interfaz
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="backup-settings-tab" data-bs-toggle="tab" data-bs-target="#backup-settings-panel" type="button" role="tab">
                                        <i class="fas fa-download me-1"></i>Respaldo
                                    </button>
                                </li>
                            </ul>

                            <div class="tab-content" id="configurationTabContent">
                                ${this.createPlayerFiltersPanel()}
                                ${this.createTeamsManagementPanel()}
                                ${this.createInterfaceSettingsPanel()}
                                ${this.createBackupSettingsPanel()}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-warning" id="reset-all-settings-btn">
                                <i class="fas fa-undo me-1"></i>Restablecer Todo
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Agregar al DOM si no existe
        if (!document.getElementById('configuration-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            this.setupModalEventListeners();
        }
    }

    createPlayerFiltersPanel() {
        return `
            <div class="tab-pane fade show active" id="player-filters-panel" role="tabpanel">
                <div class="row g-4">
                    <!-- Filtro de tipo de jugadores -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-users me-2"></i>Tipo de Jugadores
                                </h6>
                            </div>
                            <div class="card-body">
                                <p class="text-muted small mb-3">
                                    Elige qué jugadores mostrar en la selección de plantilla.
                                </p>
                                <div class="row g-2" id="player-filter-options">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filtro por equipo -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-shield-alt me-2"></i>Filtro por Equipo
                                </h6>
                            </div>
                            <div class="card-body">
                                <p class="text-muted small mb-3">
                                    Filtra jugadores por equipo específico (requiere equipos creados).
                                </p>
                                <select class="form-select" id="team-filter-select">
                                    <option value="all">Todos los equipos</option>
                                    <!-- Se llenará dinámicamente -->
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Vista previa de filtros -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-eye me-2"></i>Vista Previa
                                </h6>
                            </div>
                            <div class="card-body">
                                <div id="filter-preview" class="d-flex align-items-center gap-3">
                                    <div class="stat-box">
                                        <div class="stat-number" id="filtered-players-count">0</div>
                                        <div class="stat-label">Jugadores mostrados</div>
                                    </div>
                                    <div class="stat-box">
                                        <div class="stat-number" id="filtered-teams-count">0</div>
                                        <div class="stat-label">Equipos incluidos</div>
                                    </div>
                                    <div class="stat-box">
                                        <div class="stat-number" id="filtered-custom-count">0</div>
                                        <div class="stat-label">Personalizados</div>
                                    </div>
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
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h6 class="mb-1">
                            <i class="fas fa-shield-alt me-2"></i>
                            Mis Equipos (<span id="teams-count">0</span>)
                        </h6>
                        <p class="text-muted small mb-0">
                            Crea equipos para organizar mejor tus jugadores personalizados.
                        </p>
                    </div>
                    <button class="btn btn-success" id="add-team-btn">
                        <i class="fas fa-plus me-1"></i>Crear Equipo
                    </button>
                </div>

                <div id="teams-list" class="row g-3">
                    <!-- Se llenará dinámicamente -->
                </div>

                <div id="no-teams-message" class="text-center py-5" style="display: none;">
                    <i class="fas fa-shield-alt fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No tienes equipos creados</h5>
                    <p class="text-muted">Los equipos te ayudan a organizar jugadores por categorías como "Titulares", "Suplentes", "Juveniles", etc.</p>
                    <button class="btn btn-success" onclick="document.getElementById('add-team-btn').click()">
                        <i class="fas fa-plus me-1"></i>Crear tu Primer Equipo
                    </button>
                </div>

                <!-- Modal para crear/editar equipo -->
                <div class="modal fade" id="team-form-modal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="team-form-modal-title">Crear Equipo</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="team-form">
                                    <div class="mb-3">
                                        <label for="team-name" class="form-label">Nombre del Equipo *</label>
                                        <input type="text" class="form-control" id="team-name" required maxlength="30">
                                        <div class="form-text">Ejemplo: "Titulares", "Suplentes", "Real Madrid", etc.</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="team-description" class="form-label">Descripción (Opcional)</label>
                                        <textarea class="form-control" id="team-description" rows="2" maxlength="100"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label for="team-color" class="form-label">Color Representativo</label>
                                        <div class="d-flex align-items-center gap-2">
                                            <input type="color" class="form-control form-control-color" id="team-color" value="#007bff">
                                            <small class="text-muted">Se usará para identificar el equipo visualmente</small>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" form="team-form" class="btn btn-success" id="save-team-btn">
                                    <i class="fas fa-save me-1"></i>Guardar Equipo
                                </button>
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
                                    <i class="fas fa-info-circle me-2"></i>Información del Sistema
                                </h6>
                            </div>
                            <div class="card-body">
                                <div id="system-info">
                                    <!-- Se llenará dinámicamente -->
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
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-download me-2"></i>Exportar Configuración
                                </h6>
                            </div>
                            <div class="card-body">
                                <p class="card-text">
                                    Descarga todas tus configuraciones y equipos como archivo JSON 
                                    para hacer respaldo o transferir a otro dispositivo.
                                </p>
                                <button class="btn btn-primary" id="export-config-btn">
                                    <i class="fas fa-file-download me-2"></i>Exportar Todo
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-upload me-2"></i>Importar Configuración
                                </h6>
                            </div>
                            <div class="card-body">
                                <p class="card-text">
                                    Carga configuraciones y equipos desde un archivo JSON exportado previamente.
                                </p>
                                <input type="file" class="form-control mb-3" id="import-config-file" accept=".json">
                                <button class="btn btn-success" id="import-config-btn" disabled>
                                    <i class="fas fa-file-upload me-2"></i>Importar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <h6><i class="fas fa-exclamation-triangle me-2"></i>Información Importante:</h6>
                            <ul class="mb-0">
                                <li><strong>Configuraciones:</strong> Incluye filtros, preferencias de interfaz y configuraciones generales</li>
                                <li><strong>Equipos:</strong> Incluye todos los equipos creados (pero no los jugadores asignados)</li>
                                <li><strong>Los jugadores personalizados se exportan por separado</strong> en el módulo de jugadores</li>
                                <li><strong>Importar sobrescribirá</strong> la configuración actual</li>
                            </ul>
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
        this.updatePlayerFilters();
        this.updateTeamsList();
        this.updateInterfaceSettings();
        this.updateSystemInfo();
    }

    updatePlayerFilters() {
        // Implementar actualización de filtros
    }

    updateTeamsList() {
        // Implementar actualización de equipos
    }

    updateInterfaceSettings() {
        // Implementar actualización de configuraciones de interfaz
    }

    updateSystemInfo() {
        const systemInfoContainer = document.getElementById('system-info');
        if (!systemInfoContainer) return;

        // Obtener información del sistema y configuraciones de imágenes
        const imageConfigs = this.customPlayersManager.constructor.getImageConfigurations();
        const storageInfo = this.getStorageInfo();

        const systemInfo = `
            <div class="row g-3">
                <!-- Información de localStorage -->
                <div class="col-md-6">
                    <div class="card border-primary">
                        <div class="card-body">
                            <h6 class="card-title text-primary">
                                <i class="fas fa-database me-2"></i>Almacenamiento Local
                            </h6>
                            <div class="mb-2">
                                <small class="text-muted">Usado:</small>
                                <div class="progress progress-sm">
                                    <div class="progress-bar bg-primary" role="progressbar" 
                                         style="width: ${storageInfo.percentage}%"
                                         aria-valuenow="${storageInfo.percentage}" 
                                         aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>
                                <small class="text-muted">${storageInfo.used} / ~${storageInfo.total}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Configuraciones de imagen -->
                <div class="col-md-6">
                    <div class="card border-success">
                        <div class="card-body">
                            <h6 class="card-title text-success">
                                <i class="fas fa-image me-2"></i>Procesamiento de Imágenes
                            </h6>
                            <div class="small">
                                <div><strong>Estándar:</strong> ${imageConfigs.player.width}×${imageConfigs.player.height}px</div>
                                <div><strong>Calidad:</strong> ${Math.round(imageConfigs.player.quality * 100)}%</div>
                                <div><strong>Formato:</strong> JPEG optimizado</div>
                                <div><strong>Tamaño máximo:</strong> ~200KB</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Información del navegador -->
                <div class="col-12">
                    <div class="card border-info">
                        <div class="card-body">
                            <h6 class="card-title text-info">
                                <i class="fas fa-globe me-2"></i>Navegador y Compatibilidad
                            </h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="small">
                                        <div><strong>User Agent:</strong> ${navigator.userAgent.substring(0, 80)}...</div>
                                        <div><strong>Canvas API:</strong> ${this.checkCanvasSupport() ? '✅ Soportado' : '❌ No disponible'}</div>
                                        <div><strong>File API:</strong> ${this.checkFileSupport() ? '✅ Soportado' : '❌ No disponible'}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="small">
                                        <div><strong>localStorage:</strong> ${this.checkLocalStorageSupport() ? '✅ Disponible' : '❌ No disponible'}</div>
                                        <div><strong>PWA:</strong> ${this.checkPWASupport() ? '✅ Instalable' : '⚠️ Solo web'}</div>
                                        <div><strong>Pantalla:</strong> ${screen.width}×${screen.height}px</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        systemInfoContainer.innerHTML = systemInfo;
    }

    getStorageInfo() {
        try {
            const used = JSON.stringify(localStorage).length;
            const usedKB = (used / 1024).toFixed(1);
            const totalMB = 5; // Aproximación común de límite de localStorage
            const percentage = Math.min((used / (totalMB * 1024 * 1024)) * 100, 100);

            return {
                used: `${usedKB}KB`,
                total: `${totalMB}MB`,
                percentage: percentage.toFixed(1)
            };
        } catch (e) {
            return {
                used: 'N/A',
                total: 'N/A',
                percentage: 0
            };
        }
    }

    checkCanvasSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    checkFileSupport() {
        return !!(window.File && window.FileReader && window.FileList && window.Blob);
    }

    checkLocalStorageSupport() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    checkPWASupport() {
        return !!('serviceWorker' in navigator && 'PushManager' in window);
    }

    updateFilterControls() {
        // Implementar controles de filtro en la interfaz principal
    }

    handleSettingChanged(detail) {
        console.log('[ConfigurationUI] Configuración cambiada:', detail.key, '=', detail.value);
        
        // Actualizar interfaz según el cambio
        if (detail.key === 'defaultPlayerFilter' || detail.key === 'defaultTeamFilter') {
            this.updateFilterControls();
            
            // Actualizar lista de jugadores si está abierta
            if (this.playerManager && document.getElementById('squad-selection-modal').classList.contains('show')) {
                this.playerManager.renderPlayerSelectionList();
            }
        }
    }

    showSuccess(message) {
        // Usar el mismo sistema de toasts que customPlayersUI
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Implementar sistema de toasts
        console.log(`[ConfigurationUI] ${type.toUpperCase()}: ${message}`);
    }
}

// Hacer disponible globalmente
window.configurationUI = null;
