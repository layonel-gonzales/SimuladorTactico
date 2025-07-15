import { drawFootballField } from './fieldDrawer.js';
import { staticPlayers } from './players.js';
import DrawingManager from './drawingManager.js';
import PlayerManager from './playerManager.js';
import TacticsManager from './tacticsManager.js';
import UIManager from './uiManager.js';
import BallDrawingManager from './ballDrawingManager.js';
import AnimationManager from './animationManager.js';
import ModeManager from './modeManager.js';
import TutorialManager from './tutorialManager.js';
import FullscreenManager from './fullscreenManager.js';

// --- Simulador Táctico con dos modos principales separados ---
// Modo 1: Dibujo de trazos usando el balón como cursor
// Modo 2: Crear animaciones tácticas con frames

document.addEventListener('DOMContentLoaded', async () => {

    // Función global para comunicación con UIManager y BallDrawingManager
    window.main = {
        setBallDragStarted: function(isDragging) {
            // Notificar al gestor de dibujo de estelas
            if (ballDrawingManager) {
                ballDrawingManager.setBallDragStarted(isDragging);
            }
        }
    };

    // Funciones globales para acceso desde UIManager
    window.ensureBallInPlayers = ensureBallInPlayers;
    window.importAnimationData = null; // Se definirá más adelante

    // Estado global (debe ir antes de cualquier uso)
    // Inicializar activePlayers con los jugadores y balón desde staticPlayers
    // Asegura que siempre haya un balón en la cancha
    function ensureBallInPlayers(players) {
        console.log('[DEBUG] Llamada a ensureBallInPlayers');
        // Elimina cualquier balón duplicado
        let balls = players.filter(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
        if (balls.length > 1) {
            console.log('[DEBUG] Se encontraron balones duplicados, eliminando extras');
            // Deja solo uno
            const first = balls[0];
            players = players.filter(p => !(p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'));
            players.push(first);
        }
        let ballPlayer = players.find(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
        if (!ballPlayer) {
            // Agregar balón en el centro del campo (coordenadas más realistas)
            ballPlayer = {
                id: 'ball',
                isBall: true,
                type: 'ball',
                role: 'ball',
                x: 50, // centro horizontal
                y: 50  // centro vertical
            };
            players.push(ballPlayer);
            console.log('[DEBUG] Balón agregado al centro de la cancha', ballPlayer);
        }
        // Asegura que tenga todas las propiedades y posición válida
        if (typeof ballPlayer.x !== 'number' || typeof ballPlayer.y !== 'number') {
            ballPlayer.x = 50; // centro horizontal del campo
            ballPlayer.y = 50; // centro vertical del campo
            console.log('[DEBUG] Balón reposicionado al centro', ballPlayer);
        }
        
        // Validar que las coordenadas están en rango válido (0-100%)
        if (ballPlayer.x < 0 || ballPlayer.x > 100) ballPlayer.x = 50;
        if (ballPlayer.y < 0 || ballPlayer.y > 100) ballPlayer.y = 50;
        
        ballPlayer.id = 'ball';
        ballPlayer.isBall = true;
        ballPlayer.type = 'ball';
        ballPlayer.role = 'ball';
        // Mensaje de depuración para ver el estado de los jugadores
        console.log('[DEBUG] Estado de activePlayers tras asegurar balón:', players);
    }
    // Estado global (debe ir antes de cualquier uso)
    const state = {
        activePlayers: [], // Iniciar vacío, solo agregar jugadores seleccionados
        currentTactic: 'Libre',
        isDrawingMode: false
    };
    
    // Solo asegurar el balón, no cargar jugadores por defecto
    ensureBallInPlayers(state.activePlayers);
    
    // Forzar balón al centro al cargar
    const ballPlayerInit = state.activePlayers.find(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
    if (ballPlayerInit) {
        ballPlayerInit.x = 50; // centro en porcentaje
        ballPlayerInit.y = 50; // centro en porcentaje
        console.log('[DEBUG] Balón forzado al centro al cargar', ballPlayerInit);
    }

    // Inicialización de módulos especializados
    const playerManager = new PlayerManager(staticPlayers);
    const tacticsManager = new TacticsManager();
    const drawingManager = new DrawingManager('drawing-canvas');
    
    // NUEVO: Gestores especializados para las dos funcionalidades principales
    const ballDrawingManager = new BallDrawingManager('drawing-canvas', () => state.activePlayers);
    const animationManager = new AnimationManager(
        () => state.activePlayers,
        (players) => { state.activePlayers = players; },
        ensureBallInPlayers,
        null // Se asignará después de crear UIManager
    );

    // NUEVO: Coordinador de modos para evitar conflictos
    const modeManager = new ModeManager();

    // Crear UIManager y conectar con los gestores especializados
    const uiManager = new UIManager();
    
    // Conectar todos los gestores
    animationManager.uiManager = uiManager;
    modeManager.setManagers(drawingManager, ballDrawingManager, animationManager, uiManager);

    // --- NOTA: El modeManager ya se encarga de conectar el botón global de modo ---
    // No necesitamos duplicar la conexión aquí

    // Establecer modo inicial (dibujo) y verificar
    console.log('[Main] Estableciendo modo inicial...');
    modeManager.switchToMode('drawing');
    
    // Verificación adicional después de un pequeño delay
    setTimeout(() => {
        console.log('[Main] Verificación post-inicialización:');
        console.log('- Modo actual:', modeManager.currentMode);
        console.log('- Clases del body:', document.body.className);
        console.log('- Botón global de modo existe:', !!document.getElementById('global-mode-toggle'));
        console.log('- Botón global de plantilla existe:', !!document.getElementById('global-select-squad-btn'));
        console.log('- Drawing controls existe:', !!document.getElementById('drawing-mode-controls'));
        console.log('- Animation controls existe:', !!document.getElementById('animation-mode-controls'));
    }, 100);

    // --- Exportar animación como JSON ---
    const exportBtn = document.getElementById('export-animation-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = animationManager.exportAnimationData(state.currentTactic);
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animacion-tactica.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[Main] Animación exportada exitosamente');
        });
    }

    // --- Generar link para compartir animación ---
    const linkBtn = document.getElementById('generate-share-link');
    const linkOutput = document.getElementById('share-link-output');
    if (linkBtn && linkOutput) {
        linkBtn.addEventListener('click', () => {
            const data = animationManager.exportAnimationData(state.currentTactic);
            const json = JSON.stringify(data);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            const url = `${window.location.origin}${window.location.pathname}?anim=${encodeURIComponent(base64)}`;
            
            linkOutput.value = url;
            linkOutput.style.display = 'block';
            linkOutput.select();
            
            try { 
                document.execCommand('copy'); 
                linkBtn.innerHTML = '<i class="fas fa-link"></i> ¡Copiado!';
            } catch(e) {
                linkBtn.innerHTML = '<i class="fas fa-link"></i> Error';
            }
            
            setTimeout(() => {
                linkBtn.innerHTML = '<i class="fas fa-link"></i> Link';
                linkOutput.style.display = 'none';
            }, 1500);
            
            console.log('[Main] Link generado exitosamente');
        });
    }

    // Función para cargar jugadores específicos por sus IDs
    function loadPlayersByIds(playerIds) {
        // Limpiar jugadores actuales (mantener solo el balón)
        state.activePlayers = state.activePlayers.filter(p => 
            p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'
        );
        
        // Agregar jugadores seleccionados
        playerIds.forEach(playerId => {
            const player = staticPlayers.find(p => p.id === playerId);
            if (player) {
                state.activePlayers.push({ ...player });
            }
        });
        
        // Asegurar que el balón esté presente
        ensureBallInPlayers(state.activePlayers);
        
        // Renderizar jugadores en la cancha
        uiManager.renderPlayersOnPitch();
        
        console.log('[Main] Jugadores cargados por IDs:', playerIds, state.activePlayers);
    }

    // Función para mostrar modal de selección con IDs predefinidos
    function showPlayerSelectionModal(preselectedIds = []) {
        const modal = new bootstrap.Modal(document.getElementById('squad-selection-modal'));
        modal.show();
        
        if (preselectedIds.length > 0) {
            setTimeout(() => {
                const checkboxes = document.querySelectorAll('#squad-player-list input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    const playerId = parseInt(checkbox.value);
                    if (preselectedIds.includes(playerId)) {
                        checkbox.checked = true;
                    }
                });
                if (uiManager && uiManager.updateSelectedCount) {
                    uiManager.updateSelectedCount();
                }
            }, 100);
        }
    }

    // --- Importar animación desde JSON ---
    let importInput = document.getElementById('import-animation-json');
    let importBtn = document.getElementById('import-btn');
    
    // Limpiar duplicados si existen
    if (importBtn && importBtn.parentNode) importBtn.parentNode.removeChild(importBtn);
    if (importInput && importInput.parentNode) importInput.parentNode.removeChild(importInput);
    
    // Crear input file oculto
    importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-animation-json';
    importInput.accept = 'application/json';
    importInput.style.display = 'none';
    document.body.appendChild(importInput);
    
    // Crear botón visible
    importBtn = document.createElement('button');
    importBtn.id = 'import-btn';
    importBtn.className = 'btn btn-outline-primary btn-sm';
    importBtn.innerHTML = '<i class="fas fa-file-import"></i>';
    
    // Insertar el botón al lado de exportar si existe
    const exportBtnRef = document.getElementById('export-animation-json');
    if (exportBtnRef && exportBtnRef.parentNode) {
        exportBtnRef.parentNode.insertBefore(importBtn, exportBtnRef.nextSibling);
    } else {
        document.body.appendChild(importBtn);
    }
    
    // Eventos
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (!data.frames || !Array.isArray(data.frames)) {
                    throw new Error('JSON inválido: falta frames');
                }
                
                // Usar AnimationManager para importar
                const tactic = animationManager.importAnimationData(data);
                state.currentTactic = tactic;
                
                alert('Animación importada correctamente.');
                console.log('[Main] Animación importada desde archivo JSON');
                
            } catch (err) {
                alert('Error al importar animación: ' + err.message);
                console.error('[Main] Error al importar:', err);
            }
        };
        reader.readAsText(file);
    });

    // Función auxiliar para importar datos de animación (expuesta globalmente para compatibilidad)
    function importAnimationData(data) {
        try {
            const tactic = animationManager.importAnimationData(data);
            state.currentTactic = tactic;
            return true;
        } catch (err) {
            console.error('[Main] Error en importAnimationData:', err);
            return false;
        }
    }
    
    // Exponer función globalmente para compatibilidad
    window.importAnimationData = importAnimationData;

    // --- Importar animación desde link compartido (URL) ---
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const anim = params.get('anim');
        if (!anim) return;
        
        try {
            const json = decodeURIComponent(escape(atob(anim)));
            const data = JSON.parse(json);
            if (!data.frames || !Array.isArray(data.frames)) {
                throw new Error('El link no contiene animación válida.');
            }
            
            // Usar AnimationManager para importar
            const tactic = animationManager.importAnimationData(data);
            state.currentTactic = tactic;
            
            setTimeout(() => alert('Animación cargada desde link compartido.'), 300);
            console.log('[Main] Animación importada desde URL');
            
        } catch (err) {
            setTimeout(() => alert('Error al cargar animación desde link: ' + err.message), 300);
            console.error('[Main] Error al importar desde URL:', err);
        }
    }, 200);

    // Las funciones de frame (getCurrentState, setStateFromFrame, etc.) 
    // ahora están en AnimationManager. Se eliminan para evitar duplicados.

    // --- NUEVO: Controles de línea ---
    const colorPicker = document.getElementById('line-color-picker');
    const widthPicker = document.getElementById('line-width-picker');
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            drawingManager.lineProperties.color = e.target.value;
            drawingManager.applyContextProperties();
        });
    }
    if (widthPicker) {
        widthPicker.addEventListener('input', (e) => {
            drawingManager.lineProperties.width = parseInt(e.target.value);
            drawingManager.applyContextProperties();
        });
    }

    // --- NUEVO: Borrar línea individual ---
    let deleteLineMode = false;
    const deleteLineBtn = document.getElementById('delete-line-mode');
    if (deleteLineBtn) {
        deleteLineBtn.addEventListener('click', () => {
            deleteLineMode = !deleteLineMode;
            deleteLineBtn.classList.toggle('active', deleteLineMode);
            drawingManager.setDeleteLineMode(deleteLineMode);
        });
    }


    // Inicializar UI
    uiManager.init({
        playerManager,
        tacticsManager,
        drawingManager, // Pasamos el drawingManager
        state
    });

    // Renderizar jugadores iniciales (incluyendo el balón)
    uiManager.renderPlayersOnPitch();

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

    // --- TUTORIAL MANAGER ---
    // Inicializar el gestor de tutorial al final para que todo esté cargado
    const tutorialManager = new TutorialManager();
    
    // --- FULLSCREEN MANAGER ---
    // Inicializar el gestor de pantalla completa
    const fullscreenManager = new FullscreenManager();
    
    // Hacer disponible globalmente para debugging y acceso desde otros módulos
    window.tutorialManager = tutorialManager;
    window.fullscreenManager = fullscreenManager;
    window.modeManager = modeManager; // También hacer disponible el modeManager
    
    console.log('[Main] 🎓 Tutorial Manager inicializado');
    console.log('[Main] 🖥️ Fullscreen Manager inicializado');

    // NOTA: Los dos event listeners para 'click' en 'squad-player-list'
    // que actualizan el contador están duplicados y la lógica está
    // mejor centralizada en uiManager.updateSelectedCount().
    // He eliminado el duplicado aquí. uiManager.updateSelectedCount() ya se encarga de esto.
// Fin del bloque DOMContentLoaded
});