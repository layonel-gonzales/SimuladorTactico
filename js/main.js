

import { drawFootballField } from './fieldDrawer.js';
import { staticPlayers } from './players.js';
import DrawingManager from './drawingManager.js';
import PlayerManager from './playerManager.js';
import TacticsManager from './tacticsManager.js';
import UIManager from './uiManager.js';

// --- Exportar animación como JSON y Generar link para compartir animación ---

// ...existing code...

document.addEventListener('DOMContentLoaded', async () => {

    // Estado global (debe ir antes de cualquier uso)
    const state = {
        activePlayers: [],
        currentTactic: 'Libre',
        isDrawingMode: false
    };

    // Inicialización de módulos (antes de lógica de frames)
    let isRecordMode = false;
    const playerManager = new PlayerManager(staticPlayers);
    const tacticsManager = new TacticsManager();
    // Pasar función para saber si está en modo grabación
    const drawingManager = new DrawingManager('drawing-canvas', () => isRecordMode);
    const uiManager = new UIManager();
    // --- Modo grabación ---
    const recordBtn = document.getElementById('record-mode-toggle');
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            isRecordMode = !isRecordMode;
            recordBtn.classList.toggle('active', isRecordMode);
            recordBtn.style.backgroundColor = isRecordMode ? '#c00' : '';
            recordBtn.style.color = isRecordMode ? '#fff' : '';
            // Visual feedback
            recordBtn.innerHTML = isRecordMode ? '<i class="fas fa-dot-circle"></i> Grabando' : '<i class="fas fa-dot-circle"></i> Grabar';
        });
    }

    // --- NUEVO: Animación táctica (frames) ---
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    const frameIndicator = document.getElementById('frame-indicator');
    const btnPrev = document.getElementById('frame-prev');
    const btnNext = document.getElementById('frame-next');
    const btnAdd = document.getElementById('frame-add');
    const btnPlay = document.getElementById('frame-play');

    // --- Exportar animación como JSON ---
    const exportBtn = document.getElementById('export-animation-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                frames: frames.map(f => ({
                    players: f.players ? f.players.map(p => ({...p})) : [],
                    lines: f.lines ? f.lines.map(l => JSON.parse(JSON.stringify(l))) : []
                })),
                players: state.activePlayers.map(p => ({...p})),
                tactic: state.currentTactic
            };
            const json = JSON.stringify(data);
            const blob = new Blob([json], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animacion_tactica.json';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        });
    }

    // --- Generar link para compartir animación ---
    const linkBtn = document.getElementById('generate-share-link');
    const linkOutput = document.getElementById('share-link-output');
    if (linkBtn && linkOutput) {
        linkBtn.addEventListener('click', () => {
            const data = {
                frames: frames.map(f => ({
                    players: f.players ? f.players.map(p => ({...p})) : [],
                    lines: f.lines ? f.lines.map(l => JSON.parse(JSON.stringify(l))) : []
                })),
                players: state.activePlayers.map(p => ({...p})),
                tactic: state.currentTactic
            };
            const json = JSON.stringify(data);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            const url = `${window.location.origin}${window.location.pathname}?anim=${encodeURIComponent(base64)}`;
            linkOutput.value = url;
            linkOutput.style.display = 'block';
            linkOutput.select();
            try { document.execCommand('copy'); } catch(e) {}
            linkBtn.innerHTML = '<i class="fas fa-link"></i> ¡Copiado!';
            setTimeout(() => {
                linkBtn.innerHTML = '<i class="fas fa-link"></i> Link';
                linkOutput.style.display = 'none';
            }, 1500);
        });
    }

    // --- Importar animación desde JSON ---
    // Vincular botón visible con input file oculto para importar (solo una vez)
    let importInput = document.getElementById('import-animation-json');
    let importBtn = document.getElementById('import-btn');
    // Eliminar duplicados si existen
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
    importBtn.innerHTML = '<i class="fas fa-file-import"></i> Importar';
    // Insertar el botón al lado de exportar si existe
    const exportBtnRef = document.getElementById('export-animation-json');
    if (exportBtnRef && exportBtnRef.parentNode) {
        exportBtnRef.parentNode.insertBefore(importBtn, exportBtnRef.nextSibling);
    } else {
        document.body.appendChild(importBtn);
    }
    // Al hacer click en el botón visible, abrir el input file
    importBtn.addEventListener('click', () => importInput.click());
    // Listener de importación real
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (!data.frames || !Array.isArray(data.frames)) throw new Error('JSON inválido: falta frames');
                frames = data.frames.map(f => ({
                    players: f.players ? f.players.map(p => ({...p})) : [],
                    lines: f.lines ? f.lines.map(l => JSON.parse(JSON.stringify(l))) : []
                }));
                state.activePlayers.forEach((p, i) => {
                    if (data.players && data.players[i]) Object.assign(p, data.players[i]);
                });
                state.currentTactic = data.tactic || 'Libre';
                currentFrame = 0;
                setStateFromFrame(frames[0]);
                updateFrameIndicator();
                alert('Animación importada correctamente.');
            } catch (err) {
                alert('Error al importar animación: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    // --- Importar animación desde link compartido (URL) ---
    // Importar animación desde link compartido (URL) solo cuando todo está listo
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const anim = params.get('anim');
        if (!anim) return;
        try {
            const json = decodeURIComponent(escape(atob(anim)));
            const data = JSON.parse(json);
            if (!data.frames || !Array.isArray(data.frames)) throw new Error('El link no contiene animación válida.');
            frames = data.frames.map(f => ({
                players: f.players ? f.players.map(p => ({...p})) : [],
                lines: f.lines ? f.lines.map(l => JSON.parse(JSON.stringify(l))) : []
            }));
            state.activePlayers.forEach((p, i) => {
                if (data.players && data.players[i]) Object.assign(p, data.players[i]);
            });
            state.currentTactic = data.tactic || 'Libre';
            currentFrame = 0;
            setStateFromFrame(frames[0]);
            updateFrameIndicator();
            setTimeout(() => alert('Animación cargada desde link.'), 300);
        } catch (err) {
            setTimeout(() => alert('Error al cargar animación desde link: ' + err.message), 300);
        }
    }, 200);

    function getCurrentState() {
        return {
            players: state.activePlayers.map(p => ({...p})),
            lines: drawingManager.lines.map(l => JSON.parse(JSON.stringify(l)))
        };
    }
    function setStateFromFrame(frame) {
        state.activePlayers.forEach((p, i) => {
            if (frame.players[i]) {
                Object.assign(p, frame.players[i]);
            }
        });
        uiManager.renderPlayersOnPitch();
        drawingManager.lines = frame.lines.map(l => JSON.parse(JSON.stringify(l)));
        drawingManager.redrawLines();
    }
    function updateFrameIndicator() {
        if (frameIndicator) frameIndicator.textContent = `${currentFrame+1}/${frames.length}`;
    }
    function saveCurrentFrame() {
        frames[currentFrame] = getCurrentState();
    }
    function addFrame() {
        saveCurrentFrame();
        frames.splice(currentFrame+1);
        frames.push(getCurrentState());
        currentFrame = frames.length-1;
        setStateFromFrame(frames[currentFrame]);
        updateFrameIndicator();
    }
    function gotoFrame(idx) {
        if (idx < 0 || idx >= frames.length) return;
        saveCurrentFrame();
        currentFrame = idx;
        setStateFromFrame(frames[currentFrame]);
        updateFrameIndicator();
    }
    // --- Animación interpolada de frames (jugadores y balón) ---
    function lerp(a, b, t) { return a + (b - a) * t; }
    function playAnimation() {
        if (isPlaying || frames.length < 2) return;
        isPlaying = true;
        btnPlay.innerHTML = '<i class="fas fa-stop"></i>';
        const speedInput = document.getElementById('animation-speed');
        let speed = speedInput ? parseFloat(speedInput.value) : 1;
        let i = 0;
        const isRecordModeNow = isRecordMode;
        // Si estamos en modo grabación, ocultar líneas durante la animación
        if (isRecordModeNow) {
            drawingManager._hideLinesForAnimation = true;
        }
        function animateFrameTransition(fromFrame, toFrame, onComplete) {
            const duration = 600 / speed; // ms, ajustable
            const start = performance.now();
            // Copias profundas para no modificar los frames originales
            const fromPlayers = fromFrame.players.map(p => ({...p}));
            const toPlayers = toFrame.players.map(p => ({...p}));
            // Balón: posición final de la última línea
            function getBallPos(frame) {
                const lines = frame.lines;
                if (!lines.length) return null;
                const lastLine = lines[lines.length-1];
                const pt = lastLine.points[lastLine.points.length-1];
                return {
                    x: pt.x / lastLine.initialWidth,
                    y: pt.y / lastLine.initialHeight
                };
            }
            const fromBall = getBallPos(fromFrame);
            const toBall = getBallPos(toFrame);
            function step(now) {
                if (!isPlaying) return;
                let t = Math.min(1, (now - start) / duration);
                // Interpolar jugadores
                state.activePlayers.forEach((p, idx) => {
                    if (fromPlayers[idx] && toPlayers[idx]) {
                        p.x = lerp(fromPlayers[idx].x, toPlayers[idx].x, t);
                        p.y = lerp(fromPlayers[idx].y, toPlayers[idx].y, t);
                    }
                });
                uiManager.renderPlayersOnPitch();
                // Interpolar balón (última línea)
                if (fromBall && toBall && drawingManager.lines.length) {
                    const lastLine = drawingManager.lines[drawingManager.lines.length-1];
                    lastLine.points[lastLine.points.length-1].x = lerp(
                        fromBall.x * lastLine.initialWidth,
                        toBall.x * lastLine.initialWidth,
                        t
                    );
                    lastLine.points[lastLine.points.length-1].y = lerp(
                        fromBall.y * lastLine.initialHeight,
                        toBall.y * lastLine.initialHeight,
                        t
                    );
                    drawingManager.redrawLines();
                }
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    onComplete();
                }
            }
            requestAnimationFrame(step);
        }
        function nextStep() {
            if (!isPlaying || i >= frames.length-1) {
                isPlaying = false;
                btnPlay.innerHTML = '<i class="fas fa-play"></i>';
                gotoFrame(i); // Asegura el último frame
                if (isRecordModeNow) {
                    drawingManager._hideLinesForAnimation = false;
                    drawingManager.redrawLines();
                }
                return;
            }
            animateFrameTransition(frames[i], frames[i+1], () => {
                i++;
                gotoFrame(i); // Corrige estado final
                setTimeout(nextStep, 80);
            });
        }
        nextStep();
    }
    // --- Resetear animación (frames, líneas, jugadores) ---
    const resetBtn = document.getElementById('reset-animation');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            frames = [];
            currentFrame = 0;
            // Limpiar líneas y jugadores
            drawingManager.lines = [];
            drawingManager.redrawLines();
            state.activePlayers.forEach(p => {
                delete p.x;
                delete p.y;
            });
            uiManager.renderPlayersOnPitch();
            // Frame inicial vacío
            frames.push(getCurrentState());
            updateFrameIndicator();
        });
    }
    function stopAnimation() {
        isPlaying = false;
        btnPlay.innerHTML = '<i class="fas fa-play"></i>';
    }
    if (btnPrev) btnPrev.addEventListener('click', () => gotoFrame(currentFrame-1));
    if (btnNext) btnNext.addEventListener('click', () => gotoFrame(currentFrame+1));
    if (btnAdd) btnAdd.addEventListener('click', addFrame);
    if (btnPlay) btnPlay.addEventListener('click', () => { isPlaying ? stopAnimation() : playAnimation(); });
    // Cambiar velocidad en tiempo real
    const speedInput = document.getElementById('animation-speed');
    if (speedInput) {
        speedInput.addEventListener('input', () => {
            // Si está animando, la velocidad se toma en el siguiente frame
        });
    }



    // Inicializar con un frame vacío al cargar (ahora sí, después de state y módulos)
    frames.push(getCurrentState());
    updateFrameIndicator();

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
// Fin del bloque DOMContentLoaded
});