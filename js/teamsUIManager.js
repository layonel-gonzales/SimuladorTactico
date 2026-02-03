/**
 * TeamsUIManager - Interfaz de usuario para gestión de equipos
 * Permite filtrar jugadores por equipo, crear nuevos equipos y asignar jugadores
 */

class TeamsUIManager {
    constructor(teamsManager) {
        this.teamsManager = teamsManager;
        this.currentTeamFilter = null;
        this.init();
    }

    init() {
        this.setupTeamSelector();
        this.setupCreateTeamForm();
        this.updateTeamButtons();
    }

    /**
     * Configura el formulario de creación de equipos
     */
    setupCreateTeamForm() {
        const saveTeamBtn = document.getElementById('save-team-btn');
        const teamForm = document.getElementById('create-team-form');
        
        if (!saveTeamBtn || !teamForm) return;

        saveTeamBtn.addEventListener('click', () => {
            const name = document.getElementById('team-name').value.trim();
            const color = document.getElementById('team-color').value;
            const icon = document.getElementById('team-icon').value.trim() || '⚽';

            if (!name) {
                alert('El nombre del equipo es requerido');
                return;
            }

            // Crear el equipo
            const newTeam = this.teamsManager.createTeam(name, color, icon);
            
            if (newTeam) {
                // Limpiar formulario
                teamForm.reset();
                document.getElementById('team-color').value = '#4CAF50';
                document.getElementById('team-icon').value = '⚽';

                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('create-team-modal'));
                if (modal) modal.hide();

                // Actualizar selector de equipos
                this.setupTeamSelector();
                
                // Mostrar confirmación
                alert(`✅ Equipo "${name}" creado exitosamente`);
            }
        });
    }

    /**
     * Configura el selector de equipo (combobox) en el modal de selección de jugadores
     * Reemplaza los botones de filtro con un dropdown
     */
    setupTeamSelector() {
        const teamSelector = document.getElementById('team-selector');
        if (!teamSelector) return;

        // Limpiar opciones existentes (mantener solo la primera)
        while (teamSelector.options.length > 0) {
            teamSelector.remove(0);
        }

        // Agregar opción "Default"
        const defaultOption = document.createElement('option');
        defaultOption.value = 'default';
        defaultOption.textContent = '📌 Default (11 jugadores por defecto)';
        teamSelector.appendChild(defaultOption);

        // Agregar opciones dinámicamente para cada equipo creado
        const allTeams = this.teamsManager.getAllTeams();
        allTeams.forEach(team => {
            // No agregar el equipo "Default" porque ya está arriba
            if (team.id !== 'default') {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = `${team.icon} ${team.name}`;
                teamSelector.appendChild(option);
            }
        });

        // Event listener para cambio de equipo
        teamSelector.addEventListener('change', (e) => {
            this.onTeamSelectorChange(e.target.value);
        });

        // Iniciar con "Default" seleccionado
        this.onTeamSelectorChange('default');
    }

    /**
     * Maneja el cambio de selección en el combobox de equipos
     */
    onTeamSelectorChange(teamValue) {
        this.currentTeamFilter = teamValue;
        this.refreshPlayerList();
    }

    /**
     * Configura el filtro de equipos en el modal de selección de jugadores
     * OBSOLETO - Mantenido para referencia, reemplazado por setupTeamSelector
     */
    setupTeamFilter() {
        // Este método está siendo reemplazado por setupTeamSelector
        // Ya no se crea el contenedor de filtros de botones
        return;
    }

    /**
     * Refresca la lista de jugadores aplicando filtros
     */
    refreshPlayerList() {
        if (!window.customPlayersManager) return;

        const players = window.customPlayersManager.getPlayers();
        
        // Filtrar según la selección del combobox
        let filtered;
        if (this.currentTeamFilter === 'default') {
            // Mostrar solo jugadores por defecto
            filtered = players.filter(p => p.isDefault === true && p.teamId === 'default');
        } else if (this.currentTeamFilter && this.currentTeamFilter !== 'default') {
            // Filtrar por equipo específico
            filtered = players.filter(p => p.teamId === this.currentTeamFilter);
        } else {
            // Sin filtro
            filtered = players;
        }

        // Obtener elemento de lista
        const playerList = document.getElementById('squad-player-list');
        if (!playerList) return;

        // Limpiar lista actual
        playerList.innerHTML = '';

        // Agregar jugadores filtrados
        filtered.forEach(player => {
            const team = this.teamsManager.getTeamById(player.teamId);
            const cardClass = 'card-style-classic'; // Estilo por defecto
            
            const playerRow = document.createElement('div');
            playerRow.className = `player-card-wrapper ${cardClass} mb-2 p-2 cursor-pointer`;
            playerRow.dataset.playerId = player.id;
            
            playerRow.innerHTML = `
                <div class="player-card-header">
                    <span class="team-badge" style="background-color: ${team?.color || '#666'}">${team?.icon || '⚽'}</span>
                    <h6>${player.name}</h6>
                </div>
                <div class="player-info">
                    <span class="card-position">${player.position}</span>
                    <span class="card-jersey">#${player.jersey_number}</span>
                </div>
                <div class="player-stats">
                    <span>⭐ ${player.overall || 75}</span>
                </div>
            `;

            playerRow.addEventListener('click', () => {
                // Alternar selección del jugador
                playerRow.classList.toggle('selected');
            });

            playerList.appendChild(playerRow);
        });

        // Mostrar mensaje si no hay jugadores
        if (filtered.length === 0) {
            const emptyMessage = this.currentTeamFilter === 'default' 
                ? '📌 No hay jugadores por defecto disponibles'
                : `No hay jugadores en este equipo. <button class="btn btn-sm btn-primary mt-2" onclick="window.customPlayersUI.showAddPlayerModal()">Agregar jugador</button>`;
            playerList.innerHTML = `<div class="alert alert-info">${emptyMessage}</div>`;
        }
    }

    /**
     * Actualiza los botones de equipo
     */
    updateTeamButtons() {
        // Crear área de equipos si no existe
        let teamArea = document.querySelector('.teams-management-area');
        if (!teamArea) {
            teamArea = document.createElement('div');
            teamArea.className = 'teams-management-area mt-4';
            document.body.appendChild(teamArea);
        }
    }

    /**
     * Muestra un modal para crear nuevo equipo
     */
    showCreateTeamModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'createTeamModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Crear Nuevo Equipo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nombre del Equipo</label>
                            <input type="text" id="teamName" class="form-control" placeholder="Ej: Mi Equipo">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Estilo de Card</label>
                            <select id="teamStyle" class="form-select">
                                <option value="card-style-fifa">FIFA</option>
                                <option value="card-style-modern">Moderno</option>
                                <option value="card-style-retro">Retro</option>
                                <option value="card-style-premium">Premium</option>
                                <option value="card-style-classic">Clásico</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Color del Equipo</label>
                            <input type="color" id="teamColor" class="form-control form-control-color" value="#2196F3">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descripción (Opcional)</label>
                            <textarea id="teamDescription" class="form-control" rows="2"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="saveTeamBtn">Crear Equipo</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);

        document.getElementById('saveTeamBtn').addEventListener('click', () => {
            const name = document.getElementById('teamName').value;
            const style = document.getElementById('teamStyle').value;
            const color = document.getElementById('teamColor').value;
            const description = document.getElementById('teamDescription').value;

            if (name.trim()) {
                this.teamsManager.createTeam(name, style, color, description);
                this.updateTeamFilter();
                bsModal.hide();
                modal.remove();
            }
        });

        bsModal.show();
    }

    /**
     * Asigna un equipo a un jugador
     */
    assignTeamToPlayer(playerId, teamId) {
        if (!window.customPlayersManager) return false;

        const player = window.customPlayersManager.getPlayer(playerId);
        if (!player) return false;

        player.teamId = teamId;
        window.customPlayersManager.updatePlayer(playerId, player);
        
        // Actualizar card
        if (window.playerCardManager) {
            window.playerCardManager.refreshCardStyle();
        }

        return true;
    }

    /**
     * Obtiene estadísticas de equipos
     */
    getTeamsStatistics() {
        const stats = {};
        
        this.teamsManager.getAllTeams().forEach(team => {
            const teamStats = this.teamsManager.getTeamStats(team.id);
            stats[team.name] = {
                ...teamStats,
                color: team.color,
                icon: team.icon
            };
        });

        return stats;
    }

    /**
     * Actualiza el modal cuando se agregan nuevos jugadores
     */
    onPlayerAdded(player) {
        // Auto-asignar equipo si es necesario
        if (!player.teamId) {
            // Obtener el último equipo usado
            const lastTeamId = localStorage.getItem('lastUsedTeamId');
            const defaultTeam = lastTeamId 
                ? this.teamsManager.getTeamById(lastTeamId)
                : this.teamsManager.getNextTeam();
            
            if (defaultTeam) {
                player.teamId = defaultTeam.id;
                window.customPlayersManager.updatePlayer(player.id, player);
                localStorage.setItem('lastUsedTeamId', defaultTeam.id);
            }
        }

        this.refreshPlayerList();
    }
}

// Crear instancia global cuando teamsManager esté listo
if (window.teamsManager) {
    window.teamsUI = new TeamsUIManager(window.teamsManager);
}
