import { drawFootballField } from './fieldDrawer.js';
import { staticPlayers } from './players.js';
import DrawingManager from './drawingManager.js';
import PlayerManager from './playerManager.js';
import UIManager from './uiManager.js';
import BallDrawingManager from './ballDrawingManager.js';
import AnimationManager from './animationManager.js';
import ModeManager from './modeManager.js';
import TutorialManager from './tutorialManager.js';
import FullscreenManager from './fullscreenManager.js';
import OrientationManager from './orientationManager.js';
import AudioManager from './audioManager.js';

// --- Simulador Táctico con dos modos principales separados ---
// Modo 1: Dibujo de trazos usando el balón como cursor
// Modo 2: Crear animaciones tácticas con frames

document.addEventListener('DOMContentLoaded', async () => {

    // Inicializar el gestor de orientación PRIMERO (antes que cualquier otra cosa)
    const orientationManager = new OrientationManager();
    
    // Inicializar el gestor de audio
    const audioManager = new AudioManager();

    // Función global para comunicación con UIManager y BallDrawingManager
    window.main = {
        setBallDragStarted: function(isDragging) {
            // Notificar al gestor de dibujo de estelas
            if (ballDrawingManager) {
                ballDrawingManager.setBallDragStarted(isDragging);
            }
        }
    };

    // Funciones globales para acceso desde UIManager
    window.ensureBallInPlayers = ensureBallInPlayers;
    window.importAnimationData = null; // Se definirá más adelante

    // Estado global (debe ir antes de cualquier uso)
    // Inicializar activePlayers con los jugadores y balón desde staticPlayers
    // Asegura que siempre haya un balón en la cancha
    function ensureBallInPlayers() {
        console.log('[DEBUG] Llamada a ensureBallInPlayers');
        
        // Si no hay activePlayers, inicializar como array vacío
        if (!state.activePlayers || !Array.isArray(state.activePlayers)) {
            console.log('[DEBUG] Inicializando activePlayers como array vacío');
            state.activePlayers = [];
        }
        
        // Elimina cualquier balón duplicado
        let balls = state.activePlayers.filter(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
        if (balls.length > 1) {
            console.log('[DEBUG] Se encontraron balones duplicados, eliminando extras');
            // Deja solo uno
            const first = balls[0];
            state.activePlayers = state.activePlayers.filter(p => !(p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'));
            state.activePlayers.push(first);
        }
        let ballPlayer = state.activePlayers.find(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
        if (!ballPlayer) {
            // Agregar balón en el centro del campo (coordenadas más realistas)
            ballPlayer = {
                id: 'ball',
                isBall: true,
                type: 'ball',
                role: 'ball',
                x: 50, // centro horizontal
                y: 50  // centro vertical
            };
            state.activePlayers.push(ballPlayer);
            console.log('[DEBUG] Balón agregado al centro de la cancha', ballPlayer);
        }
        // Asegura que tenga todas las propiedades y posición válida
        if (typeof ballPlayer.x !== 'number' || typeof ballPlayer.y !== 'number') {
            ballPlayer.x = 50; // centro horizontal del campo
            ballPlayer.y = 50; // centro vertical del campo
            console.log('[DEBUG] Balón reposicionado al centro', ballPlayer);
        }
        
        // Validar que las coordenadas están en rango válido (0-100%)
        if (ballPlayer.x < 0 || ballPlayer.x > 100) ballPlayer.x = 50;
        if (ballPlayer.y < 0 || ballPlayer.y > 100) ballPlayer.y = 50;
        
        ballPlayer.id = 'ball';
        ballPlayer.isBall = true;
        ballPlayer.type = 'ball';
        ballPlayer.role = 'ball';
        // Mensaje de depuración para ver el estado de los jugadores
        console.log('[DEBUG] Estado de activePlayers tras asegurar balón:', state.activePlayers);
    }
    // Estado global (debe ir antes de cualquier uso)
    const state = {
        activePlayers: [], // Iniciar vacío, solo agregar jugadores seleccionados
        isDrawingMode: false
    };
    
    // Solo asegurar el balón, no cargar jugadores por defecto
    ensureBallInPlayers();
    
    // Forzar balón al centro al cargar
    const ballPlayerInit = state.activePlayers.find(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
    if (ballPlayerInit) {
        ballPlayerInit.x = 50; // centro en porcentaje
        ballPlayerInit.y = 50; // centro en porcentaje
        console.log('[DEBUG] Balón forzado al centro al cargar', ballPlayerInit);
    }

    // Inicialización de módulos especializados
    const playerManager = new PlayerManager(staticPlayers);
    const drawingManager = new DrawingManager('drawing-canvas');
    
    // NUEVO: Gestores especializados para las dos funcionalidades principales
    const ballDrawingManager = new BallDrawingManager('drawing-canvas', () => state.activePlayers);
    
    // CRÍTICO: Conectar ambos managers para coordinación mutua
    ballDrawingManager.drawingManager = drawingManager;
    drawingManager.ballDrawingManager = ballDrawingManager;
    
    const animationManager = new AnimationManager(
        () => state.activePlayers,
        (players) => { state.activePlayers = players; },
        ensureBallInPlayers,
        null, // Se asignará después de crear UIManager
        audioManager // Pasar referencia del audioManager
    );

    // NUEVO: Coordinador de modos para evitar conflictos
    const modeManager = new ModeManager();

    // Crear UIManager y conectar con los gestores especializados
    const uiManager = new UIManager();
    
    // Conectar todos los gestores
    animationManager.uiManager = uiManager;
    modeManager.setManagers(drawingManager, ballDrawingManager, animationManager, uiManager);

    // --- NOTA: El modeManager ya se encarga de conectar el botón global de modo ---
    // No necesitamos duplicar la conexión aquí

    // Establecer modo inicial (dibujo) y verificar
    console.log('[Main] Estableciendo modo inicial...');
    modeManager.switchToMode('drawing');
    
    // Verificación adicional después de un pequeño delay
    setTimeout(() => {
        console.log('[Main] Verificación post-inicialización:');
        console.log('- Modo actual:', modeManager.currentMode);
        console.log('- Clases del body:', document.body.className);
        console.log('- Botón global de modo existe:', !!document.getElementById('global-mode-toggle'));
        console.log('- Botón global de plantilla existe:', !!document.getElementById('global-select-squad-btn'));
        console.log('- Drawing controls existe:', !!document.getElementById('drawing-mode-controls'));
        console.log('- Animation controls existe:', !!document.getElementById('animation-mode-controls'));
    }, 100);

    // --- Exportar animación como JSON ---
    const exportBtn = document.getElementById('export-animation-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = animationManager.exportAnimationData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animacion-tactica.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[Main] Animación exportada exitosamente');
        });
    }

    // --- Exportar animación como Video MP4 ---
    const exportVideoBtn = document.getElementById('export-animation-video');
    if (exportVideoBtn) {
        exportVideoBtn.addEventListener('click', async () => {
            // Verificar que hay frames suficientes
            if (animationManager.getFrameCount() < 2) {
                alert('❌ Necesitas al menos 2 frames para crear un video.\n\n💡 Tip: Agrega más frames moviendo jugadores y presionando "Agregar Frame"');
                return;
            }

            // Confirmar exportación con instrucciones claras
            const hasAudio = audioManager && audioManager.hasRecordedAudio();
            const audioText = hasAudio ? '\n🎤 SE INCLUIRÁ el audio grabado' : '\n🔇 Sin audio (graba antes si quieres narrarlo)';
            
            const confirmed = confirm(`🎬 ¿Exportar animación como video?\n\n📹 Se capturará la animación REAL de la pantalla${audioText}\n\n⚠️ IMPORTANTE:\n• Se abrirá selector de pantalla\n• Selecciona esta ventana/pestaña\n• La animación se reproducirá automáticamente\n• El video se descargará al finalizar\n\n¿Continuar?`);
            
            if (confirmed) {
                try {
                    await animationManager.exportToVideo();
                    console.log('[Main] Video exportado exitosamente');
                } catch (error) {
                    console.error('[Main] Error al exportar video:', error);
                    alert('❌ Error al crear el video.\n\n💡 Asegúrate de:\n• Permitir captura de pantalla\n• Seleccionar esta pestaña\n• No minimizar la ventana durante la grabación');
                }
            }
        });
    }

    // --- Generar link para compartir animación ---
    const linkBtn = document.getElementById('generate-share-link');
    const linkOutput = document.getElementById('share-link-output');
    if (linkBtn && linkOutput) {
        linkBtn.addEventListener('click', () => {
            const data = animationManager.exportAnimationData();
            
            // ESTRATEGIA INTELIGENTE: Crear versión sin audio para compartir por URL
            const dataForURL = { ...data };
            delete dataForURL.audio; // Eliminar audio para mantener URL manejable
            
            const json = JSON.stringify(dataForURL);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            const url = `${window.location.origin}${window.location.pathname}?anim=${encodeURIComponent(base64)}`;
            
            // Verificar tamaño del URL
            if (url.length > 6000) {
                alert('❌ La animación es muy compleja para compartir por URL.\n\n✅ Usa "Exportar JSON" para descargar el archivo completo (incluye audio).');
                return;
            }
            
            linkOutput.value = url;
            linkOutput.style.display = 'block';
            linkOutput.select();
            
            // Mostrar advertencia si había audio
            if (data.audio) {
                setTimeout(() => {
                    alert('📢 NOTA: El audio se guarda solo en el archivo JSON descargable.\n\nLa URL compartida contiene la animación pero sin audio.');
                }, 500);
            }
            
            try { 
                document.execCommand('copy'); 
                linkBtn.innerHTML = '<i class="fas fa-link"></i> ¡Copiado!';
            } catch(e) {
                linkBtn.innerHTML = '<i class="fas fa-link"></i> Error';
            }
            
            setTimeout(() => {
                linkBtn.innerHTML = '<i class="fas fa-link"></i> Link';
                linkOutput.style.display = 'none';
            }, 1500);
            
            console.log('[Main] Link generado exitosamente');
        });
    }

    // --- Importar animación desde JSON ---
    let importInput = document.getElementById('import-animation-json');
    let importBtn = document.getElementById('import-btn');
    
    // Limpiar duplicados si existen
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
    importBtn.innerHTML = '<i class="fas fa-file-import"></i>';
    
    // Insertar el botón al lado de exportar si existe
    const exportBtnRef = document.getElementById('export-animation-json');
    if (exportBtnRef && exportBtnRef.parentNode) {
        exportBtnRef.parentNode.insertBefore(importBtn, exportBtnRef.nextSibling);
    } else {
        document.body.appendChild(importBtn);
    }
    
    // Eventos
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (!data.frames || !Array.isArray(data.frames)) {
                    throw new Error('JSON inválido: falta frames');
                }
                
                // Usar AnimationManager para importar
                animationManager.importAnimationData(data);
                
                alert('Animación importada correctamente.');
                console.log('[Main] Animación importada desde archivo JSON');
                
            } catch (err) {
                alert('Error al importar animación: ' + err.message);
                console.error('[Main] Error al importar:', err);
            }
        };
        reader.readAsText(file);
    });

    // Función auxiliar para importar datos de animación (expuesta globalmente para compatibilidad)
    function importAnimationData(data) {
        try {
            animationManager.importAnimationData(data);
            return true;
        } catch (err) {
            console.error('[Main] Error en importAnimationData:', err);
            return false;
        }
    }
    
    // Exponer función globalmente para compatibilidad
    window.importAnimationData = importAnimationData;

    // --- Importar animación desde link compartido (URL) ---
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const anim = params.get('anim');
        if (!anim) return;
        
        try {
            const json = decodeURIComponent(escape(atob(anim)));
            const data = JSON.parse(json);
            if (!data.frames || !Array.isArray(data.frames)) {
                throw new Error('El link no contiene animación válida.');
            }
            
            // Usar AnimationManager para importar
            animationManager.importAnimationData(data);
            
            setTimeout(() => alert('Animación cargada desde link compartido.'), 300);
            console.log('[Main] Animación importada desde URL');
            
        } catch (err) {
            setTimeout(() => alert('Error al cargar animación desde link: ' + err.message), 300);
            console.error('[Main] Error al importar desde URL:', err);
        }
    }, 200);

    // Las funciones de frame (getCurrentState, setStateFromFrame, etc.) 
    // ahora están en AnimationManager. Se eliminan para evitar duplicados.

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
    const drawingCanvas = document.getElementById('drawing-canvas');
    
    if (deleteLineBtn) {
        deleteLineBtn.addEventListener('click', () => {
            deleteLineMode = !deleteLineMode;
            
            // Toggle clases CSS
            deleteLineBtn.classList.toggle('active', deleteLineMode);
            
            // Toggle animación del ícono
            const icon = deleteLineBtn.querySelector('i');
            if (deleteLineMode) {
                icon.classList.add('fa-beat');
                // Cambiar cursor del canvas
                if (drawingCanvas) {
                    drawingCanvas.classList.add('scissors-cursor-simple');
                }
                // Actualizar título del botón
                deleteLineBtn.title = 'Salir del modo borrar líneas';
                console.log('[Main] 🔄 Modo eliminar líneas ACTIVADO');
            } else {
                icon.classList.remove('fa-beat');
                // Restaurar cursor normal
                if (drawingCanvas) {
                    drawingCanvas.classList.remove('scissors-cursor-simple');
                }
                // Restaurar título del botón
                deleteLineBtn.title = 'Borrar línea específica';
                console.log('[Main] ✅ Modo eliminar líneas DESACTIVADO');
            }
            
            // Notificar al DrawingManager
            drawingManager.setDeleteLineMode(deleteLineMode);
        });
    }


    // Inicializar UI
    uiManager.init({
        playerManager,
        drawingManager, // Pasamos el drawingManager
        state,
        modeManager // Pasar referencia del modeManager
    });

    // Renderizar jugadores iniciales (incluyendo el balón)
    uiManager.renderPlayersOnPitch();

    // --- Lógica del campo de fútbol ---
    const pitchContainer = document.getElementById('pitch-container');
    const footballFieldCanvas = document.getElementById('football-field');
    const fieldCtx = footballFieldCanvas.getContext('2d');

    // Función para dibujar el campo, que se llamará al redimensionar
    // Esta función solo se encarga del fondo del campo.
    function renderFootballField() {
        const rect = pitchContainer.getBoundingClientRect();
        
        // MEJORA: Usar devicePixelRatio para alta resolución
        const dpr = window.devicePixelRatio || 1;
        
        // Tamaño CSS (lo que ve el usuario)
        const cssWidth = rect.width;
        const cssHeight = rect.height;
        
        // Tamaño real del canvas en píxeles de dispositivo
        const canvasWidth = cssWidth * dpr;
        const canvasHeight = cssHeight * dpr;
        
        // Configurar tamaños del canvas
        footballFieldCanvas.width = canvasWidth;
        footballFieldCanvas.height = canvasHeight;
        
        // Establecer el tamaño CSS para que se muestre correctamente
        footballFieldCanvas.style.width = cssWidth + 'px';
        footballFieldCanvas.style.height = cssHeight + 'px';
        
        // Escalar el contexto para que coincida con el ratio de píxeles
        // IMPORTANTE: Limpiar transformaciones previas
        fieldCtx.setTransform(1, 0, 0, 1, 0, 0);
        fieldCtx.scale(dpr, dpr);
        
        // Dibujar el campo usando las dimensiones CSS
        drawFootballField(footballFieldCanvas, fieldCtx);
        console.log(`main.js: Campo redibujado - CSS: ${cssWidth}x${cssHeight}, Canvas: ${canvasWidth}x${canvasHeight}, DPR: ${dpr}`);
        console.log(`main.js: Forzando redibujo completo del campo con arcos actualizados`);
    }

    // El UIManager ya tiene un listener para 'resize' que llama a drawingManager.resizeCanvas()
    // y repositionPlayersOnPitch(). Aquí solo necesitamos asegurarnos de que el campo de fondo
    // también se redibuje.
    let resizeFieldTimeout;
    
    // MEJORA: Detectar dispositivos móviles para manejar mejor el redimensionado
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    function handleResize() {
        clearTimeout(resizeFieldTimeout);
        const delay = isMobile ? 100 : 250; // Menos delay en móviles para mejor responsividad
        
        resizeFieldTimeout = setTimeout(() => {
            console.log('[Main] Redimensionando campo para:', isMobile ? 'MÓVIL' : 'ESCRITORIO');
            renderFootballField(); // Redibujar el fondo del campo
        }, delay);
    }
    
    window.addEventListener('resize', handleResize);
    
    // NUEVO: También escuchar cambios de orientación en móviles
    if (isMobile) {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                console.log('[Main] Cambio de orientación detectado');
                handleResize();
            }, 300); // Pequeño delay para que la orientación termine de cambiar
        });
    }


    // Ejecutar renderizado inicial del campo
    renderFootballField();

    // Cargar jugadores iniciales en el modal de selección
    playerManager.renderPlayerSelectionList();

    // --- AUDIO RECORDING CONTROLS ---
    const audioRecordBtn = document.getElementById('audio-record-btn');
    const audioPlayBtn = document.getElementById('audio-play-btn');
    
    if (audioRecordBtn) {
        audioRecordBtn.addEventListener('click', async () => {
            if (!audioManager.isRecording) {
                // Verificar si hay audio previo y advertir al usuario
                if (audioManager.hasAudio()) {
                    if (!confirm('Ya existe una grabación de audio. ¿Deseas reemplazarla con una nueva grabación?')) {
                        return;
                    }
                }
                
                try {
                    await audioManager.startRecording();
                    audioRecordBtn.innerHTML = '<i class="fas fa-stop"></i>';
                    audioRecordBtn.title = 'Detener grabación';
                    audioRecordBtn.classList.add('recording');
                } catch (error) {
                    console.error('[Main] Error al iniciar grabación:', error);
                    alert('Error al iniciar la grabación. Asegúrate de permitir el acceso al micrófono.');
                }
            } else {
                audioManager.stopRecording();
                audioRecordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                audioRecordBtn.title = 'Grabar audio';
                audioRecordBtn.classList.remove('recording');
                
                // Habilitar botón de reproducción si hay audio
                if (audioPlayBtn && audioManager.hasAudio()) {
                    audioPlayBtn.disabled = false;
                }
            }
        });
    }
    
    if (audioPlayBtn) {
        audioPlayBtn.addEventListener('click', () => {
            if (audioManager.hasAudio()) {
                if (!audioManager.isPlaying) {
                    audioManager.playAudio();
                    audioPlayBtn.innerHTML = '<i class="fas fa-stop"></i>';
                    audioPlayBtn.title = 'Detener reproducción';
                    
                    // Volver al estado normal cuando termine la reproducción
                    audioManager.onAudioEnd = () => {
                        audioPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                        audioPlayBtn.title = 'Reproducir audio';
                    };
                } else {
                    audioManager.stopAudio();
                    audioPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                    audioPlayBtn.title = 'Reproducir audio';
                }
            }
        });
        
        // Deshabilitar inicialmente si no hay audio
        audioPlayBtn.disabled = !audioManager.hasRecordedAudio();
    }

    // --- TUTORIAL MANAGER ---
    // Inicializar el gestor de tutorial al final para que todo esté cargado
    // Usar setTimeout para asegurar que todo esté inicializado
    setTimeout(() => {
        const tutorialManager = new TutorialManager();
        
        // Hacer disponible globalmente para debugging y acceso desde otros módulos
        window.tutorialManager = tutorialManager;
        console.log('[Main] 🎓 Tutorial Manager inicializado');
    }, 100);

    // --- FULLSCREEN MANAGER ---
    // Inicializar el gestor de pantalla completa
    const fullscreenManager = new FullscreenManager();
    
    // Hacer disponible globalmente para debugging y acceso desde otros módulos
    window.fullscreenManager = fullscreenManager;
    window.modeManager = modeManager; // También hacer disponible el modeManager
    
    console.log('[Main] 🖥️ Fullscreen Manager inicializado');
// Fin del bloque DOMContentLoaded
});