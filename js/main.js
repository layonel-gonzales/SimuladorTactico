import { drawFootballField } from './fieldDrawer.js';
import { staticPlayers } from './players.js';
import DrawingManager from './drawingManager.js';
import PlayerManager from './playerManager.js';
import TacticsManager from './tacticsManager.js';
import UIManager from './uiManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Inicialización de módulos
    const playerManager = new PlayerManager(staticPlayers);
    const tacticsManager = new TacticsManager();
    const drawingManager = new DrawingManager('drawing-canvas');
    const uiManager = new UIManager();

    // Estado global
    const state = {
        activePlayers: [],
        currentTactic: 'Libre',
        isDrawingMode: false
    };

    // Inicializar UI
    uiManager.init({
        playerManager,
        tacticsManager,
        drawingManager,
        state
    });

    // Actualizar contador de selección
    document.getElementById('squad-player-list').addEventListener('click', () => {
        uiManager.updateSelectedCount();
    });

    document.getElementById('squad-player-list').addEventListener('click', () => {
        const selectedCount = document.querySelectorAll('.squad-player-item.selected').length;
        document.getElementById('selected-count').textContent = `${selectedCount} seleccionados`;

        if (selectedCount > 11) {
            document.getElementById('selected-count').classList.add('bg-danger');
        } else {
            document.getElementById('selected-count').classList.remove('bg-danger');
        }
    });

    // Inicializar campo
    const pitchContainer = document.getElementById('pitch-container');
    const footballFieldCanvas = document.getElementById('football-field');
    const fieldCtx = footballFieldCanvas.getContext('2d');

    function resizeCanvases() {
        const rect = pitchContainer.getBoundingClientRect();

        footballFieldCanvas.width = rect.width;
        footballFieldCanvas.height = rect.height;

        drawingManager.resize(rect.width, rect.height);

        drawFootballField(footballFieldCanvas, fieldCtx);
    }

    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    // Cargar jugadores iniciales
    playerManager.renderPlayerSelectionList();
});