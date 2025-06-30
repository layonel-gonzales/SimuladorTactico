// uiManager.js

export default class UIManager {
    constructor() {
        this.playerManager = null;
        this.tacticsManager = null;
        this.drawingManager = null;
        this.state = null; // Se inicializará en init()
    }

    init({ playerManager, tacticsManager, drawingManager, state }) {
        this.playerManager = playerManager;
        this.tacticsManager = tacticsManager;
        this.drawingManager = drawingManager;
        this.state = state;

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

        // Asegúrate de que el cursor del canvas se actualice al cambiar el modo
        const toggleDrawingModeBtn = document.getElementById('toggle-drawing-mode');
        if (toggleDrawingModeBtn) {
            toggleDrawingModeBtn.addEventListener('click', () => {
                this.state.isDrawingMode = !this.state.isDrawingMode;
                this.updateModeIndicator();
                updateCanvasCursor(); // Actualizar cursor inmediatamente al cambiar modo
                console.log('UIManager: Modo de dibujo cambiado a', this.state.isDrawingMode);
            });
        }
    }

    setupEventListeners() {
        console.log('UIManager: Configurando Event Listeners...');

        // --- Eventos para el menú móvil ---
        const mobileControlsToggleBtn = document.getElementById('mobile-controls-toggle-btn');
        const controlsWrapper = document.getElementById('controls-wrapper');
        const overlay = document.getElementById('mobile-menu-overlay');
        const closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');
        const closeMobileMenuBtnBottom = document.getElementById('close-mobile-menu-btn-bottom');

        // Función para cerrar el menú móvil
        const closeMobileMenu = () => {
            console.log('UIManager: Cerrando menú móvil.');
            if (controlsWrapper) controlsWrapper.classList.remove('show-controls');
            if (overlay) overlay.classList.remove('show-overlay');
        };

        // Abrir menú
        if (mobileControlsToggleBtn) {
            mobileControlsToggleBtn.addEventListener('click', () => {
                console.log('UIManager: Click en botón para abrir menú móvil.');
                if (controlsWrapper) controlsWrapper.classList.add('show-controls');
                if (overlay) overlay.classList.add('show-overlay');
            });
        } else {
             console.warn('UIManager: Botón #mobile-controls-toggle-btn no encontrado.');
        }

        // Cerrar menú desde el botón superior o inferior
        if (closeMobileMenuBtn) {
            closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
        } else {
             console.warn('UIManager: Botón #close-mobile-menu-btn no encontrado.');
        }
        if (closeMobileMenuBtnBottom) {
            closeMobileMenuBtnBottom.addEventListener('click', closeMobileMenu);
        } else {
             console.warn('UIManager: Botón #close-mobile-menu-btn-bottom no encontrado.');
        }

        // Cerrar menú al hacer clic en el overlay
        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        } else {
            console.warn('UIManager: Overlay #mobile-menu-overlay no encontrado.');
        }

        // --- Eventos principales de la aplicación ---

