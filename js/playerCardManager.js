/**
 * ==========================================
 * 🎴 GESTOR UNIFICADO DE CARDS DE JUGADOR
 * ==========================================
 * Sistema centralizado para manejar todas las cards de jugador
 * tanto en el campo como en la selección de plantilla.
 * Proporciona acceso uniforme a elementos: overall, foto, nombre, etc.
 */

class PlayerCardManager {
    constructor() {
        this.cardInstances = new Map(); // Almacena todas las instancias de cards
        this.cardElements = new Map(); // Cache de elementos DOM
        this.globalConfig = {
            showOverall: true,
            showPosition: true,
            showJerseyNumber: true,
            showPlayerName: true,
            showPlayerImage: true,
            overallStyle: 'default',
            nameStyle: 'default',
            imageStyle: 'default',
            responsiveMode: 'auto' // auto, desktop, tablet, mobile
        };
        
        this.screenSizes = {
            mobile: 480,
            tablet: 768,
            desktop: 1025
        };
        
        this.init();
    }
    
    /**
     * Inicializa el gestor de cards
     */
    init() {
        console.log('🎴 PlayerCardManager iniciado');
        this.setupCardObserver();
    }
    
    /**
     * Crea una card de jugador unificada
     * @param {Object} player - Datos del jugador
     * @param {string} type - Tipo de card: 'field' o 'selection'
     * @param {Object} options - Opciones adicionales
     * @returns {HTMLElement} Elemento DOM de la card
     */
    createPlayerCard(player, type = 'field', options = {}) {
        const screenType = this.detectScreenType();
        const timestamp = Date.now();
        const cardId = `${type}-card-${player.id}-${screenType}-${timestamp}`;
        
        // Crear elemento principal
        const cardElement = document.createElement('div');
        cardElement.className = type === 'field' ? 'player-token' : 'squad-player-item';
        cardElement.dataset.playerId = player.id;
        cardElement.dataset.cardType = type;
        cardElement.dataset.cardId = cardId;
        cardElement.dataset.screenType = screenType;
        cardElement.dataset.createdAt = timestamp;
        
        // Agregar atributos de accesibilidad
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('aria-label', `Jugador ${player.name} - ${screenType}`);
        cardElement.setAttribute('tabindex', '0');
        
        // Crear estructura interna con identificadores únicos
        const cardStructure = this.createCardStructure(player, type, cardId, screenType);
        cardElement.innerHTML = cardStructure;
        
        // Registrar la card
        this.registerCard(cardId, {
            element: cardElement,
            player: player,
            type: type,
            screenType: screenType,
            options: options
        });
        
        // Aplicar configuración global
        this.applyGlobalConfig(cardElement);
        
        return cardElement;
    }
    
    /**
     * Crea la estructura HTML interna de la card
     * @param {Object} player - Datos del jugador
     * @param {string} type - Tipo de card
     * @param {string} cardId - ID único de la card
     * @param {string} screenType - Tipo de pantalla (mobile, tablet, desktop)
     * @returns {string} HTML de la estructura
     */
    createCardStructure(player, type, cardId, screenType) {
        const overall = this.calculateOverall(player);
        const uniquePrefix = `${screenType}-${type}`;
        
        if (type === 'field') {
            return `
                <div class="minicard-overall player-card-element" 
                     data-element="overall" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-overall-${player.id}"
                     title="Overall: ${overall}">
                    ${overall}
                </div>
                <div class="minicard-position player-card-element" 
                     data-element="position" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-position-${player.id}"
                     title="Posición: ${player.position}">
                    ${player.position}
                </div>
                <img src="${player.image_url}" 
                     class="minicard-player-image player-card-element" 
                     data-element="image" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-image-${player.id}"
                     alt="Foto de ${player.name}"
                     title="${player.name}">
                <div class="minicard-name player-card-element" 
                     data-element="name" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-name-${player.id}"
                     title="Nombre: ${player.name}">
                    ${player.name}
                </div>
                <div class="minicard-jersey-number player-card-element" 
                     data-element="jersey" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-jersey-${player.id}"
                     title="Dorsal: ${player.jersey_number || '?'}">
                    ${player.jersey_number || '?'}
                </div>
            `;
        } else {
            // Card de selección (plantilla)
            return `
                <div class="minicard-overallSeleccion player-card-element" 
                     data-element="overall" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-overall-${player.id}"
                     title="Overall: ${overall}">
                    ${overall}
                </div>
                <img src="${player.image_url}" 
                     class="player-card-element" 
                     data-element="image" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-image-${player.id}"
                     alt="Foto de ${player.name}"
                     title="${player.name}">
                <div class="player-name player-card-element" 
                     data-element="name" 
                     data-card-id="${cardId}"
                     data-player-id="${player.id}"
                     data-screen-type="${screenType}"
                     data-unique-id="${uniquePrefix}-name-${player.id}"
                     title="Nombre: ${player.name}">
                    ${player.name}
                </div>
            `;
        }
    }
    
