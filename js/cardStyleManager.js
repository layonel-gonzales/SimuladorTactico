// cardStyleManager.js - Gestor de estilos de cards de jugador

class CardStyleManager {
    constructor() {
        this.currentStyle = 'classic';
        this.styles = {};
        this.stylesLoaded = false;
        
        console.log('🎨 CardStyleManager inicializado');
        this.loadStyles();
    }

    async loadStyles() {
        try {
            this.styles = {
                'classic': {
                    name: 'Clásico',
                    description: 'Estilo tradicional con marco clásico',
                    createFunction: this.createClassicCard,
                    icon: '🎴',
                    frameImage: 'marco3.png',
                    theme: {
                        primary: '#333',
                        secondary: '#fff',
                        accent: '#ffaa00'
                    }
                },
                'modern': {
                    name: 'Moderno',
                    description: 'Diseño limpio y contemporáneo',
                    createFunction: this.createModernCard,
                    icon: '✨',
                    frameImage: 'marco-modern.png',
                    theme: {
                        primary: '#2c3e50',
                        secondary: '#ecf0f1',
                        accent: '#3498db'
                    }
                },
                'fifa': {
                    name: 'FIFA Style',
                    description: 'Estilo inspirado en cartas FIFA',
                    createFunction: this.createFifaCard,
                    icon: '⚽',
                    frameImage: 'marco-fifa.png',
                    theme: {
                        primary: '#1a1a1a',
                        secondary: '#ffffff',
                        accent: '#00ff88'
                    }
                },
                'retro': {
                    name: 'Retro',
                    description: 'Estilo vintage de los años 80-90',
                    createFunction: this.createRetroCard,
                    icon: '📺',
                    frameImage: 'marco-retro.png',
                    theme: {
                        primary: '#8b4513',
                        secondary: '#f4e4bc',
                        accent: '#ff6b35'
                    }
                }
            };
            
            this.stylesLoaded = true;
            console.log('🎨 CardStyleManager inicializado con', Object.keys(this.styles).length, 'estilos');
            this.loadSavedStyle();
        } catch (error) {
            console.error('Error cargando estilos:', error);
            this.stylesLoaded = false;
        }
    }

    getAvailableStyles() {
        return Object.keys(this.styles).map(key => ({
            id: key,
            ...this.styles[key]
        }));
    }

    setCurrentStyle(styleId) {
        if (this.styles[styleId]) {
            this.currentStyle = styleId;
            this.saveCurrentStyle();
            console.log(`🎴 Estilo de card cambiado a: ${this.styles[styleId].name}`);
            
            window.dispatchEvent(new CustomEvent('cardStyleChanged', {
                detail: { styleId, style: this.styles[styleId] }
            }));
            
            return true;
        }
        console.warn(`❌ Estilo de card '${styleId}' no encontrado`);
        return false;
    }

    getCurrentStyle() {
        return {
            id: this.currentStyle,
            ...this.styles[this.currentStyle]
        };
    }

    createStyledCard(player, type = 'field', cardId, screenType) {
        if (!this.stylesLoaded) {
            console.warn('⚠️ Estilos no cargados, usando clásico');
            return this.createClassicCard(player, type, cardId, screenType, this.styles.classic?.theme || {});
        }
        
        const currentStyle = this.styles[this.currentStyle];
        
        try {
            return currentStyle.createFunction.call(this, player, type, cardId, screenType, currentStyle.theme);
        } catch (error) {
            console.error(`❌ Error creando card con estilo ${this.currentStyle}:`, error);
            return this.createClassicCard(player, type, cardId, screenType, this.styles.classic?.theme || {});
        }
    }

    createClassicCard(player, type = 'field', cardId, screenType, theme) {
        const positionText = player.position && player.position !== 'N/A' ? player.position : '';
        const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
        
        if (type === 'field') {
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
            return `
                <div class="squad-player-item card-style-classic" data-card-style="classic">
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

    createModernCard(player, type = 'field', cardId, screenType, theme) {
        const positionText = player.position && player.position !== 'N/A' ? player.position : '';
        const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
        const rating = player.rating || '85';
        
        if (type === 'field') {
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
            return `
                <div class="squad-player-item card-style-modern" data-card-style="modern">
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

    createFifaCard(player, type = 'field', cardId, screenType, theme) {
        const positionText = player.position && player.position !== 'N/A' ? player.position : '';
        const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
        const rating = player.rating || '85';
        const ratingColor = this.getRatingColor(parseInt(rating));
        
        if (type === 'field') {
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
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="squad-player-item card-style-fifa" data-card-style="fifa">
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

    createRetroCard(player, type = 'field', cardId, screenType, theme) {
        const positionText = player.position && player.position !== 'N/A' ? player.position : '';
        const playerName = player.name && player.name.trim() !== '' ? player.name : `Jugador ${player.number}`;
        const rating = player.rating || '85';
        
        if (type === 'field') {
            return `
                <div class="minicard-overall card-style-retro" data-card-style="retro">
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
                <div class="squad-player-item card-style-retro" data-card-style="retro">
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

    getRatingColor(rating) {
        if (rating >= 90) return 'fifa-gold';
        if (rating >= 85) return 'fifa-silver';
        if (rating >= 80) return 'fifa-bronze';
        return 'fifa-common';
    }

    saveCurrentStyle() {
        try {
            localStorage.setItem('selectedCardStyle', this.currentStyle);
        } catch (error) {
            console.warn('No se pudo guardar el estilo de card:', error);
        }
    }

    loadSavedStyle() {
        try {
            const saved = localStorage.getItem('selectedCardStyle');
            if (saved && this.styles[saved]) {
                this.currentStyle = saved;
                console.log(`🎴 Estilo de card cargado: ${this.styles[saved].name}`);
            }
        } catch (error) {
            console.warn('No se pudo cargar el estilo de card guardado:', error);
        }
    }

    init() {
        console.log('🎨 CardStyleManager inicializado completamente');
    }
}

// Crear instancia global
window.cardStyleManager = new CardStyleManager();
