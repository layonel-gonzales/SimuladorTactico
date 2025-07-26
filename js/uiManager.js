// uiManager.js

export default class UIManager {
    constructor() {
        this.playerManager = null;
        this.drawingManager = null;
        this.state = null;
        this.modeManager = null; // Referencia al modeManager para verificar modo actual
    }

    init({ playerManager, drawingManager, state, modeManager }) {
        this.playerManager = playerManager;
        this.drawingManager = drawingManager;
        this.state = state;
        this.modeManager = modeManager; // Guardar referencia
        this.setupEventListeners();
        this.setupCursors();
        this.updateModeIndicator();
        this.setupResizeListener(); // Configura el listener de redimensionamiento
        console.log('UIManager: Inicialización completa.');
    }

    setupCursors() {
        const drawingCanvas = document.getElementById('drawing-canvas');
        const pitchContainer = document.getElementById('pitch-container');

        if (!drawingCanvas || !pitchContainer) {
            console.error('UIManager: No se encontraron los elementos canvas o pitch-container para setupCursors.');
            return;
        }

        // Función para actualizar el cursor del canvas basada en el modo
        const updateCanvasCursor = () => {
            if (this.state.isDrawingMode) {
                // Icono de lápiz (Font Awesome) para el cursor
                // Convertir SVG a URL compatible con CSS cursor
                const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' fill='%23ffffff'/></svg>`;
                drawingCanvas.style.cursor = `url("data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}") 0 24, auto`;
            } else {
                drawingCanvas.style.cursor = 'grab'; // Cursor por defecto para arrastrar jugadores
            }
        };

        // Escucha el evento mouseenter en el canvas
        drawingCanvas.addEventListener('mouseenter', updateCanvasCursor);

        // Escucha el evento mouseleave en el canvas para resetear si no está en modo dibujo
        drawingCanvas.addEventListener('mouseleave', () => {
            if (!this.state.isDrawingMode) {
                drawingCanvas.style.cursor = 'default';
            }
        });

        // Evento global para el cursor de "grab" en los player-token
        pitchContainer.addEventListener('mouseover', (e) => {
            const playerToken = e.target.closest('.player-token');
            if (playerToken && !this.state.isDrawingMode) {
                playerToken.style.cursor = 'grab';
            }
        });
    }

