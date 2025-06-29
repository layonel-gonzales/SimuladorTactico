export default class PlayerManager {
    constructor(players) {
        this.players = players;
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
        const positionType = this.getPositionType(position);
        const weights = {
            GK: { pace: 0.1, shooting: 0, passing: 0.1, dribbling: 0, defending: 0.5, physical: 0.3 },
            DF: { pace: 0.2, shooting: 0.1, passing: 0.2, dribbling: 0.1, defending: 0.3, physical: 0.2 },
            MC: { pace: 0.1, shooting: 0.1, passing: 0.3, dribbling: 0.25, defending: 0.1, physical: 0.15 },
            FW: { pace: 0.2, shooting: 0.4, passing: 0.05, dribbling: 0.25, defending: 0.05, physical: 0.05 }
        };
        
        return weights[positionType] || weights.MC;
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
        const container = document.getElementById('squad-player-list');
        container.innerHTML = '';
        
        // Agrupar por posición
        const byPosition = {
            Porteros: this.players.filter(p => p.position === 'GK'),
            Defensas: this.players.filter(p => ['CB','RB','LB'].includes(p.position)),
            Mediocampistas: this.players.filter(p => ['CM','CDM','CAM','RM','LM'].includes(p.position)),
            Delanteros: this.players.filter(p => ['ST','CF','RW','LW'].includes(p.position))
        };
        
        // Renderizar por grupos
        for (const [position, players] of Object.entries(byPosition)) {
            if (players.length === 0) continue;
            
            const groupHeader = document.createElement('div');
            groupHeader.className = 'col-12 mt-3 mb-1 fw-bold text-white';
            groupHeader.textContent = position;
            container.appendChild(groupHeader);
            
            players.forEach(player => {
                const playerItem = this.createPlayerSelectionItem(player);
                container.appendChild(playerItem);
            });
        }
    }

    createPlayerSelectionItem(player) {
        const playerItem = document.createElement('div');
        playerItem.className = 'squad-player-item';
        playerItem.dataset.playerId = player.id;
        
        playerItem.innerHTML = `
            <div class="minicard-overall">${this.calculateOverall(player)}</div>
            <img src="${player.image_url}" alt="${player.name}">
            <div class="player-name">${player.name}</div>
            <div class="player-position">${player.position}</div>
            <div class="minicard-jersey-number">#${player.jersey_number}</div>
        `;
        
        return playerItem;
    }
    
    getPlayerById(id) {
        return this.players.find(player => player.id === id);
    }
}