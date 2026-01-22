/**
 * ⚽ ESTILO FIFA PARA CARDS DE JUGADORES
 * Estilo inspirado en cartas FIFA
 */

function getRatingColor(rating) {
    if (rating >= 90) return 'fifa-gold';
    if (rating >= 85) return 'fifa-silver';
    if (rating >= 80) return 'fifa-bronze';
    return 'fifa-common';
}

function createFifaCard(player, type = 'field', cardId, screenType, theme, playerId) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    const rating = player.rating || '85';
    const ratingColor = getRatingColor(parseInt(rating));
    const actualPlayerId = playerId || player.id || 'unknown';
    
    if (type === 'field') {
        return `
            <div class="minicard-overall card-style-fifa" data-card-style="fifa" data-player-id="${actualPlayerId}">
                <div class="fifa-card-container">
                    <div class="fifa-card-background">
                        <div class="fifa-rating-corner ${ratingColor}">
                            <div class="fifa-rating-number">${rating}</div>
                            <div class="fifa-position-text">${positionText}</div>
                        </div>
                        <div class="fifa-player-photo">
                            <img src="${player.image}" alt="Jugador" loading="lazy">
                        </div>
                        <div class="fifa-player-details">
                            <div class="fifa-player-name">${playerName}</div>
                            <div class="fifa-player-number">${player.number}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="squad-player-item card-style-fifa" data-card-style="fifa" data-player-id="${actualPlayerId}">
                <div class="fifa-selection-card">
                    <div class="fifa-card-top">
                        <div class="fifa-rating-badge ${ratingColor}">
                            <span class="fifa-overall-rating">${rating}</span>
                            <span class="fifa-ovr-label">OVR</span>
                        </div>
                        <div class="fifa-position-badge">
                            <span class="fifa-pos-label">${positionText}</span>
                        </div>
                    </div>
                    <div class="fifa-player-section">
                        <div class="fifa-player-image-container">
                            <div class="fifa-image-frame">
                                <img src="${player.image}" alt="${playerName}" class="fifa-player-img" loading="lazy">
                            </div>
                        </div>
                        <div class="fifa-player-info">
                            <div class="fifa-number-display">
                                <span class="fifa-jersey-number">${player.number}</span>
                            </div>
                            <div class="fifa-name-container">
                                <span class="fifa-player-surname">${playerName}</span>
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
    window.styleRegistry.registerCardStyle('fifa', {
        name: 'FIFA Style',
        description: 'Estilo inspirado en cartas FIFA',
        icon: '⚽',
        theme: {
            primary: '#1a1a1a',
            secondary: '#ffffff',
            accent: '#00ff88'
        },
        createFunction: createFifaCard
    });
}
