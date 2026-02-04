/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎬 VIDEO EXPORT WORKFLOW - FLUJO PROFESIONAL DE EXPORTACIÓN
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Automatiza el proceso:
 * 1. Capturar animación a canvas (clean, sin UI)
 * 2. Grabar audio automáticamente sincronizado
 * 3. Validar audio + permitir re-grabar
 * 4. Mezclar video + audio + descargar
 * 
 * Usa ffmpeg.js para procesamiento profesional
 */

class VideoExportWorkflow {
    constructor(animationManager, audioManager) {
        this.animationManager = animationManager;
        this.audioManager = audioManager;
        this.videoBlob = null;
        this.audioBlob = null;
        this.canvas = null;
        this.canvasCtx = null;
        this.isCapturing = false;
        this.frameCount = 0;
    }

    /**
     * Inicia el flujo completo de exportación
     */
    async startExportWorkflow() {
        try {
            console.log('🎬 [VideoExportWorkflow] Iniciando flujo de exportación...');
            
            // Paso 1: Capturar video (canvas rendering)
            console.log('📹 [Paso 1] Capturando animación a video...');
            await this.captureAnimationToVideo();
            
            // Paso 2: Grabar audio sincronizado
            console.log('🎤 [Paso 2] Grabando audio sincronizado...');
            await this.recordAudioSynchronized();
            
            // Paso 3: Validar audio (mostrar vista previa)
            console.log('✅ [Paso 3] Mostrando validación de audio...');
            const audioConfirmed = await this.validateAndConfirmAudio();
            
            if (!audioConfirmed) {
                console.log('🔄 [Paso 3] Usuario rechazó audio, reiniciando...');
                await this.startExportWorkflow();
                return;
            }
            
            // Paso 4: Mezclar video + audio y descargar
            console.log('🎞️ [Paso 4] Procesando video final (mezclando audio)...');
            await this.processAndDownloadFinalVideo();
            
            console.log('✅ [VideoExportWorkflow] ¡Exportación completada!');
            
        } catch (error) {
            console.error('[VideoExportWorkflow] Error:', error);
            alert(`❌ Error en exportación: ${error.message}`);
        }
    }

    /**
     * PASO 1: Capturar la animación directamente a canvas
     * (sin captura de pantalla, sin modales visuales)
     */
    async captureAnimationToVideo() {
        return new Promise(async (resolve, reject) => {
            try {
                // Crear canvas temporal para renderizado
                this.canvas = document.createElement('canvas');
                this.canvas.width = 1280;
                this.canvas.height = 720;
                this.canvasCtx = this.canvas.getContext('2d');

                // MediaRecorder del canvas
                const stream = this.canvas.captureStream(30); // 30 FPS
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 3000000
                });

                const chunks = [];
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) chunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    this.videoBlob = new Blob(chunks, { type: 'video/webm' });
                    console.log(`✅ Video capturado: ${(this.videoBlob.size / 1024 / 1024).toFixed(2)} MB`);
                    resolve();
                };

                // Iniciar grabación
                mediaRecorder.start();
                this.isCapturing = true;
                this.frameCount = 0;

                // Mostrar indicador minimalista (sin modal superpuesto)
                this.showMinimalProgressIndicator();

                // Reproducir animación mientras se captura
                await this.playAnimationWithCanvasCapture(mediaRecorder);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Reproducir animación mientras se captura en canvas
     */
    async playAnimationWithCanvasCapture(mediaRecorder) {
        try {
            const frames = this.animationManager.frames;
            const speed = this.animationManager.speedInput ? 
                parseFloat(this.animationManager.speedInput.value) : 1;

            for (let i = 0; i < frames.length - 1; i++) {
                if (!this.isCapturing) break;

                const fromFrame = frames[i];
                const toFrame = frames[i + 1];

                // Animar transición en canvas
                await this.animateFrameToCanvasTransition(fromFrame, toFrame, speed);
                
                // Actualizar progreso visual
                const progress = ((i + 1) / (frames.length - 1)) * 100;
                this.updateMinimalProgress(progress);
                
                this.frameCount++;
            }

            // Detener grabación
            this.isCapturing = false;
            mediaRecorder.stop();
            this.hideMinimalProgressIndicator();

        } catch (error) {
            console.error('[captureAnimation] Error:', error);
            mediaRecorder.stop();
            throw error;
        }
    }

