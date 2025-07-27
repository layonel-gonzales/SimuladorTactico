// cardStyleClassic.js - Estilo clásico (funcionalidad actual sin cambios)
export function createClassicCard(player, type = 'field', cardId, screenType, theme) {
    // Este es el estilo clásico que mantiene exactamente la funcionalidad actual
    // para garantizar compatibilidad total
    
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    
    if (type === 'field') {
        // Card para el campo (más compacta)
        return `
            <div class="minicard-overall card-style-classic" data-card-style="classic">
                <div class="minicard-position">
                    <span class="minicard-position-text">${positionText}</span>
                </div>
                <div class="minicard-player-image">
                    <img src="${player.image}" alt="Jugador" loading="lazy">
                </div>
                <div class="minicard-number">
                    <span class="minicard-number-text">${player.number}</span>
                </div>
                <div class="minicard-name">
                    <span class="minicard-name-text">${playerName}</span>
                </div>
                <div class="minicard-rating">
                    <span class="minicard-rating-text">${player.rating || '85'}</span>
                </div>
            </div>
        `;
    } else {
        // Card para selección (más detallada)
        return `
            <div class="squad-player-item card-style-classic" data-card-style="classic" onclick="selectPlayer('${cardId}')">
                <div class="player-info-container">
                    <div class="player-position-badge">
                        <span class="position-text">${positionText}</span>
                    </div>
                    <div class="player-image-container">
                        <img src="${player.image}" alt="${playerName}" class="player-avatar" loading="lazy">
                    </div>
                    <div class="player-number-badge">
                        <span class="number-text">${player.number}</span>
                    </div>
                    <div class="player-details">
                        <div class="player-name-text">${playerName}</div>
                        <div class="player-rating-display">
                            <span class="rating-value">${player.rating || '85'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Función auxiliar para validar datos del jugador
 */
function validatePlayerData(player) {
    return {
        number: player.number || '1',
        name: player.name || 'Jugador',
        position: player.position || '',
        image: player.image || 'img/default_player.png',
        rating: player.rating || '85'
    };
}
