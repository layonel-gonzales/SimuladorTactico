// customPlayersUI.js
// Interfaz de usuario para gestión de jugadores personalizados

export default class CustomPlayersUI {
    constructor(customPlayersManager, playerManager) {
        this.customPlayersManager = customPlayersManager;
        this.playerManager = playerManager;
        this.currentEditingPlayer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        console.log('[CustomPlayersUI] Inicializado correctamente');
    }

    setupEventListeners() {
        // Botón principal para abrir modal
        const customPlayersBtn = document.getElementById('custom-players-btn');
        if (customPlayersBtn) {
            customPlayersBtn.addEventListener('click', () => {
                console.log('[CustomPlayersUI][DEBUG] Click en BOTÓN VERDE - Jugadores Personalizados.');
                console.log('[CustomPlayersUI][DEBUG] Llamando a openCustomPlayersModal...');
                this.openCustomPlayersModal();
            });
        }

        // Formulario de agregar jugador
        const form = document.getElementById('custom-player-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddPlayer();
            });
        }

        // Botón de limpiar formulario
        const resetBtn = document.getElementById('reset-form-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Subida de foto
        const photoInput = document.getElementById('player-photo');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e.target.files[0]);
            });
        }

        // Campos de estadísticas para cálculo automático del overall
        const statInputs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
        statInputs.forEach(stat => {
            const input = document.getElementById(`player-${stat}`);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateCalculatedOverall();
                });
            }
        });

        // Cambio de posición para ajustar pesos del overall
        const positionSelect = document.getElementById('player-position');
        if (positionSelect) {
            positionSelect.addEventListener('change', () => {
                this.updateCalculatedOverall();
            });
        }

        // Botones de gestión
        const clearAllBtn = document.getElementById('clear-all-custom-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.handleClearAll();
            });
        }

        const storageInfoBtn = document.getElementById('storage-info-btn');
        if (storageInfoBtn) {
            storageInfoBtn.addEventListener('click', () => {
                this.showStorageInfo();
            });
        }

        // Importar/Exportar
        const exportBtn = document.getElementById('export-players-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.customPlayersManager.exportCustomPlayers();
            });
        }

        const importFileInput = document.getElementById('import-players-file');
        const importBtn = document.getElementById('import-players-btn');
        
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                importBtn.disabled = !e.target.files[0];
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.handleImport();
            });
        }

        // Listener para actualizaciones de la lista
        document.addEventListener('customPlayersUpdated', () => {
            this.refreshCustomPlayersList();
        });
    }

    setupFormValidation() {
        // Validación en tiempo real para nombre
        const nameInput = document.getElementById('player-name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length > 30) {
                    e.target.setCustomValidity('El nombre no puede tener más de 30 caracteres');
                } else if (value.length < 2) {
                    e.target.setCustomValidity('El nombre debe tener al menos 2 caracteres');
                } else {
                    e.target.setCustomValidity('');
                }
            });
        }

        // Validación para estadísticas
        const statInputs = document.querySelectorAll('input[type="number"][min="1"][max="99"]');
        statInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < 1 || value > 99) {
                    e.target.setCustomValidity('El valor debe estar entre 1 y 99');
                } else {
                    e.target.setCustomValidity('');
                }
            });
        });
    }

    openCustomPlayersModal() {
        console.log('[CustomPlayersUI][DEBUG] Ejecutando openCustomPlayersModal...');
        console.log('[CustomPlayersUI][DEBUG] Buscando modal custom-players-modal...');
        
        const modalElement = document.getElementById('custom-players-modal');
        console.log('[CustomPlayersUI][DEBUG] Modal element encontrado:', !!modalElement);
        
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            console.log('[CustomPlayersUI][DEBUG] Bootstrap Modal creado, mostrando...');
            modal.show();
            console.log('[CustomPlayersUI][DEBUG] Modal custom-players-modal mostrado.');
            
            // Actualizar listas al abrir
            this.refreshCustomPlayersList();
            this.updateCalculatedOverall();
        } else {
            console.error('[CustomPlayersUI][ERROR] No se encontró el modal custom-players-modal');
        }
    }

    async handleAddPlayer() {
        try {
            const formData = this.getFormData();
            
            // Validar datos
            if (!formData.name || !formData.position) {
                throw new Error('Nombre y posición son obligatorios');
            }

            // Agregar jugador
            const newPlayer = this.customPlayersManager.addCustomPlayer(formData);
            
            // Limpiar formulario
            this.resetForm();
            
            // Mostrar éxito
            this.showSuccess(`✅ ${newPlayer.name} agregado exitosamente!`);
            
            // Actualizar listas
            this.refreshCustomPlayersList();
            
            // Refrescar lista de selección de jugadores si está abierta
            if (this.playerManager && document.getElementById('squad-selection-modal').classList.contains('show')) {
                this.playerManager.renderPlayerSelectionList();
            }

            console.log('[CustomPlayersUI] Jugador agregado:', newPlayer.name);
            
        } catch (error) {
            console.error('[CustomPlayersUI] Error agregando jugador:', error);
            this.showError('Error al agregar jugador: ' + error.message);
        }
    }

    getFormData() {
        return {
            name: document.getElementById('player-name').value.trim(),
            jersey_number: parseInt(document.getElementById('player-jersey').value) || undefined,
            position: document.getElementById('player-position').value,
            pace: parseInt(document.getElementById('player-pace').value) || 70,
            shooting: parseInt(document.getElementById('player-shooting').value) || 70,
            passing: parseInt(document.getElementById('player-passing').value) || 70,
            dribbling: parseInt(document.getElementById('player-dribbling').value) || 70,
            defending: parseInt(document.getElementById('player-defending').value) || 70,
            physical: parseInt(document.getElementById('player-physical').value) || 70,
            image_url: document.getElementById('player-photo-preview').src
        };
    }

    resetForm() {
        const form = document.getElementById('custom-player-form');
        if (form) {
            form.reset();
            
            // Restablecer preview de foto
            document.getElementById('player-photo-preview').src = 'img/default_player.png';
            
            // Restablecer valores por defecto
            const statInputs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
            statInputs.forEach(stat => {
                document.getElementById(`player-${stat}`).value = 70;
            });
            
            // Actualizar overall calculado
            this.updateCalculatedOverall();
        }
    }

    async handlePhotoUpload(file) {
        if (!file) return;
        
        const previewImg = document.getElementById('player-photo-preview');
        if (!previewImg) return;

        try {
            // Mostrar indicador de carga
            previewImg.classList.add('player-image-loading');
            
            // Mostrar información de la imagen original
            const imageInfo = await this.customPlayersManager.getImageInfo(file);
            console.log(`[CustomPlayersUI] Procesando imagen: ${imageInfo.name}`);
            console.log(`- Dimensiones originales: ${imageInfo.width}x${imageInfo.height}px`);
            console.log(`- Tamaño original: ${(imageInfo.size/1024).toFixed(1)}KB`);
            console.log(`- Tipo original: ${imageInfo.type}`);
            
            // Procesar imagen
            const base64 = await this.customPlayersManager.handlePlayerPhotoUpload(file);
            
            // Calcular tamaño procesado y determinar formato final
            const processedSize = (base64.length * 3/4) / 1024;
            const finalFormat = base64.startsWith('data:image/png') ? 'PNG (con transparencia)' : 'JPEG (sin transparencia)';
            
            console.log(`- Formato final: ${finalFormat}`);
            console.log(`- Tamaño optimizado: ${processedSize.toFixed(1)}KB`);
            console.log(`- Reducción: ${(((imageInfo.size/1024) - processedSize) / (imageInfo.size/1024) * 100).toFixed(1)}%`);
            
            // Mostrar imagen optimizada
            previewImg.src = base64;
            previewImg.classList.remove('player-image-loading');
            previewImg.classList.add('player-image-optimized');
            
            // Mostrar mensaje de éxito con información detallada
            this.showSuccess(`Imagen optimizada: ${processedSize.toFixed(1)}KB (120x140px, ${finalFormat})`);
            
        } catch (error) {
            previewImg.classList.remove('player-image-loading');
            console.error('[CustomPlayersUI] Error cargando foto:', error);
            this.showError('Error procesando imagen: ' + error.message);
        }
    }

    updateCalculatedOverall() {
        const position = document.getElementById('player-position').value;
        if (!position) {
            document.getElementById('calculated-overall').textContent = '70';
            return;
        }

        const stats = {
            pace: parseInt(document.getElementById('player-pace').value) || 70,
            shooting: parseInt(document.getElementById('player-shooting').value) || 70,
            passing: parseInt(document.getElementById('player-passing').value) || 70,
            dribbling: parseInt(document.getElementById('player-dribbling').value) || 70,
            defending: parseInt(document.getElementById('player-defending').value) || 70,
            physical: parseInt(document.getElementById('player-physical').value) || 70
        };

        // Usar el mismo sistema de cálculo que PlayerManager
        const fakePlayer = { ...stats, position };
        const overall = this.playerManager.calculateOverall(fakePlayer);
        
        document.getElementById('calculated-overall').textContent = overall;
    }

    refreshCustomPlayersList() {
        const container = document.getElementById('custom-players-list');
        const noPlayersDiv = document.getElementById('no-custom-players');
        const countSpan = document.getElementById('custom-players-count');
        
        if (!container) return;
        
        const customPlayers = this.customPlayersManager.getCustomPlayers();
        
        // Actualizar contador
        if (countSpan) {
            countSpan.textContent = customPlayers.length;
        }
        
        // Mostrar/ocultar mensaje de "sin jugadores"
        if (customPlayers.length === 0) {
            container.style.display = 'none';
            if (noPlayersDiv) noPlayersDiv.style.display = 'block';
            return;
        }
        
        container.style.display = 'block';
        if (noPlayersDiv) noPlayersDiv.style.display = 'none';
        
        // Renderizar jugadores
        container.innerHTML = '';
        customPlayers.forEach(player => {
            const card = this.createCustomPlayerCard(player);
            container.appendChild(card);
        });
    }

    createCustomPlayerCard(player) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const overall = this.playerManager.calculateOverall(player);
        const createdDate = new Date(player.created_at).toLocaleDateString('es-ES');
        
        col.innerHTML = `
            <div class="custom-player-card">
                <div class="overall-badge">${overall}</div>
                <div class="d-flex align-items-center mb-2">
                    <img src="${player.image_url}" alt="${player.name}" class="player-photo me-3">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${player.name}</h6>
                        <div class="d-flex align-items-center text-muted">
                            <span class="badge bg-primary me-2">${player.position}</span>
                            <small>#${player.jersey_number}</small>
                        </div>
                    </div>
                </div>
                
                <div class="player-stats row g-1 mb-2">
                    <div class="col-4"><small><strong>VEL:</strong> ${player.pace}</small></div>
                    <div class="col-4"><small><strong>TIR:</strong> ${player.shooting}</small></div>
                    <div class="col-4"><small><strong>PAS:</strong> ${player.passing}</small></div>
                    <div class="col-4"><small><strong>REG:</strong> ${player.dribbling}</small></div>
                    <div class="col-4"><small><strong>DEF:</strong> ${player.defending}</small></div>
                    <div class="col-4"><small><strong>FIS:</strong> ${player.physical}</small></div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Creado: ${createdDate}</small>
                    <div class="action-buttons">
                        <button class="btn btn-outline-danger btn-sm" onclick="customPlayersUI.deletePlayer(${player.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return col;
    }

    deletePlayer(playerId) {
        try {
            const player = this.customPlayersManager.getCustomPlayers().find(p => p.id === playerId);
            if (!player) return;
            
            if (confirm(`¿Estás seguro de eliminar a ${player.name}?\n\nEsta acción no se puede deshacer.`)) {
                this.customPlayersManager.deleteCustomPlayer(playerId);
                this.refreshCustomPlayersList();
                this.showSuccess(`✅ ${player.name} eliminado exitosamente`);
                
                // Refrescar lista de selección si está abierta
                if (this.playerManager && document.getElementById('squad-selection-modal').classList.contains('show')) {
                    this.playerManager.renderPlayerSelectionList();
                }
            }
        } catch (error) {
            console.error('[CustomPlayersUI] Error eliminando jugador:', error);
            this.showError('Error eliminando jugador: ' + error.message);
        }
    }

    handleClearAll() {
        if (this.customPlayersManager.clearAllCustomData()) {
            this.refreshCustomPlayersList();
            this.showSuccess('✅ Todos los jugadores personalizados eliminados');
            
            // Refrescar lista de selección si está abierta
            if (this.playerManager && document.getElementById('squad-selection-modal').classList.contains('show')) {
                this.playerManager.renderPlayerSelectionList();
            }
        }
    }

    showStorageInfo() {
        const info = this.customPlayersManager.getStorageInfo();
        if (!info) {
            this.showError('No se pudo obtener información de almacenamiento');
            return;
        }
        
        const message = `📊 Información de Almacenamiento\n\n` +
                       `• Jugadores personalizados: ${info.customPlayers}\n` +
                       `• Equipos personalizados: ${info.customTeams}\n` +
                       `• Espacio usado (jugadores): ${info.playersSize} KB\n` +
                       `• Espacio usado (equipos): ${info.teamsSize} KB\n` +
                       `• Espacio total usado: ${info.storageUsed} KB\n\n` +
                       `💡 Consejo: Si el almacenamiento está cerca del límite,\n` +
                       `considera exportar y eliminar jugadores no utilizados.`;
        
        alert(message);
    }

    async handleImport() {
        const fileInput = document.getElementById('import-players-file');
        const file = fileInput.files[0];
        
        if (!file) return;
        
        try {
            const result = await this.customPlayersManager.importCustomPlayers(file);
            this.refreshCustomPlayersList();
            
            const message = `✅ Importación completada!\n\n` +
                           `• Jugadores importados: ${result.imported}\n` +
                           `• Total en archivo: ${result.total}`;
            
            this.showSuccess(message);
            
            // Limpiar input
            fileInput.value = '';
            document.getElementById('import-players-btn').disabled = true;
            
            // Refrescar lista de selección si está abierta
            if (this.playerManager && document.getElementById('squad-selection-modal').classList.contains('show')) {
                this.playerManager.renderPlayerSelectionList();
            }
            
        } catch (error) {
            console.error('[CustomPlayersUI] Error importando:', error);
            this.showError('Error al importar: ' + error.message);
        }
    }

    showSuccess(message) {
        // Crear toast de éxito
        this.showToast(message, 'success');
    }

    showError(message) {
        // Crear toast de error
        this.showToast(message, 'error');
        console.error('[CustomPlayersUI]', message);
    }

    showToast(message, type = 'info') {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Agregar a container de toasts
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
        bsToast.show();
        
        // Eliminar del DOM después de ocultarse
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Hacer disponible globalmente para los event handlers inline
window.customPlayersUI = null;
