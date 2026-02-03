/**
 * ═══════════════════════════════════════════════════════════════════════
 * 💾 LOCAL STORAGE UI MANAGER
 * ═══════════════════════════════════════════════════════════════════════
 * Interfaz visual para gestionar almacenamiento local
 * Incluye: estadísticas, backup, export, import, limpieza
 */

class LocalStorageUIManager {
    constructor(localStorageManager) {
        this.lsm = localStorageManager;
        this.modalId = 'storage-management-modal';
        this.init();
    }
    
    /**
     * Inicializar
     */
    init() {
        this.createStorageModal();
        this.setupEventListeners();
        window.addEventListener('storageWarning', (e) => this.showStorageWarning(e.detail.message));
    }
    
    /**
     * Crear modal de gestión de almacenamiento
     */
    createStorageModal() {
        const html = `
        <div class="modal fade" id="${this.modalId}" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-database me-2"></i>Gestión de Almacenamiento Local
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Estadísticas de Almacenamiento -->
                        <div class="card mb-3">
                            <div class="card-header bg-primary text-white">
                                <i class="fas fa-chart-pie me-2"></i>Estadísticas de Uso
                            </div>
                            <div class="card-body">
                                <div class="storage-stats-container">
                                    <div class="storage-bar">
                                        <div class="storage-used" id="storageUsedBar"></div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-3 text-center">
                                            <div class="stat-value" id="statUsed">-</div>
                                            <div class="stat-label">Usado</div>
                                        </div>
                                        <div class="col-md-3 text-center">
                                            <div class="stat-value" id="statAvailable">-</div>
                                            <div class="stat-label">Disponible</div>
                                        </div>
                                        <div class="col-md-3 text-center">
                                            <div class="stat-value" id="statPercent">-</div>
                                            <div class="stat-label">Uso %</div>
                                        </div>
                                        <div class="col-md-3 text-center">
                                            <div class="stat-value" id="statTotal">-</div>
                                            <div class="stat-label">Total</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Desglose por tipo -->
                                <div class="mt-4">
                                    <h6>Desglose por tipo:</h6>
                                    <div id="storageBreakdown"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Botones de Acción -->
                        <div class="card mb-3">
                            <div class="card-header bg-success text-white">
                                <i class="fas fa-cogs me-2"></i>Acciones
                            </div>
                            <div class="card-body">
                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <button class="btn btn-primary w-100" id="btnCreateBackup">
                                            <i class="fas fa-download me-2"></i>Descargar Backup
                                        </button>
                                    </div>
                                    <div class="col-md-6">
                                        <button class="btn btn-info w-100" id="btnExportPlayers">
                                            <i class="fas fa-file-csv me-2"></i>Exportar Jugadores (CSV)
                                        </button>
                                    </div>
                                    <div class="col-md-6">
                                        <button class="btn btn-warning w-100" id="btnImportData">
                                            <i class="fas fa-upload me-2"></i>Importar Backup
                                        </button>
                                    </div>
                                    <div class="col-md-6">
                                        <button class="btn btn-danger w-100" id="btnClearStorage">
                                            <i class="fas fa-trash me-2"></i>Limpiar Todo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Información -->
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Información:</strong> Los datos se guardan localmente en tu navegador. 
                            Se perderán si limpias el cache. <strong>Se recomienda hacer backups regularmente.</strong>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" id="btnRefreshStats">
                            <i class="fas fa-sync me-2"></i>Actualizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Input oculto para importar archivo -->
        <input type="file" id="importFileInput" accept=".json" style="display: none;">
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        this.addStyles();
    }
    
    /**
     * Agregar estilos CSS
     */
    addStyles() {
        const styles = `
        <style>
            .storage-stats-container {
                padding: 10px 0;
            }
            
            .storage-bar {
                height: 30px;
                background: #e9ecef;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #dee2e6;
            }
            
            .storage-used {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3);
                transition: width 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: #007bff;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6c757d;
                margin-top: 5px;
            }
            
