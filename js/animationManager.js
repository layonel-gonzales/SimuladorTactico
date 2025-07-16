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
        
        console.log('AnimationManager: Inicializado correctamente');
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
        this.btnReset = document.getElementById('reset-animation');
    }
    
    setupEventListeners() {
        // Botón de grabación
        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => this.toggleRecordMode());
        }
        
        // Controles de frames
        if (this.btnPrev) {
            this.btnPrev.addEventListener('click', () => this.gotoFrame(this.currentFrame - 1));
        }
        if (this.btnNext) {
            this.btnNext.addEventListener('click', () => this.gotoFrame(this.currentFrame + 1));
        }
        if (this.btnAdd) {
            this.btnAdd.addEventListener('click', () => this.addFrame());
        }
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => this.resetAnimation());
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
        
        // Si se desactiva el modo grabación y se tienen frames, sugerir audio
        if (!this.isRecordMode && this.frames.length >= 3) {
            this.checkForAudioRecordingSuggestion();
        }
        
        console.log(`[AnimationManager] Modo grabación: ${this.isRecordMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
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
        
        console.log(`[AnimationManager] Frame ${this.frames.length} guardado automáticamente`);
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
        if (!frame || !frame.players) return;
        
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
        }
    }
    
    updateFrameIndicator() {
        if (this.frameIndicator) {
            this.frameIndicator.textContent = `${this.currentFrame + 1}/${this.frames.length}`;
        }
    }
    
    saveCurrentFrame() {
        if (this.frames[this.currentFrame]) {
            this.frames[this.currentFrame] = this.getCurrentState();
        }
    }
    
    addFrame() {
        this.saveCurrentFrame();
        this.frames.splice(this.currentFrame + 1);
        this.frames.push(this.getCurrentState());
        this.currentFrame = this.frames.length - 1;
        this.setStateFromFrame(this.frames[this.currentFrame]);
        this.updateFrameIndicator();
        
        // Sugerir grabación de audio cuando se tienen suficientes frames
        this.checkForAudioRecordingSuggestion();
    }
    
    gotoFrame(idx) {
        if (idx < 0 || idx >= this.frames.length) return;
        
        this.saveCurrentFrame();
        this.currentFrame = idx;
        this.setStateFromFrame(this.frames[this.currentFrame]);
        this.updateFrameIndicator();
    }
    
    // Función de interpolación lineal
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Obtener posición del balón del frame
    getBallPosFromFrame(frame) {
        if (frame.ball && typeof frame.ball.x === 'number' && typeof frame.ball.y === 'number') {
            return { x: frame.ball.x, y: frame.ball.y };
        }
        
        if (frame.players && frame.players.length > 0) {
            const ballPlayer = frame.players.find(p => p.isBall);
            if (ballPlayer) return { x: ballPlayer.x, y: ballPlayer.y };
        }
        
        return null;
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
        
        console.log('[AnimationManager] Animación detenida');
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
    
    // Mostrar tip discreto sobre grabación de audio
    showAudioRecordingTip() {
        if (!this.audioManager) return;
        
        const audioBtn = document.getElementById('audio-record-btn');
        if (audioBtn) {
            // Efecto visual discreto en el botón de audio
            audioBtn.style.animation = 'pulse 2s infinite';
            audioBtn.title = '💡 Tip: ¡Graba audio para explicar tu táctica!';
            
            // Quitar el efecto después de unos segundos
            setTimeout(() => {
                audioBtn.style.animation = '';
                audioBtn.title = 'Grabar audio';
            }, 6000);
            
            console.log('[AnimationManager] 💡 Tip: Se puede grabar audio para explicar la animación');
        }
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
        
        console.log('[AnimationManager] Exportando con jugadores:', selectedPlayerIds);
        
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
            console.log('[AnimationManager] Audio incluido en exportación');
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
            
            // Asegurar que el frame actual esté en rango válido
            if (this.currentFrame >= this.frames.length) {
                this.currentFrame = this.frames.length - 1;
            }
            
            // Aplicar el frame actual
            if (this.frames.length > 0) {
                this.setStateFromFrame(this.frames[this.currentFrame]);
            }
            
            this.updateFrameIndicator();
            
            // Cargar audio si está disponible
            if (data.audio && this.audioManager) {
                this.audioManager.loadAudioFromData(data.audio);
                console.log('[AnimationManager] Audio cargado desde importación');
            }
            
            console.log(`[AnimationManager] Animación importada: ${this.frames.length} frames`);
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
        
        console.log('[AnimationManager] Animación reseteada, manteniéndose en modo animación');
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
    
    getCurrentFrameIndex() {
        return this.currentFrame;
    }
}