    /**
     * Registra una card en el sistema
     * @param {string} cardId - ID único de la card
     * @param {Object} cardData - Datos de la card
     */
    registerCard(cardId, cardData) {
        this.cardInstances.set(cardId, cardData);
        
        // Cache de elementos específicos
        const elements = {
            overall: cardData.element.querySelector('[data-element="overall"]'),
            position: cardData.element.querySelector('[data-element="position"]'),
            image: cardData.element.querySelector('[data-element="image"]'),
            name: cardData.element.querySelector('[data-element="name"]'),
            jersey: cardData.element.querySelector('[data-element="jersey"]')
        };
        
        this.cardElements.set(cardId, elements);
        
        console.log(`🎴 Card registrada: ${cardId}`, cardData);
    }
    
    /**
     * Obtiene una card por su ID
     * @param {string} cardId - ID de la card
     * @returns {Object} Datos de la card
     */
    getCard(cardId) {
        return this.cardInstances.get(cardId);
    }
    
    /**
     * Obtiene todas las cards de un jugador específico
     * @param {string} playerId - ID del jugador
     * @returns {Array} Array de cards del jugador
     */
    getCardsByPlayerId(playerId) {
        const cards = [];
        for (const [cardId, cardData] of this.cardInstances) {
            if (cardData.player.id === playerId) {
                cards.push({ cardId, ...cardData });
            }
        }
        return cards;
    }
    
    /**
     * Obtiene un elemento específico de una card
     * @param {string} cardId - ID de la card
     * @param {string} elementType - Tipo de elemento (overall, name, image, etc.)
     * @returns {HTMLElement} Elemento DOM
     */
    getCardElement(cardId, elementType) {
        const elements = this.cardElements.get(cardId);
        return elements ? elements[elementType] : null;
    }
    
    /**
     * Actualiza un elemento específico de una card
     * @param {string} cardId - ID de la card
     * @param {string} elementType - Tipo de elemento
     * @param {string|Object} value - Nuevo valor
     */
    updateCardElement(cardId, elementType, value) {
        const element = this.getCardElement(cardId, elementType);
        if (!element) {
            console.warn(`Elemento ${elementType} no encontrado en card ${cardId}`);
            return;
        }
        
        switch (elementType) {
            case 'overall':
                element.textContent = value;
                element.title = `Overall: ${value}`;
                break;
            case 'name':
                element.textContent = value;
                element.title = `Nombre: ${value}`;
                break;
            case 'position':
                element.textContent = value;
                element.title = `Posición: ${value}`;
                break;
            case 'jersey':
                element.textContent = value;
                element.title = `Dorsal: ${value}`;
                break;
            case 'image':
                if (typeof value === 'string') {
                    element.src = value;
                    element.alt = `Foto actualizada`;
                } else if (typeof value === 'object') {
                    Object.assign(element.style, value);
                }
                break;
        }
        
        console.log(`🔄 Actualizado ${elementType} en card ${cardId}:`, value);
    }
    
    /**
     * Actualiza datos completos de un jugador en todas sus cards
     * @param {string} playerId - ID del jugador
     * @param {Object} playerData - Nuevos datos del jugador
     */
    updatePlayerInAllCards(playerId, playerData) {
        const playerCards = this.getCardsByPlayerId(playerId);
        
        playerCards.forEach(({ cardId }) => {
            if (playerData.name) {
                this.updateCardElement(cardId, 'name', playerData.name);
            }
            if (playerData.image_url) {
                this.updateCardElement(cardId, 'image', playerData.image_url);
            }
            if (playerData.position) {
                this.updateCardElement(cardId, 'position', playerData.position);
            }
            if (playerData.jersey_number) {
                this.updateCardElement(cardId, 'jersey', playerData.jersey_number);
            }
            
            // Recalcular overall si han cambiado las estadísticas
            if (playerData.pace || playerData.shooting || playerData.passing || 
                playerData.dribbling || playerData.defending || playerData.physical) {
                const newOverall = this.calculateOverall(playerData);
                this.updateCardElement(cardId, 'overall', newOverall);
            }
        });
        
        console.log(`🔄 Jugador ${playerId} actualizado en ${playerCards.length} cards`);
    }
    