            .storage-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                border-bottom: 1px solid #e9ecef;
                font-size: 14px;
            }
            
            .storage-item:last-child {
                border-bottom: none;
            }
            
            .storage-item-label {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .storage-item-size {
                color: #6c757d;
                font-weight: bold;
            }
        </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        document.getElementById('btnCreateBackup').addEventListener('click', () => this.handleBackup());
        document.getElementById('btnExportPlayers').addEventListener('click', () => this.handleExportPlayers());
        document.getElementById('btnImportData').addEventListener('click', () => this.handleImport());
        document.getElementById('btnClearStorage').addEventListener('click', () => this.handleClear());
        document.getElementById('btnRefreshStats').addEventListener('click', () => this.updateStatistics());
        
        document.getElementById('importFileInput').addEventListener('change', (e) => this.importFile(e));
    }
    
    /**
     * Mostrar modal
     */
    show() {
        this.updateStatistics();
        const modal = new bootstrap.Modal(document.getElementById(this.modalId));
        modal.show();
    }
    
    /**
     * Actualizar estadísticas
     */
    updateStatistics() {
        const stats = this.lsm.getUsageStats();
        
        // Actualizar valores principales
        document.getElementById('statUsed').textContent = `${stats.totalMB}MB`;
        document.getElementById('statAvailable').textContent = `${stats.availableMB}MB`;
        document.getElementById('statPercent').textContent = `${stats.usagePercent}%`;
        document.getElementById('statTotal').textContent = `${this.lsm.QUOTA_MB}MB`;
        
        // Actualizar barra de progreso
        const percent = parseFloat(stats.usagePercent);
        const usedBar = document.getElementById('storageUsedBar');
        usedBar.style.width = `${percent}%`;
        usedBar.textContent = `${percent.toFixed(1)}%`;
        
        // Color según uso
        if (percent > 90) {
            usedBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
        } else if (percent > 75) {
            usedBar.style.background = 'linear-gradient(90deg, #ffc107, #e0a800)';
        } else {
            usedBar.style.background = 'linear-gradient(90deg, #28a745, #1e7e34)';
        }
        
        // Desglose por tipo
        this.updateBreakdown(stats);
    }
    
    /**
     * Actualizar desglose
     */
    updateBreakdown(stats) {
        const breakdown = document.getElementById('storageBreakdown');
        let html = '';
        
        for (const [name, data] of Object.entries(stats.stats)) {
            if (data.sizeKB > 0) {
                html += `
                <div class="storage-item">
                    <div class="storage-item-label">
                        ${this.getIcon(name)} <span>${this.getName(name)}</span>
                    </div>
                    <div class="storage-item-size">
                        ${data.sizeKB}KB (${data.itemCount} ítems)
                    </div>
                </div>
                `;
            }
        }
        
        breakdown.innerHTML = html || '<p class="text-muted">No hay datos almacenados</p>';
    }
    
    /**
     * Obtener icono según tipo
     */
    getIcon(name) {
        const icons = {
            customPlayers: '<i class="fas fa-user-friends" style="color: #007bff;"></i>',
            customTeams: '<i class="fas fa-users" style="color: #28a745;"></i>',
            settings: '<i class="fas fa-cogs" style="color: #6c757d;"></i>',
            formations: '<i class="fas fa-chess" style="color: #ffc107;"></i>',
            tactics: '<i class="fas fa-diagram-project" style="color: #17a2b8;"></i>',
            favorites: '<i class="fas fa-star" style="color: #fd7e14;"></i>',
            backups: '<i class="fas fa-save" style="color: #6f42c1;"></i>'
        };
        return icons[name] || '<i class="fas fa-database"></i>';
    }
    
    /**
     * Obtener nombre legible
     */
    getName(name) {
        const names = {
            customPlayers: 'Jugadores Personalizados',
            customTeams: 'Equipos Personalizados',
            settings: 'Configuraciones',
            formations: 'Formaciones',
            tactics: 'Tácticas',
            favorites: 'Favoritos',
            backups: 'Backups Automáticos'
        };
        return names[name] || name;
    }
    
    /**
     * Manejar descarga de backup
     */
    handleBackup() {
        const { content, filename } = this.lsm.exportDataAsJSON();
        this.downloadFile(content, filename, 'application/json');
    }
    
    /**
     * Manejar exportación de jugadores
     */
    handleExportPlayers() {
        const data = this.lsm.exportPlayersAsCSV();
        if (!data) {
            alert('No hay jugadores personalizados para exportar');
            return;
        }
        this.downloadFile(data.content, data.filename, 'text/csv');
    }
    
    /**
     * Manejar importación
     */
    handleImport() {
        document.getElementById('importFileInput').click();
    }
    
    /**
     * Importar archivo
     */
    importFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = this.lsm.importDataFromJSON(e.target.result);
                alert(result.message);
                if (result.success) {
                    this.updateStatistics();
                }
            } catch (error) {
                alert('Error al importar: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Limpiar input
        event.target.value = '';
    }
    
    /**
     * Manejar limpieza
     */
    handleClear() {
        if (this.lsm.clearAllStorage()) {
            this.updateStatistics();
            alert('✅ Almacenamiento local limpiado');
        }
    }
    
    /**
     * Descargar archivo
     */
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Mostrar advertencia de almacenamiento
     */
    showStorageWarning(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Almacenamiento:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Crear instancia global cuando localStorageManager esté listo
if (window.localStorageManager) {
    window.localStorageUI = new LocalStorageUIManager(window.localStorageManager);
}
