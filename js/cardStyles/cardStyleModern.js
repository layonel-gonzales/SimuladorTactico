// cardStyleModern.js - Estilo moderno con diseño limpio y contemporáneo
export function createModernCard(player, type = 'field', cardId, screenType, theme) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    const rating = player.rating || '85';
    
    if (type === 'field') {
        // Card moderna para el campo - diseño minimalista
        return `
            <div class="minicard-overall card-style-modern" data-card-style="modern">
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
        // Card moderna para selección - más espacio y detalles
        return `
            <div class="squad-player-item card-style-modern" data-card-style="modern" onclick="selectPlayer('${cardId}')">
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

/**
 * CSS específico para el estilo moderno
 */
export const modernCardCSS = `
    .card-style-modern {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: var(--card-primary, #2c3e50);
    }
    
    .modern-card-bg {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        overflow: hidden;
        background: linear-gradient(135deg, var(--card-secondary, #ecf0f1) 0%, #bdc3c7 100%);
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .modern-gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, var(--card-accent, #3498db) 30%, var(--card-accent, #3498db) 32%, transparent 32%);
        opacity: 0.1;
    }
    
    .modern-position-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: var(--card-accent, #3498db);
        color: white;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 9px;
        font-weight: bold;
    }
    
    .modern-image-frame {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--card-accent, #3498db);
        background: white;
    }
    
    .modern-image-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .modern-player-info {
        position: absolute;
        bottom: 5px;
        left: 0;
        right: 0;
        text-align: center;
    }
    
    .modern-number-display {
        background: var(--card-primary, #2c3e50);
        color: white;
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        line-height: 18px;
        font-size: 10px;
        font-weight: bold;
        margin-bottom: 2px;
    }
    
    .modern-name-text {
        font-size: 8px;
        font-weight: 600;
        color: var(--card-primary, #2c3e50);
        display: block;
        margin-bottom: 1px;
    }
    
    .modern-rating-chip {
        background: var(--card-accent, #3498db);
        color: white;
        display: inline-block;
        padding: 1px 4px;
        border-radius: 6px;
        font-size: 7px;
        font-weight: bold;
    }
    
    /* Estilos para selección */
    .modern-selection-card {
        background: linear-gradient(135deg, var(--card-secondary, #ecf0f1) 0%, #d5dbdb 100%);
        border-radius: 15px;
        padding: 12px;
        position: relative;
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }
    
    .modern-selection-card:hover {
        border-color: var(--card-accent, #3498db);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(52, 152, 219, 0.2);
    }
    
    .modern-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .modern-position-chip {
        background: var(--card-accent, #3498db);
        color: white;
        padding: 4px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: bold;
    }
    
    .modern-rating-corner {
        background: var(--card-primary, #2c3e50);
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
    }
    
    .modern-player-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
    }
    
    .modern-avatar-ring {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 3px solid var(--card-accent, #3498db);
        padding: 3px;
        background: white;
    }
    
    .modern-player-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .modern-info-section {
        flex: 1;
    }
    
    .modern-num-display {
        background: var(--card-primary, #2c3e50);
        color: white;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        display: inline-block;
        margin-bottom: 4px;
    }
    
    .modern-name-display {
        font-size: 13px;
        font-weight: 600;
        color: var(--card-primary, #2c3e50);
        display: block;
    }
    
    .modern-skill-bars {
        background: rgba(189, 195, 199, 0.3);
        height: 4px;
        border-radius: 2px;
        overflow: hidden;
    }
    
    .modern-skill-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--card-accent, #3498db), #2ecc71);
        border-radius: 2px;
        transition: width 0.8s ease;
    }
`;
