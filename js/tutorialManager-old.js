// tutorialManager.js
// Gestor del tutorial interactivo usando Intro.js

export default class TutorialManager {
    constructor() {
        this.isFirstVisit = this.checkFirstVisit();
        this.init();
    }
    
    init() {
        this.setupTutorialButton();
        this.configureTutorial();
        
        // Auto-iniciar tutorial en primera visita
        if (this.isFirstVisit) {
            setTimeout(() => {
                this.showWelcomeDialog();
            }, 2000); // Esperar 2 segundos para que cargue todo
        }
        
        console.log('[TutorialManager] Inicializado');
    }
    
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('fifa-tactics-visited');
        if (!hasVisited) {
            localStorage.setItem('fifa-tactics-visited', 'true');
            return true;
        }
        return false;
    }
    
    setupTutorialButton() {
        const tutorialDrawingBtn = document.getElementById('start-tutorial-drawing-btn');
        const tutorialAnimationBtn = document.getElementById('start-tutorial-animation-btn');
        
        console.log('[TutorialManager] Configurando botones de tutorial...');
        console.log('[TutorialManager] tutorialDrawingBtn:', tutorialDrawingBtn);
        console.log('[TutorialManager] tutorialAnimationBtn:', tutorialAnimationBtn);
        
        if (tutorialDrawingBtn) {
            tutorialDrawingBtn.addEventListener('click', (e) => {
                console.log('[TutorialManager] Click en botón de tutorial de dibujo detectado');
                e.preventDefault();
                e.stopPropagation();
                this.startTutorial('drawing');
            });
            console.log('[TutorialManager] Botón de tutorial de dibujo configurado');
        } else {
            console.warn('[TutorialManager] Botón de tutorial de dibujo no encontrado');
        }
        
        if (tutorialAnimationBtn) {
            tutorialAnimationBtn.addEventListener('click', (e) => {
                console.log('[TutorialManager] Click en botón de tutorial de animación detectado');
                e.preventDefault();
                e.stopPropagation();
                this.startTutorial('animation');
            });
            console.log('[TutorialManager] Botón de tutorial de animación configurado');
        } else {
            console.warn('[TutorialManager] Botón de tutorial de animación no encontrado');
        }
        
        // Controlar visibilidad de botones según el modo
        this.updateTutorialButtons();
        
        // Escuchar cambios de modo para actualizar botones
        document.addEventListener('modeChanged', () => {
            this.updateTutorialButtons();
        });
    }
    
    configureTutorial() {
        // Configuración personalizada de Intro.js
        if (typeof introJs !== 'undefined') {
            // Obtener tema actual
            const currentTheme = this.getCurrentTheme();
            const isDarkTheme = currentTheme === 'dark';
            
            introJs().setOptions({
                nextLabel: 'Siguiente →',
                prevLabel: '← Anterior',
                skipLabel: 'Saltar',
                doneLabel: '¡Terminado!',
                hidePrev: false,
                hideNext: false,
                showStepNumbers: true,
                showProgress: true,
                showBullets: false,
                scrollToElement: true,
                overlayOpacity: isDarkTheme ? 0.7 : 0.6,
                disableInteraction: false,
                tooltipClass: isDarkTheme ? 'customTooltip dark-theme' : 'customTooltip light-theme',
                highlightClass: 'customHighlight',
                exitOnEsc: true,
                exitOnOverlayClick: false,
                keyboardNavigation: true
            });
            
            // Eventos del tutorial
            introJs().onchange((targetElement) => {
                this.handleStepChange(targetElement);
                // Forzar estilos de contraste después de cada cambio
                setTimeout(() => {
                    this.forceTooltipStyles();
                }, 100);
            });
            
            introJs().oncomplete(() => {
                this.handleTutorialComplete();
            });
            
            introJs().onexit(() => {
                this.handleTutorialExit();
            });
            
            // Forzar estilos al inicio también
            introJs().onbeforechange(() => {
                setTimeout(() => {
                    this.forceTooltipStyles();
                }, 50);
            });
            
            console.log('[TutorialManager] Intro.js configurado');
        } else {
            console.error('[TutorialManager] Intro.js no está disponible');
        }
    }
    
    getCurrentTheme() {
        // Intentar obtener el tema del themeManager
        if (window.themeManager && window.themeManager.currentTheme) {
            return window.themeManager.currentTheme;
        }
        
        // Fallback: obtener del localStorage
        const savedTheme = localStorage.getItem('soccer-tactics-theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Fallback: detectar del atributo data-theme
        const htmlElement = document.documentElement;
        if (htmlElement.hasAttribute('data-theme')) {
            return htmlElement.getAttribute('data-theme');
        }
        
        // Default: modo oscuro
        return 'dark';
    }
    
    forceTooltipStyles() {
        // Forzar estilos de contraste mediante JavaScript
        const tooltip = document.querySelector('.introjs-tooltip');
        if (tooltip) {
            const currentTheme = this.getCurrentTheme();
            const isDarkTheme = currentTheme === 'dark';
            
            // Aplicar estilos directamente al elemento
            if (isDarkTheme) {
                tooltip.style.color = '#ffffff';
                tooltip.style.background = 'linear-gradient(135deg, rgba(42, 42, 42, 0.95), rgba(52, 58, 64, 0.95))';
            } else {
                tooltip.style.color = '#1a1a1a';
                tooltip.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 252, 255, 0.98))';
            }
            
            // Forzar color en el texto del tooltip
            const tooltipText = tooltip.querySelector('.introjs-tooltiptext');
            if (tooltipText) {
                tooltipText.style.color = isDarkTheme ? '#ffffff' : '#1a1a1a';
                tooltipText.style.textShadow = 'none';
            }
            
            // Forzar color en todos los elementos hijos
            const allElements = tooltip.querySelectorAll('*');
            allElements.forEach(element => {
                if (!element.classList.contains('introjs-button') && 
                    !element.classList.contains('introjs-skipbutton')) {
                    element.style.color = isDarkTheme ? '#ffffff' : '#1a1a1a';
                }
            });
            
            console.log('[TutorialManager] Estilos de tooltip forzados para tema:', currentTheme);
        }
    }
    
    showWelcomeDialog() {
        // Crear modal moderno con CSS avanzado y responsive design
        const modalHTML = `
            <div id="modern-tutorial-modal" class="tutorial-modal-overlay">
                <div class="tutorial-modal-container">
                    <div class="tutorial-modal-header">
                        <div class="tutorial-modal-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h2 class="tutorial-modal-title">¡Bienvenido al Simulador Táctico!</h2>
                        <button class="tutorial-modal-close" id="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="tutorial-modal-body">
                        <div class="tutorial-modal-content">
                            <div class="tutorial-feature-grid">
                                <div class="tutorial-feature-card">
                                    <div class="feature-icon">
                                        <i class="fas fa-palette"></i>
                                    </div>
                                    <h3>Modo Dibujo</h3>
                                    <p>Dibuja líneas, flechas y tácticas directamente en el campo</p>
                                </div>
                                
                                <div class="tutorial-feature-card">
                                    <div class="feature-icon">
                                        <i class="fas fa-play-circle"></i>
                                    </div>
                                    <h3>Modo Animación</h3>
                                    <p>Crea secuencias animadas moviendo jugadores frame por frame</p>
                                </div>
                                
                                <div class="tutorial-feature-card">
                                    <div class="feature-icon">
                                        <i class="fas fa-microphone"></i>
                                    </div>
                                    <h3>Audio Narración</h3>
                                    <p>Graba explicaciones de voz para tus jugadas tácticas</p>
                                </div>
                            </div>
                            
                            <div class="tutorial-mode-selector">
                                <h3>¿Qué te gustaría aprender primero?</h3>
                                <div class="tutorial-button-group">
                                    <button class="tutorial-start-btn tutorial-drawing-btn" data-mode="drawing">
                                        <i class="fas fa-palette"></i>
                                        <span>Tutorial de Dibujo</span>
                                        <small>Aprende a dibujar tácticas</small>
                                    </button>
                                    
                                    <button class="tutorial-start-btn tutorial-animation-btn" data-mode="animation">
                                        <i class="fas fa-play-circle"></i>
                                        <span>Tutorial de Animación</span>
                                        <small>Crea secuencias animadas</small>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-modal-footer">
                        <div class="tutorial-skip-section">
                            <button class="tutorial-skip-btn" id="skip-tutorial-btn">
                                Saltar y explorar por mi cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar event listeners
        this.setupModalEventListeners();
        
        // Animar entrada del modal
        requestAnimationFrame(() => {
            const modal = document.getElementById('modern-tutorial-modal');
            if (modal) {
                modal.classList.add('show');
            }
        });
    }
    
    setupModalEventListeners() {
        const modal = document.getElementById('modern-tutorial-modal');
        if (!modal) return;
        
        const closeBtn = document.getElementById('modal-close-btn');
        const skipBtn = document.getElementById('skip-tutorial-btn');
        const drawingBtn = modal.querySelector('.tutorial-drawing-btn');
        const animationBtn = modal.querySelector('.tutorial-animation-btn');
        
        // Cerrar modal
        const closeModal = () => {
            modal.classList.remove('show');
            modal.classList.add('hide');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        };
        
        // Event listeners
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', closeModal);
        }
        
        // Click fuera del modal para cerrar
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Botones de inicio de tutorial
        if (drawingBtn) {
            drawingBtn.addEventListener('click', () => {
                closeModal();
                setTimeout(() => {
                    this.startTutorial('drawing');
                }, 350);
            });
        }
        
        if (animationBtn) {
            animationBtn.addEventListener('click', () => {
                closeModal();
                setTimeout(() => {
                    this.startTutorial('animation');
                }, 350);
            });
        }
        
        // Atajos de teclado
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
    }
    
    startTutorial(mode = 'drawing') {
        console.log(`[TutorialManager] Iniciando tutorial de: ${mode}`);
        
        // Configurar tutorial con tema actual
        this.configureTutorial();
        
        // Aplicar los pasos de tutorial específicos del modo
        this.applyModeSpecificTutorialSteps(mode);
        
        // Cambiar al modo correspondiente
        const modeManager = window.modeManager;
        if (modeManager) {
            if (mode === 'drawing') {
                modeManager.switchToMode('drawing');
            } else if (mode === 'animation') {
                modeManager.switchToMode('animation');
            }
        }
        
        // Guardar el modo del tutorial actual
        this.currentTutorialMode = mode;
        
        // Iniciar Intro.js
        if (typeof introJs !== 'undefined') {
            introJs().start();
        } else {
            alert('Error: La librería de tutorial no está disponible.');
        }
    }
    
    applyModeSpecificTutorialSteps(mode) {
        // Limpiar cualquier configuración anterior
        this.clearPreviousTutorialData();
        
        if (mode === 'drawing') {
            this.setupDrawingTutorialSteps();
        } else if (mode === 'animation') {
            this.setupAnimationTutorialSteps();
        }
    }
    
    clearPreviousTutorialData() {
        // Remover atributos de tutorial de todos los elementos
        const elementsWithTutorial = document.querySelectorAll('[data-intro], [data-step]');
        elementsWithTutorial.forEach(element => {
            element.removeAttribute('data-intro');
            element.removeAttribute('data-step');
        });
    }
    
    setupDrawingTutorialSteps() {
        console.log('[TutorialManager] Configurando pasos del tutorial de DIBUJO');
        
        // Todos los elementos del modo dibujo con mensajes mejorados
        const drawingElements = [
            {
                selector: '#pitch-container',
                intro: '🎨 <strong>¡Bienvenido al MODO DIBUJO!</strong><br>Este es tu lienzo táctico donde puedes crear estrategias dibujando líneas, flechas y movimientos directamente sobre el campo.',
                step: '1'
            },
            {
                selector: '#drawing-canvas',
                intro: '🎯 <strong>¡DIBUJA AQUÍ!</strong><br>Haz <strong>CLIC y ARRASTRA</strong> sobre el campo para crear líneas tácticas. Puedes dibujar:<br>• Pases entre jugadores<br>• Movimientos de jugadores<br>• Estrategias de ataque<br>• Coberturas defensivas',
                step: '2'
            },
            {
                selector: '#drawing-mode-controls',
                intro: '🛠️ <strong>BARRA DE HERRAMIENTAS DE DIBUJO</strong><br>Aquí tienes todos los controles para crear y personalizar tus líneas tácticas. Exploraremos cada herramienta paso a paso.',
                step: '3'
            },
            {
                selector: '#undo-line',
                intro: '↩️ <strong>DESHACER</strong><br>Elimina la <strong>última línea</strong> que dibujaste. Perfecto para corregir errores rápidamente sin afectar el resto de tu táctica.',
                step: '4'
            },
            {
                selector: '#redo-line',
                intro: '↪️ <strong>REHACER</strong><br>Restaura una línea que acabas de deshacer. Útil si cambias de opinión después de usar el botón anterior.',
                step: '5'
            },
            {
                selector: '#clear-canvas',
                intro: '🧽 <strong>LIMPIAR TODO</strong><br>Borra <strong>TODAS</strong> las líneas del campo de una vez. Ideal para empezar una nueva táctica desde cero. <em>¡Cuidado! Esta acción no se puede deshacer.</em>',
                step: '6'
            },
            {
                selector: '#line-color-picker',
                intro: '🎨 <strong>SELECTOR DE COLOR</strong><br>Cambia el color de las líneas que dibujas. Usa diferentes colores para:<br>• <span style="color: #ffff00;">Amarillo</span> - Movimientos ofensivos<br>• <span style="color: #ff0000;">Rojo</span> - Marcaje defensivo<br>• <span style="color: #00ff00;">Verde</span> - Pases largos<br>• <span style="color: #0000ff;">Azul</span> - Movimientos de apoyo',
                step: '7'
            },
            {
                selector: '#line-width-picker',
                intro: '📏 <strong>GROSOR DE LÍNEA</strong><br>Ajusta el <strong>grosor</strong> de las líneas según la importancia:<br>• Líneas finas (2-4px) - Movimientos secundarios<br>• Líneas medianas (6-8px) - Jugadas principales<br>• Líneas gruesas (12px) - Jugadas clave o primarias',
                step: '8'
            },
            {
                selector: '#delete-line-mode',
                intro: '✂️ <strong>MODO TIJERAS</strong><br>Activa el <strong>borrador selectivo</strong>. Después de hacer clic aquí:<br>1. Tu cursor se convertirá en tijeras<br>2. Haz clic en cualquier línea para eliminarla<br>3. Haz clic de nuevo en este botón para salir del modo',
                step: '9'
            },
            {
                selector: '#share-pitch-btn',
                intro: '📤 <strong>COMPARTIR TÁCTICA</strong><br>Exporta tu táctica como <strong>imagen de alta calidad</strong>. Perfecto para:<br>• Enviar a tu equipo por WhatsApp<br>• Presentar en reuniones técnicas<br>• Guardar en tu biblioteca táctica<br>• Compartir en redes sociales',
                step: '10'
            }
        ];
        
        this.applyTutorialElements(drawingElements);
    }
    
    setupAnimationTutorialSteps() {
        console.log('[TutorialManager] Configurando pasos del tutorial de ANIMACIÓN');
        
        // Todos los elementos del modo animación con mensajes mejorados
        const animationElements = [
            {
                selector: '#pitch-container',
                intro: '🎬 <strong>¡Bienvenido al MODO ANIMACIÓN!</strong><br>Aquí puedes crear <strong>secuencias de movimiento</strong> dinámicas y reproducir tus tácticas como si fueran una película. ¡Dale vida a tus estrategias!',
                step: '1'
            },
            {
                selector: '#animation-mode-controls',
                intro: '🎮 <strong>CENTRO DE CONTROL DE ANIMACIÓN</strong><br>Esta es tu consola principal para crear, editar y reproducir animaciones tácticas. Vamos a explorar cada herramienta paso a paso.',
                step: '2'
            },
            {
                selector: '#record-mode-toggle',
                intro: '🔴 <strong>MODO GRABACIÓN</strong><br>Activa la <strong>grabación automática</strong>. Una vez activado:<br>• Mueve cualquier jugador en el campo<br>• Sus posiciones se guardarán automáticamente<br>• Cada movimiento creará un nuevo frame<br>• El botón se pondrá rojo cuando esté grabando',
                step: '3'
            },
            {
                selector: '#frame-add',
                intro: '➕ <strong>CREAR NUEVO FRAME</strong><br>Crea un <strong>frame manual</strong> con las posiciones actuales de los jugadores. Esto es útil para:<br>• Capturar momentos específicos<br>• Crear pausas en la animación<br>• Marcar posiciones importantes en la jugada',
                step: '4'
            },
            {
                selector: '#frame-prev',
                intro: '⏮️ <strong>FRAME ANTERIOR</strong><br>Navega al frame <strong>anterior</strong> de tu animación. Te permite:<br>• Revisar pasos previos<br>• Editar frames anteriores<br>• Verificar la secuencia de movimientos<br>• Corregir errores en frames específicos',
                step: '5'
            },
            {
                selector: '#frame-indicator',
                intro: '📊 <strong>INDICADOR DE FRAMES</strong><br>Muestra tu posición actual en la animación (ej: <strong>3/5</strong>):<br>• Primer número = Frame actual<br>• Segundo número = Total de frames<br>• Te ayuda a ubicarte en la secuencia<br>• Es tu "cronómetro" visual de la animación',
                step: '6'
            },
            {
                selector: '#frame-next',
                intro: '⏭️ <strong>FRAME SIGUIENTE</strong><br>Avanza al <strong>siguiente frame</strong> de tu animación. Perfecto para:<br>• Revisar la secuencia completa<br>• Reproducir paso a paso<br>• Verificar transiciones entre frames<br>• Hacer ajustes precisos',
                step: '7'
            },
            {
                selector: '#frame-delete',
                intro: '🗑️ <strong>ELIMINAR FRAME</strong><br>Borra el <strong>frame actual</strong> de la animación. <em>¡Cuidado!</em><br>• Esta acción no se puede deshacer<br>• Solo afecta al frame que estás viendo<br>• Los otros frames permanecen intactos<br>• Útil para corregir errores específicos',
                step: '8'
            },
            {
                selector: '#frame-play',
                intro: '▶️ <strong>REPRODUCIR ANIMACIÓN</strong><br>¡Reproduce toda tu <strong>secuencia táctica</strong>! Verás:<br>• Los jugadores moviéndose automáticamente<br>• Las transiciones entre frames<br>• Tu táctica en movimiento completo<br>• Una vista previa del resultado final',
                step: '9'
            },
            {
                selector: '#audio-record-btn',
                intro: '🎤 <strong>GRABAR NARRACIÓN</strong><br>Graba tu <strong>voz explicando la táctica</strong>. Ideal para:<br>• Explicar cada movimiento<br>• Dar instrucciones al equipo<br>• Crear contenido educativo<br>• Añadir contexto profesional a tus animaciones',
                step: '10'
            },
            {
                selector: '#audio-play-btn',
                intro: '🔊 <strong>REPRODUCIR AUDIO</strong><br>Escucha la <strong>narración grabada</strong>. Te permite:<br>• Verificar la calidad del audio<br>• Sincronizar voz con movimientos<br>• Revisar las explicaciones<br>• Hacer ajustes antes de exportar',
                step: '11'
            },
            {
                selector: '#export-animation-json',
                intro: '💾 <strong>EXPORTAR COMO JSON</strong><br>Guarda tu animación en <strong>formato digital</strong>. Incluye:<br>• Todos los frames y posiciones<br>• Audio grabado (si existe)<br>• Configuraciones de la animación<br>• Perfecto para backup y compartir datos',
                step: '12'
            },
            {
                selector: '#export-animation-video',
                intro: '🎥 <strong>CREAR VIDEO MP4</strong><br>Exporta tu animación como <strong>video profesional</strong>. Ideal para:<br>• WhatsApp y redes sociales<br>• Presentaciones en reuniones<br>• Contenido para YouTube/Instagram<br>• Compartir con jugadores y cuerpo técnico',
                step: '13'
            },
            {
                selector: '#reset-animation',
                intro: '🔄 <strong>REINICIAR ANIMACIÓN</strong><br>Borra <strong>TODA</strong> la animación y vuelve al frame inicial. <em>¡ATENCIÓN!</em><br>• Se perderán todos los frames<br>• Se eliminará el audio grabado<br>• Regresarás al estado inicial<br>• Úsalo solo para empezar desde cero',
                step: '14'
            }
        ];
        
        this.applyTutorialElements(animationElements);
    }
    
    applyTutorialElements(elements) {
        elements.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element) {
                element.setAttribute('data-intro', item.intro);
                element.setAttribute('data-step', item.step);
            } else {
                console.warn(`[TutorialManager] Elemento no encontrado: ${item.selector}`);
            }
        });
    }
    
    handleStepChange(targetElement) {
        const step = targetElement.getAttribute('data-step');
        console.log(`[TutorialManager] Paso ${step}: ${targetElement.id} - Modo: ${this.currentTutorialMode}`);

        // Helper para deshabilitar/rehabilitar el botón siguiente
        function setNextEnabled(enabled) {
            const nextBtn = document.querySelector('.introjs-nextbutton');
            if (nextBtn) {
                nextBtn.disabled = !enabled;
                nextBtn.classList.toggle('disabled', !enabled);
                
                if (!enabled) {
                    nextBtn.innerHTML = '🔒 Realiza la acción primero';
                } else {
                    nextBtn.innerHTML = 'Siguiente →';
                }
            }
        }

        // Verificar si el elemento está visible
        function isElementVisible(element) {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }

        // Manejar pasos interactivos según el modo del tutorial
        if (this.currentTutorialMode === 'drawing') {
            this.handleDrawingTutorialStep(step, targetElement, setNextEnabled, isElementVisible);
        } else if (this.currentTutorialMode === 'animation') {
            this.handleAnimationTutorialStep(step, targetElement, setNextEnabled, isElementVisible);
        }
    }
    
    handleDrawingTutorialStep(step, targetElement, setNextEnabled, isElementVisible) {
        switch (step) {
            case '2': // Selección de jugadores
                setNextEnabled(false);
                const playerList = document.getElementById('player-selection-list');
                if (playerList) {
                    const handler = () => {
                        if (window.state && window.state.activePlayers && window.state.activePlayers.length > 0) {
                            setNextEnabled(true);
                            playerList.removeEventListener('click', handler);
                        }
                    };
                    playerList.addEventListener('click', handler);
                }
                break;

            case '12': // Dibujar línea
                setNextEnabled(false);
                const drawingCanvas = document.getElementById('drawing-canvas');
                if (drawingCanvas) {
                    const handler = () => {
                        setNextEnabled(true);
                        drawingCanvas.removeEventListener('mousedown', handler);
                        drawingCanvas.removeEventListener('touchstart', handler);
                    };
                    drawingCanvas.addEventListener('mousedown', handler);
                    drawingCanvas.addEventListener('touchstart', handler);
                }
                break;
        }
    }
    
    handleAnimationTutorialStep(step, targetElement, setNextEnabled, isElementVisible) {
        switch (step) {
            case '2': // Selección de jugadores
                setNextEnabled(false);
                const playerList = document.getElementById('player-selection-list');
                if (playerList) {
                    const handler = () => {
                        if (window.state && window.state.activePlayers && window.state.activePlayers.length > 0) {
                            setNextEnabled(true);
                            playerList.removeEventListener('click', handler);
                        }
                    };
                    playerList.addEventListener('click', handler);
                }
                break;

            case '8': // Agregar frame
                setNextEnabled(false);
                const addFrameBtn = document.getElementById('frame-add');
                if (addFrameBtn && isElementVisible(addFrameBtn)) {
                    const handler = () => {
                        setTimeout(() => setNextEnabled(true), 500);
                        addFrameBtn.removeEventListener('click', handler);
                    };
                    addFrameBtn.addEventListener('click', handler);
                } else {
                    setNextEnabled(true);
                }
                break;

            case '9': // Reproducir animación
                setNextEnabled(false);
                const playBtn = document.getElementById('frame-play');
                if (playBtn && isElementVisible(playBtn)) {
                    const handler = () => {
                        setTimeout(() => setNextEnabled(true), 1000);
                        playBtn.removeEventListener('click', handler);
                    };
                    playBtn.addEventListener('click', handler);
                } else {
                    setNextEnabled(true);
                }
                break;

            case '10': // Activar grabación
                setNextEnabled(false);
                const recordBtn = document.getElementById('record-mode-toggle');
                if (recordBtn && isElementVisible(recordBtn)) {
                    const handler = () => {
                        setTimeout(() => setNextEnabled(true), 300);
                        recordBtn.removeEventListener('click', handler);
                    };
                    recordBtn.addEventListener('click', handler);
                } else {
                    setNextEnabled(true);
                }
                break;

            case '11': // Exportar animación
                setNextEnabled(false);
                const exportBtn = document.getElementById('export-animation-json');
                if (exportBtn && isElementVisible(exportBtn)) {
                    const handler = () => {
                        setTimeout(() => setNextEnabled(true), 500);
                        exportBtn.removeEventListener('click', handler);
                    };
                    exportBtn.addEventListener('click', handler);
                } else {
                    setNextEnabled(true);
                }
                break;
        }
    }
    
    handleTutorialComplete() {
        console.log(`[TutorialManager] Tutorial completado: ${this.currentTutorialMode}`);
        
        // Mensaje de felicitación específico del modo
        setTimeout(() => {
            let message = "🎉 ¡Felicitaciones! Has completado el tutorial";
            
            if (this.currentTutorialMode === 'drawing') {
                message += " de DIBUJO.\n\n" +
                    "Ahora ya sabes cómo:\n" +
                    "✅ Seleccionar jugadores y formaciones\n" +
                    "✅ Dibujar líneas tácticas\n" +
                    "✅ Usar herramientas de dibujo\n" +
                    "✅ Exportar y compartir tácticas\n\n" +
                    "💡 Consejo: Prueba también el Tutorial de Animación para crear jugadas en movimiento.";
            } else if (this.currentTutorialMode === 'animation') {
                message += " de ANIMACIÓN.\n\n" +
                    "Ahora ya sabes cómo:\n" +
                    "✅ Crear frames de animación\n" +
                    "✅ Reproducir secuencias de movimiento\n" +
                    "✅ Usar el modo de grabación\n" +
                    "✅ Exportar animaciones\n\n" +
                    "💡 Consejo: Combina el modo Dibujo con Animación para crear tácticas completas.";
            }
            
            message += "\n\n¡Empieza a crear tus propias jugadas!";
            
            alert(message);
        }, 500);
        
        // Marcar tutorial como completado
        localStorage.setItem(`fifa-tactics-tutorial-${this.currentTutorialMode}-completed`, 'true');
    }
    
    handleTutorialExit() {
        console.log(`[TutorialManager] Tutorial salido/cancelado: ${this.currentTutorialMode}`);
        
        // Limpiar atributos de tutorial
        document.querySelectorAll('[data-intro]').forEach(element => {
            element.removeAttribute('data-intro');
            element.removeAttribute('data-step');
        });
        
        this.currentTutorialMode = null;
    }
    
    // Método para reiniciar el tutorial manualmente
    resetTutorial() {
        localStorage.removeItem('fifa-tactics-visited');
        localStorage.removeItem('fifa-tactics-tutorial-completed');
        console.log('[TutorialManager] Tutorial reiniciado');
    }
    
    // Método para mostrar ayuda contextual
    showQuickHelp(mode = 'drawing') {
        let helpText = '';
        
        if (mode === 'drawing') {
            helpText = `
📝 MODO DIBUJO - Ayuda Rápida:

🎨 DIBUJAR: Haz clic y arrastra en el campo para dibujar líneas
👥 JUGADORES: Usa el botón de usuarios para seleccionar tu plantilla
⚽ FORMACIÓN: Elige una táctica predefinida del selector
🎨 COLOR: Cambia el color de las líneas con el selector
📏 GROSOR: Ajusta el grosor de las líneas
↩️ DESHACER: Usa los botones de deshacer/rehacer
🗑️ LIMPIAR: Borra todas las líneas con el botón amarillo
✂️ BORRAR: Activa modo borrador para eliminar líneas específicas
📤 COMPARTIR: Exporta tu táctica como imagen
            `;
        } else {
            helpText = `
🎬 MODO ANIMACIÓN - Ayuda Rápida:

🎞️ FRAMES: Cada frame captura las posiciones de los jugadores
➕ CREAR: Añade nuevos frames con el botón +
⏮️⏭️ NAVEGAR: Usa los botones de anterior/siguiente
▶️ REPRODUCIR: Ve tu animación en movimiento
🔴 GRABAR: Activa grabación para capturar movimientos automáticamente
📊 CONTADOR: Muestra frame actual (ej: 3/5)
💾 EXPORTAR: Guarda tu animación como archivo JSON
🗑️ RESET: Borra toda la animación
            `;
        }
        
        alert(helpText);
    }
    
    updateTutorialButtons() {
        const modeManager = window.modeManager;
        const currentMode = modeManager ? modeManager.currentMode : 'drawing';
        
        const drawingBtn = document.getElementById('start-tutorial-drawing-btn');
        const animationBtn = document.getElementById('start-tutorial-animation-btn');
        
        if (drawingBtn && animationBtn) {
            if (currentMode === 'drawing') {
                drawingBtn.classList.remove('hidden');
                animationBtn.classList.add('hidden');
            } else if (currentMode === 'animation') {
                drawingBtn.classList.add('hidden');
                animationBtn.classList.remove('hidden');
            }
        }
        
        console.log(`[TutorialManager] Botones de tutorial actualizados para modo: ${currentMode}`);
    }
}

// Funciones globales para acceso desde consola (debugging)
window.startTutorial = function(mode = 'drawing') {
    if (window.tutorialManager) {
        window.tutorialManager.startTutorial(mode);
    }
};

window.startDrawingTutorial = function() {
    if (window.tutorialManager) {
        window.tutorialManager.startTutorial('drawing');
    }
};

window.startAnimationTutorial = function() {
    if (window.tutorialManager) {
        window.tutorialManager.startTutorial('animation');
    }
};

window.resetTutorial = function() {
    if (window.tutorialManager) {
        window.tutorialManager.resetTutorial();
    }
};
