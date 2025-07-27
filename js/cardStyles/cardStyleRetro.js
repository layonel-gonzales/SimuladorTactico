// cardStyleRetro.js - Estilo vintage de los años 80-90
export function createRetroCard(player, type = 'field', cardId, screenType, theme) {
    const positionText = player.position && player.position !== 'N/A' ? player.position : '';
    const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
    const rating = player.rating || '85';
    
    if (type === 'field') {
        // Card retro para el campo - estilo vintage compacto
        return `
            <div class="minicard-overall card-style-retro" data-card-style="retro">
                <div class="retro-card-body">
                    <div class="retro-card-frame">
                        <div class="retro-corner-decoration top-left"></div>
                        <div class="retro-corner-decoration top-right"></div>
                        <div class="retro-corner-decoration bottom-left"></div>
                        <div class="retro-corner-decoration bottom-right"></div>
                        
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
                        
                        <div class="retro-pattern-overlay"></div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Card retro para selección - estilo vintage expandido
        return `
            <div class="squad-player-item card-style-retro" data-card-style="retro" onclick="selectPlayer('${cardId}')">
                <div class="retro-selection-card">
                    <div class="retro-card-header">
                        <div class="retro-header-line"></div>
                        <div class="retro-title-section">
                            <span class="retro-card-title">PLAYER CARD</span>
                        </div>
                        <div class="retro-header-line"></div>
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
                    
                    <div class="retro-card-footer">
                        <div class="retro-footer-pattern"></div>
                        <span class="retro-copyright">© STOIKO FC '90</span>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * CSS específico para el estilo retro
 */
export const retroCardCSS = `
    .card-style-retro {
        font-family: 'Courier New', monospace;
        color: var(--card-primary, #8b4513);
    }
    
    /* Card para campo */
    .retro-card-body {
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(145deg, var(--card-secondary, #f4e4bc) 0%, #e6d3a3 100%);
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 
            inset 0 0 0 2px var(--card-accent, #ff6b35),
            inset 0 0 0 4px var(--card-primary, #8b4513),
            0 4px 12px rgba(139, 69, 19, 0.3);
    }
    
    .retro-card-frame {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 4px;
    }
    
    /* Decoraciones de esquinas */
    .retro-corner-decoration {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--card-accent, #ff6b35);
        border: 1px solid var(--card-primary, #8b4513);
    }
    
    .retro-corner-decoration.top-left { top: 2px; left: 2px; border-radius: 0 0 4px 0; }
    .retro-corner-decoration.top-right { top: 2px; right: 2px; border-radius: 0 0 0 4px; }
    .retro-corner-decoration.bottom-left { bottom: 2px; left: 2px; border-radius: 0 4px 0 0; }
    .retro-corner-decoration.bottom-right { bottom: 2px; right: 2px; border-radius: 4px 0 0 0; }
    
    .retro-position-banner {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--card-primary, #8b4513);
        color: var(--card-secondary, #f4e4bc);
        padding: 2px 6px;
        font-size: 8px;
        font-weight: bold;
        border-radius: 2px;
        border: 1px solid var(--card-accent, #ff6b35);
    }
    
    .retro-photo-frame {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        width: 28px;
        height: 28px;
        background: var(--card-secondary, #f4e4bc);
        border: 2px solid var(--card-primary, #8b4513);
        border-radius: 2px;
        overflow: hidden;
        box-shadow: inset 0 0 0 1px var(--card-accent, #ff6b35);
    }
    
    .retro-photo-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: sepia(20%) contrast(1.1);
    }
    
    .retro-player-stats {
        position: absolute;
        bottom: 4px;
        left: 0;
        right: 0;
        text-align: center;
    }
    
    .retro-number-badge {
        background: var(--card-accent, #ff6b35);
        color: var(--card-secondary, #f4e4bc);
        display: inline-block;
        width: 16px;
        height: 16px;
        line-height: 14px;
        font-size: 9px;
        font-weight: bold;
        border: 1px solid var(--card-primary, #8b4513);
        margin-bottom: 2px;
    }
    
    .retro-name {
        font-size: 7px;
        font-weight: bold;
        color: var(--card-primary, #8b4513);
        text-transform: uppercase;
        display: block;
        margin-bottom: 1px;
        text-shadow: 1px 1px 0 rgba(244, 228, 188, 0.8);
    }
    
    .retro-rating-star {
        background: var(--card-primary, #8b4513);
        color: var(--card-secondary, #f4e4bc);
        display: inline-block;
        padding: 1px 3px;
        font-size: 7px;
        font-weight: bold;
        border-radius: 2px;
        border: 1px solid var(--card-accent, #ff6b35);
    }
    
    .retro-pattern-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
            repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255, 107, 53, 0.05) 2px,
                rgba(255, 107, 53, 0.05) 4px
            );
        pointer-events: none;
    }
    
    /* Card para selección */
    .retro-selection-card {
        background: linear-gradient(145deg, var(--card-secondary, #f4e4bc) 0%, #e6d3a3 100%);
        border: 3px solid var(--card-primary, #8b4513);
        border-radius: 8px;
        padding: 12px;
        position: relative;
        overflow: hidden;
        box-shadow: 
            inset 0 0 0 1px var(--card-accent, #ff6b35),
            0 6px 20px rgba(139, 69, 19, 0.2);
        transition: all 0.3s ease;
    }
    
    .retro-selection-card:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 
            inset 0 0 0 1px var(--card-accent, #ff6b35),
            0 8px 25px rgba(139, 69, 19, 0.3);
    }
    
    .retro-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
    }
    
    .retro-header-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--card-accent, #ff6b35), transparent);
    }
    
    .retro-card-title {
        font-size: 10px;
        font-weight: bold;
        color: var(--card-primary, #8b4513);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .retro-main-content {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
    }
    
    .retro-left-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    
    .retro-photo-border {
        width: 50px;
        height: 50px;
        background: var(--card-secondary, #f4e4bc);
        border: 3px solid var(--card-primary, #8b4513);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }
    
    .retro-photo-border::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px solid var(--card-accent, #ff6b35);
        border-radius: 1px;
    }
    
    .retro-player-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: sepia(15%) contrast(1.1) brightness(1.05);
    }
    
    .retro-position-section {
        text-align: center;
    }
    
    .retro-position-label {
        font-size: 8px;
        color: var(--card-primary, #8b4513);
        font-weight: bold;
        margin-bottom: 2px;
    }
    
    .retro-position-value {
        background: var(--card-accent, #ff6b35);
        color: var(--card-secondary, #f4e4bc);
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        border-radius: 2px;
        border: 1px solid var(--card-primary, #8b4513);
    }
    
    .retro-right-section {
        flex: 1;
    }
    
    .retro-jersey-section {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
    }
    
    .retro-jersey-label {
        color: var(--card-primary, #8b4513);
        font-size: 12px;
        font-weight: bold;
    }
    
    .retro-jersey-number {
        background: var(--card-primary, #8b4513);
        color: var(--card-secondary, #f4e4bc);
        padding: 4px 8px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 2px;
        border: 1px solid var(--card-accent, #ff6b35);
    }
    
    .retro-name-section {
        margin-bottom: 8px;
    }
    
    .retro-name-label {
        font-size: 8px;
        color: var(--card-primary, #8b4513);
        font-weight: bold;
        margin-bottom: 2px;
    }
    
    .retro-name-value {
        font-size: 12px;
        color: var(--card-primary, #8b4513);
        font-weight: bold;
        text-transform: uppercase;
        text-shadow: 1px 1px 0 rgba(244, 228, 188, 0.8);
    }
    
    .retro-skill-section {
        margin-bottom: 6px;
    }
    
    .retro-skill-label {
        font-size: 8px;
        color: var(--card-primary, #8b4513);
        font-weight: bold;
        margin-bottom: 4px;
    }
    
    .retro-skill-meter {
        background: var(--card-primary, #8b4513);
        height: 12px;
        border-radius: 2px;
        overflow: hidden;
        border: 1px solid var(--card-accent, #ff6b35);
        position: relative;
    }
    
    .retro-skill-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--card-accent, #ff6b35), #ffa500);
        transition: width 0.8s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    
    .retro-skill-number {
        color: var(--card-secondary, #f4e4bc);
        font-size: 8px;
        font-weight: bold;
        text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
    }
    
    .retro-card-footer {
        border-top: 2px solid var(--card-accent, #ff6b35);
        padding-top: 6px;
        text-align: center;
        position: relative;
    }
    
    .retro-footer-pattern {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: repeating-linear-gradient(
            90deg,
            var(--card-accent, #ff6b35),
            var(--card-accent, #ff6b35) 4px,
            var(--card-primary, #8b4513) 4px,
            var(--card-primary, #8b4513) 8px
        );
    }
    
    .retro-copyright {
        color: var(--card-primary, #8b4513);
        font-size: 8px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
`;
