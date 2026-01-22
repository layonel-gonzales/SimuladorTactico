/**
 * 📺 ESTILO RETRO PARA CARDS DE JUGADORES
 * Estilo vintage de los años 80-90
 */

function createRetroCard(player, type = 'field', cardId, screenType, theme, playerId) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    const rating = player.rating || '85';
    const actualPlayerId = playerId || player.id || 'unknown';
    
    if (type === 'field') {
        return `
            <div class="minicard-overall card-style-retro" data-card-style="retro" data-player-id="${actualPlayerId}">
                <div class="retro-card-body">
                    <div class="retro-card-frame">
                        <div class="retro-position-banner">
                            <span class="retro-pos-text">${positionText}</span>
                        </div>
                        <div class="retro-player-portrait">
                            <div class="retro-photo-frame">
                                <img src="${player.image}" alt="Jugador" loading="lazy">
                            </div>
                        </div>
                        <div class="retro-player-stats">
                            <div class="retro-number-badge">
                                <span class="retro-number">${player.number}</span>
                            </div>
                            <div class="retro-name-tag">
                                <span class="retro-name">${playerName}</span>
                            </div>
                            <div class="retro-rating-star">
                                <span class="retro-rating">${rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="squad-player-item card-style-retro" data-card-style="retro" data-player-id="${actualPlayerId}">
                <div class="retro-selection-card">
                    <div class="retro-card-header">
                        <span class="retro-card-title">PLAYER CARD</span>
                    </div>
                    <div class="retro-main-content">
                        <div class="retro-left-section">
                            <div class="retro-avatar-section">
                                <div class="retro-photo-border">
                                    <img src="${player.image}" alt="${playerName}" class="retro-player-photo" loading="lazy">
                                </div>
                            </div>
                            <div class="retro-position-section">
                                <div class="retro-position-label">POSITION</div>
                                <div class="retro-position-value">${positionText}</div>
                            </div>
                        </div>
                        <div class="retro-right-section">
                            <div class="retro-player-details">
                                <div class="retro-jersey-section">
                                    <span class="retro-jersey-label">№</span>
                                    <span class="retro-jersey-number">${player.number}</span>
                                </div>
                                <div class="retro-name-section">
                                    <div class="retro-name-label">NAME</div>
                                    <div class="retro-name-value">${playerName}</div>
                                </div>
                                <div class="retro-skill-section">
                                    <div class="retro-skill-label">SKILL</div>
                                    <div class="retro-skill-meter">
                                        <div class="retro-skill-fill" style="width: ${Math.min(parseInt(rating), 100)}%">
                                            <span class="retro-skill-number">${rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerCardStyle('retro', {
        name: 'Retro',
        description: 'Estilo vintage de los años 80-90',
        icon: '📺',
        theme: {
            primary: '#8b4513',
            secondary: '#f4e4bc',
            accent: '#ff6b35'
        },
        createFunction: createRetroCard
    });
}
