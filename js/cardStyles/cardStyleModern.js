/**
 * ✨ ESTILO MODERNO PARA CARDS DE JUGADORES
 * Diseño limpio y contemporáneo
 */

function createModernCard(player, type = 'field', cardId, screenType, theme, playerId) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    const rating = player.rating || '85';
    const actualPlayerId = playerId || player.id || 'unknown';
    
    if (type === 'field') {
        return `
            <div class="minicard-overall card-style-modern" data-card-style="modern" data-player-id="${actualPlayerId}">
                <div class="modern-card-bg">
                    <div class="modern-gradient-overlay"></div>
                    <div class="modern-position-badge">
                        <span class="modern-position-text">${positionText}</span>
                    </div>
                    <div class="modern-player-image">
                        <div class="modern-image-frame">
                            <img src="${player.image}" alt="Jugador" loading="lazy">
                        </div>
                    </div>
                    <div class="modern-player-info">
                        <div class="modern-number-display">
                            <span class="modern-number-text">${player.number}</span>
                        </div>
                        <div class="modern-name-container">
                            <span class="modern-name-text">${playerName}</span>
                        </div>
                        <div class="modern-rating-chip">
                            <span class="modern-rating-text">${rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="squad-player-item card-style-modern" data-card-style="modern" data-player-id="${actualPlayerId}">
                <div class="modern-selection-card">
                    <div class="modern-card-header">
                        <div class="modern-position-chip">
                            <span class="modern-pos-text">${positionText}</span>
                        </div>
                        <div class="modern-rating-corner">
                            <span class="modern-rating-value">${rating}</span>
                        </div>
                    </div>
                    <div class="modern-player-section">
                        <div class="modern-avatar-container">
                            <div class="modern-avatar-ring">
                                <img src="${player.image}" alt="${playerName}" class="modern-player-avatar" loading="lazy">
                            </div>
                        </div>
                        <div class="modern-info-section">
                            <div class="modern-player-number">
                                <span class="modern-num-display">${player.number}</span>
                            </div>
                            <div class="modern-player-name">
                                <span class="modern-name-display">${playerName}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modern-card-footer">
                        <div class="modern-skill-bars">
                            <div class="modern-skill-bar" style="width: ${Math.min(parseInt(rating), 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerCardStyle('modern', {
        name: 'Moderno',
        description: 'Diseño limpio y contemporáneo',
        icon: '✨',
        theme: {
            primary: '#2c3e50',
            secondary: '#ecf0f1',
            accent: '#3498db'
        },
        createFunction: createModernCard
    });
}
