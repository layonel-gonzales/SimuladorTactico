/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎴 ESTILO CLÁSICO PARA CARDS DE JUGADORES - CAPA SUPERIOR (z-index: 20)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * AISLAMIENTO: Este estilo SOLO genera HTML para las cards.
 * - No modifica el Canvas del campo (CAPA z-index: 1)
 * - Usa clases prefijadas (card-style-classic, classic-*)
 * - Siempre flota por encima del campo
 * 
 * INDEPENDENCIA: Cambiar el estilo de las cards NO afecta al campo.
 * El campo siempre permanece como base visual.
 * ═══════════════════════════════════════════════════════════════════════
 */

function createClassicCard(player, type = 'field', cardId, screenType, theme, playerId) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number || '?'}`;
    const actualPlayerId = player.id || playerId || 'unknown';
    
    if (type === 'field') {
        return `
            <div class="minicard-overall player-card-element" 
                 data-element="overall" 
                 data-player-id="${actualPlayerId}"
                 title="Overall: ${player.rating || '85'}">
                ${player.rating || '85'}
            </div>
            <div class="minicard-position player-card-element" 
                 data-element="position" 
                 data-player-id="${actualPlayerId}"
                 title="Posición: ${positionText}">
                ${positionText}
            </div>
            <img src="${player.image || player.image_url || 'img/default_player.png'}" 
                 class="minicard-player-image player-card-element" 
                 data-element="image" 
                 data-player-id="${actualPlayerId}"
                 alt="${playerName}"
                 title="${playerName}">
            <div class="minicard-name player-card-element" 
                 data-element="name" 
                 data-player-id="${actualPlayerId}"
                 title="Nombre: ${playerName}">
                ${playerName}
            </div>
            <div class="minicard-jersey-number player-card-element" 
                 data-element="jersey" 
                 data-player-id="${actualPlayerId}"
                 title="Dorsal: ${player.jersey_number || player.number || '?'}">
                ${player.jersey_number || player.number || '?'}
            </div>
        `;
    } else {
        return `
            <div class="minicard-overall player-card-element" 
                 data-element="overall" 
                 data-player-id="${actualPlayerId}"
                 title="Overall: ${player.rating || '85'}">
                ${player.rating || '85'}
            </div>
            <img src="${player.image || player.image_url || 'img/default_player.png'}" 
                 class="player-card-element" 
                 data-element="image" 
                 data-player-id="${actualPlayerId}"
                 alt="${playerName}"
                 title="${playerName}">
            <div class="player-name player-card-element" 
                 data-element="name" 
                 data-player-id="${actualPlayerId}"
                 title="Nombre: ${playerName}">
                ${playerName}
            </div>
        `;
    }
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerCardStyle('classic', {
        name: 'Clásico',
        description: 'Estilo tradicional con marco clásico',
        icon: '🎴',
        theme: {
            primary: '#333',
            secondary: '#fff',
            accent: '#ffaa00'
        },
        createFunction: createClassicCard
    });
}
