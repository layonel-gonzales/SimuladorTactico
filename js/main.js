import { drawFootballField } from './fieldDrawer.js';
import { getOrCreateDeviceId } from './deviceIdManager.js';
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
import CustomPlayersManager from './customPlayersManager.js';
import CustomPlayersUI from './customPlayersUI.js';
import ConfigurationManager from './configurationManager.js';
import ConfigurationUI from './configurationUI.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- GESTIÓN DE DEVICEID (FREEMIUM) ---
    const deviceId = getOrCreateDeviceId();
    window.deviceId = deviceId; // Exponer globalmente para pruebas
    
    // SISTEMA DE AUTENTICACIÓN: Verificar acceso antes de inicializar la aplicación
    const waitForAuthentication = () => {
        return new Promise((resolve) => {
            
            // Si no hay sistema de autenticación, continuar
            if (!window.authSystem) {
                resolve();
                return;
            }
            
            // Si ya está autenticado, continuar
            if (window.authSystem.isAuthenticated) {
                resolve();
                return;
            }
            
            // Esperar hasta que se autentique o se haga bypass
            let checkCount = 0;
            const checkAuth = setInterval(() => {
                checkCount++;
                
                if (window.authSystem.isAuthenticated) {
                    clearInterval(checkAuth);
                    resolve();
                }
            }, 100);
            
            // Timeout de seguridad después de 30 segundos (aumentado)
            setTimeout(() => {
                clearInterval(checkAuth);
                console.warn('[Main] Timeout de autenticación alcanzado después de 30 segundos, continuando...');
                resolve();
            }, 30000);
        });
    };
    
    // Esperar autenticación antes de continuar
    await waitForAuthentication();

    // Inicializar el gestor de orientación PRIMERO (antes que cualquier otra cosa)
    const orientationManager = new OrientationManager();
    
    // Inicializar el gestor de audio
    const audioManager = new AudioManager();

    // Inicializar el gestor de jugadores personalizados
    const customPlayersManager = new CustomPlayersManager();
    
    // Hacer disponible globalmente para sistemas de equipos
    window.customPlayersManager = customPlayersManager;

    // ✅ CARGAR AUTOMÁTICAMENTE los 22 jugadores por defecto al iniciar
    // Se ejecuta cuando defaultPlayersData está disponible
    if (window.defaultPlayersData) {
        window.defaultPlayersData.loadDefaultPlayers().then(result => {
            if (result.loaded) {
                console.log(`✅ Sistema de jugadores por defecto inicializado: ${result.total} jugadores`);
            }
        }).catch(err => {
            console.error('❌ Error cargando jugadores por defecto:', err);
        });
    } else {
        // Si defaultPlayersData no está listo, esperar un poco y reintentar
        setTimeout(() => {
            if (window.defaultPlayersData) {
                window.defaultPlayersData.loadDefaultPlayers();
            }
        }, 200);
    }

    // Inicializar el gestor de configuración
    const configurationManager = new ConfigurationManager(customPlayersManager);

    // Inicializar el gestor de cards de jugador (después de configuración)
    window.playerCardManager = new PlayerCardManager();

    // Función global para comunicación con UIManager y BallDrawingManager
    window.main = {
        setBallDragStarted: function(isDragging) {
            // Esta función se sobrescribirá después de que ballDrawingManager esté inicializado
            console.warn('setBallDragStarted llamado antes de inicializar ballDrawingManager');
        }
    };

    // Funciones globales para acceso desde UIManager
    window.ensureBallInPlayers = ensureBallInPlayers;
    window.importAnimationData = null; // Se definirá más adelante

    // Estado global (debe ir antes de cualquier uso)
    // Inicializar activePlayers con los jugadores y balón desde staticPlayers
    // Asegura que siempre haya un balón en la cancha
    function ensureBallInPlayers() {    
        // Si no hay activePlayers, inicializar como array vacío
        if (!state.activePlayers || !Array.isArray(state.activePlayers)) {
            state.activePlayers = [];
        }
        
        // Elimina cualquier balón duplicado
        let balls = state.activePlayers.filter(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
        if (balls.length > 1) {
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
        }
        // Asegura que tenga todas las propiedades y posición válida
        if (typeof ballPlayer.x !== 'number' || typeof ballPlayer.y !== 'number') {
            ballPlayer.x = 50; // centro horizontal del campo
            ballPlayer.y = 50; // centro vertical del campo
        }
        
        // Validar que las coordenadas están en rango válido (0-100%)
        if (ballPlayer.x < 0 || ballPlayer.x > 100) ballPlayer.x = 50;
        if (ballPlayer.y < 0 || ballPlayer.y > 100) ballPlayer.y = 50;
        
        ballPlayer.id = 'ball';
        ballPlayer.isBall = true;
        ballPlayer.type = 'ball';
        ballPlayer.role = 'ball';
    }
    // Estado global (debe ir antes de cualquier uso)
    const state = {
        activePlayers: [], // Iniciar vacío, solo agregar jugadores seleccionados
        isDrawingMode: false
    };
    
    // EXPONER el estado globalmente para que otros módulos puedan acceder
    window.main = window.main || {};
    window.main.state = state;
    
    // Solo asegurar el balón, no cargar jugadores por defecto
    ensureBallInPlayers();
    
    // Forzar balón al centro al cargar
    const ballPlayerInit = state.activePlayers.find(p => p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball');
    if (ballPlayerInit) {
        ballPlayerInit.x = 50; // centro en porcentaje
        ballPlayerInit.y = 50; // centro en porcentaje
    }

    // Inicialización de módulos especializados
    const playerManager = new PlayerManager(staticPlayers, customPlayersManager, configurationManager);
    const drawingManager = new DrawingManager('drawing-canvas');
    
    // NUEVO: Gestores especializados para las dos funcionalidades principales
    const ballDrawingManager = new BallDrawingManager('drawing-canvas', () => state.activePlayers);
    
    // EXPONER ballDrawingManager después de su inicialización
    window.main.ballDrawingManager = ballDrawingManager;
    
    // SOBRESCRIBIR la función setBallDragStarted con la implementación correcta
    window.main.setBallDragStarted = function(isDragging) {
        // Notificar al gestor de dibujo de estelas
        if (ballDrawingManager) {
            ballDrawingManager.setBallDragStarted(isDragging);
        }
    };
    
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
    
    // Inicializar la interfaz de jugadores personalizados
    const customPlayersUI = new CustomPlayersUI(customPlayersManager, playerManager);
    window.customPlayersUI = customPlayersUI; // Hacer disponible globalmente
    
    // Inicializar la interfaz de configuración COMPLETA
    const configurationUI = new ConfigurationUI(configurationManager, customPlayersManager, playerManager);
    window.configurationUI = configurationUI; // Hacer disponible globalmente
    
    // Conectar el botón de configuración al modal COMPLETO
    const configurationBtn = document.getElementById('configuration-btn');
    if (configurationBtn) {
        configurationBtn.addEventListener('click', () => {
            configurationUI.openConfigurationModal();
        });
    }
    
    // NOTA: El botón custom-players-btn se conecta en customPlayersUI.setupEventListeners()
    // No agregar listener aquí para evitar duplicados
    
    // Inicializar sistema de estilos de cancha después de un delay
    setTimeout(() => {
        if (window.fieldStylesDirectIntegration) {
            window.fieldStylesDirectIntegration.init();
        }
    }, 2000);
    
    // Conectar todos los gestores
    animationManager.uiManager = uiManager;
    modeManager.setManagers(drawingManager, ballDrawingManager, animationManager, uiManager);
    modeManager.switchToMode('drawing');
    
    // Verificación adicional después de un pequeño delay
    setTimeout(() => {

        
        // Agregar función global para debug de filtros
        window.debugFilters = () => {
            if (configurationManager) {
                const settings = configurationManager.getAllSettings();
            }
            if (playerManager) {
                const allPlayers = playerManager.getAllPlayers();
            }
        };
        
        // Botón de gestión de almacenamiento local
        const storageBtn = document.getElementById('storage-management-btn');
        if (storageBtn && window.localStorageUI) {
            storageBtn.addEventListener('click', () => {
                window.localStorageUI.show();
            });
        }

        // Botón de gestión de equipos
        const teamsBtn = document.getElementById('teams-management-btn');
        if (teamsBtn && window.teamsUI) {
            teamsBtn.addEventListener('click', () => {
                window.teamsUI.showCreateTeamModal();
            });
        }

        
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
            } else {
                icon.classList.remove('fa-beat');
                // Restaurar cursor normal
                if (drawingCanvas) {
                    drawingCanvas.classList.remove('scissors-cursor-simple');
                }
                // Restaurar título del botón
                deleteLineBtn.title = 'Borrar línea específica';
            }
            
            // Notificar al DrawingManager
            drawingManager.setDeleteLineMode(deleteLineMode);
        });
    }

    // --- COMPARTIR IMAGEN DEL CAMPO ---
    const sharePitchBtn = document.getElementById('share-pitch-btn');
    if (sharePitchBtn) {
        sharePitchBtn.addEventListener('click', async () => {
            try {          
                const pitchContainer = document.getElementById('pitch-container');
                const footballFieldCanvas = document.getElementById('football-field');
                const drawingCanvasEl = document.getElementById('drawing-canvas');
                
                if (!pitchContainer || !footballFieldCanvas) {
                    throw new Error('No se encontró el contenedor del campo');
                }
                
                // Mostrar indicador de carga
                sharePitchBtn.disabled = true;
                const originalIcon = sharePitchBtn.innerHTML;
                sharePitchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                let resultCanvas;
                
                // Método 1: Usar html2canvas si está disponible (captura TODO incluyendo tokens)
                if (typeof html2canvas !== 'undefined') {
                    
                    resultCanvas = await html2canvas(pitchContainer, {
                        backgroundColor: null,
                        scale: window.devicePixelRatio || 1,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        // Ignorar elementos que no queremos en la captura
                        ignoreElements: (element) => {
                            return element.classList?.contains('center-logo-watermark');
                        }
                    });
                } else {               
                    resultCanvas = document.createElement('canvas');
                    const ctx = resultCanvas.getContext('2d');
                    const dpr = window.devicePixelRatio || 1;
                    
                    resultCanvas.width = footballFieldCanvas.width;
                    resultCanvas.height = footballFieldCanvas.height;
                    
                    // Dibujar campo
                    ctx.drawImage(footballFieldCanvas, 0, 0);
                    
                    // Dibujar líneas
                    if (drawingCanvasEl) {
                        ctx.drawImage(drawingCanvasEl, 0, 0);
                    }
                    
                    // Dibujar tokens como rectángulos con info básica
                    const playerTokens = document.querySelectorAll('.player-token');
                    const fieldRect = footballFieldCanvas.getBoundingClientRect();
                    
                    for (const token of playerTokens) {
                        const tokenRect = token.getBoundingClientRect();
                        const x = (tokenRect.left - fieldRect.left) * dpr;
                        const y = (tokenRect.top - fieldRect.top) * dpr;
                        const width = tokenRect.width * dpr;
                        const height = tokenRect.height * dpr;
                        
                        // Dibujar representación del token
                        ctx.save();
                        
                        // Fondo semi-transparente
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        ctx.fillRect(x, y, width, height);
                        
                        // Círculo para la foto
                        const centerX = x + width / 2;
                        const centerY = y + height * 0.35;
                        const radius = Math.min(width, height) * 0.25;
                        
                        ctx.fillStyle = '#2c3e50';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                        ctx.fill();
                        
                        // Número del jugador
                        const number = token.querySelector('.player-number')?.textContent || 
                                       token.querySelector('.minicard-number')?.textContent || '';
                        if (number) {
                            ctx.fillStyle = '#ffffff';
                            ctx.font = `bold ${radius}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(number, centerX, centerY);
                        }
                        
                        // Nombre del jugador
                        const name = token.querySelector('.minicard-name')?.textContent || 
                                     token.querySelector('.player-name')?.textContent || '';
                        if (name) {
                            ctx.fillStyle = '#ffffff';
                            ctx.font = `bold ${height * 0.1}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.fillText(name.substring(0, 10), centerX, y + height * 0.75);
                        }
                        
                        ctx.restore();
                    }
                }
                
                // Convertir a blob
                const blob = await new Promise(resolve => resultCanvas.toBlob(resolve, 'image/png', 1.0));
                
                // Intentar usar Web Share API si está disponible (móviles)
                if (navigator.share && navigator.canShare) {
                    try {
                        const file = new File([blob], 'tactica.png', { type: 'image/png' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Mi Táctica de Fútbol',
                                text: 'Creada con Simulador Táctico'
                            });
                        } else {
                            throw new Error('No se puede compartir archivos');
                        }
                    } catch (shareError) {
                        downloadImage(blob);
                    }
                } else {
                    // Descargar la imagen
                    downloadImage(blob);
                }
                
                function downloadImage(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tactica_${new Date().toISOString().slice(0,10)}_${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
                
            } catch (error) {
                alert('Error al generar la imagen. Por favor, intenta de nuevo.');
            } finally {
                // Restaurar botón
                sharePitchBtn.disabled = false;
                sharePitchBtn.innerHTML = '<i class="fas fa-image"></i>';
            }
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
        
        // La cancha ocupa TODO el espacio disponible del contenedor
        // Sin márgenes - las líneas del campo llegarán hasta los bordes
        let cssWidth = rect.width;
        let cssHeight = rect.height;
        
        // Asegurar dimensiones mínimas
        cssWidth = Math.max(cssWidth, 200);
        cssHeight = Math.max(cssHeight, 130);
        
        // Tamaño real del canvas en píxeles de dispositivo
        const canvasWidth = Math.round(cssWidth * dpr);
        const canvasHeight = Math.round(cssHeight * dpr);
        
        // Configurar tamaños del canvas del campo
        footballFieldCanvas.width = canvasWidth;
        footballFieldCanvas.height = canvasHeight;
        footballFieldCanvas.style.width = cssWidth + 'px';
        footballFieldCanvas.style.height = cssHeight + 'px';
        fieldCtx.setTransform(1, 0, 0, 1, 0, 0);
        fieldCtx.scale(dpr, dpr);
        
        // Dibujar el campo usando el sistema de estilos
        if (window.fieldStyleManager) {
            window.fieldStyleManager.drawField(footballFieldCanvas, fieldCtx);
        } else {
            // Fallback al dibujo original si no está disponible el sistema de estilos
            drawFootballField(footballFieldCanvas, fieldCtx);
        }
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
            renderFootballField(); // Redibujar el fondo del campo
            // Sincronizar el canvas de dibujo después de redimensionar el campo
            if (drawingManager) {
                drawingManager.resizeCanvas();
            }
        }, delay);
    }
    
    window.addEventListener('resize', handleResize);
    
    // NUEVO: También escuchar cambios de orientación en móviles
    if (isMobile) {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                handleResize();
            }, 300); // Pequeño delay para que la orientación termine de cambiar
        });
    }


    // Ejecutar renderizado inicial del campo
    renderFootballField();
    
    // IMPORTANTE: Sincronizar el canvas de dibujo después del renderizado inicial
    if (drawingManager) {
        drawingManager.resizeCanvas();
    }

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
    }, 100);

    // --- FULLSCREEN MANAGER ---
    // Inicializar el gestor de pantalla completa
    const fullscreenManager = new FullscreenManager();
    
    // Hacer disponible globalmente para debugging y acceso desde otros módulos
    window.fullscreenManager = fullscreenManager;
    window.modeManager = modeManager; // También hacer disponible el modeManager
 
});