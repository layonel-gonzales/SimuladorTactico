// cardStyleFifa.js - Estilo inspirado en cartas FIFA con diseño deportivo
export function createFifaCard(player, type = 'field', cardId, screenType, theme) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    const rating = player.rating || '85';
    
    // Determinar color del rating
    const ratingColor = getRatingColor(parseInt(rating));
    
    if (type === 'field') {
        // Card FIFA para el campo - estilo compact deportivo
        return `
            <div class="minicard-overall card-style-fifa" data-card-style="fifa">
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
                        <div class="fifa-card-accent"></div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Card FIFA para selección - más espacio y estadísticas
        return `
            <div class="squad-player-item card-style-fifa" data-card-style="fifa" onclick="selectPlayer('${cardId}')">
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
                            <div class="fifa-stats-preview">
                                <div class="fifa-stat-bar">
                                    <span class="fifa-stat-label">SKL</span>
                                    <div class="fifa-stat-value" style="width: ${Math.min(parseInt(rating), 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="fifa-card-footer">
                        <div class="fifa-club-info">
                            <span class="fifa-team-name">STOIKO FC</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Determinar color del rating según el valor
 */
function getRatingColor(rating) {
    if (rating >= 90) return 'fifa-gold';
    if (rating >= 85) return 'fifa-silver';
    if (rating >= 80) return 'fifa-bronze';
    return 'fifa-common';
}

/**
 * CSS específico para el estilo FIFA
 */
export const fifaCardCSS = `
    .card-style-fifa {
        font-family: 'Arial', sans-serif;
        color: var(--card-primary, #1a1a1a);
    }
    
    /* Colores de rating FIFA */
    .fifa-gold { background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a1a; }
    .fifa-silver { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #1a1a1a; }
    .fifa-bronze { background: linear-gradient(135deg, #CD7F32, #B8860B); color: white; }
    .fifa-common { background: linear-gradient(135deg, #4A4A4A, #2A2A2A); color: white; }
    
    /* Card para campo */
    .fifa-card-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid var(--card-accent, #00ff88);
    }
    
    .fifa-card-background {
        position: relative;
        width: 100%;
        height: 100%;
        background-image: 
            radial-gradient(circle at 20% 20%, rgba(0,255,136,0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(0,255,136,0.05) 30%, rgba(0,255,136,0.05) 32%, transparent 32%);
    }
    
    .fifa-rating-corner {
        position: absolute;
        top: 6px;
        left: 6px;
        width: 24px;
        height: 30px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    .fifa-rating-number {
        font-size: 11px;
        line-height: 1;
        margin-bottom: 1px;
    }
    
    .fifa-position-text {
        font-size: 7px;
        line-height: 1;
    }
    
    .fifa-player-photo {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -55%);
        width: 34px;
        height: 34px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--card-accent, #00ff88);
        background: #1a1a1a;
    }
    
    .fifa-player-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .fifa-player-details {
        position: absolute;
        bottom: 5px;
        left: 0;
        right: 0;
        text-align: center;
    }
    
    .fifa-player-name {
        color: var(--card-accent, #00ff88);
        font-size: 8px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 1px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }
    
    .fifa-player-number {
        color: white;
        font-size: 10px;
        font-weight: bold;
        background: var(--card-accent, #00ff88);
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        line-height: 16px;
        color: #1a1a1a;
    }
    
    .fifa-card-accent {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--card-accent, #00ff88), #00cc6a);
    }
    
    /* Card para selección */
    .fifa-selection-card {
        background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 12px;
        padding: 12px;
        border: 2px solid var(--card-accent, #00ff88);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .fifa-selection-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        border-color: #00ff88;
    }
    
    .fifa-selection-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            radial-gradient(circle at 80% 20%, rgba(0,255,136,0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 60%, rgba(0,255,136,0.05) 60%, rgba(0,255,136,0.05) 62%, transparent 62%);
        pointer-events: none;
    }
    
    .fifa-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }
    
    .fifa-rating-badge {
        width: 35px;
        height: 40px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    }
    
    .fifa-overall-rating {
        font-size: 16px;
        line-height: 1;
    }
    
    .fifa-ovr-label {
        font-size: 8px;
        line-height: 1;
        margin-top: 2px;
    }
    
    .fifa-position-badge {
        background: rgba(0, 255, 136, 0.2);
        border: 1px solid var(--card-accent, #00ff88);
        color: var(--card-accent, #00ff88);
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: bold;
    }
    
    .fifa-player-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
    }
    
    .fifa-image-frame {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 3px solid var(--card-accent, #00ff88);
        overflow: hidden;
        background: #1a1a1a;
        position: relative;
    }
    
    .fifa-player-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .fifa-player-info {
        flex: 1;
        color: white;
    }
    
    .fifa-jersey-number {
        background: var(--card-accent, #00ff88);
        color: #1a1a1a;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        display: inline-block;
        margin-bottom: 4px;
    }
    
    .fifa-player-surname {
        color: var(--card-accent, #00ff88);
        font-size: 13px;
        font-weight: bold;
        text-transform: uppercase;
        display: block;
        margin-bottom: 6px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }
    
    .fifa-stats-preview {
        margin-top: 4px;
    }
    
    .fifa-stat-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
    }
    
    .fifa-stat-label {
        color: #aaa;
        font-size: 9px;
        font-weight: bold;
        width: 20px;
    }
    
    .fifa-stat-value {
        height: 3px;
        background: linear-gradient(90deg, var(--card-accent, #00ff88), #00cc6a);
        border-radius: 2px;
        transition: width 0.8s ease;
    }
    
    .fifa-card-footer {
        border-top: 1px solid rgba(0, 255, 136, 0.2);
        padding-top: 6px;
        text-align: center;
    }
    
    .fifa-team-name {
        color: #aaa;
        font-size: 9px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
`;
