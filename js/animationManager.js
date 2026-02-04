// animationManager.js
// Maneja todo lo relacionado con crear y reproducir animaciones tácticas

export default class AnimationManager {
    constructor(getActivePlayers, setActivePlayers, ensureBallInPlayers, uiManager, audioManager = null) {
        this.getActivePlayers = getActivePlayers;
        this.setActivePlayers = setActivePlayers;
        this.ensureBallInPlayers = ensureBallInPlayers;
        this.uiManager = uiManager;
        this.audioManager = audioManager; // Referencia al AudioManager
        
        // Estado de la animación
        this.frames = [];
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isRecordMode = false;
        
        // Flags para sugerencias de audio
        this.audioSuggestionShown = false;
        this.audioSuggestionAfterPlay = false;
        
        // Referencias a elementos del DOM
        this.frameIndicator = null;
        this.recordBtn = null;
        this.playBtn = null;
        this.speedInput = null;
        
        this.init();
    }
    
    init() {
        this.setupDOMReferences();
        this.setupEventListeners();
        this.setupPlayerDropHandlers();
        
        // Inicializar con un frame vacío
        this.frames.push(this.getCurrentState());
        this.updateFrameIndicator();
        this.updateButtonsAvailability(); // ✨ Configurar estado inicial de botones
    }
    
    setupDOMReferences() {
        this.frameIndicator = document.getElementById('frame-indicator');
        this.recordBtn = document.getElementById('record-mode-toggle');
        this.playBtn = document.getElementById('frame-play');
        this.speedInput = document.getElementById('animation-speed');
        
        // Botones de control de frames
        this.btnPrev = document.getElementById('frame-prev');
        this.btnNext = document.getElementById('frame-next');
        this.btnAdd = document.getElementById('frame-add');
        this.btnDelete = document.getElementById('frame-delete');
        this.btnReset = document.getElementById('reset-animation');
    }
    
