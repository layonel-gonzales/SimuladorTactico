export default class UIManager {
    init({ playerManager, tacticsManager, drawingManager, state }) {
        this.playerManager = playerManager;
        this.tacticsManager = tacticsManager;
        this.drawingManager = drawingManager;
        this.state = state;

        this.setupEventListeners();
    }

    setupCursors() {
        const drawingCanvas = document.getElementById('drawing-canvas');

        // Cursor para modo dibujo
        drawingCanvas.addEventListener('mouseenter', () => {
            if (this.state.isDrawingMode) {
                drawingCanvas.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\' fill=\'%23ffffff\'/%3E%3C/svg%3E") 0 24, auto';
            }
        });

        // Cursor para jugadores
        document.getElementById('pitch-container').addEventListener('mouseover', (e) => {
            if (e.target.closest('.player-token') && !this.state.isDrawingMode) {
                e.target.closest('.player-token').style.cursor = 'grab';
            }
        });
    }

    setupEventListeners() {
        // Toggle controles
        document.getElementById('toggle-controls').addEventListener('click', () => {
            const content = document.getElementById('controls-content');
            const icon = document.querySelector('#toggle-controls i');
            content.classList.toggle('d-none');
            icon.classList.toggle('bi-chevron-down');
            icon.classList.toggle('bi-chevron-up');
        });

        // Seleccionar plantilla
        document.getElementById('select-squad-btn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('squad-selection-modal'));
            modal.show();
        });

        // Confirmar plantilla
        document.getElementById('confirm-squad-btn').addEventListener('click', () => {
            const selectedPlayers = this.getSelectedPlayers();
            this.state.activePlayers = selectedPlayers.map(id =>
                this.playerManager.getPlayerById(id)
            );

            // Aplicar táctica actual
            this.tacticsManager.applyTactic(
                this.state.currentTactic,
                this.state.activePlayers
            );

            // Renderizar jugadores en el campo
            this.renderPlayersOnPitch();

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('squad-selection-modal'));
            modal.hide();
        });

        // Cambiar táctica
        document.getElementById('tactic-selector').addEventListener('change', (e) => {
            this.state.currentTactic = e.target.value;

            if (this.state.activePlayers.length > 0) {
                this.tacticsManager.applyTactic(
                    this.state.currentTactic,
                    this.state.activePlayers
                );
                this.renderPlayersOnPitch();
            }
        });

        // Modo dibujo
        document.getElementById('toggle-drawing-mode').addEventListener('click', () => {
            this.state.isDrawingMode = !this.state.isDrawingMode;
            this.updateModeIndicator();
        });

        // Borrar dibujo
        document.getElementById('clear-canvas').addEventListener('click', () => {
            this.drawingManager.clearCanvas();
        });

        // Pantalla completa
        document.getElementById('fullscreenButton').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Evento para seleccionar jugadores en el modal
        document.getElementById('squad-player-list').addEventListener('click', (e) => {
            const playerItem = e.target.closest('.squad-player-item');
            if (playerItem) {
                playerItem.classList.toggle('selected');
                this.updateSelectedCount();
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
        pitch.querySelectorAll('.player-token').forEach(el => el.remove());
        
        const pitchRect = pitch.getBoundingClientRect();
        const playerCount = this.state.activePlayers.length;
        
        // Posicionar jugadores en línea horizontal en el centro
        const startX = pitchRect.width / 2 - (playerCount * 60) / 2;
        const centerY = pitchRect.height / 2 - 65; // 65 es la mitad de la altura del token
        
        this.state.activePlayers.forEach((player, index) => {
            const token = document.createElement('div');
            token.className = 'player-token';
            
            // Posición inicial horizontal
            token.style.left = `${startX + index * 60}px`;
            token.style.top = `${centerY}px`;
            token.dataset.playerId = player.id;
            
            token.innerHTML = `
                <div class="minicard-overall">${this.playerManager.calculateOverall(player)}</div>
                <div class="minicard-position">${player.position}</div>
                <img src="${player.image_url}" class="minicard-player-image">
                <div class="minicard-name">${player.name}</div>
                <div class="minicard-jersey-number">#${player.jersey_number}</div>
            `;
            
            token.addEventListener('dblclick', () => {
                this.showPlayerCard(player.id);
            });
            
            // Eventos para arrastrar
            token.addEventListener('mousedown', (e) => {
                if (this.state.isDrawingMode) return;
                
                e.preventDefault();
                this.dragPlayer(token, e);
                
                // Cambiar cursor a mano cerrada
                token.style.cursor = 'grabbing';
            });
            
            pitch.appendChild(token);
        });
    }

    dragPlayer(token, e) {
        token.classList.add('dragging');
        
        const pitch = document.getElementById('pitch-container');
        const pitchRect = pitch.getBoundingClientRect();
        
        const startX = e.clientX - token.getBoundingClientRect().left;
        const startY = e.clientY - token.getBoundingClientRect().top;
        
        const moveHandler = (moveEvent) => {
            const x = moveEvent.clientX - pitchRect.left - startX;
            const y = moveEvent.clientY - pitchRect.top - startY;
            
            // Limitar al área del campo
            const maxX = pitchRect.width - token.offsetWidth;
            const maxY = pitchRect.height - token.offsetHeight;
            
            token.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            token.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        };
        
        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            token.classList.remove('dragging');
            
            // Restaurar cursor a mano abierta
            token.style.cursor = 'grab';
            
            // Actualizar posición en el estado
            const playerId = parseInt(token.dataset.playerId);
            const player = this.state.activePlayers.find(p => p.id === playerId);
            if (player) {
                player.x = (parseInt(token.style.left) / pitchRect.width) * 100;
                player.y = (parseInt(token.style.top) / pitchRect.height) * 100;
            }
        };
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    showPlayerCard(playerId) {
        const player = this.playerManager.getPlayerById(playerId);
        if (!player) return;

        const container = document.getElementById('player-card-container');
        container.innerHTML = this.playerManager.renderPlayerCard(player);

        const modal = new bootstrap.Modal(document.getElementById('player-modal'));
        modal.show();
    }

    updateModeIndicator() {
        const mode = this.state.isDrawingMode ? 'Dibujo' : 'Arrastrar';
        document.getElementById('current-mode').textContent = mode;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error al intentar pantalla completa: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}