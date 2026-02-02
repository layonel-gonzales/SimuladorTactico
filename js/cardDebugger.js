/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔍 CARD DEBUGGER - ANALIZADOR DE ESTRUCTURA DE CARDS
 * ═══════════════════════════════════════════════════════════════════════
 */

class CardDebugger {
    static analyzeCanvasCards() {
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 ANÁLISIS DE CARDS EN CANVAS');
        console.log('═══════════════════════════════════════════════════════');
        
        const canvasCards = document.querySelectorAll('.pitch-container .player-token, .pitch-container .player-card-wrapper.player-token');
        
        if (canvasCards.length === 0) {
            console.warn('⚠️ No se encontraron cards en canvas');
            return;
        }
        
        console.log(`✅ Encontradas ${canvasCards.length} cards en canvas\n`);
        
        canvasCards.forEach((card, index) => {
            console.group(`Card Canvas #${index + 1}`);
            console.log('Clases:', card.className);
            console.log('Atributos data:', {
                playerId: card.dataset.playerId,
                cardType: card.dataset.cardType,
                cardId: card.dataset.cardId,
                screenType: card.dataset.screenType,
                createdAt: card.dataset.createdAt
            });
            console.log('Elementos internos:', {
                overall: card.querySelector('[data-element="overall"]') ? '✅' : '❌',
                position: card.querySelector('[data-element="position"]') ? '✅' : '❌',
                image: card.querySelector('[data-element="image"]') ? '✅' : '❌',
                name: card.querySelector('[data-element="name"]') ? '✅' : '❌',
                jersey: card.querySelector('[data-element="jersey"]') ? '✅' : '❌'
            });
            console.log('Clases de elementos:', {
                'card-overall': card.querySelector('.card-overall') ? '✅' : '❌',
                'card-position': card.querySelector('.card-position') ? '✅' : '❌',
                'card-image': card.querySelector('.card-image') ? '✅' : '❌',
                'card-name': card.querySelector('.card-name') ? '✅' : '❌',
                'card-jersey': card.querySelector('.card-jersey') ? '✅' : '❌'
            });
            console.log('Computed Style:', {
                width: window.getComputedStyle(card).width,
                height: window.getComputedStyle(card).height,
                overflow: window.getComputedStyle(card).overflow,
                position: window.getComputedStyle(card).position
            });
            console.groupEnd();
        });
    }
    
    static analyzeModalCards() {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📊 ANÁLISIS DE CARDS EN MODAL DE SELECCIÓN');
        console.log('═══════════════════════════════════════════════════════');
        
        const modalCards = document.querySelectorAll('#squad-player-list .squad-player-item, #squad-player-list .player-card-wrapper.squad-player-item');
        
        if (modalCards.length === 0) {
            console.warn('⚠️ No se encontraron cards en modal');
            return;
        }
        
        console.log(`✅ Encontradas ${modalCards.length} cards en modal\n`);
        
        modalCards.forEach((card, index) => {
            if (index < 3) { // Solo mostrar las primeras 3
                console.group(`Card Modal #${index + 1}`);
                console.log('Clases:', card.className);
                console.log('Atributos data:', {
                    playerId: card.dataset.playerId,
                    cardType: card.dataset.cardType,
                    cardId: card.dataset.cardId,
                    screenType: card.dataset.screenType,
                    createdAt: card.dataset.createdAt
                });
                console.log('Elementos internos:', {
                    overall: card.querySelector('[data-element="overall"]') ? '✅' : '❌',
                    position: card.querySelector('[data-element="position"]') ? '✅' : '❌',
                    image: card.querySelector('[data-element="image"]') ? '✅' : '❌',
                    name: card.querySelector('[data-element="name"]') ? '✅' : '❌',
                    jersey: card.querySelector('[data-element="jersey"]') ? '✅' : '❌'
                });
                console.log('Clases de elementos:', {
                    'card-overall': card.querySelector('.card-overall') ? '✅' : '❌',
                    'card-position': card.querySelector('.card-position') ? '✅' : '❌',
                    'card-image': card.querySelector('.card-image') ? '✅' : '❌',
                    'card-name': card.querySelector('.card-name') ? '✅' : '❌',
                    'card-jersey': card.querySelector('.card-jersey') ? '✅' : '❌'
                });
                console.log('Computed Style:', {
                    width: window.getComputedStyle(card).width,
                    height: window.getComputedStyle(card).height,
                    overflow: window.getComputedStyle(card).overflow,
                    position: window.getComputedStyle(card).position
                });
                console.log('Selected:', card.classList.contains('selected') ? '✅ Sí' : '❌ No');
                console.groupEnd();
            }
        });
        
        if (modalCards.length > 3) {
            console.log(`... y ${modalCards.length - 3} cards más\n`);
        }
    }
    
    static checkSelectionFunctionality() {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🎯 VERIFICAR FUNCIONALIDAD DE SELECCIÓN');
        console.log('═══════════════════════════════════════════════════════');
        
        const squadPlayerList = document.getElementById('squad-player-list');
        console.log('squad-player-list encontrado:', squadPlayerList ? '✅' : '❌');
        
        if (squadPlayerList) {
            console.log('Event listeners en squadPlayerList:', {
                hasClickListener: 'Revisar DevTools'
            });
            
            // Contar cards seleccionadas
            const selected = squadPlayerList.querySelectorAll('.squad-player-item.selected, .player-card-wrapper.selected').length;
            const total = squadPlayerList.querySelectorAll('.squad-player-item, .player-card-wrapper.squad-player-item').length;
            console.log(`Cards seleccionadas: ${selected}/${total}`);
        }
    }
    
    static fullAnalysis() {
        console.clear();
        console.log('🔍 ANÁLISIS COMPLETO DE CARDS');
        console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
        console.log('\n');
        
        this.analyzeCanvasCards();
        this.analyzeModalCards();
        this.checkSelectionFunctionality();
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ Análisis completado');
        console.log('═══════════════════════════════════════════════════════');
    }
}

// Exponer globalmente
window.CardDebugger = CardDebugger;

// Crear alias global para facilitar uso
window.analyzeCards = () => CardDebugger.fullAnalysis();
window.analyzeCanvas = () => CardDebugger.analyzeCanvasCards();
window.analyzeModal = () => CardDebugger.analyzeModalCards();

// Ejecutar análisis cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('💡 Para analizar las cards, ejecuta: analyzeCards()');
            console.log('💡 Solo canvas: analyzeCanvas()');
            console.log('💡 Solo modal: analyzeModal()');
        }, 1000);
    });
} else {
    setTimeout(() => {
        console.log('💡 Para analizar las cards, ejecuta: analyzeCards()');
        console.log('💡 Solo canvas: analyzeCanvas()');
        console.log('💡 Solo modal: analyzeModal()');
    }, 1000);
}
