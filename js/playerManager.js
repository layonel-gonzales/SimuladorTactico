export default class PlayerManager {
    constructor(players, customPlayersManager = null, configurationManager = null) {
        this.players = players;
        this.customPlayersManager = customPlayersManager;
        this.configurationManager = configurationManager;
        this.activePlayers = [];
    }
    
    calculateOverall(player) {
        const weights = this.getWeightsForPosition(player.position);
        return Math.round(
            Object.keys(weights).reduce((total, stat) => 
                total + (player[stat] * weights[stat]), 0)
        );
    }
    
    getWeightsForPosition(position) {
        const weights = {
            'GK': { pace: 0.1, shooting: 0.0, passing: 0.15, dribbling: 0.05, defending: 0.6, physical: 0.1 },
            'CB': { pace: 0.1, shooting: 0.05, passing: 0.2, dribbling: 0.05, defending: 0.5, physical: 0.1 },
            'LB': { pace: 0.2, shooting: 0.1, passing: 0.2, dribbling: 0.1, defending: 0.3, physical: 0.1 },
            'RB': { pace: 0.2, shooting: 0.1, passing: 0.2, dribbling: 0.1, defending: 0.3, physical: 0.1 },
            'CDM': { pace: 0.1, shooting: 0.1, passing: 0.25, dribbling: 0.15, defending: 0.3, physical: 0.1 },
            'CM': { pace: 0.15, shooting: 0.15, passing: 0.25, dribbling: 0.2, defending: 0.15, physical: 0.1 },
            'CAM': { pace: 0.15, shooting: 0.2, passing: 0.25, dribbling: 0.25, defending: 0.05, physical: 0.1 },
            'LM': { pace: 0.2, shooting: 0.15, passing: 0.2, dribbling: 0.2, defending: 0.15, physical: 0.1 },
            'RM': { pace: 0.2, shooting: 0.15, passing: 0.2, dribbling: 0.2, defending: 0.15, physical: 0.1 },
            'LW': { pace: 0.25, shooting: 0.2, passing: 0.15, dribbling: 0.25, defending: 0.05, physical: 0.1 },
            'RW': { pace: 0.25, shooting: 0.2, passing: 0.15, dribbling: 0.25, defending: 0.05, physical: 0.1 },
            'ST': { pace: 0.2, shooting: 0.3, passing: 0.1, dribbling: 0.2, defending: 0.05, physical: 0.15 }
        };
        return weights[position] || weights['CM'];
    }
    
    getPositionType(position) {
        if (position === 'GK') return 'GK';
        if (['CB','RB','LB'].includes(position)) return 'DF';
        if (['CM','CDM','CAM','RM','LM'].includes(position)) return 'MC';
        return 'FW';
    }
    
    renderPlayerCard(player) {
        if (!player.overall) {
            player.overall = this.calculateOverall(player);
        }
        
        return `
            <div class="fifa-card bg-dark text-white rounded p-3">
                <div class="row">
                    <div class="col-5">
                        <img src="${player.image_url}" alt="${player.name}" class="img-fluid rounded-circle border border-3 border-primary">
                    </div>
                    <div class="col-7">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="display-4 fw-bold">${player.overall}</span>
                            <span class="badge bg-primary fs-6">${player.position}</span>
                        </div>
                        <h5 class="mb-0">${player.name}</h5>
                        <small class="text-muted">#${player.jersey_number}</small>
                    </div>
                </div>
                
                <div class="mt-3">
                    <div class="row g-2">
                        <div class="col-6">
                            <div class="d-flex justify-content-between">
                                <span>PACE</span>
                                <strong>${player.pace}</strong>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex justify-content-between">
                                <span>SHO</span>
                                <strong>${player.shooting}</strong>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex justify-content-between">
                                <span>PAS</span>
                                <strong>${player.passing}</strong>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex justify-content-between">
                                <span>DRI</span>
                                <strong>${player.dribbling}</strong>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex justify-content-between">
                                <span>DEF</span>
                                <strong>${player.defending}</strong>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex justify-content-between">
                                <span>PHY</span>
                                <strong>${player.physical}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPlayerSelectionList() {
        console.log('[PlayerManager] Renderizando lista de selección de jugadores...');
        
        const container = document.getElementById('squad-player-list');
        if (!container) {
            console.warn('[PlayerManager] Contenedor squad-player-list no encontrado');
            return;
        }
        
        container.innerHTML = '';
        
        // Obtener todos los jugadores (estáticos + personalizados) con filtros aplicados
        const allPlayers = this.getAllPlayers();
        console.log(`[PlayerManager] Jugadores después de filtros: ${allPlayers.length}`);
        
        // Agrupar por posición
        const byPosition = {
            Porteros: allPlayers.filter(p => p.position === 'GK'),
            Defensas: allPlayers.filter(p => ['CB','RB','LB'].includes(p.position)),
            Mediocampistas: allPlayers.filter(p => ['CM','CDM','CAM','RM','LM'].includes(p.position)),
            Delanteros: allPlayers.filter(p => ['ST','CF','RW','LW'].includes(p.position))
        };
        
        // Renderizar por grupos
        for (const [position, players] of Object.entries(byPosition)) {
            if (players.length === 0) continue;
            
            const groupHeader = document.createElement('div');
            groupHeader.className = 'col-12 mt-3 mb-1 fw-bold text-white';
            groupHeader.textContent = position;
            container.appendChild(groupHeader);
            
            players.forEach(player => {
                const playerItem = this.createPlayerSelectionItem(player, player.isCustom);
                container.appendChild(playerItem);
            });
        }

        // Agregar sección de jugadores personalizados si no hay ninguno
        if (this.customPlayersManager) {
            const customPlayers = this.customPlayersManager.getCustomPlayers();
            if (customPlayers.length === 0) {
                const customPrompt = document.createElement('div');
                customPrompt.className = 'col-12 mt-4';
                customPrompt.innerHTML = `
                    <div class="alert alert-info">
                        <h6><i class="fas fa-user-plus me-2"></i>¿Quieres agregar tus propios jugadores?</h6>
                        <p class="mb-2">Crea jugadores personalizados con fotos, nombres y estadísticas propias.</p>
                        <button class="btn btn-success btn-sm" onclick="document.getElementById('custom-players-btn').click()">
                            <i class="fas fa-plus me-1"></i>Crear Jugadores Personalizados
                        </button>
                    </div>
                `;
                container.appendChild(customPrompt);
            }
        }
    }


    createPlayerSelectionItem(player, isCustom = false) {
        // Usar el sistema unificado de cards si está disponible
        if (window.playerCardManager) {
            return window.playerCardManager.createPlayerCard(player, 'selection');
        }
        
        // Fallback al método anterior si el manager no está disponible
        const playerItem = document.createElement('div');
        playerItem.className = 'squad-player-item' + (isCustom ? ' custom-player' : '');
        playerItem.dataset.playerId = player.id;
        
        const customBadge = isCustom ? '<div class="custom-badge"><i class="fas fa-star"></i></div>' : '';
        
        playerItem.innerHTML = `
            ${customBadge}
            <div class="minicard-overall player-card-element" 
                 data-element="overall" 
                 data-player-id="${player.id}"
                 title="Overall: ${this.calculateOverall(player)}">
                ${this.calculateOverall(player)}
            </div>
            <img src="${player.image_url}" 
                 class="player-card-element" 
                 data-element="image" 
                 data-player-id="${player.id}"
                 alt="${player.name}"
                 title="${player.name}">
            <div class="player-name player-card-element" 
                 data-element="name" 
                 data-player-id="${player.id}"
                 title="Nombre: ${player.name}">
                ${player.name}
            </div>
        `;
        
        return playerItem;
    }
    
    getPlayerById(id) {
        console.log(`[PlayerManager] Buscando jugador con ID: ${id} (tipo: ${typeof id})`);
        
        // Buscar primero en jugadores personalizados, luego en estáticos
        if (this.customPlayersManager) {
            const customPlayer = this.customPlayersManager.getPlayerById(id, this.players);
            if (customPlayer) {
                console.log(`[PlayerManager] Jugador encontrado en personalizados:`, customPlayer.name);
                return customPlayer;
            }
        }
        
        const staticPlayer = this.players.find(player => {
            const match = player.id === id || player.id === String(id) || player.id === Number(id);
            if (match) {
                console.log(`[PlayerManager] Jugador encontrado en estáticos:`, player.name);
            }
            return match;
        });
        
        if (!staticPlayer) {
            console.warn(`[PlayerManager] Jugador con ID ${id} NO encontrado`);
            console.log(`[PlayerManager] IDs disponibles:`, this.players.slice(0, 5).map(p => `${p.id} (${typeof p.id})`));
        }
        
        return staticPlayer;
    }

    // Nuevo método para obtener todos los jugadores (estáticos + personalizados) con filtros
    getAllPlayers() {
        let allPlayers;
        if (this.customPlayersManager) {
            allPlayers = this.customPlayersManager.getAllPlayers(this.players);
        } else {
            allPlayers = this.players;
        }

        // Aplicar filtros de configuración si está disponible
        if (this.configurationManager) {
            return allPlayers.filter(player => 
                this.configurationManager.shouldShowPlayer(player)
            );
        }

        return allPlayers;
    }
}