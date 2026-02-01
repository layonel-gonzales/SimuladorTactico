// audioManager.js
// Maneja la grabación de audio durante las animaciones tácticas

export default class AudioManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordedAudioBlob = null;
        this.recordedAudioBase64 = null;
        this.onAudioEnd = null; // Callback para cuando termine la reproducción
        this.isPlaying = false; // Estado de reproducción
        this.currentAudio = null; // Referencia al audio actual en reproducción
        
        // Referencias DOM
        this.recordButton = null;
        this.playButton = null;
        this.audioIndicator = null;
        
        this.init();
    }
    
    init() {
        this.setupDOMReferences();
        this.setupEventListeners();
    }
    
    setupDOMReferences() {
        this.recordButton = document.getElementById('audio-record-btn');
        this.playButton = document.getElementById('audio-play-btn');
        this.audioIndicator = document.getElementById('audio-indicator');
        
        if (!this.recordButton) {
            console.warn('AudioManager: Botón de grabación de audio no encontrado');
        }
    }
    
    setupEventListeners() {
        if (this.recordButton) {
            this.recordButton.addEventListener('click', () => {
                if (this.isRecording) {
                    this.stopRecording();
                } else {
                    this.startRecording();
                }
            });
        }
        
        if (this.playButton) {
            this.playButton.addEventListener('click', () => {
                this.playRecordedAudio();
            });
        }
    }
    
    async startRecording() {
        try {         
            this.audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            // Configurar MediaRecorder
            const options = {
                mimeType: 'audio/webm;codecs=opus', // Formato eficiente
                audioBitsPerSecond: 64000 // 64kbps para balance calidad/tamaño
            };
            
            // Fallback para navegadores que no soportan webm
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/mp4';
            }
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, options);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedAudioBlob = new Blob(this.audioChunks, { 
                    type: this.mediaRecorder.mimeType 
                });
                this.convertBlobToBase64();
                this.stopAudioStream();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateRecordingUI(true);
            
        } catch (error) {
            console.error('[AudioManager] Error al acceder al micrófono:', error);
            this.showAudioError('No se pudo acceder al micrófono. Verifique los permisos.');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateRecordingUI(false);
        }
    }
    
    stopAudioStream() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
    }
    
    convertBlobToBase64() {
        if (!this.recordedAudioBlob) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            this.recordedAudioBase64 = reader.result;
            this.updatePlayButtonState(true);
        };
        reader.readAsDataURL(this.recordedAudioBlob);
    }
    
    playRecordedAudio() {
        if (!this.recordedAudioBlob) {
            console.warn('[AudioManager] No hay audio grabado para reproducir');
            return;
        }
        
        if (this.isPlaying) {
            console.warn('[AudioManager] Ya se está reproduciendo audio');
            return;
        }
        
        const audioUrl = URL.createObjectURL(this.recordedAudioBlob);
        this.currentAudio = new Audio(audioUrl);
        this.isPlaying = true;
        
        this.currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            this.isPlaying = false;
            if (this.onAudioEnd) {
                this.onAudioEnd();
            }
        };
        
        this.currentAudio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            this.isPlaying = false;
            console.error('[AudioManager] Error al reproducir audio');
        };
        
        this.currentAudio.play().catch(error => {
            console.error('[AudioManager] Error al reproducir audio:', error);
            this.isPlaying = false;
        });
        
    }
    
    // Método alias para compatibilidad
    playAudio() {
        this.playRecordedAudio();
    }
    
    // Método para detener reproducción
    stopAudio() {
        if (this.currentAudio && this.isPlaying) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isPlaying = false;
            if (this.onAudioEnd) {
                this.onAudioEnd();
            }
        }
    }
    
    // Método para limpiar todo el audio
    clearAudio() {
        this.stopAudio();
        this.recordedAudioBlob = null;
        this.recordedAudioBase64 = null;
        this.currentAudio = null;
        this.updatePlayButtonState(false);
    }
    
    updateRecordingUI(isRecording) {
        if (this.recordButton) {
            if (isRecording) {
                this.recordButton.innerHTML = '<i class="fas fa-stop"></i>';
                this.recordButton.classList.add('recording');
                this.recordButton.title = 'Detener grabación';
            } else {
                this.recordButton.innerHTML = '<i class="fas fa-microphone"></i>';
                this.recordButton.classList.remove('recording');
                this.recordButton.title = 'Grabar audio';
            }
        }
        
        if (this.audioIndicator) {
            this.audioIndicator.style.display = isRecording ? 'block' : 'none';
        }
    }
    
    updatePlayButtonState(hasAudio) {
        if (this.playButton) {
            this.playButton.disabled = !hasAudio;
            this.playButton.style.opacity = hasAudio ? '1' : '0.5';
        }
    }
    
    showAudioError(message) {
        // Mostrar error al usuario (puedes personalizar esto)
        alert(message);
    }
    
    // Método para exportar audio en JSON
    getAudioDataForExport() {
        if (!this.recordedAudioBase64) {
            return null;
        }
        
        return {
            audioData: this.recordedAudioBase64,
            mimeType: this.mediaRecorder ? this.mediaRecorder.mimeType : 'audio/webm',
            duration: this.getAudioDuration(),
            recorded: new Date().toISOString()
        };
    }
    
    // Método para importar audio desde JSON
    loadAudioFromData(audioData) {
        if (!audioData || !audioData.audioData) {
            this.clearAudio();
            return;
        }
        
        this.recordedAudioBase64 = audioData.audioData;
        
        // Convertir base64 de vuelta a blob
        fetch(audioData.audioData)
            .then(res => res.blob())
            .then(blob => {
                this.recordedAudioBlob = blob;
                this.updatePlayButtonState(true);
            })
            .catch(error => {
                console.error('[AudioManager] Error al cargar audio:', error);
                this.clearAudio();
            });
    }
    
    clearAudio() {
        this.stopAudio();
        this.recordedAudioBlob = null;
        this.recordedAudioBase64 = null;
        this.currentAudio = null;
        this.updatePlayButtonState(false);
    }
    
    getAudioDuration() {
        // Para implementar más adelante si es necesario
        return null;
    }
    
    // Verificar si hay audio grabado
    hasRecordedAudio() {
        return !!this.recordedAudioBase64;
    }
    
    // Método alias para compatibilidad
    hasAudio() {
        return this.hasRecordedAudio();
    }
    
    // Verificar si el navegador soporta grabación de audio
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    }
}
