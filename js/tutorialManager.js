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
                overlayOpacity: 0.8,
                disableInteraction: false,
                tooltipClass: 'customTooltip',
                highlightClass: 'customHighlight',
                exitOnEsc: true,
                exitOnOverlayClick: false,
                keyboardNavigation: true
            });
            
            // Eventos del tutorial
            introJs().onchange((targetElement) => {
                this.handleStepChange(targetElement);
            });
            
            introJs().oncomplete(() => {
                this.handleTutorialComplete();
            });
            
            introJs().onexit(() => {
                this.handleTutorialExit();
            });
            
            console.log('[TutorialManager] Intro.js configurado');
        } else {
            console.error('[TutorialManager] Intro.js no está disponible');
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
        
        // Aplicar los pasos de tutorial específicos del modo
        if (window.applyTutorialSteps) {
            window.applyTutorialSteps(mode);
        }
        
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
        
        console.log(`[TutorialManager] Botones actualizados para modo: ${currentMode}`);
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