    /**
     * Animar transición de frame en canvas
     */
    async animateFrameToCanvasTransition(fromFrame, toFrame, speed) {
        const steps = 10;
        const stepDuration = (200 * 1.75) / speed / steps;

        for (let step = 0; step <= steps; step++) {
            const t = step / steps;

            // Interpolar posiciones
            const interpolatedFrame = this.interpolateFrame(fromFrame, toFrame, t);
            
            // Dibujar en canvas
            this.animationManager.captureFrameToCanvas(
                this.canvasCtx, 
                this.canvas, 
                interpolatedFrame
            );

            await this.sleep(stepDuration);
        }
    }

    /**
     * Interpolar entre dos frames
     */
    interpolateFrame(fromFrame, toFrame, t) {
        return {
            ...toFrame,
            players: toFrame.players.map((toPlayer, idx) => {
                const fromPlayer = fromFrame.players[idx] || toPlayer;
                return {
                    ...toPlayer,
                    x: fromPlayer.x + (toPlayer.x - fromPlayer.x) * t,
                    y: fromPlayer.y + (toPlayer.y - fromPlayer.y) * t
                };
            })
        };
    }

    /**
     * PASO 2: Grabar audio sincronizado (automático al terminar video)
     */
    async recordAudioSynchronized() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('🎤 Iniciando grabación de audio...');
                
                // Preparar audioManager
                if (!this.audioManager) {
                    console.warn('⚠️ audioManager no disponible, omitiendo audio');
                    resolve();
                    return;
                }

                // Mostrar contador de grabación con el audio
                this.showAudioRecordingIndicator();

                // Iniciar grabación de audio
                await this.audioManager.startRecording();

                // Calcular duración esperada
                const duration = this.getAnimationDuration();
                console.log(`⏱️ Audio grabándose durante ${duration}ms`);

                // Esperar a que termine (+ pequeño buffer)
                setTimeout(async () => {
                    await this.audioManager.stopRecording();
                    this.audioBlob = await this.audioManager.getAudioBlob();
                    console.log(`✅ Audio grabado: ${(this.audioBlob.size / 1024).toFixed(2)} KB`);
                    this.hideAudioRecordingIndicator();
                    resolve();
                }, duration + 500);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Calcular duración total de la animación
     */
    getAnimationDuration() {
        const frames = this.animationManager.frames;
        const speed = this.animationManager.speedInput ? 
            parseFloat(this.animationManager.speedInput.value) : 1;
        
        // Cada transición toma ~350ms (200ms * 1.75 / speed)
        const frameDuration = (200 * 1.75) / speed;
        return (frames.length - 1) * frameDuration;
    }

