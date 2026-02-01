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
    
    getCurrentFrameIndex() {
        return this.currentFrame;
    }
    
    // Nuevo método para exportar a video MP4 - CAPTURA REAL DE LA ANIMACIÓN
    async exportToVideo() {
        if (this.frames.length < 2) {
            alert('❌ Necesitas al menos 2 frames para crear un video');
            return;
        }

        // Mostrar modal de progreso
        this.showVideoExportProgress();

        try {
            // Obtener el contenedor del campo para capturar
            const pitchContainer = document.getElementById('pitch-container');
            if (!pitchContainer) {
                throw new Error('No se encontró el contenedor del campo');
            }

            // Configurar captura de pantalla del campo
            const stream = await this.captureApplicationScreen(pitchContainer);
            
            // Si hay audio grabado, combinarlo
            let finalStream = stream;
            if (this.audioManager && this.audioManager.hasRecordedAudio()) {
                finalStream = await this.addAudioToStream(stream);
            }
            
            // Configurar MediaRecorder
            const mediaRecorder = new MediaRecorder(finalStream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 3000000 // 3 Mbps para alta calidad
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            // Cuando termine la grabación
            mediaRecorder.onstop = async () => {
                const webmBlob = new Blob(chunks, { type: 'video/webm' });
                this.downloadVideo(webmBlob, 'webm');
                this.hideVideoExportProgress();
            };

            // Iniciar grabación
            mediaRecorder.start();

            // Reproducir la animación REAL de la aplicación mientras se graba
            await this.playAnimationForRecording();

            // Detener grabación
            setTimeout(() => {
                mediaRecorder.stop();
            }, 1000); // Pequeña pausa al final

        } catch (error) {
            console.error('[AnimationManager] Error al exportar video:', error);
            
            // Mensaje de error más específico
            let errorMessage = '❌ Error al crear el video.\n\n';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += '🚫 Permisos de captura denegados.\n\n💡 Solución:\n• Permite compartir pantalla\n• Selecciona esta pestaña en el selector';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += '⚠️ Tu navegador no soporta captura de pantalla.\n\n💡 Alternativas:\n• Usa Chrome, Firefox o Edge\n• Actualiza tu navegador\n• Usa grabación de pantalla externa';
            } else {
                errorMessage += '🔧 Error técnico.\n\n💡 Intenta:\n• Recargar la página\n• Usar otro navegador\n• Verificar conexión a internet';
            }
            
            alert(errorMessage);
            this.hideVideoExportProgress();
        }
    }

    // Capturar la pantalla de la aplicación
    async captureApplicationScreen(element) {
        try {
            // Usar getDisplayMedia para capturar pantalla
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: false // Audio lo manejaremos por separado
            });

            return screenStream;

        } catch (error) {
            console.warn('[AnimationManager] getDisplayMedia no disponible, usando alternativa');
            
            // Alternativa: capturar usando canvas del elemento
            return this.captureElementAsStream(element);
        }
    }

    // Alternativa: capturar elemento específico
    async captureElementAsStream(element) {
        // Crear canvas del tamaño del elemento
        const canvas = document.createElement('canvas');
        const rect = element.getBoundingClientRect();
        canvas.width = rect.width * 2; // 2x para mejor calidad
        canvas.height = rect.height * 2;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2); // Escalar para mejor calidad
        
        // Función para capturar el elemento en el canvas
        const captureFrame = () => {
            // Usar html2canvas para capturar el elemento
            if (window.html2canvas) {
                window.html2canvas(element, {
                    canvas: canvas,
                    backgroundColor: null,
                    scale: 2,
                    logging: false
                });
            } else {
                // Fallback: dibujar fondo del campo
                ctx.fillStyle = '#1a5f3f';
                ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
            }
        };

        // Iniciar captura continua
        const interval = setInterval(captureFrame, 33); // ~30 FPS
        
        // Limpiar interval cuando termine
        setTimeout(() => clearInterval(interval), 30000); // Max 30 segundos
        
        return canvas.captureStream(30);
    }

    // Agregar audio al stream de video
    async addAudioToStream(videoStream) {
        try {
            if (!this.audioManager || !this.audioManager.recordedAudioBlob) {
                return videoStream;
            }

            // Crear contexto de audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Convertir blob de audio a buffer
            const audioArrayBuffer = await this.audioManager.recordedAudioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);

            // Crear fuente de audio
            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;

            // Crear destino para el stream
            const audioDestination = audioContext.createMediaStreamDestination();
            audioSource.connect(audioDestination);

            // Combinar video y audio
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioDestination.stream.getAudioTracks()
            ]);

            // Programar inicio del audio sincronizado
            this.scheduledAudioSource = audioSource;

            return combinedStream;

        } catch (error) {
            console.warn('[AnimationManager] Error al agregar audio:', error);
            return videoStream;
        }
    }

    // Reproducir animación especificamente para grabación
    async playAnimationForRecording() {
        // Preparar para grabación
        this.isRecordingVideo = true;
        
        // Ir al primer frame
        this.currentFrame = 0;
        this.setStateFromFrame(this.frames[0]);
        this.updateFrameIndicator();
        
        // Pequeña pausa inicial
        await this.sleep(1000);
        
        // Iniciar audio si está disponible
        if (this.scheduledAudioSource) {
            this.scheduledAudioSource.start(0);
        }

        // Reproducir la animación normal
        await this.playAnimationSynchronously();
        
        // Pausa final
        await this.sleep(1500);
        
        this.isRecordingVideo = false;
    }

    // Versión síncrona de playAnimation para grabación
    async playAnimationSynchronously() {
        const speed = this.speedInput ? parseFloat(this.speedInput.value) : 1;
        
        for (let i = 0; i < this.frames.length - 1; i++) {
            const fromFrame = this.frames[i];
            const toFrame = this.frames[i + 1];
            
            // Actualizar progreso
            this.updateVideoProgress(((i + 1) / (this.frames.length - 1)) * 90); // 90% max, dejando 10% para finalización
            
            // Animar transición
            await this.animateFrameTransitionSync(fromFrame, toFrame, speed);
            
            // Pausa entre frames
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
                
                // Interpolar jugadores
                const interpolatedPlayers = fromFrame.players.map((fromPlayer, idx) => {
                    const toPlayer = toFrame.players[idx];
                    if (!toPlayer) return fromPlayer;
                    
                    return {
                        ...fromPlayer,
                        x: this.lerp(fromPlayer.x, toPlayer.x, progress),
                        y: this.lerp(fromPlayer.y, toPlayer.y, progress)
                    };
                });
                
                // Actualizar pantalla real
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

    // Crear canvas para el video
    createVideoCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 1280; // HD width
        canvas.height = 720; // HD height
        return canvas;
    }

    // Grabar frames de la animación
    async recordAnimationFrames(ctx, canvas) {
        const speed = this.speedInput ? parseFloat(this.speedInput.value) : 1;
        const frameDuration = (600 * 1.75) / speed; // ms por frame (igual que la animación)
        const pauseDuration = (200 * 1.35) / speed; // pausa entre frames

        // Capturar estado inicial
        await this.captureFrameToCanvas(ctx, canvas, this.frames[0]);
        await this.sleep(500); // Pausa inicial

        // Capturar transiciones entre frames
        for (let i = 0; i < this.frames.length - 1; i++) {
            const fromFrame = this.frames[i];
            const toFrame = this.frames[i + 1];

            // Actualizar progreso
            this.updateVideoProgress(((i + 1) / this.frames.length) * 100);

            // Animar transición
            await this.animateFrameForVideo(ctx, canvas, fromFrame, toFrame, frameDuration);
            
            // Pausa entre frames
            await this.sleep(pauseDuration);
        }

        // Frame final estático
        await this.sleep(1000);
    }

    // Animar transición para video
    async animateFrameForVideo(ctx, canvas, fromFrame, toFrame, duration) {
        const startTime = performance.now();
        const fromPlayers = fromFrame.players.map(p => ({ ...p }));
        const toPlayers = toFrame.players.map(p => ({ ...p }));

        return new Promise((resolve) => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
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

                // Capturar frame interpolado
                this.captureFrameToCanvas(ctx, canvas, { players: interpolatedPlayers });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
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

    // Convertir WebM a MP4 (usando FFmpeg.js o similar)
    async convertToMP4(webmBlob) {
        try {
            // Para una implementación completa, aquí usarías FFmpeg.js
            // Por ahora, descargaremos como WebM (compatible con la mayoría de navegadores modernos)
            this.downloadVideo(webmBlob, 'webm');
            
        } catch (error) {
            console.error('[AnimationManager] Error en conversión:', error);
            this.downloadVideo(webmBlob, 'webm');
        }
    }

    // Descargar video
    downloadVideo(blob, extension) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `animacion-tactica-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Mostrar mensaje de éxito
        const hasAudio = this.audioManager && this.audioManager.hasRecordedAudio();
        const audioText = hasAudio ? '\n🎤 Incluye narración de audio' : '\n🔇 Sin audio (puedes grabarlo antes de exportar)';
        
        setTimeout(() => {
            alert(`✅ Video exportado exitosamente como ${extension.toUpperCase()}${audioText}\n\n📱 Puedes compartirlo en:\n• WhatsApp\n• Instagram\n• Facebook\n• YouTube\n• TikTok\n\n🎬 El video está listo para usar!`);
        }, 500);
    }

    // Mostrar modal de progreso
    showVideoExportProgress() {
        const modal = document.createElement('div');
        modal.id = 'video-export-modal';
        modal.innerHTML = `
            <div class="video-export-overlay">
                <div class="video-export-content">
                    <div class="video-export-header">
                        <h3>🎬 Capturando Video Real</h3>
                        <p>Grabando la animación exacta de la aplicación...</p>
                    </div>
                    <div class="video-export-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="video-progress-fill"></div>
                        </div>
                        <span id="video-progress-text">0%</span>
                    </div>
                    <div class="video-export-instructions">
                        <div class="instruction-step">
                            <strong>📺 Si aparece selector de pantalla:</strong><br>
                            <small>• Selecciona esta ventana/pestaña<br>
                            • Permite compartir pantalla</small>
                        </div>
                        <div class="instruction-step">
                            <strong>⚠️ Durante la grabación:</strong><br>
                            <small>• NO cambies de pestaña<br>
                            • NO minimices la ventana<br>
                            • La animación se reproduce automáticamente</small>
                        </div>
                    </div>
                    <div class="video-export-info">
                        <small>💡 El video final será idéntico a lo que ves en pantalla</small>
                    </div>
                </div>
            </div>
        `;

        // Estilos para el modal
        if (!document.getElementById('video-export-styles')) {
            const style = document.createElement('style');
            style.id = 'video-export-styles';
            style.textContent = `
                .video-export-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .video-export-content {
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    color: white;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                
                .video-export-header h3 {
                    margin: 0 0 10px 0;
                    color: #17a2b8;
                    font-size: 24px;
                }
                
                .video-export-header p {
                    margin: 0 0 20px 0;
                    color: #b8b8b8;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #17a2b8, #28a745);
                    width: 0%;
                    transition: width 0.3s ease;
                    border-radius: 10px;
                }
                
                #video-progress-text {
                    font-weight: bold;
                    color: #17a2b8;
                }
                
                .video-export-instructions {
                    margin: 20px 0;
                    text-align: left;
                }
                
                .instruction-step {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: rgba(23, 162, 184, 0.1);
                    border-left: 3px solid #17a2b8;
                    border-radius: 5px;
                }
                
                .instruction-step strong {
                    color: #17a2b8;
                    display: block;
                    margin-bottom: 5px;
                }
                
                .instruction-step small {
                    color: #d0d0d0;
                    line-height: 1.4;
                }
                
                .video-export-info {
                    margin-top: 20px;
                    color: #888;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    // Actualizar progreso del video
    updateVideoProgress(percentage) {
        const progressFill = document.getElementById('video-progress-fill');
        const progressText = document.getElementById('video-progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    }

    // Ocultar modal de progreso
    hideVideoExportProgress() {
        const modal = document.getElementById('video-export-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Utilidad para pausas
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