    setupEventListeners() {
        // Botón de grabación
        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => this.toggleRecordMode());
        }
        
        // Controles de frames
        if (this.btnPrev) {
            this.btnPrev.addEventListener('click', () => {
                this.gotoFrame(this.currentFrame - 1);
            });
        }
        if (this.btnNext) {
            this.btnNext.addEventListener('click', () => {
                this.gotoFrame(this.currentFrame + 1);
            });
        }
        if (this.btnAdd) {
            this.btnAdd.addEventListener('click', () => this.addFrame());
        }
        if (this.btnDelete) {
            this.btnDelete.addEventListener('click', () => {
                // Confirmar acción crítica si está habilitado
                const shouldProceed = window.confirmCriticalAction && 
                    window.confirmCriticalAction(
                        '¿Estás seguro de que quieres eliminar el frame actual?\n\nEsta acción no se puede deshacer.',
                        'DeleteFrame'
                    );
                
                if (shouldProceed !== false) { // Proceder si la función no existe o si el usuario confirma
                    this.deleteCurrentFrame();
                }
            });
        }
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => {
                // Confirmar acción crítica si está habilitado
                const shouldProceed = window.confirmCriticalAction && 
                    window.confirmCriticalAction(
                        '¿Estás seguro de que quieres reiniciar la animación?\n\nSe perderán todos los frames configurados.',
                        'ResetAnimation'
                    );
                
                if (shouldProceed !== false) { // Proceder si la función no existe o si el usuario confirma
                    this.resetAnimation();
                }
            });
        }
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                this.isPlaying ? this.stopAnimation() : this.playAnimation();
            });
        }
        
        // Eventos de movimiento de jugadores y balón
        document.addEventListener('player-move-end', () => {
            if (this.isRecordMode) this.saveFrame();
        });
        document.addEventListener('ball-move-end', () => {
            if (this.isRecordMode) this.saveFrame();
        });
    }
    
    setupPlayerDropHandlers() {
        // Configurar callbacks en UIManager para detectar cuando se mueven jugadores
        if (this.uiManager) {
            this.uiManager.onPlayerDrop = () => {
                if (this.isRecordMode) this.saveFrame();
            };
            this.uiManager.onBallDrop = () => {
                if (this.isRecordMode) this.saveFrame();
            };
        }
    }
    
    toggleRecordMode() {
        this.isRecordMode = !this.isRecordMode;
        
        // Actualizar UI del botón
        if (this.recordBtn) {
            this.recordBtn.classList.toggle('active', this.isRecordMode);
            this.recordBtn.style.backgroundColor = this.isRecordMode ? '#c00' : '';
            this.recordBtn.style.color = this.isRecordMode ? 'white' : '';
            this.recordBtn.innerHTML = this.isRecordMode ? 
                '<i class="fas fa-stop"></i> Detener' : 
                '<i class="fas fa-dot-circle"></i> Grabar';
        }
        
        // ✨ NUEVA FUNCIONALIDAD: Habilitar botones progresivamente
        this.updateButtonsAvailability();
        
        // Si se desactiva el modo grabación y se tienen frames, sugerir audio
        if (!this.isRecordMode && this.frames.length >= 3) {
            this.checkForAudioRecordingSuggestion();
        }
        
    }
    
    // ✨ NUEVA FUNCIÓN: Actualizar disponibilidad de botones según el estado
    updateButtonsAvailability() {
        // Lógica progresiva de habilitación:
        // 1. Solo "Grabar" está disponible inicialmente
        // 2. Al grabar, se habilita "Nuevo frame" 
        // 3. Con múltiples frames, se habilitan navegación y reproducción
        
        const hasFrames = this.frames.length > 0;
        const hasMultipleFrames = this.frames.length > 1;
        const isRecording = this.isRecordMode;
        
        // Botón "Nuevo frame" - disponible cuando hay grabación activa o frames existentes
        if (this.btnAdd) {
            this.btnAdd.disabled = !isRecording && !hasFrames;
            this.btnAdd.style.opacity = (isRecording || hasFrames) ? '1' : '0.5';
            this.btnAdd.title = !isRecording && !hasFrames ? 
                'Primero activa el modo grabar para crear frames' : 
                'Nuevo frame';
        }
        
        // Navegación - disponible solo con múltiples frames
        if (this.btnPrev) {
            this.btnPrev.disabled = !hasMultipleFrames;
            this.btnPrev.style.opacity = hasMultipleFrames ? '1' : '0.5';
        }
        
        if (this.btnNext) {
            this.btnNext.disabled = !hasMultipleFrames;
            this.btnNext.style.opacity = hasMultipleFrames ? '1' : '0.5';
        }
        
        // Reproducción - disponible con múltiples frames y no grabando
        if (this.btnPlay) {
            this.btnPlay.disabled = !hasMultipleFrames || isRecording;
            this.btnPlay.style.opacity = (hasMultipleFrames && !isRecording) ? '1' : '0.5';
            this.btnPlay.title = isRecording ? 
                'Detén la grabación primero para reproducir' : 
                (hasMultipleFrames ? 'Reproducir animación' : 'Necesitas al menos 2 frames para reproducir');
        }
        
        // Eliminar frame - disponible solo cuando hay múltiples frames (no eliminar el último)
        if (this.btnDelete) {
            this.btnDelete.disabled = !hasMultipleFrames;
            this.btnDelete.style.opacity = hasMultipleFrames ? '1' : '0.5';
            this.btnDelete.title = hasMultipleFrames ? 
                `Eliminar frame actual (${this.currentFrame + 1}/${this.frames.length})` : 
                'Necesitas al menos 2 frames para poder eliminar uno';
        }
        
    }
    
    // Guardar frame en modo grabación
    saveFrame() {
        if (!this.isRecordMode) return;
        
        const currentState = this.getCurrentState();
        
        // Evitar frames duplicados
        const lastFrame = this.frames[this.frames.length - 1];
        if (lastFrame && JSON.stringify(lastFrame) === JSON.stringify(currentState)) {
            return;
        }
        
        this.frames.push(currentState);
        this.currentFrame = this.frames.length - 1;
        this.updateFrameIndicator();
        this.updateButtonsAvailability(); // ✨ Actualizar botones cuando se graba automáticamente
        
    }
    
    getCurrentState() {
        const activePlayers = this.getActivePlayers();
        
        return {
            players: activePlayers.map(player => ({
                id: player.id,
                x: player.x,
                y: player.y,
                team: player.team,
                role: player.role,
                number: player.number,
                name: player.name,
                position: player.position,
                photo: player.photo,
                isBall: player.isBall || false,
                // Preservar todas las propiedades adicionales del jugador
                ...player
            })),
            timestamp: Date.now()
        };
    }
    
    setStateFromFrame(frame) {
        if (!frame || !frame.players) {
            return;
        }       
        
        // Restaurar posiciones de jugadores preservando toda la información
        const existingPlayers = this.getActivePlayers();
        
        const newPlayers = frame.players.map(framePlayer => {
            // Buscar jugador existente
            let player = existingPlayers.find(p => p.id === framePlayer.id);
            
            if (player) {
                // Si existe, preservar todas sus propiedades y solo actualizar posición
                return {
                    ...player,
                    x: framePlayer.x,
                    y: framePlayer.y,
                    // Actualizar otras propiedades del frame si existen
                    team: framePlayer.team || player.team,
                    role: framePlayer.role || player.role,
                    number: framePlayer.number || player.number,
                    name: framePlayer.name || player.name,
                    position: framePlayer.position || player.position,
                    photo: framePlayer.photo || player.photo,
                    isBall: framePlayer.isBall || player.isBall || false
                };
            } else {
                // Si no existe, crear nuevo jugador con toda la información del frame
                return {
                    ...framePlayer,
                    team: framePlayer.team || 'team1',
                    role: framePlayer.role || 'player',
                    number: framePlayer.number || '1',
                    name: framePlayer.name || 'Jugador',
                    position: framePlayer.position || 'MC',
                    photo: framePlayer.photo || 'img/default_player.png',
                    isBall: framePlayer.isBall || false
                };
            }
        });
        
        this.setActivePlayers(newPlayers);
        this.ensureBallInPlayers();
        
        if (this.uiManager) {
            this.uiManager.renderPlayersOnPitch();
        } else {
            console.log('[AnimationManager] ⚠️ UIManager no disponible');
        }
    }
    
    updateFrameIndicator() {
        if (this.frameIndicator) {
            const indicator = `${this.currentFrame + 1}/${this.frames.length}`;
            this.frameIndicator.textContent = indicator;
        }
    }
    
    saveCurrentFrame() {
        if (this.frames[this.currentFrame]) {
            this.frames[this.currentFrame] = this.getCurrentState();
        }
    }
    
    addFrame() {
        // Guardar el frame actual antes de agregar uno nuevo
        this.saveCurrentFrame();
        
        // Agregar nuevo frame con el estado actual
        const newState = this.getCurrentState();
        this.frames.push(newState);
        this.currentFrame = this.frames.length - 1;
        
        // Actualizar UI
        this.updateFrameIndicator();
        this.updateButtonsAvailability(); // ✨ Actualizar botones después de agregar frame
        
        
        // Sugerir grabación de audio cuando se tienen suficientes frames
        this.checkForAudioRecordingSuggestion();
    }
    
    deleteCurrentFrame() {
        // No permitir eliminar si solo hay un frame
        if (this.frames.length <= 1) {
            return;
        }
        
        const frameToDelete = this.currentFrame + 1; // Para mostrar en consola (1-based)
        const totalFrames = this.frames.length;
        
        // Eliminar el frame actual
        this.frames.splice(this.currentFrame, 1);
        
        // Ajustar el currentFrame después de eliminar
        if (this.currentFrame >= this.frames.length) {
            // Si eliminamos el último frame, ir al anterior
            this.currentFrame = this.frames.length - 1;
        }
        // Si no era el último, el currentFrame automáticamente apunta al siguiente frame
        // (porque los índices se desplazaron hacia abajo)
        
        // Cargar el nuevo frame actual
        this.setStateFromFrame(this.frames[this.currentFrame]);
        
        // Actualizar UI
        this.updateFrameIndicator();
        this.updateButtonsAvailability();
        
    }
    
    gotoFrame(idx) {
        if (idx < 0 || idx >= this.frames.length) {
            return;
        }
             
        this.saveCurrentFrame();
        this.currentFrame = idx;
        this.setStateFromFrame(this.frames[this.currentFrame]);
        this.updateFrameIndicator();
    }
    
    // Función de interpolación lineal
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Versión async de playAnimation que espera hasta completarse
    async playAnimationAsync() {
        return new Promise((resolve) => {
            if (this.isPlaying || this.frames.length < 2) {
                resolve();
                return;
            }
            
            // Limpiar líneas antes de animar
            if (this.uiManager && this.uiManager.drawingManager) {
                this.uiManager.drawingManager.lines = [];
                this.uiManager.drawingManager.redrawLines();
            }
            
            // NO reproducir audio automáticamente en este modo
            // (porque podría estar grabando narración)
            
            this.isPlaying = true;
            if (this.playBtn) {
                this.playBtn.innerHTML = '<i class="fas fa-stop"></i>';
            }
            
            const speed = this.speedInput ? parseFloat(this.speedInput.value) : 1;
            let i = 0;
            
            const animateFrameTransition = (fromFrame, toFrame, onComplete) => {
                const duration = (600 * 1.75) / speed;
                const start = performance.now();
                const fromPlayers = fromFrame.players.map(p => ({ ...p }));
                const toPlayers = toFrame.players.map(p => ({ ...p }));
                
                const animate = (currentTime) => {
                    if (!this.isPlaying) {
                        onComplete();
                        return;
                    }
                    
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    const interpolatedPlayers = fromPlayers.map((fromPlayer, idx) => {
                        const toPlayer = toPlayers[idx];
                        if (!toPlayer) return fromPlayer;
                        
                        return {
                            ...fromPlayer,
                            x: this.lerp(fromPlayer.x, toPlayer.x, progress),
                            y: this.lerp(fromPlayer.y, toPlayer.y, progress)
                        };
                    });
                    
                    this.setActivePlayers(interpolatedPlayers);
                    if (this.uiManager) {
                        this.uiManager.renderPlayersOnPitch();
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        onComplete();
                    }
                };
                
                requestAnimationFrame(animate);
            };
            
            const nextStep = () => {
                if (!this.isPlaying || i >= this.frames.length - 1) {
                    this.isPlaying = false;
                    if (this.playBtn) {
                        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }
                    resolve();
                    return;
                }
                
                const currentFrame = this.frames[i];
                const nextFrame = this.frames[i + 1];
                
                this.currentFrame = i + 1;
                this.updateFrameIndicator();
                
                animateFrameTransition(currentFrame, nextFrame, () => {
                    i++;
                    setTimeout(nextStep, (200 * 1.35) / speed);
                });
            };
            
            nextStep();
        });
    }

    playAnimation() {
        if (this.isPlaying || this.frames.length < 2) return;
        
        // Limpiar líneas antes de animar
        if (this.uiManager && this.uiManager.drawingManager) {
            this.uiManager.drawingManager.lines = [];
            this.uiManager.drawingManager.redrawLines();
        }
        
        // Reproducir audio si está disponible
        if (this.audioManager && this.audioManager.hasRecordedAudio()) {
            this.audioManager.playAudio();
        }
        
        this.isPlaying = true;
        if (this.playBtn) {
            this.playBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }
        
        const speed = this.speedInput ? parseFloat(this.speedInput.value) : 1;
        let i = 0;
        
        const animateFrameTransition = (fromFrame, toFrame, onComplete) => {
            const duration = (600 * 1.75) / speed; // ms, 35% más lento para mejor narración
            const start = performance.now();
            const fromPlayers = fromFrame.players.map(p => ({ ...p }));
            const toPlayers = toFrame.players.map(p => ({ ...p }));
            
            const animate = (currentTime) => {
                if (!this.isPlaying) {
                    onComplete();
                    return;
                }
                
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Interpolar posiciones
                const interpolatedPlayers = fromPlayers.map((fromPlayer, idx) => {
                    const toPlayer = toPlayers[idx];
                    if (!toPlayer) return fromPlayer;
                    
                    return {
                        ...fromPlayer,
                        x: this.lerp(fromPlayer.x, toPlayer.x, progress),
                        y: this.lerp(fromPlayer.y, toPlayer.y, progress)
                    };
                });
                
                // Actualizar posiciones en pantalla
                this.setActivePlayers(interpolatedPlayers);
                if (this.uiManager) {
                    this.uiManager.renderPlayersOnPitch();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    onComplete();
                }
            };
            
            requestAnimationFrame(animate);
        };
        
        const nextStep = () => {
            if (!this.isPlaying || i >= this.frames.length - 1) {
                this.stopAnimation();
                return;
            }
            
            const currentFrame = this.frames[i];
            const nextFrame = this.frames[i + 1];
            
            this.currentFrame = i + 1;
            this.updateFrameIndicator();
            
            animateFrameTransition(currentFrame, nextFrame, () => {
                i++;
                setTimeout(nextStep, (200 * 1.35) / speed); // Pausa entre frames, 35% más lenta
            });
        };
        
        nextStep();
    }
    
    stopAnimation() {
        this.isPlaying = false;
        if (this.playBtn) {
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // Parar audio si se está reproduciendo
        if (this.audioManager && this.audioManager.isPlaying) {
            this.audioManager.stopAudio();
        }
        
        // Sugerir grabación de audio al finalizar una animación (si no hay audio)
        if (this.frames.length >= 3 && this.audioManager && !this.audioManager.hasRecordedAudio()) {
            this.suggestAudioRecording();
        }
        
    }
    
    // Método para verificar si se debe sugerir grabación de audio
    checkForAudioRecordingSuggestion() {
        // Sugerir audio cuando se tienen 3 o más frames y no hay audio grabado
        if (this.frames.length >= 3 && this.audioManager && !this.audioManager.hasRecordedAudio()) {
            // Mostrar sugerencia solo una vez por sesión
            if (!this.audioSuggestionShown) {
                this.audioSuggestionShown = true;
                setTimeout(() => {
                    this.showAudioRecordingTip();
                }, 1000); // Pequeño delay para no interrumpir el flujo
            }
        }
    }
    
    // Método para sugerir grabación de audio después de la animación
    suggestAudioRecording() {
        if (!this.audioSuggestionAfterPlay) {
            this.audioSuggestionAfterPlay = true;
            setTimeout(() => {
                this.showAudioRecordingSuggestion();
            }, 500);
        }
    }
    
    // Ya no se necesita - la grabación de audio se controla desde el modal
    showAudioRecordingTip() {
        // Método mantenido por compatibilidad pero no se usa
    }
    
    // Mostrar sugerencia más prominente después de reproducir
    showAudioRecordingSuggestion() {
        if (!this.audioManager) return;
        
        // Crear notificación no intrusiva
        const notification = document.createElement('div');
        notification.className = 'audio-suggestion-toast';
        notification.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">🎤</div>
                <div class="toast-text">
                    <strong>¡Excelente animación!</strong><br>
                    <small>¿Te gustaría agregar una narración de audio para explicar la táctica?</small>
                </div>
                <div class="toast-actions">
                    <button class="toast-btn toast-btn-primary" onclick="this.parentElement.parentElement.parentElement.querySelector('.audio-record-action').click()">
                        Grabar Audio
                    </button>
                    <button class="toast-btn toast-btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Ahora no
                    </button>
                </div>
            </div>
            <button class="audio-record-action" style="display: none;" id="temp-audio-record-trigger"></button>
        `;
        
        // Agregar estilos para la notificación
        if (!document.getElementById('audio-suggestion-styles')) {
            const style = document.createElement('style');
            style.id = 'audio-suggestion-styles';
            style.textContent = `
                .audio-suggestion-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    border: 1px solid rgba(23, 162, 184, 0.5);
                    border-radius: 12px;
                    padding: 16px;
                    max-width: 320px;
                    z-index: 9999;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                    animation: slideInRight 0.3s ease-out;
                    color: white;
                }
                
                .toast-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .toast-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                
                .toast-text {
                    flex: 1;
                    margin-bottom: 12px;
                }
                
                .toast-text strong {
                    color: #17a2b8;
                }
                
                .toast-text small {
                    color: #b8b8b8;
                    font-size: 12px;
                }
                
                .toast-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                
                .toast-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .toast-btn-primary {
                    background: linear-gradient(135deg, #17a2b8, #28a745);
                    color: white;
                }
                
                .toast-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
                }
                
                .toast-btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #b8b8b8;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .toast-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(23, 162, 184, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(23, 162, 184, 0); }
                }
            `;
            
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Configurar acción del botón de grabar
        const recordTrigger = notification.querySelector('#temp-audio-record-trigger');
        recordTrigger.addEventListener('click', () => {
            notification.remove();
            // Activar grabación de audio
            if (this.audioManager && this.audioManager.recordButton) {
                this.audioManager.recordButton.click();
            }
        });
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    // Métodos para import/export
    exportAnimationData() {
        const activePlayers = this.getActivePlayers();
        
        // Obtener IDs de jugadores activos (excluyendo el balón)
        const selectedPlayerIds = activePlayers
            .filter(p => !p.isBall && p.type !== 'ball' && p.role !== 'ball' && p.id !== 'ball')
            .map(p => p.id);
        
        const exportData = {
            version: '2.0',
            type: 'animation',
            created: new Date().toISOString(),
            frames: this.frames,
            selectedPlayers: selectedPlayerIds,
            currentFrame: this.currentFrame,
            metadata: {
                totalFrames: this.frames.length,
                duration: this.frames.length * 1.08, // estimado en segundos (35% más lento que antes)
                hasAudio: this.audioManager ? this.audioManager.hasRecordedAudio() : false
            }
        };
        
        // Incluir audio solo para exportación JSON (no para URLs)
        if (this.audioManager && this.audioManager.hasRecordedAudio()) {
            exportData.audio = this.audioManager.getAudioDataForExport();
        }
        
        return exportData;
    }
    
    importAnimationData(data, clearLines = true) {
        if (!data || !data.frames || !Array.isArray(data.frames)) {
            console.error('[AnimationManager] Datos de animación inválidos');
            return false;
        }
        
        try {
            // Limpiar líneas si se especifica
            if (clearLines && this.uiManager && this.uiManager.drawingManager) {
                this.uiManager.drawingManager.clearCanvas();
            }
            
            // Importar frames
            this.frames = data.frames;
            this.currentFrame = data.currentFrame || 0;
            
            // Asegurar que el frame current esté en rango válido
            if (this.currentFrame >= this.frames.length) {
                this.currentFrame = this.frames.length - 1;
            }
            
            // Aplicar el frame current
            if (this.frames.length > 0) {
                this.setStateFromFrame(this.frames[this.currentFrame]);
            }
            
            this.updateFrameIndicator();
            
            // Cargar audio si está disponible
            if (data.audio && this.audioManager) {
                this.audioManager.loadAudioFromData(data.audio);
            }
            
            return true;
            
        } catch (error) {
            console.error('[AnimationManager] Error al importar animación:', error);
            return false;
        }
    }
    
    // Resetear animación
    resetAnimation() {
        this.frames = [this.getCurrentState()];
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isRecordMode = false;
        
        // Limpiar audio también
        if (this.audioManager) {
            this.audioManager.clearAudio();
        }
        
        // Reset de flags de sugerencias
        this.audioSuggestionShown = false;
        this.audioSuggestionAfterPlay = false;
        
        if (this.recordBtn) {
            this.recordBtn.classList.remove('active');
            this.recordBtn.style.backgroundColor = '';
            this.recordBtn.style.color = '';
            this.recordBtn.innerHTML = '<i class="fas fa-dot-circle"></i> Grabar';
        }
        
        if (this.playBtn) {
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        this.updateFrameIndicator();
        
        // Redrawear la escena para reflejar los cambios
        if (this.drawingManager) {
            this.drawingManager.redraw();
        }
        
    }
    
    // Getters para otros módulos
    getIsPlaying() {
        return this.isPlaying;
    }
    
    getIsRecordMode() {
        return this.isRecordMode;
    }
    
    getFrameCount() {
        return this.frames.length;
    }
    
    // ============ FLUJO: GUARDAR SECUENCIA + AUDIO OPCIONAL + GRABACIÓN DE VIDEO ============

    // Paso 1: Iniciar flujo (guarda frames y pregunta por audio)
    async startVideoRecordingFlow() {
        console.log('[AnimationManager] startVideoRecordingFlow() iniciado');
        
        if (this.frames.length < 2) {
            alert('❌ Necesitas al menos 2 frames para grabar un video');
            return;
        }

        try {
            // PASO 1: Guardar la secuencia de frames
            console.log('[AnimationManager] Guardando secuencia de frames...');
            this.savedAnimationData = this.exportAnimationData();
            console.log('[AnimationManager] Secuencia guardada');
            
            // PASO 2: Preguntar si desea agregar audio
            console.log('[AnimationManager] Mostrando modal para pregunta de audio...');
            await this.showAudioModal(false);
            console.log('[AnimationManager] startVideoRecordingFlow() completado');

        } catch (error) {
            console.error('[AnimationManager] Error en startVideoRecordingFlow:', error);
            alert('❌ Error: ' + error.message);
        }
    }

    // Paso 3: Cuando el usuario hace clic en "Descargar" - AHORA se graba el video
    async recordVideoAndDownload(audioBlob = null) {
        console.log('[AnimationManager] recordVideoAndDownload() iniciado');
        
        try {
            // Obtener el contenedor del campo para capturar
            const pitchContainer = document.getElementById('pitch-container');
            if (!pitchContainer) {
                throw new Error('No se encontró el contenedor del campo');
            }

            console.log('[AnimationManager] Iniciando captura de pantalla...');
            
            // Configurar captura de pantalla del campo
            let stream = await this.captureApplicationScreen(pitchContainer);
            
            console.log('[AnimationManager] Stream obtenido:', stream.getTracks().length, 'tracks');
            
            // SI TIENE AUDIO, agregarlo al stream ANTES de grabar
            if (audioBlob) {
                console.log('[AnimationManager] Agregando audio al stream...');
                stream = await this.addAudioToStream(stream, audioBlob);
                console.log('[AnimationManager] Audio agregado al stream');
            }
            
            // MOSTRAR INDICADOR MINIMALISTA EN ESQUINA (no modal que interfiera)
            this.showMinimalExportIndicator();
            
            // Configurar MediaRecorder CON el stream que ya tiene audio
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 3000000
            });

            console.log('[AnimationManager] MediaRecorder configurado');

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                console.log('[AnimationManager] ondataavailable -', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            // Cuando termine la grabación del VIDEO
            mediaRecorder.onstop = async () => {
                console.log('[AnimationManager] onstop evento disparado');
                const videoBlob = new Blob(chunks, { type: 'video/webm' });
                console.log('[AnimationManager] Video blob creado, tamaño:', videoBlob.size, 'bytes');
                this.hideMinimalExportIndicator();
                
                try {
                    console.log('[AnimationManager] Descargando video');
                    this.downloadVideo(videoBlob, 'webm');
                    
                    // Limpiar
                    if (this.recordingAudioContext) {
                        this.recordingAudioContext.close();
                        this.recordingAudioContext = null;
                    }
                    this.scheduledAudioSource = null;
                    
                } catch (error) {
                    console.error('[AnimationManager] Error al descargar:', error);
                    alert('❌ Error: ' + error.message);
                }
            };

            // Iniciar grabación
            console.log('[AnimationManager] Iniciando mediaRecorder.start()');
            mediaRecorder.start();

            // ESPERAR UN POCO para que el MediaRecorder esté listo
            await this.sleep(100);

            console.log('[AnimationManager] Reproduciendo animación para grabación...');
            
            // Reproducir la animación REAL de la aplicación mientras se graba
            await this.playAnimationForRecording();

            console.log('[AnimationManager] Llamando a mediaRecorder.stop()');
            
            // Detener grabación
            mediaRecorder.stop();

        } catch (error) {
            console.error('[AnimationManager] Error en recordVideoAndDownload:', error);
            this.hideMinimalExportIndicator();
            alert('❌ Error: ' + error.message);
        }
    }

    // Capturar frame actual al canvas del video
    captureFrameToCanvas(ctx, canvas, frame) {
        // Limpiar canvas
        ctx.fillStyle = '#1a5f3f'; // Color verde del campo
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar campo de fútbol
        this.drawSoccerField(ctx, canvas);

        // Dibujar jugadores
        if (frame && frame.players) {
            frame.players.forEach(player => {
                this.drawPlayerOnCanvas(ctx, canvas, player);
            });
        }

        // Dibujar información del frame
        this.drawFrameInfo(ctx, canvas);

        // Dibujar marca de agua
        this.drawWatermark(ctx, canvas);
    }

    // Dibujar campo de fútbol en el canvas
    drawSoccerField(ctx, canvas) {
        const width = canvas.width;
        const height = canvas.height;
        const fieldMargin = 50;
        const fieldWidth = width - (fieldMargin * 2);
        const fieldHeight = height - (fieldMargin * 2);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;

        // Campo principal
        ctx.strokeRect(fieldMargin, fieldMargin, fieldWidth, fieldHeight);

        // Línea central
        ctx.beginPath();
        ctx.moveTo(width / 2, fieldMargin);
        ctx.lineTo(width / 2, height - fieldMargin);
        ctx.stroke();

        // Círculo central
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 60, 0, 2 * Math.PI);
        ctx.stroke();

        // Áreas de penalty
        const penaltyWidth = 120;
        const penaltyHeight = 80;
        
        // Área izquierda
        ctx.strokeRect(fieldMargin, (height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
        
        // Área derecha
        ctx.strokeRect(width - fieldMargin - penaltyWidth, (height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);

        // Porterías
        const goalHeight = 40;
        ctx.strokeRect(fieldMargin - 10, (height - goalHeight) / 2, 10, goalHeight);
        ctx.strokeRect(width - fieldMargin, (height - goalHeight) / 2, 10, goalHeight);
    }

    // Dibujar jugador en el canvas
    drawPlayerOnCanvas(ctx, canvas, player) {
        // Obtener dimensiones reales del campo desde el DOM
        const pitchContainer = document.getElementById('pitch-container');
        const fieldWidth = pitchContainer ? pitchContainer.offsetWidth : 800;
        const fieldHeight = pitchContainer ? pitchContainer.offsetHeight : 600;

        // Escalar posiciones del campo real al canvas del video
        const x = (player.x / fieldWidth) * (canvas.width - 100) + 50;
        const y = (player.y / fieldHeight) * (canvas.height - 100) + 50;

        if (player.isBall) {
            // Dibujar balón
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Sombra del balón
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x + 2, y + 12, 8, 4, 0, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Dibujar jugador
            const teamColor = player.team === 'team1' ? '#ff4444' : '#4444ff';
            
            // Sombra del jugador
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x + 2, y + 20, 12, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Círculo del jugador
            ctx.fillStyle = teamColor;
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, 2 * Math.PI);
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Número del jugador
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(player.number || '?', x, y);

            // Nombre del jugador (opcional)
            if (player.name && player.name !== 'Jugador') {
                ctx.font = '10px Arial';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.strokeText(player.name, x, y + 35);
                ctx.fillText(player.name, x, y + 35);
            }
        }
    }

    // Dibujar información del frame
    drawFrameInfo(ctx, canvas) {
        const currentFrameNum = this.currentFrame + 1;
        const totalFrames = this.frames.length;
        
        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 40);
        
        // Texto del frame
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Frame ${currentFrameNum} / ${totalFrames}`, 20, 35);
    }

    // Dibujar marca de agua
    drawWatermark(ctx, canvas) {
        // Logo/marca principal
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('⚽ Simulador Táctico', canvas.width - 20, canvas.height - 40);
        
        // URL/créditos
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.fillText('Creado con Simulador Táctico', canvas.width - 20, canvas.height - 20);
        
        // Timestamp
        const now = new Date();
        const timestamp = now.toLocaleDateString('es-ES');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(timestamp, 20, canvas.height - 20);
    }

    // Detectar si es dispositivo móvil
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Capturar la pantalla de la aplicación (Desktop y Mobile)
    async captureApplicationScreen(element) {
        const isMobile = this.isMobileDevice();
        return isMobile ? await this.captureCanvasAsStream(element) : await this.captureScreenViaDisplayMedia(element);
    }

    // Captura por getDisplayMedia (Desktop)
    async captureScreenViaDisplayMedia(element) {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: false
            });
            return screenStream;
        } catch (error) {
            throw new Error('Captura de pantalla no disponible en tu navegador');
        }
    }

    // Captura por Canvas (Mobile)
    async captureCanvasAsStream(element) {
        try {
            const canvas = element.querySelector('canvas') || document.getElementById('football-field');
            if (!canvas) throw new Error('Canvas no encontrado');

            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            const ctx = outputCanvas.getContext('2d');
            const canvasStream = outputCanvas.captureStream(30); // 30 FPS

            let animationFrameId = null;
            let isRecording = true;

            const copyCanvasFrame = () => {
                if (isRecording) {
                    try {
                        ctx.drawImage(canvas, 0, 0);
                    } catch (e) {}
                    animationFrameId = requestAnimationFrame(copyCanvasFrame);
                }
            };

            this.canvasCopyFrameId = animationFrameId;
            this.isCanvasCopyingActive = true;
            this.canvasStream = canvasStream;
            copyCanvasFrame();

            canvasStream.getTracks().forEach(track => {
                track.onended = () => {
                    isRecording = false;
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    this.isCanvasCopyingActive = false;
                };
            });

            return canvasStream;
        } catch (error) {
            throw new Error('No se puede capturar el canvas: ' + error.message);
        }
    }

    // Agregar audio al stream de video
    async addAudioToStream(videoStream, audioBlob = null) {
        try {
            // Usar el audioBlob pasado o el del audioManager
            const blob = audioBlob || (this.audioManager && this.audioManager.recordedAudioBlob);
            
            if (!blob) {
                console.log('[AnimationManager] No hay audio para combinar');
                return videoStream;
            }

            console.log('[AnimationManager] Preparando audio para agregar al stream...');

            // Crear un AudioContext que persista durante toda la grabación
            if (!this.recordingAudioContext) {
                this.recordingAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const audioContext = this.recordingAudioContext;
            
            // Si el contexto está suspendido, reanudarlo
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const audioArrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
            
            console.log('[AnimationManager] Audio decodificado - Duración:', audioBuffer.duration, 'segundos');

            // Crear el source del audio
            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;

            // Crear el destino del stream de media
            const audioDestination = audioContext.createMediaStreamDestination();
            audioSource.connect(audioDestination);

            // Crear el stream combinado: video + audio
            const videoTracks = videoStream.getVideoTracks();
            const audioTracks = audioDestination.stream.getAudioTracks();

            console.log('[AnimationManager] Video tracks:', videoTracks.length, 'Audio tracks:', audioTracks.length);

            const combinedStream = new MediaStream([
                ...videoTracks,
                ...audioTracks
            ]);

            console.log('[AnimationManager] Stream combinado creado. Tracks totales:', combinedStream.getTracks().length);

            // Guardar la source de audio para iniciar después
            this.scheduledAudioSource = audioSource;
            this.recordingAudioContext = audioContext;
            
            return combinedStream;

        } catch (error) {
            console.error('[AnimationManager] Error al agregar audio:', error);
            return videoStream;
        }
    }

    // Reproducir animación especificamente para grabación
    async playAnimationForRecording() {
        console.log('[AnimationManager] playAnimationForRecording() iniciado');
        this.isRecordingVideo = true;
        this.currentFrame = 0;
        this.setStateFromFrame(this.frames[0]);
        this.updateFrameIndicator();
        
        // Esperar a que el MediaRecorder esté listo
        await this.sleep(500);
        
        // Iniciar el audio AHORA
        if (this.scheduledAudioSource) {
            console.log('[AnimationManager] Iniciando audio source en time:', this.recordingAudioContext?.currentTime);
            try {
                this.scheduledAudioSource.start(0);
                console.log('[AnimationManager] Audio source iniciado correctamente');
            } catch (error) {
                console.error('[AnimationManager] Error al iniciar audio source:', error);
            }
        } else {
            console.log('[AnimationManager] No hay audio source disponible');
        }

        // Ahora reproducir la animación
        console.log('[AnimationManager] Iniciando reproducción sincronizada...');
        await this.playAnimationSynchronously();
        console.log('[AnimationManager] Reproducción terminada');
        
        await this.sleep(1000);
        
        this.isRecordingVideo = false;
        console.log('[AnimationManager] playAnimationForRecording() completado');
    }

    // Versión síncrona de playAnimation para grabación
    async playAnimationSynchronously() {
        const speed = this.speedInput ? parseFloat(this.speedInput.value) : 1;
        
        for (let i = 0; i < this.frames.length - 1; i++) {
            const fromFrame = this.frames[i];
            const toFrame = this.frames[i + 1];
            
            await this.animateFrameTransitionSync(fromFrame, toFrame, speed);
            await this.sleep((200 * 1.75) / speed);
        }
    }

    // Transición de frame síncrona
    async animateFrameTransitionSync(fromFrame, toFrame, speed) {
        const duration = (600 * 1.75) / speed;
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const interpolatedPlayers = fromFrame.players.map((fromPlayer, idx) => {
                    const toPlayer = toFrame.players[idx];
                    if (!toPlayer) return fromPlayer;
                    
                    return {
                        ...fromPlayer,
                        x: this.lerp(fromPlayer.x, toPlayer.x, progress),
                        y: this.lerp(fromPlayer.y, toPlayer.y, progress)
                    };
                });
                
                this.setActivePlayers(interpolatedPlayers);
                if (this.uiManager) {
                    this.uiManager.renderPlayersOnPitch();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // ============ MODALES Y FLUJO DE AUDIO ============

    // Modal unificado: pregunta si agregar audio O muestra opciones con audio grabado
    showAudioModal(hasAudio = false) {
        return new Promise((resolve) => {
            console.log('[AnimationManager] showAudioModal() iniciado - hasAudio:', hasAudio);
            
            // Crear modal
            const modal = document.createElement('div');
            modal.id = 'audio-control-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px 40px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                text-align: center;
                min-width: 400px;
                border: 2px solid rgba(255, 255, 255, 0.2);
            `;

            let modalContent = '';
            
            if (!hasAudio) {
                // SIN AUDIO: Pregunta si desea agregar
                modalContent = `
                    <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">🎙️ ¿Deseas agregar audio/narración?</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 0 0 25px 0;">Se reproducirá la secuencia para que puedas narrar la jugada</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="btn-add-audio-yes" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 10px 30px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            transition: all 0.3s ease;
                        ">Sí, agregar audio</button>
                        <button id="btn-add-audio-no" style="
                            background: #f44336;
                            color: white;
                            border: none;
                            padding: 10px 30px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            transition: all 0.3s ease;
                        ">No, descargar sin audio</button>
                    </div>
                `;
            } else {
                // CON AUDIO: Muestra opciones de control
                modalContent = `
                    <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">🎵 Audio grabado</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 0 0 25px 0;">¿Qué deseas hacer?</p>
                    <div style="margin-bottom: 15px;">
                        <button id="btn-play-audio" style="
                            background: #2196F3;
                            color: white;
                            border: none;
                            padding: 10px 25px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            width: 100%;
                            transition: all 0.3s ease;
                        ">▶️ Reproducir audio</button>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="btn-re-record" style="
                            background: #FF9800;
                            color: white;
                            border: none;
                            padding: 10px 25px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            transition: all 0.3s ease;
                        ">🔄 Volver a grabar</button>
                        <button id="btn-download-with-audio" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 10px 25px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            transition: all 0.3s ease;
                        ">⬇️ Descargar</button>
                    </div>
                `;
            }

            modal.innerHTML = modalContent;

            console.log('[AnimationManager] Modal HTML creado');
            document.body.appendChild(modal);
            console.log('[AnimationManager] Modal agregado al DOM');

            if (!hasAudio) {
                // BOTONES SIN AUDIO
                document.getElementById('btn-add-audio-yes').addEventListener('click', async () => {
                    console.log('[AnimationManager] Usuario eligió: SÍ agregar audio');
                    modal.remove();
                    await this.startAudioRecordingFlow();
                    resolve();
                });

                document.getElementById('btn-add-audio-no').addEventListener('click', async () => {
                    console.log('[AnimationManager] Usuario eligió: NO, descargar sin audio');
                    modal.remove();
                    // AHORA grabar video sin audio
                    await this.recordVideoAndDownload(null);
                    resolve();
                });
            } else {
                // BOTONES CON AUDIO
                document.getElementById('btn-play-audio').addEventListener('click', () => {
                    console.log('[AnimationManager] Usuario eligió: Reproducir audio');
                    if (this.audioManager && this.audioManager.recordedAudioBlob) {
                        const audioURL = URL.createObjectURL(this.audioManager.recordedAudioBlob);
                        const audio = new Audio(audioURL);
                        audio.play();
                    }
                });

                document.getElementById('btn-re-record').addEventListener('click', async () => {
                    console.log('[AnimationManager] Usuario eligió: Volver a grabar');
                    modal.remove();
                    // Limpiar audio anterior
                    if (this.audioManager) {
                        this.audioManager.recordedAudioBlob = null;
                    }
                    // Reiniciar el flujo de audio
                    await this.startAudioRecordingFlow();
                    resolve();
                });

                document.getElementById('btn-download-with-audio').addEventListener('click', async () => {
                    console.log('[AnimationManager] Usuario eligió: Descargar con audio');
                    modal.remove();
                    // AHORA grabar video y combinarlo con audio
                    await this.recordVideoAndDownload(this.audioManager?.recordedAudioBlob);
                    resolve();
                });
            }
            
            console.log('[AnimationManager] Event listeners agregados');
        });
    }

    // Flujo de grabación de audio
    async startAudioRecordingFlow() {
        console.log('[AnimationManager] startAudioRecordingFlow() iniciado');
        
        // Mostrar countdown 3, 2, 1
        await this.showCountdown();

        // Reproducir la secuencia (mientras se graba audio)
        console.log('[AnimationManager] Iniciando reproducción para narración...');
        
        // INMEDIATAMENTE DESPUÉS del countdown, iniciar grabación de audio
        if (this.audioManager) {
            await this.audioManager.startRecording();
            console.log('[AnimationManager] Grabación de audio iniciada');
        }

        // Reproducir animación usando playAnimationAsync() que espera completamente
        console.log('[AnimationManager] Reproduciendo animación...');
        await this.playAnimationAsync();

        // Esperar 1 segundo después de que termina la animación
        console.log('[AnimationManager] Esperando 1 segundo para asegurar audio completo...');
        await this.sleep(1000);

        // DESPUÉS de esperar, detener grabación de audio
        if (this.audioManager) {
            this.audioManager.stopRecording();
            console.log('[AnimationManager] Grabación de audio detenida');
        }

        // Mostrar modal para revisar/re-grabar audio (CON AUDIO ya grabado)
        console.log('[AnimationManager] Mostrando modal con opciones de audio...');
        await this.showAudioModal(true);
        console.log('[AnimationManager] startAudioRecordingFlow() completado');
    }

    // Mostrar countdown 3, 2, 1
    showCountdown() {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            container.id = 'countdown-container';
            container.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                text-align: center;
            `;

            const number = document.createElement('div');
            number.style.cssText = `
                font-size: 150px;
                font-weight: bold;
                color: white;
                text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(76, 175, 80, 0.6);
                font-family: 'Arial', sans-serif;
                letter-spacing: 20px;
                animation: pulse 1s ease-in-out;
            `;

            container.appendChild(number);
            document.body.appendChild(container);

            // Agregar estilos de animación
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            const countdownNumbers = [3, 2, 1];
            let index = 0;

            const showNumber = () => {
                if (index < countdownNumbers.length) {
                    number.textContent = countdownNumbers[index];
                    index++;
                    setTimeout(showNumber, 1000);
                } else {
                    // El número 1 desaparece
                    number.style.opacity = '0';
                    setTimeout(() => {
                        container.remove();
                        style.remove();
                        resolve();
                    }, 500);
                }
            };

            showNumber();
        });
    }


    // Combinar video y audio usando FFmpeg.wasm
    async combineVideoAndAudioWithFFmpeg(videoBlob, audioBlob) {
        try {
            if (!videoBlob) {
                throw new Error('No hay video para combinar');
            }

            // Si no hay audio, devolver solo el video
            if (!audioBlob) {
                console.log('[AnimationManager] Sin audio, devolviendo video sin cambios');
                return videoBlob;
            }

            console.log('[AnimationManager] Cargando FFmpeg...');

            // Verificar que FFmpeg esté disponible
            if (!window.FFmpeg || !window.FFmpeg.FFmpeg) {
                console.warn('[AnimationManager] FFmpeg no disponible, descargando video sin audio');
                alert('⚠️ No se pudo cargar FFmpeg. Se descargará el video sin audio.\n\nPuedes combinarlos manualmente con herramientas como VLC o HandBrake.');
                return videoBlob;
            }

            const { FFmpeg, toBlobURL } = window.FFmpeg;
            const ffmpeg = new FFmpeg.FFmpeg();

            // Cargar los binarios de FFmpeg
            const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
            ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message));

            if (!ffmpeg.loaded) {
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
                });
            }

            console.log('[AnimationManager] FFmpeg cargado');

            // Convertir blobs a Uint8Array
            const videoData = new Uint8Array(await videoBlob.arrayBuffer());
            const audioData = new Uint8Array(await audioBlob.arrayBuffer());

            // Escribir archivos en el sistema de archivos virtual de FFmpeg
            ffmpeg.FS('writeFile', 'video.webm', videoData);
            ffmpeg.FS('writeFile', 'audio.webm', audioData);

            console.log('[AnimationManager] Ejecutando FFmpeg para combinar...');

            // Ejecutar FFmpeg para combinar
            await ffmpeg.run(
                '-i', 'video.webm',
                '-i', 'audio.webm',
                '-c:v', 'copy',     // Copiar video sin re-encodear
                '-c:a', 'aac',      // Audio codec
                '-map', '0:v:0',    // Usar pista de video del primer archivo
                '-map', '1:a:0',    // Usar pista de audio del segundo archivo
                '-y',               // Overwrite output file
                'output.webm'
            );

            console.log('[AnimationManager] Leyendo archivo combinado...');

            // Leer el archivo resultante
            const outputData = ffmpeg.FS('readFile', 'output.webm');
            const outputBlob = new Blob([outputData], { type: 'video/webm' });

            // Limpiar archivos
            ffmpeg.FS('unlink', 'video.webm');
            ffmpeg.FS('unlink', 'audio.webm');
            ffmpeg.FS('unlink', 'output.webm');

            console.log('[AnimationManager] Video y audio combinados exitosamente');
            return outputBlob;

        } catch (error) {
            console.error('[AnimationManager] Error en FFmpeg:', error);
            throw new Error(`Error al combinar: ${error.message}`);
        }
    }


    downloadVideo(blob, extension) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `animacion-tactica-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setTimeout(() => {
            alert(`✅ Video exportado exitosamente como ${extension.toUpperCase()}`);
        }, 500);
    }

    // INDICADOR MINIMALISTA (esquina, NO interfiere)
    showMinimalExportIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'minimal-export-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #17a2b8;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 5000;
            font-size: 12px;
            font-weight: bold;
            pointer-events: none;
        `;
        indicator.innerHTML = '📹 Grabando...';
        document.body.appendChild(indicator);
    }

    hideMinimalExportIndicator() {
        const indicator = document.getElementById('minimal-export-indicator');
        if (indicator) indicator.remove();
    }

    // Utilidad para pausas
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