    setupEventListeners() {
        console.log('UIManager: Configurando Event Listeners...');

        // --- Eventos principales de la aplicación ---

        // Botón global de selección de plantilla (siempre visible)
        const globalSelectSquadBtn = document.getElementById('global-select-squad-btn');
        if (globalSelectSquadBtn) {
            globalSelectSquadBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Seleccionar Plantilla (botón global).');
                const modal = new bootstrap.Modal(document.getElementById('squad-selection-modal'));
                modal.show();
            });
        } else {
            console.warn('UIManager: Botón global de plantilla #global-select-squad-btn no encontrado.');
        }

        // Botón legacy para compatibilidad (si existe)
        const selectSquadBtn = document.getElementById('select-squad-btn');
        if (selectSquadBtn) {
            selectSquadBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Seleccionar Plantilla (botón legacy).');
                const modal = new bootstrap.Modal(document.getElementById('squad-selection-modal'));
                modal.show();
            });
        }

        const confirmSquadBtn = document.getElementById('confirm-squad-btn');
        if (confirmSquadBtn) {
            confirmSquadBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Confirmar Plantilla.');
                const selectedPlayers = this.getSelectedPlayers();

                // NUEVA LÓGICA: Mantener persistencia en lugar de reemplazar
                console.log('UIManager: Jugadores seleccionados en modal:', selectedPlayers);
                console.log('UIManager: Jugadores actualmente en campo:', this.state.activePlayers.map(p => p.id));

                // Filtrar para no más de 11 jugadores
                const playersToActivate = selectedPlayers.slice(0, 11);

                // Mapear los IDs seleccionados a objetos de jugador
                this.state.activePlayers = playersToActivate.map(id =>
                    this.playerManager.getPlayerById(id)
                ).filter(player => player !== null); // Filtrar nulls

                console.log('UIManager: Nuevos jugadores activos:', this.state.activePlayers.map(p => p.name));

                // Verificar si hay una animación pendiente de importar
                if (window.pendingAnimationData) {
                    console.log('UIManager: Importando animación pendiente...');
                    const data = window.pendingAnimationData;
                    
                    // Primero cargar los jugadores seleccionados
                    this.state.activePlayers = playersToActivate.map(id =>
                        this.playerManager.getPlayerById(id)
                    ).filter(player => player !== null); // Filtrar nulls
                    
                    // Asegurar que el balón esté presente
                    if (window.ensureBallInPlayers) {
                        window.ensureBallInPlayers(this.state.activePlayers);
                    }
                    
                    // Luego importar la animación con los jugadores ya cargados
                    if (window.importAnimationData) {
                        window.importAnimationData(data);
                    }
                    
                    // Limpiar datos pendientes
                    delete window.pendingAnimationData;
                } else {
                    // Comportamiento normal: renderizar jugadores
                    this.renderPlayersOnPitch();
                    
                    // Asegurar que el balón esté presente
                    if (window.ensureBallInPlayers) {
                        window.ensureBallInPlayers(this.state.activePlayers);
                        this.renderPlayersOnPitch();
                    }
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('squad-selection-modal'));
                if (modal) modal.hide();
            });
        }

        // --- Botones de deshacer/rehacer (escritorio) ---
        const undoBtn = document.getElementById('undo-line');
        const redoBtn = document.getElementById('redo-line');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.drawingManager.undoLine();
            });
        }
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.drawingManager.redoLine();
            });
        }

        const clearCanvasBtn = document.getElementById('clear-canvas');
        if (clearCanvasBtn) {
            clearCanvasBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Borrar Dibujo.');
                
                // Confirmar acción crítica si está habilitado
                const shouldProceed = window.confirmCriticalAction && 
                    window.confirmCriticalAction(
                        '¿Estás seguro de que quieres borrar todas las líneas de dibujo?\n\nEsta acción no se puede deshacer.',
                        'ClearAllLines'
                    );
                
                if (shouldProceed !== false) { // Proceder si la función no existe o si el usuario confirma
                    this.drawingManager.clearAllLines();
                }
            });
        }



        const squadPlayerList = document.getElementById('squad-player-list');
        if (squadPlayerList) {
            squadPlayerList.addEventListener('click', (e) => {
                const playerItem = e.target.closest('.squad-player-item');
                if (playerItem) {
                    // Prevenir seleccionar más de 11 jugadores
                    const currentSelected = document.querySelectorAll('.squad-player-item.selected').length;
                    if (!playerItem.classList.contains('selected') && currentSelected >= 11) {
                        alert('Solo puedes seleccionar hasta 11 jugadores.');
                        return;
                    }
                    playerItem.classList.toggle('selected');
                    this.updateSelectedCount();
                }
            });
        }

        // Event listener para actualizar la lista cuando se abra el modal de selección
        const squadSelectionModal = document.getElementById('squad-selection-modal');
        if (squadSelectionModal) {
            squadSelectionModal.addEventListener('shown.bs.modal', () => {
                console.log('UIManager: Modal de selección de jugadores abierto - Actualizando lista...');
                // Actualizar la lista de jugadores con filtros aplicados
                if (this.playerManager && typeof this.playerManager.renderPlayerSelectionList === 'function') {
                    this.playerManager.renderPlayerSelectionList();
                    
                    // NUEVA LÓGICA: Marcar jugadores que ya están en el campo
                    this.preselectActivePlayersInModal();
                } else {
                    console.warn('UIManager: playerManager o renderPlayerSelectionList no disponible');
                }
            });
        } else {
            console.warn('UIManager: Modal squad-selection-modal no encontrado para event listener');
        }
    }

    // --- NUEVO MÉTODO ---
    setupResizeListener() {
        // Usamos un debounce para evitar que la función se ejecute demasiadas veces
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('UIManager: Ventana redimensionada. Reposicionando jugadores...');
                this.repositionPlayersOnPitch(); // Reposiciona los jugadores existentes
                this.drawingManager.resizeCanvas(); // También redimensionar el canvas de dibujo
            }, 250); // Espera 250ms después de que el redimensionamiento se detenga
        });
    }

    // --- NUEVO MÉTODO ---
    repositionPlayersOnPitch() {
        const pitch = document.getElementById('pitch-container');
        if (!pitch) {
            console.error('UIManager: pitch-container no encontrado para repositionPlayersOnPitch.');
            return;
        }

        const pitchRect = pitch.getBoundingClientRect();

        // Iterar sobre los jugadores activos y actualizar su posición
        this.state.activePlayers.forEach(player => {
            const token = document.querySelector(`.player-token[data-player-id="${player.id}"]`);
            if (token && typeof player.x === 'number' && typeof player.y === 'number') {
                // Las propiedades player.x y player.y ya están guardadas como porcentajes (0-100)
                // Ahora, las aplicamos al nuevo tamaño del campo.
                // Restamos la mitad del tamaño del token para centrarlo si las coordenadas fueran el centro.
                // Pero como estamos guardando la esquina superior izquierda, simplemente aplicamos.
                const newLeft = (player.x / 100) * pitchRect.width;
                const newTop = (player.y / 100) * pitchRect.height;

                token.style.left = `${newLeft}px`;
                token.style.top = `${newTop}px`;
            }
        });
    }


    getSelectedPlayers() {
        const selected = [];
        document.querySelectorAll('.squad-player-item.selected').forEach(item => {
            selected.push(parseInt(item.dataset.playerId));
        });
        return selected;
    }

    // NUEVA FUNCIÓN: Preseleccionar jugadores que ya están en el campo
    preselectActivePlayersInModal() {
        console.log('UIManager: Preseleccionando jugadores activos en el modal...');
        
        // Primero, desseleccionar todos los jugadores
        document.querySelectorAll('.squad-player-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Obtener IDs de jugadores actualmente en el campo
        const activePlayerIds = this.state.activePlayers
            .filter(player => player && !player.isBall && player.id !== 'ball') // Excluir el balón
            .map(player => player.id);
            
        console.log('UIManager: Jugadores activos a preseleccionar:', activePlayerIds);
        
        // Marcar como seleccionados los jugadores que están en el campo
        activePlayerIds.forEach(playerId => {
            const playerItem = document.querySelector(`.squad-player-item[data-player-id="${playerId}"]`);
            if (playerItem) {
                playerItem.classList.add('selected');
                console.log(`UIManager: Jugador ${playerId} marcado como seleccionado`);
            } else {
                console.warn(`UIManager: No se encontró el item para el jugador ${playerId}`);
            }
        });
        
        // Actualizar contador visual
        this.updateSelectedCount();
        
        console.log(`UIManager: ${activePlayerIds.length} jugadores preseleccionados en el modal`);
    }

    // FUNCIÓN ACTUALIZADA: Actualizar contador de jugadores seleccionados  
    updateSelectedCountBadge(count) {
        // Esta función ahora delega a updateSelectedCount() que ya existe
        this.updateSelectedCount();
    }

    renderPlayersOnPitch() {
        const pitch = document.getElementById('pitch-container');
        if (!pitch) {
            console.error('UIManager: pitch-container no encontrado para renderPlayersOnPitch.');
            return;
        }
        // Eliminar jugadores y balones existentes antes de volver a renderizar
        pitch.querySelectorAll('.player-token, .ball-token').forEach(el => el.remove());

        const pitchRect = pitch.getBoundingClientRect();

        // --- DEBUG: Mostrar todos los jugadores a renderizar ---
        console.log('[UIManager][DEBUG] Jugadores a renderizar:', this.state.activePlayers);

        this.state.activePlayers.forEach((player, index) => {
            // Si el jugador es el balón, solo dibujarlo en modo animación
            if (player.isBall || player.type === 'ball' || player.role === 'ball' || player.id === 'ball') {
                // Solo mostrar el balón en modo animación
                const currentMode = this.modeManager ? this.modeManager.currentMode : 'drawing';
                if (currentMode !== 'animation') {
                    console.log('[UIManager] Balón omitido - solo se muestra en modo animación');
                    return; // Saltar renderizado del balón en modo dibujo
                }
                
                // Dibuja el balón como una imagen especial (solo en modo animación)
                const ball = document.createElement('img');
                ball.className = 'ball-token';
                ball.dataset.playerId = player.id;
                ball.src = 'img/ball.png';
                
                // Coordenadas del balón (esperamos porcentajes)
                let x = player.x || 50; // default centro
                let y = player.y || 50; // default centro
                
                // Convertir porcentaje a píxeles para posicionamiento
                ball.style.left = `${(x / 100) * pitchRect.width - 16}px`; // -16 para centrar (32px/2)
                ball.style.top = `${(y / 100) * pitchRect.height - 16}px`;   // -16 para centrar (32px/2)
                ball.style.width = '32px';
                ball.style.height = '32px';
                ball.style.position = 'absolute';
                ball.style.zIndex = 20;
                ball.style.cursor = 'grab';
                ball.title = 'Balón';
                
                // Agregar eventos de drag para el balón
                const startDragBall = (e) => {
                    if (this.state.isDrawingMode) return;
                    console.log('UIManager: Iniciando arrastre del balón.', e.type);
                    
                    // Notificar que se está arrastrando para evitar conflicto con estela
                    if (window.main && window.main.setBallDragStarted) {
                        window.main.setBallDragStarted(true);
                    }
                    
                    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                    ball.classList.add('dragging');
                    ball.style.cursor = 'grabbing';
                    const ballRect = ball.getBoundingClientRect();
                    const pitchRect = pitch.getBoundingClientRect();
                    const offsetX = clientX - ballRect.left;
                    const offsetY = clientY - ballRect.top;
                    const moveHandler = (moveEvent) => {
                        moveEvent.preventDefault();
                        const currentClientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                        const currentClientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
                        const xPx = currentClientX - pitchRect.left - offsetX;
                        const yPx = currentClientY - pitchRect.top - offsetY;
                        const maxX = pitchRect.width - ball.offsetWidth;
                        const maxY = pitchRect.height - ball.offsetHeight;
                        ball.style.left = `${Math.max(0, Math.min(xPx, maxX))}px`;
                        ball.style.top = `${Math.max(0, Math.min(yPx, maxY))}px`;
                    };
                    const upHandler = () => {
                        console.log('UIManager: Finalizando arrastre del balón.');
                        document.removeEventListener('mousemove', moveHandler);
                        document.removeEventListener('mouseup', upHandler);
                        document.removeEventListener('touchmove', moveHandler);
                        document.removeEventListener('touchend', upHandler);
                        ball.classList.remove('dragging');
                        ball.style.cursor = 'grab';
                        const ballPlayer = this.state.activePlayers.find(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
                        if (ballPlayer) {
                            const currentLeftPx = parseFloat(ball.style.left);
                            const currentTopPx = parseFloat(ball.style.top);
                            ballPlayer.x = ((currentLeftPx + 16) / pitchRect.width) * 100; // +16 para volver al centro
                            ballPlayer.y = ((currentTopPx + 16) / pitchRect.height) * 100;  // +16 para volver al centro
                            console.log(`Balón guardado en: x=${ballPlayer.x.toFixed(2)}%, y=${ballPlayer.y.toFixed(2)}%`);
                        }
                        
                        // Restablecer estado de drag después de un tiempo
                        setTimeout(() => {
                            if (window.main && window.main.setBallDragStarted) {
                                window.main.setBallDragStarted(false);
                            }
                        }, 200);
                    };
                    document.addEventListener('mousemove', moveHandler);
                    document.addEventListener('mouseup', upHandler);
                    document.addEventListener('touchmove', moveHandler, { passive: false });
                    document.addEventListener('touchend', upHandler);
                };
                ball.addEventListener('mousedown', startDragBall);
                ball.addEventListener('touchstart', startDragBall, { passive: false });
                
                pitch.appendChild(ball);
                console.log('[UIManager][DEBUG] Balón renderizado en', x, y, '% -> píxeles:', ball.style.left, ball.style.top);
                return;
            }

            // Si el jugador no tiene posiciones (x,y) definidas (por ejemplo, es la primera vez que se añade
            // o no hay una táctica que le asigne una), asignarle una posición por defecto
            if (typeof player.x !== 'number' || typeof player.y !== 'number') {
                const initialX = (pitchRect.width / 2) - (60 / 2) + (index * 5);
                const initialY = (pitchRect.height * 0.20);
                player.x = (initialX / pitchRect.width) * 100;
                player.y = (initialY / pitchRect.height) * 100;
            }

            // Crear token usando el sistema unificado
            let token;
            if (window.playerCardManager) {
                token = window.playerCardManager.createPlayerCard(player, 'field');
                token.style.left = `${(player.x / 100) * pitchRect.width}px`;
                token.style.top = `${(player.y / 100) * pitchRect.height}px`;
            } else {
                // Fallback al método anterior
                token = document.createElement('div');
                token.className = 'player-token';
                token.dataset.playerId = player.id;
                token.style.left = `${(player.x / 100) * pitchRect.width}px`;
                token.style.top = `${(player.y / 100) * pitchRect.height}px`;
                token.innerHTML = `
                    <div class="minicard-overall player-card-element" 
                         data-element="overall" 
                         data-player-id="${player.id}"
                         title="Overall: ${this.playerManager.calculateOverall(player)}">
                        ${this.playerManager.calculateOverall(player)}
                    </div>
                    <div class="minicard-position player-card-element" 
                         data-element="position" 
                         data-player-id="${player.id}"
                         title="Posición: ${player.position}">
                        ${player.position}
                    </div>
                    <img src="${player.image_url}" 
                         class="minicard-player-image player-card-element" 
                         data-element="image" 
                         data-player-id="${player.id}"
                         alt="${player.name}"
                         title="${player.name}">
                    <div class="minicard-name player-card-element" 
                         data-element="name" 
                         data-player-id="${player.id}"
                         title="Nombre: ${player.name}">
                        ${player.name}
                    </div>
                    <div class="minicard-jersey-number player-card-element" 
                         data-element="jersey" 
                         data-player-id="${player.id}"
                         title="Dorsal: ${player.jersey_number || '?'}">
                        ${player.jersey_number || '?'}
                    </div>
                `;
            }

            // ELIMINADO: Ya no se abre el menú de jugador al hacer doble clic
            // token.addEventListener('dblclick', () => {
            //     console.log('UIManager: Doble clic en jugador', player.id);
            //     this.showPlayerCard(player.id);
            // });

            // Eventos para arrastrar (Touch events para móvil)
            const startDrag = (e) => {
                if (this.state.isDrawingMode) return;
                console.log('UIManager: Iniciando arrastre de jugador.', e.type);
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                token.classList.add('dragging');
                token.style.cursor = 'grabbing';
                const tokenRect = token.getBoundingClientRect();
                const pitchRect = pitch.getBoundingClientRect();
                const offsetX = clientX - tokenRect.left;
                const offsetY = clientY - tokenRect.top;
                const moveHandler = (moveEvent) => {
                    moveEvent.preventDefault();
                    const currentClientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                    const currentClientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
                    const xPx = currentClientX - pitchRect.left - offsetX;
                    const yPx = currentClientY - pitchRect.top - offsetY;
                    const maxX = pitchRect.width - token.offsetWidth;
                    const maxY = pitchRect.height - token.offsetHeight;
                    token.style.left = `${Math.max(0, Math.min(xPx, maxX))}px`;
                    token.style.top = `${Math.max(0, Math.min(yPx, maxY))}px`;
                };
                const upHandler = () => {
                    console.log('UIManager: Finalizando arrastre de jugador.');
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    document.removeEventListener('touchmove', moveHandler);
                    document.removeEventListener('touchend', upHandler);
                    token.classList.remove('dragging');
                    token.style.cursor = 'grab';
                    const playerId = parseInt(token.dataset.playerId);
                    const player = this.state.activePlayers.find(p => p.id === playerId);
                    if (player) {
                        const currentLeftPx = parseFloat(token.style.left);
                        const currentTopPx = parseFloat(token.style.top);
                        player.x = (currentLeftPx / pitchRect.width) * 100;
                        player.y = (currentTopPx / pitchRect.height) * 100;
                        console.log(`Jugador ${player.id} guardado en: x=${player.x.toFixed(2)}%, y=${player.y.toFixed(2)}%`);
                    }
                };
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
                document.addEventListener('touchmove', moveHandler, { passive: false });
                document.addEventListener('touchend', upHandler);
            };
            token.addEventListener('mousedown', startDrag);
            token.addEventListener('touchstart', startDrag, { passive: false });
            pitch.appendChild(token);
        });
    }

    // ELIMINADO: Método showPlayerCard ya no se usa
    // showPlayerCard(playerId) { ... }

    updateModeIndicator() {
        const modeSpan = document.getElementById('current-mode');
        if (modeSpan) {
            const mode = this.state.isDrawingMode ? 'Dibujo' : 'Arrastrar';
            modeSpan.textContent = mode;
            console.log('UIManager: Indicador de modo actualizado a', mode);
        } else {
            console.warn('UIManager: Elemento #current-mode no encontrado.');
        }
    }

    updateSelectedCount() {
        const selectedCountSpan = document.getElementById('selected-count');
        if (selectedCountSpan) {
            const selectedCount = document.querySelectorAll('.squad-player-item.selected').length;
            selectedCountSpan.textContent = `${selectedCount} seleccionados`;

            if (selectedCount > 11) {
                selectedCountSpan.classList.add('bg-danger');
                selectedCountSpan.classList.remove('bg-success');
            } else {
                selectedCountSpan.classList.remove('bg-danger');
                selectedCountSpan.classList.add('bg-success');
            }
            console.log('UIManager: Contador de seleccionados actualizado a', selectedCount);
        } else {
            console.warn('UIManager: Elemento #selected-count no encontrado.');
        }
    }
}