    /**
     * Aplica configuración global a una card
     * @param {HTMLElement} cardElement - Elemento de la card
     */
    applyGlobalConfig(cardElement) {
        const config = this.globalConfig;
        
        // Mostrar/ocultar elementos
        const overall = cardElement.querySelector('[data-element="overall"]');
        const position = cardElement.querySelector('[data-element="position"]');
        const name = cardElement.querySelector('[data-element="name"]');
        const image = cardElement.querySelector('[data-element="image"]');
        const jersey = cardElement.querySelector('[data-element="jersey"]');
        
        if (overall) overall.style.display = config.showOverall ? 'flex' : 'none';
        if (position) position.style.display = config.showPosition ? 'block' : 'none';
        if (name) name.style.display = config.showPlayerName ? 'block' : 'none';
        if (image) image.style.display = config.showPlayerImage ? 'block' : 'none';
        if (jersey) jersey.style.display = config.showJerseyNumber ? 'block' : 'none';
    }
    
    /**
     * Actualiza la configuración global
     * @param {Object} newConfig - Nueva configuración
     */
    updateGlobalConfig(newConfig) {
        this.globalConfig = { ...this.globalConfig, ...newConfig };
        
        // Aplicar a todas las cards existentes
        for (const [cardId, cardData] of this.cardInstances) {
            this.applyGlobalConfig(cardData.element);
        }
        
        console.log('🔧 Configuración global actualizada:', this.globalConfig);
    }
    
    /**
     * Remueve una card del sistema
     * @param {string} cardId - ID de la card a remover
     */
    removeCard(cardId) {
        const cardData = this.cardInstances.get(cardId);
        if (cardData && cardData.element.parentNode) {
            cardData.element.parentNode.removeChild(cardData.element);
        }
        
        this.cardInstances.delete(cardId);
        this.cardElements.delete(cardId);
        
        console.log(`🗑️ Card removida: ${cardId}`);
    }
    
    /**
     * Calcula el overall de un jugador
     * @param {Object} player - Datos del jugador
     * @returns {number} Overall calculado
     */
    calculateOverall(player) {
        const stats = [
            player.pace || 50,
            player.shooting || 50,
            player.passing || 50,
            player.dribbling || 50,
            player.defending || 50,
            player.physical || 50
        ];
        return Math.round(stats.reduce((sum, stat) => sum + stat, 0) / stats.length);
    }
    
    /**
     * Observa cambios en el DOM para detectar nuevas cards
     */
    setupCardObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Buscar cards que no estén registradas
                        const cards = node.querySelectorAll?.('.player-token, .squad-player-item') || [];
                        cards.forEach((card) => {
                            if (!card.dataset.cardId) {
                                console.log('🔍 Card no registrada detectada:', card);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Obtiene estadísticas del sistema
     * @returns {Object} Estadísticas actuales
     */
    getStats() {
        const fieldCards = [];
        const selectionCards = [];
        
        for (const [cardId, cardData] of this.cardInstances) {
            if (cardData.type === 'field') {
                fieldCards.push(cardId);
            } else {
                selectionCards.push(cardId);
            }
        }
        
        return {
            totalCards: this.cardInstances.size,
            fieldCards: fieldCards.length,
            selectionCards: selectionCards.length,
            fieldCardIds: fieldCards,
            selectionCardIds: selectionCards,
            currentScreenType: this.detectScreenType(),
            globalConfig: { ...this.globalConfig }
        };
    }
    
    /**
     * Detecta el tipo de pantalla actual
     * @returns {string} Tipo de pantalla: 'mobile', 'tablet', 'desktop'
     */
    detectScreenType() {
        if (this.globalConfig.responsiveMode !== 'auto') {
            return this.globalConfig.responsiveMode;
        }
        
        const width = window.innerWidth || document.documentElement.clientWidth;
        
        if (width <= this.screenSizes.mobile) {
            return 'mobile';
        } else if (width <= this.screenSizes.tablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    /**
     * Obtiene cards por tipo de pantalla
     * @param {string} screenType - Tipo de pantalla
     * @returns {Array} Array de cards para ese tipo de pantalla
     */
    getCardsByScreenType(screenType) {
        const cards = [];
        for (const [cardId, cardData] of this.cardInstances) {
            if (cardData.screenType === screenType) {
                cards.push({ cardId, ...cardData });
            }
        }
        return cards;
    }
}

// Instancia global
window.playerCardManager = new PlayerCardManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerCardManager;
}
