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
            this.recordBtn.style.color = this.isRecordMode ? '#fff' : '';
            this.recordBtn.innerHTML = this.isRecordMode ? 
                '<i class="fas fa-dot-circle"></i> Grabando' : 
                '<i class="fas fa-dot-circle"></i> Grabar';
        }
        
        console.log('[AnimationManager] Modo grabación:', this.isRecordMode);
    }
    
    saveFrame() {
        const activePlayers = this.getActivePlayers();
        this.ensureBallInPlayers(activePlayers);
        
        // Crear copia profunda de jugadores con posiciones actuales
        const playersCopy = activePlayers.map(p => ({
            ...p,
            x: typeof p.x === 'number' ? p.x : (p.isBall ? 50 : undefined),
            y: typeof p.y === 'number' ? p.y : (p.isBall ? 50 : undefined)
        }));
        
        // Obtener posición específica del balón
        let ball = null;
        const ballPlayer = playersCopy.find(p => p.isBall || p.type === 'ball');
        if (ballPlayer && typeof ballPlayer.x === 'number' && typeof ballPlayer.y === 'number') {
            ball = { x: ballPlayer.x, y: ballPlayer.y };
        } else {
            ball = { x: 50, y: 50 }; // Posición por defecto
        }
        
        const newFrame = {
            players: playersCopy,
            ball: ball,
            timestamp: Date.now()
        };
        
        this.frames.push(newFrame);
        console.log('[AnimationManager] Frame guardado:', newFrame);
        this.updateFrameIndicator();
    }
    
    getCurrentState() {
        const activePlayers = this.getActivePlayers();
        this.ensureBallInPlayers(activePlayers);
        
        const playersCopy = activePlayers.map(p => ({ ...p }));
        const ballPlayer = playersCopy.find(p => p.isBall || p.type === 'ball');
        const ball = ballPlayer ? { x: ballPlayer.x, y: ballPlayer.y } : { x: 50, y: 50 };
        
        return {
            players: playersCopy,
            ball: ball,
            timestamp: Date.now()
        };
    }
    
    setStateFromFrame(frame) {
        if (!frame || !frame.players) return;
        
        console.log('[AnimationManager] Cargando frame:', frame);
        
        const activePlayers = this.getActivePlayers();
        
        // Actualizar posiciones de jugadores existentes
        if (frame.players && Array.isArray(frame.players)) {
            frame.players.forEach(framePlayer => {
                const existingPlayer = activePlayers.find(p => p.id === framePlayer.id);
                if (existingPlayer && !existingPlayer.isBall && existingPlayer.type !== 'ball') {
                    existingPlayer.x = framePlayer.x;
                    existingPlayer.y = framePlayer.y;
                    console.log('[AnimationManager] Posición actualizada para jugador', framePlayer.id, 
                              { x: framePlayer.x, y: framePlayer.y });
                }
            });
        }
        
        // Actualizar posición del balón
        if (frame.ball && typeof frame.ball.x === 'number' && typeof frame.ball.y === 'number') {
            const ballInPlayers = activePlayers.find(p => 
                p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'
            );
            if (ballInPlayers) {
                ballInPlayers.x = frame.ball.x;
                ballInPlayers.y = frame.ball.y;
                console.log('[AnimationManager] Posición del balón actualizada:', 
                          { x: frame.ball.x, y: frame.ball.y });
            }
        }
        
        // Asegurar que el balón esté presente
        this.ensureBallInPlayers(activePlayers);
        
        // Renderizar en la cancha
        if (this.uiManager && this.uiManager.renderPlayersOnPitch) {
            this.uiManager.renderPlayersOnPitch();
        }
        
        console.log('[AnimationManager] Estado actualizado desde frame');
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
        
        // Limpiar líneas antes de animar (solo movimiento de jugadores y balón)
        if (this.uiManager && this.uiManager.drawingManager) {
            this.uiManager.drawingManager.lines = [];
            this.uiManager.drawingManager.redrawLines();
        }
        
        this.isPlaying = true;
        if (this.playBtn) {
            this.playBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }
        
        const speed = this.speedInput ? parseFloat(this.speedInput.value) : 1;
        let i = 0;
        
        const animateFrameTransition = (fromFrame, toFrame, onComplete) => {
            const duration = 600 / speed; // ms, ajustable
            const start = performance.now();
            const fromPlayers = fromFrame.players.map(p => ({ ...p }));
            const toPlayers = toFrame.players.map(p => ({ ...p }));
            const fromBall = this.getBallPosFromFrame(fromFrame);
            const toBall = this.getBallPosFromFrame(toFrame);
            
            const step = (now) => {
                if (!this.isPlaying) return;
                
                let t = Math.min(1, (now - start) / duration);
                const activePlayers = this.getActivePlayers();
                
                // Interpolar jugadores
                activePlayers.forEach((p, idx) => {
                    if (fromPlayers[idx] && toPlayers[idx]) {
                        p.x = this.lerp(fromPlayers[idx].x, toPlayers[idx].x, t);
                        p.y = this.lerp(fromPlayers[idx].y, toPlayers[idx].y, t);
                    }
                });
                
                // Interpolar balón
                if (fromBall && toBall) {
                    const ballPlayer = activePlayers.find(p => 
                        p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'
                    );
                    if (ballPlayer) {
                        ballPlayer.x = this.lerp(fromBall.x, toBall.x, t);
                        ballPlayer.y = this.lerp(fromBall.y, toBall.y, t);
                    }
                } else if (fromBall) {
                    const ballPlayer = activePlayers.find(p => 
                        p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'
                    );
                    if (ballPlayer) {
                        ballPlayer.x = fromBall.x;
                        ballPlayer.y = fromBall.y;
                    }
                }
                
                // Renderizar
                if (this.uiManager && this.uiManager.renderPlayersOnPitch) {
                    this.uiManager.renderPlayersOnPitch();
                }
                
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    onComplete();
                }
            };
            
            requestAnimationFrame(step);
        };
        
        const nextStep = () => {
            if (!this.isPlaying) return;
            
            if (i < this.frames.length - 1) {
                animateFrameTransition(this.frames[i], this.frames[i + 1], () => {
                    i++;
                    this.currentFrame = i;
                    this.updateFrameIndicator();
                    setTimeout(nextStep, 200 / speed); // Pausa entre frames
                });
            } else {
                this.stopAnimation();
            }
        };
        
        nextStep();
    }
    
    stopAnimation() {
        this.isPlaying = false;
        if (this.playBtn) {
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        console.log('[AnimationManager] Animación detenida');
    }
    
    // Métodos para import/export
    exportAnimationData() {
        const activePlayers = this.getActivePlayers();
        
        // Obtener IDs de jugadores activos (excluyendo el balón)
        const selectedPlayerIds = activePlayers
            .filter(p => !p.isBall && p.type !== 'ball' && p.role !== 'ball' && p.id !== 'ball')
            .map(p => p.id);
        
        console.log('[AnimationManager] Exportando con jugadores:', selectedPlayerIds);
        
        // Asegurar que tenemos el estado actual guardado
        if (this.frames.length > 0) {
            this.frames[this.currentFrame] = this.getCurrentState();
        }
        
        // Obtener datos de audio si están disponibles
        const audioData = this.audioManager ? this.audioManager.getAudioDataForExport() : null;
        
        const exportData = {
            frames: this.frames.map(f => ({
                players: f.players ? f.players.map(p => ({ ...p })) : [],
                ball: f.ball ? { ...f.ball } : null,
                timestamp: f.timestamp || Date.now()
            })),
            players: activePlayers.map(p => ({ ...p })),
            selectedPlayerIds: selectedPlayerIds,
            tactic: 'Libre',
            initialState: {
                players: activePlayers.map(p => ({ ...p })),
                currentFrame: this.currentFrame
            }
        };
        
        // Incluir audio solo si existe (para evitar archivos JSON innecesariamente grandes)
        if (audioData) {
            exportData.audio = audioData;
            console.log('[AnimationManager] Audio incluido en la exportación');
        }
        
        return exportData;
    }
    
    importAnimationData(data, clearLines = true) {
        console.log('[AnimationManager] Importando animación:', data);
        
        // Limpiar líneas si se solicita
        if (clearLines && this.uiManager && this.uiManager.drawingManager) {
            this.uiManager.drawingManager.lines = [];
            this.uiManager.drawingManager.redrawLines();
        }
        
        // Cargar frames
        this.frames = data.frames.map(f => ({
            players: f.players ? f.players.map(p => ({ ...p })) : [],
            ball: f.ball ? { ...f.ball } : null
        }));
        
        // Cargar jugadores desde el estado inicial o desde players
        let playersToLoad = [];
        if (data.initialState && data.initialState.players) {
            playersToLoad = data.initialState.players;
            console.log('[AnimationManager] Cargando desde initialState');
        } else if (data.players && Array.isArray(data.players)) {
            playersToLoad = data.players;
            console.log('[AnimationManager] Cargando desde players (compatibilidad)');
        }
        
        // Establecer jugadores activos
        const activePlayers = [];
        playersToLoad.forEach(player => {
            activePlayers.push({ ...player });
        });
        
        this.setActivePlayers(activePlayers);
        this.ensureBallInPlayers(activePlayers);
        
        // Cargar audio si está disponible
        if (data.audio && this.audioManager) {
            this.audioManager.loadAudioFromData(data.audio);
            console.log('[AnimationManager] Audio cargado desde datos importados');
        } else if (this.audioManager) {
            // Limpiar audio si no hay datos de audio
            this.audioManager.clearAudio();
        }
        
        // Establecer frame inicial
        this.currentFrame = data.initialState && typeof data.initialState.currentFrame === 'number' 
            ? Math.min(data.initialState.currentFrame, this.frames.length - 1) 
            : 0;
        
        // Aplicar estado del frame
        if (this.frames[this.currentFrame]) {
            this.setStateFromFrame(this.frames[this.currentFrame]);
        }
        
        this.updateFrameIndicator();
        
        console.log('[AnimationManager] Animación importada exitosamente');
        console.log(`[AnimationManager] ${this.frames.length} frames, frame actual: ${this.currentFrame}`);
        
        return data.tactic || 'Libre';
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
        console.log('[AnimationManager] Animación reseteada');
    }
    
    // Getters para acceso externo
    getFrames() {
        return this.frames;
    }
    
    getCurrentFrame() {
        return this.currentFrame;
    }
    
    getIsRecordMode() {
        return this.isRecordMode;
    }
    
    getIsPlaying() {
        return this.isPlaying;
    }
}