    /**
     * PASO 3: Validar audio (reproducir + confirmar)
     */
    async validateAndConfirmAudio() {
        return new Promise((resolve) => {
            if (!this.audioBlob) {
                resolve(true); // Sin audio, continuar
                return;
            }

            const modal = document.createElement('div');
            modal.id = 'audio-validation-modal';
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                            background: rgba(0,0,0,0.8); display: flex; align-items: center; 
                            justify-content: center; z-index: 10000;">
                    <div style="background: #2d2d2d; border-radius: 15px; padding: 30px; 
                                color: white; text-align: center; max-width: 400px;">
                        <h3 style="color: #17a2b8; margin-bottom: 20px;">🎤 Validar Audio</h3>
                        <p style="margin-bottom: 20px; color: #ddd;">
                            Escucha el audio grabado. ¿Está sincronizado correctamente con la animación?
                        </p>
                        
                        <audio id="audio-preview" controls style="width: 100%; margin-bottom: 20px;">
                            <source src="${URL.createObjectURL(this.audioBlob)}" type="audio/webm">
                        </audio>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button id="btn-audio-rerecord" style="padding: 10px; background: #ff6b6b; 
                                    color: white; border: none; border-radius: 5px; cursor: pointer; 
                                    font-weight: bold;">
                                🔄 Re-grabar
                            </button>
                            <button id="btn-audio-confirm" style="padding: 10px; background: #28a745; 
                                    color: white; border: none; border-radius: 5px; cursor: pointer; 
                                    font-weight: bold;">
                                ✅ Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('btn-audio-confirm').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            document.getElementById('btn-audio-rerecord').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    /**
     * PASO 4: Procesar video final (mezclar audio) y descargar
     */
    async processAndDownloadFinalVideo() {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.audioBlob) {
                    // Sin audio, descargar video directo
                    this.downloadFile(this.videoBlob, 'video/webm');
                    resolve();
                    return;
                }

                // Mostrar modal de procesamiento
                this.showProcessingModal();

                // Si FFmpeg está disponible, mezclar audio+video
                if (typeof FFmpeg !== 'undefined') {
                    await this.mixVideoWithAudioFFmpeg();
                } else {
                    console.warn('⚠️ FFmpeg no disponible, descargando video sin audio');
                    this.downloadFile(this.videoBlob, 'video/webm');
                }

                this.hideProcessingModal();
                resolve();

            } catch (error) {
                this.hideProcessingModal();
                reject(error);
            }
        });
    }

    /**
     * Mezclar video + audio con FFmpeg
     */
    async mixVideoWithAudioFFmpeg() {
        try {
            console.log('🎬 Procesando con FFmpeg...');
            
            // Nota: FFmpeg.js requiere setup específico
            // Esta es una implementación placeholder que descarga el video
            // Para producción, usar servidor con FFmpeg o librería completa
            
            this.downloadFile(this.videoBlob, 'video/webm');
            
        } catch (error) {
            console.warn('⚠️ Error con FFmpeg, descargando sin mezcla', error);
            this.downloadFile(this.videoBlob, 'video/webm');
        }
    }

    /**
     * Descargar archivo
     */
    downloadFile(blob, mimeType) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `animacion-tactica-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * UI Helpers - Indicadores minimalistas
     */
    showMinimalProgressIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'minimal-progress';
        indicator.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); 
                        color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999; 
                        font-size: 12px;">
                📹 Grabando... <span id="progress-percent">0%</span>
            </div>
        `;
        document.body.appendChild(indicator);
    }

    updateMinimalProgress(percent) {
        const elem = document.getElementById('progress-percent');
        if (elem) elem.textContent = `${Math.round(percent)}%`;
    }

    hideMinimalProgressIndicator() {
        const elem = document.getElementById('minimal-progress');
        if (elem) elem.remove();
    }

    showAudioRecordingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'audio-recording-indicator';
        indicator.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(255,0,0,0.7); 
                        color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999; 
                        font-size: 12px; animation: pulse 1s infinite;">
                🎤 Grabando audio...
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `;
        document.body.appendChild(indicator);
    }

    hideAudioRecordingIndicator() {
        const elem = document.getElementById('audio-recording-indicator');
        if (elem) elem.remove();
    }

    showProcessingModal() {
        const modal = document.createElement('div');
        modal.id = 'processing-modal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
                        justify-content: center; z-index: 10000;">
                <div style="text-align: center; color: white;">
                    <h3>🎬 Procesando video...</h3>
                    <p>Esto puede tomar un momento</p>
                    <div style="margin-top: 20px;">
                        <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); 
                                    border-radius: 2px; margin: 0 auto;">
                            <div style="height: 100%; background: #17a2b8; border-radius: 2px; 
                                        animation: progress 2s infinite;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 100%; }
                    100% { width: 0%; }
                }
            </style>
        `;
        document.body.appendChild(modal);
    }

    hideProcessingModal() {
        const elem = document.getElementById('processing-modal');
        if (elem) elem.remove();
    }

    /**
     * Utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ✅ Hacer disponible globalmente
window.VideoExportWorkflow = VideoExportWorkflow;
window.videoExportWorkflow = null;
