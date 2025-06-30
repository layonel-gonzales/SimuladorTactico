// main.js

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
    const drawingManager = new DrawingManager('drawing-canvas'); // El canvas de dibujo
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
        drawingManager, // Pasamos el drawingManager
        state
    });

    // --- Lógica del campo de fútbol ---
    const pitchContainer = document.getElementById('pitch-container');
    const footballFieldCanvas = document.getElementById('football-field');
    const fieldCtx = footballFieldCanvas.getContext('2d');

    // Función para dibujar el campo, que se llamará al redimensionar
    // Esta función solo se encarga del fondo del campo.
    function renderFootballField() {
        const rect = pitchContainer.getBoundingClientRect();
        footballFieldCanvas.width = rect.width;
        footballFieldCanvas.height = rect.height;
        drawFootballField(footballFieldCanvas, fieldCtx);
        console.log('main.js: Campo de fútbol de fondo redibujado.');
    }

    // El UIManager ya tiene un listener para 'resize' que llama a drawingManager.resizeCanvas()
    // y repositionPlayersOnPitch(). Aquí solo necesitamos asegurarnos de que el campo de fondo
    // también se redibuje.
    let resizeFieldTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeFieldTimeout);
        resizeFieldTimeout = setTimeout(() => {
            renderFootballField(); // Redibujar el fondo del campo
        }, 250); // Mismo debounce que en UIManager para sincronizar
    });


    // Ejecutar renderizado inicial del campo
    renderFootballField();

    // Cargar jugadores iniciales en el modal de selección
    playerManager.renderPlayerSelectionList();

    // NOTA: Los dos event listeners para 'click' en 'squad-player-list'
    // que actualizan el contador están duplicados y la lógica está
    // mejor centralizada en uiManager.updateSelectedCount().
    // He eliminado el duplicado aquí. uiManager.updateSelectedCount() ya se encarga de esto.
});