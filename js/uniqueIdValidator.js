/**
 * ==========================================
 * 🔍 VALIDADOR DE IDs ÚNICOS
 * ==========================================
 * Valida que todos los elementos del simulador tengan
 * identificadores únicos correctos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Iniciando validación de IDs únicos...');
    
    setTimeout(() => {
        validateUniqueIDs();
    }, 2000); // Esperar a que se cargue todo
});

function validateUniqueIDs() {
    const report = {
        tutorialButtons: checkTutorialButtons(),
        menuSeparators: checkMenuSeparators(),
        menuButtons: checkMenuButtons(),
        playerCards: checkPlayerCards(),
        frameCounter: checkFrameCounter(),
        duplicateIDs: checkDuplicateIDs()
    };
    
    console.log('📊 Reporte de Validación de IDs:', report);
    
    // Mostrar resumen
    const totalElements = Object.keys(report).reduce((sum, key) => {
        if (key !== 'duplicateIDs') {
            return sum + (report[key].found || 0);
        }
        return sum;
    }, 0);
    
    console.log(`✅ Total de elementos validados: ${totalElements}`);
    console.log(`❌ IDs duplicados encontrados: ${report.duplicateIDs.count}`);
    
    return report;
}

function checkTutorialButtons() {
    const buttons = {
        'start-tutorial-drawing-btn': document.getElementById('start-tutorial-drawing-btn'),
        'start-tutorial-animation-btn': document.getElementById('start-tutorial-animation-btn')
    };
    
    const report = { found: 0, missing: [], present: [] };
    
    for (const [id, element] of Object.entries(buttons)) {
        if (element) {
            report.found++;
            report.present.push(id);
            console.log(`✅ Botón tutorial encontrado: ${id}`);
        } else {
            report.missing.push(id);
            console.log(`❌ Botón tutorial faltante: ${id}`);
        }
    }
    
    return report;
}

function checkMenuSeparators() {
    const separators = {
        'drawing-separator-1': document.getElementById('drawing-separator-1'),
        'animation-separator-1': document.getElementById('animation-separator-1')
    };
    
    const report = { found: 0, missing: [], present: [] };
    
    for (const [id, element] of Object.entries(separators)) {
        if (element) {
            report.found++;
            report.present.push(id);
            console.log(`✅ Separador encontrado: ${id}`);
        } else {
            report.missing.push(id);
            console.log(`❌ Separador faltante: ${id}`);
        }
    }
    
    return report;
}

function checkMenuButtons() {
    const menuButtons = [
        'global-mode-toggle', 'global-select-squad-btn', 'custom-players-btn',
        'configuration-btn', 'fullscreen-toggle-btn',
        'undo-line', 'redo-line', 'clear-canvas', 'line-color-picker',
        'line-width-picker', 'delete-line-mode', 'share-pitch-btn',
        'record-mode-toggle', 'frame-add', 'frame-prev', 'frame-next',
        'frame-delete', 'frame-play', 'audio-record-btn', 'audio-play-btn',
        'export-animation-json', 'export-animation-video', 'reset-animation'
    ];
    
    const report = { found: 0, missing: [], present: [] };
    
    menuButtons.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            report.found++;
            report.present.push(id);
            console.log(`✅ Botón de menú encontrado: ${id}`);
        } else {
            report.missing.push(id);
            console.log(`❌ Botón de menú faltante: ${id}`);
        }
    });
    
    return report;
}

function checkFrameCounter() {
    const frameIndicator = document.getElementById('frame-indicator');
    const report = { found: frameIndicator ? 1 : 0, element: frameIndicator };
    
    if (frameIndicator) {
        console.log(`✅ Frame counter encontrado: frame-indicator`);
    } else {
        console.log(`❌ Frame counter faltante: frame-indicator`);
    }
    
    return report;
}

function checkPlayerCards() {
    const report = {
        selectionCards: 0,
        fieldCards: 0,
        cardsWithUniqueIds: 0,
        cardsWithScreenType: 0,
        elementsWithDataAttributes: 0
    };
    
    // Verificar cards de selección
    const selectionCards = document.querySelectorAll('.squad-player-item');
    report.selectionCards = selectionCards.length;
    console.log(`📋 Cards de selección encontradas: ${selectionCards.length}`);
    
    // Verificar cards en el campo
    const fieldCards = document.querySelectorAll('.player-token');
    report.fieldCards = fieldCards.length;
    console.log(`⚽ Cards en campo encontradas: ${fieldCards.length}`);
    
    // Verificar que las cards tengan IDs únicos
    [...selectionCards, ...fieldCards].forEach(card => {
        if (card.dataset.cardId || card.dataset.uniqueId) {
            report.cardsWithUniqueIds++;
        }
        if (card.dataset.screenType) {
            report.cardsWithScreenType++;
        }
    });
    
    // Verificar elementos internos con data attributes
    const elementsWithData = document.querySelectorAll('[data-unique-id]');
    report.elementsWithDataAttributes = elementsWithData.length;
    console.log(`🏷️ Elementos con data-unique-id: ${elementsWithData.length}`);
    
    elementsWithData.forEach(element => {
        const uniqueId = element.dataset.uniqueId;
        const screenType = element.dataset.screenType;
        const element_type = element.dataset.element;
        console.log(`  📌 Elemento: ${element_type}, ID: ${uniqueId}, Pantalla: ${screenType}`);
    });
    
    return report;
}

function checkDuplicateIDs() {
    const allElements = document.querySelectorAll('[id]');
    const idCounts = {};
    const duplicates = [];
    
    allElements.forEach(element => {
        const id = element.id;
        if (idCounts[id]) {
            idCounts[id]++;
            if (idCounts[id] === 2) {
                duplicates.push(id);
            }
        } else {
            idCounts[id] = 1;
        }
    });
    
    const report = { count: duplicates.length, duplicates: duplicates };
    
    if (duplicates.length > 0) {
        console.log(`❌ IDs duplicados encontrados:`, duplicates);
    } else {
        console.log(`✅ No se encontraron IDs duplicados`);
    }
    
    return report;
}

// Función para testing dinámico de cards
window.testPlayerCardGeneration = function() {
    console.log('🧪 Iniciando prueba de generación de cards...');
    
    if (!window.playerCardManager) {
        console.error('❌ PlayerCardManager no está disponible');
        return false;
    }
    
    const testPlayer = {
        id: 'test-player-123',
        name: 'Jugador Test',
        position: 'CM',
        image_url: 'img/default_player.png',
        jersey_number: 10,
        pace: 85,
        shooting: 75,
        passing: 90,
        dribbling: 80,
        defending: 60,
        physical: 75
    };
    
    console.log('📄 Creando card de selección...');
    const selectionCard = window.playerCardManager.createPlayerCard(testPlayer, 'selection');
    
    console.log('⚽ Creando card de campo...');
    const fieldCard = window.playerCardManager.createPlayerCard(testPlayer, 'field');
    
    // Verificar IDs únicos
    console.log('🔍 Verificando IDs únicos en cards generadas...');
    
    const selectionUniqueElements = selectionCard.querySelectorAll('[data-unique-id]');
    const fieldUniqueElements = fieldCard.querySelectorAll('[data-unique-id]');
    
    console.log(`  📋 Elementos únicos en card de selección: ${selectionUniqueElements.length}`);
    selectionUniqueElements.forEach(el => {
        console.log(`    - ${el.dataset.element}: ${el.dataset.uniqueId}`);
    });
    
    console.log(`  ⚽ Elementos únicos en card de campo: ${fieldUniqueElements.length}`);
    fieldUniqueElements.forEach(el => {
        console.log(`    - ${el.dataset.element}: ${el.dataset.uniqueId}`);
    });
    
    return {
        selectionCard,
        fieldCard,
        selectionElements: selectionUniqueElements.length,
        fieldElements: fieldUniqueElements.length
    };
};

console.log('🔍 Validador de IDs únicos cargado. Usa testPlayerCardGeneration() para pruebas dinámicas.');
