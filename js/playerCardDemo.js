/**
 * ==========================================
 * 🧪 DEMO DEL GESTOR DE CARDS DE JUGADOR
 * ==========================================
 * Archivo de demostración para mostrar cómo usar
 * el PlayerCardManager y acceder a los elementos.
 */

class PlayerCardDemo {
    constructor() {
        this.init();
    }
    
    init() {
        // Esperar a que el DOM y el playerCardManager estén listos
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('🧪 PlayerCardDemo iniciado');
        
        // Esperar a que el playerCardManager esté disponible
        if (!window.playerCardManager) {
            setTimeout(() => this.setup(), 100);
            return;
        }
        
        this.playerCardManager = window.playerCardManager;
        this.setupExamples();
    }
    
    setupExamples() {
        // Agregar botones de demo si estamos en modo desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createDemoButtons();
        }
        
        // Configurar listeners para eventos de card
        this.setupCardEventListeners();
    }
    
    createDemoButtons() {
        const demoContainer = document.createElement('div');
        demoContainer.id = 'player-card-demo';
        demoContainer.style.cssText = `
            position: fixed;
            top: 100px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
        `;
        
        demoContainer.innerHTML = `
            <h4>🧪 Player Card Demo</h4>
            <button onclick="playerCardDemo.demonstrateAccess()">🔍 Mostrar acceso a elementos</button><br><br>
            <button onclick="playerCardDemo.demonstrateUpdate()">✏️ Actualizar elementos</button><br><br>
            <button onclick="playerCardDemo.demonstrateConfig()">⚙️ Cambiar configuración</button><br><br>
            <button onclick="playerCardDemo.showStats()">📊 Mostrar estadísticas</button><br><br>
            <button onclick="playerCardDemo.toggleDemo()">❌ Cerrar</button>
        `;
        
        document.body.appendChild(demoContainer);
        this.demoContainer = demoContainer;
    }
    
    toggleDemo() {
        if (this.demoContainer) {
            this.demoContainer.style.display = 
                this.demoContainer.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Demuestra cómo acceder a elementos específicos de las cards
     */
    demonstrateAccess() {
        console.log('🔍 DEMO: Acceso a elementos de cards');
        
        const stats = this.playerCardManager.getStats();
        console.log('📊 Estadísticas actuales:', stats);
        
        // Buscar la primera card en el campo
        const fieldCards = stats.fieldCardIds;
        if (fieldCards.length > 0) {
            const cardId = fieldCards[0];
            const card = this.playerCardManager.getCard(cardId);
            
            console.log(`🎴 Analizando card: ${cardId}`);
            console.log('📋 Datos de la card:', card);
            
            // Acceder a elementos específicos
            const overall = this.playerCardManager.getCardElement(cardId, 'overall');
            const name = this.playerCardManager.getCardElement(cardId, 'name');
            const image = this.playerCardManager.getCardElement(cardId, 'image');
            
            console.log('🏆 Overall element:', overall);
            console.log('👤 Name element:', name);
            console.log('🖼️ Image element:', image);
            
            // Resaltar elementos visualmente
            if (overall) {
                overall.style.outline = '3px solid #ff0000';
                setTimeout(() => overall.style.outline = '', 2000);
            }
            if (name) {
                name.style.outline = '3px solid #00ff00';
                setTimeout(() => name.style.outline = '', 2000);
            }
            if (image) {
                image.style.outline = '3px solid #0000ff';
                setTimeout(() => image.style.outline = '', 2000);
            }
            
        } else {
            console.log('⚠️ No hay cards en el campo para demostrar');
        }
    }
    
    /**
     * Demuestra cómo actualizar elementos
     */
    demonstrateUpdate() {
        console.log('✏️ DEMO: Actualización de elementos');
        
        const stats = this.playerCardManager.getStats();
        const fieldCards = stats.fieldCardIds;
        
        if (fieldCards.length > 0) {
            const cardId = fieldCards[0];
            const card = this.playerCardManager.getCard(cardId);
            
            console.log(`🔄 Actualizando card: ${cardId}`);
            
            // Guardar valores originales
            const originalName = card.player.name;
            const originalOverall = this.playerCardManager.calculateOverall(card.player);
            
            // Actualizar elementos temporalmente
            this.playerCardManager.updateCardElement(cardId, 'name', '⭐ DEMO PLAYER ⭐');
            this.playerCardManager.updateCardElement(cardId, 'overall', '99');
            
            console.log('✅ Elementos actualizados temporalmente');
            
            // Restaurar después de 3 segundos
            setTimeout(() => {
                this.playerCardManager.updateCardElement(cardId, 'name', originalName);
                this.playerCardManager.updateCardElement(cardId, 'overall', originalOverall);
                console.log('🔄 Elementos restaurados');
            }, 3000);
            
        } else {
            console.log('⚠️ No hay cards en el campo para demostrar');
        }
    }
    
    /**
     * Demuestra cambios de configuración global
     */
    demonstrateConfig() {
        console.log('⚙️ DEMO: Configuración global');
        
        const currentConfig = this.playerCardManager.globalConfig;
        console.log('📋 Configuración actual:', currentConfig);
        
        // Alternar visibilidad del overall
        const newShowOverall = !currentConfig.showOverall;
        this.playerCardManager.updateGlobalConfig({
            showOverall: newShowOverall
        });
        
        console.log(`👁️ Overall visibility cambiado a: ${newShowOverall}`);
        
        // Restaurar después de 3 segundos
        setTimeout(() => {
            this.playerCardManager.updateGlobalConfig({
                showOverall: currentConfig.showOverall
            });
            console.log('🔄 Configuración restaurada');
        }, 3000);
    }
    
    /**
     * Muestra estadísticas detalladas
     */
    showStats() {
        console.log('📊 DEMO: Estadísticas del sistema');
        
        const stats = this.playerCardManager.getStats();
        console.log('📊 Estadísticas completas:', stats);
        
        // Mostrar cards por jugador
        if (stats.fieldCards > 0) {
            const firstFieldCard = stats.fieldCardIds[0];
            const card = this.playerCardManager.getCard(firstFieldCard);
            const playerId = card.player.id;
            
            const playerCards = this.playerCardManager.getCardsByPlayerId(playerId);
            console.log(`👤 Cards del jugador ${playerId}:`, playerCards);
        }
        
        // Crear un resumen visual
        this.showStatsOverlay(stats);
    }
    
    showStatsOverlay(stats) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10001;
            font-family: monospace;
            max-width: 400px;
        `;
        
        overlay.innerHTML = `
            <h3>📊 Estadísticas del PlayerCardManager</h3>
            <p><strong>Total de Cards:</strong> ${stats.totalCards}</p>
            <p><strong>Cards en Campo:</strong> ${stats.fieldCards}</p>
            <p><strong>Cards en Selección:</strong> ${stats.selectionCards}</p>
            <p><strong>Configuración Global:</strong></p>
            <ul>
                <li>Mostrar Overall: ${stats.globalConfig.showOverall ? '✅' : '❌'}</li>
                <li>Mostrar Posición: ${stats.globalConfig.showPosition ? '✅' : '❌'}</li>
                <li>Mostrar Nombre: ${stats.globalConfig.showPlayerName ? '✅' : '❌'}</li>
                <li>Mostrar Imagen: ${stats.globalConfig.showPlayerImage ? '✅' : '❌'}</li>
                <li>Mostrar Dorsal: ${stats.globalConfig.showJerseyNumber ? '✅' : '❌'}</li>
            </ul>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 5px 10px;">Cerrar</button>
        `;
        
        document.body.appendChild(overlay);
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 10000);
    }
    
    setupCardEventListeners() {
        // Listener para clics en elementos de card
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('player-card-element')) {
                const elementType = e.target.dataset.element;
                const playerId = e.target.dataset.playerId;
                const cardId = e.target.dataset.cardId;
                
                console.log(`🖱️ Clic en elemento ${elementType} del jugador ${playerId} (card: ${cardId})`);
                
                // Aquí se puede agregar lógica para edición
                this.handleElementClick(e.target, elementType, playerId, cardId);
            }
        });
    }
    
    handleElementClick(element, elementType, playerId, cardId) {
        // Ejemplo de edición simple para el nombre
        if (elementType === 'name' && e.ctrlKey) {
            const currentValue = element.textContent;
            const newValue = prompt(`Editar ${elementType}:`, currentValue);
            
            if (newValue && newValue !== currentValue) {
                this.playerCardManager.updateCardElement(cardId, elementType, newValue);
                console.log(`✅ ${elementType} actualizado: ${newValue}`);
            }
        }
    }
}

// Inicializar demo
window.playerCardDemo = new PlayerCardDemo();

// Función global para acceso rápido desde consola
window.showPlayerCardStats = () => {
    if (window.playerCardManager) {
        console.log('📊 PlayerCardManager Stats:', window.playerCardManager.getStats());
    }
};

window.getPlayerCardElement = (playerId, elementType) => {
    if (window.playerCardManager) {
        const cards = window.playerCardManager.getCardsByPlayerId(playerId);
        if (cards.length > 0) {
            return window.playerCardManager.getCardElement(cards[0].cardId, elementType);
        }
    }
    return null;
};

console.log('🧪 PlayerCardDemo cargado. Funciones disponibles:');
console.log('   - showPlayerCardStats()');
console.log('   - getPlayerCardElement(playerId, elementType)');