        const selectSquadBtn = document.getElementById('select-squad-btn');
        if (selectSquadBtn) {
            selectSquadBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Seleccionar Plantilla.');
                const modal = new bootstrap.Modal(document.getElementById('squad-selection-modal'));
                modal.show();
            });
        }

        const confirmSquadBtn = document.getElementById('confirm-squad-btn');
        if (confirmSquadBtn) {
            confirmSquadBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Confirmar Plantilla.');
                const selectedPlayers = this.getSelectedPlayers();

                // Filtrar para no más de 11 jugadores
                const playersToActivate = selectedPlayers.slice(0, 11);

                // Mapear los IDs seleccionados a objetos de jugador
                this.state.activePlayers = playersToActivate.map(id =>
                    this.playerManager.getPlayerById(id)
                );

                // Aplicar la táctica, esto actualizará las posiciones x, y de los jugadores en this.state.activePlayers
                this.tacticsManager.applyTactic(
                    this.state.currentTactic,
                    this.state.activePlayers
                );

                // Renderizar los jugadores en el campo con sus nuevas posiciones
                this.renderPlayersOnPitch();

                const modal = bootstrap.Modal.getInstance(document.getElementById('squad-selection-modal'));
                if (modal) modal.hide();
            });
        }


        const tacticSelector = document.getElementById('tactic-selector');
        if (tacticSelector) {
            tacticSelector.addEventListener('change', (e) => {
                console.log('UIManager: Táctica cambiada a', e.target.value);
                this.state.currentTactic = e.target.value;

                if (this.state.activePlayers.length > 0) {
                    this.tacticsManager.applyTactic(
                        this.state.currentTactic,
                        this.state.activePlayers
                    );
                    this.renderPlayersOnPitch();
                }
            });
        }

        const clearCanvasBtn = document.getElementById('clear-canvas');
        if (clearCanvasBtn) {
            clearCanvasBtn.addEventListener('click', () => {
                console.log('UIManager: Click en Borrar Dibujo.');
                this.drawingManager.clearCanvas();
            });
        }

        const fullscreenButton = document.getElementById('fullscreenButton');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', () => {
                console.log('UIManager: Click en Pantalla Completa.');
                this.toggleFullscreen();
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

    renderPlayersOnPitch() {
        const pitch = document.getElementById('pitch-container');
        if (!pitch) {
            console.error('UIManager: pitch-container no encontrado para renderPlayersOnPitch.');
            return;
        }
        // Eliminar jugadores existentes antes de volver a renderizar
        pitch.querySelectorAll('.player-token').forEach(el => el.remove());

        const pitchRect = pitch.getBoundingClientRect();
        // NOTA: Para el renderizado inicial, si no hay posiciones predefinidas,
        // la lógica de applyTactic debería establecerlas.
        // Si no hay táctica aplicada, podemos darles una posición inicial arbitraria.

        // Asegurarse de que player.x y player.y estén definidos antes de intentar renderizar
        // Esto es crucial para que repositionPlayersOnPitch funcione.
        this.state.activePlayers.forEach((player, index) => {
            // Si el jugador no tiene posiciones (x,y) definidas (por ejemplo, es la primera vez que se añade
            // o no hay una táctica que le asigne una), asignarle una posición por defecto
            // que luego será actualizada por la táctica o por arrastre.
            if (typeof player.x !== 'number' || typeof player.y !== 'number') {
                // Aquí podrías definir una lógica de posicionamiento por defecto,
                // por ejemplo, dispersarlos un poco o colocarlos en una línea.
                // Por simplicidad, usaremos un valor que los coloque en el centro superior al 20% del campo
                // hasta que una táctica o un arrastre los mueva.
                const initialX = (pitchRect.width / 2) - (60 / 2) + (index * 5); // 60 es el ancho del token
                const initialY = (pitchRect.height * 0.20); // 20% desde arriba

                player.x = (initialX / pitchRect.width) * 100;
                player.y = (initialY / pitchRect.height) * 100;
            }

            const token = document.createElement('div');
            token.className = 'player-token';
            token.dataset.playerId = player.id;

            // Usar las posiciones (x,y) que ya están guardadas como porcentajes en el objeto player
            token.style.left = `${(player.x / 100) * pitchRect.width}px`;
            token.style.top = `${(player.y / 100) * pitchRect.height}px`;

            token.innerHTML = `
                <div class="minicard-overall">${this.playerManager.calculateOverall(player)}</div>
                <div class="minicard-position">${player.position}</div>
                <img src="${player.image_url}" class="minicard-player-image">
                <div class="minicard-name">${player.name}</div>
                <div class="minicard-jersey-number">#${player.jersey_number}</div>
            `;

            token.addEventListener('dblclick', () => {
                console.log('UIManager: Doble clic en jugador', player.id);
                this.showPlayerCard(player.id);
            });

            // Eventos para arrastrar (Touch events para móvil)
            const startDrag = (e) => {
                if (this.state.isDrawingMode) return;
                console.log('UIManager: Iniciando arrastre de jugador.', e.type);

                // Si es un evento touch, usar el primer toque
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                token.classList.add('dragging');
                token.style.cursor = 'grabbing';

                const tokenRect = token.getBoundingClientRect();
                const pitchRect = pitch.getBoundingClientRect(); // Obtener pitchRect actual en el momento del arrastre

                const offsetX = clientX - tokenRect.left;
                const offsetY = clientY - tokenRect.top;

                const moveHandler = (moveEvent) => {
                    // Prevenir comportamiento de touch por defecto (scroll) durante el movimiento
                    moveEvent.preventDefault();

                    const currentClientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                    const currentClientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

                    // Cálculo de la posición absoluta en píxeles
                    const xPx = currentClientX - pitchRect.left - offsetX;
                    const yPx = currentClientY - pitchRect.top - offsetY;

                    // Limitar al área del campo
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

                    // Actualizar posición en el estado como PORCENTAJES
                    const playerId = parseInt(token.dataset.playerId);
                    const player = this.state.activePlayers.find(p => p.id === playerId);
                    if (player) {
                        // Obtener la posición actual en píxeles y convertirla a porcentaje
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

            // Añadir event listeners para mouse y touch
            token.addEventListener('mousedown', startDrag);
            token.addEventListener('touchstart', startDrag, { passive: false });

            pitch.appendChild(token);
        });
    }

    showPlayerCard(playerId) {
        const player = this.playerManager.getPlayerById(playerId);
        if (!player) return;

        // Inyectar la tarjeta en el modal-body del modal de jugador
        const modalBodyContent = document.getElementById('player-modal-body-content');
        if (modalBodyContent) {
             modalBodyContent.innerHTML = this.playerManager.renderPlayerCard(player);
        } else {
            console.error('UIManager: Elemento #player-modal-body-content no encontrado en el modal de jugador.');
        }

        const modal = new bootstrap.Modal(document.getElementById('player-modal'));
        if (modal) {
            modal.show();
            console.log('UIManager: Modal de jugador mostrado.');
        } else {
            console.error('UIManager: No se pudo instanciar el modal de jugador. Asegúrate de que Bootstrap JS esté cargado.');
        }
    }

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

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`UIManager: Error al intentar pantalla completa: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        console.log('UIManager: Toggle Fullscreen.');
    }
}