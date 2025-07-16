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
        
        if (tutorialDrawingBtn) {
            tutorialDrawingBtn.addEventListener('click', () => {
                this.startTutorial('drawing');
            });
            console.log('[TutorialManager] Botón de tutorial de dibujo configurado');
        } else {
            console.warn('[TutorialManager] Botón de tutorial de dibujo no encontrado');
        }
        
        if (tutorialAnimationBtn) {
            tutorialAnimationBtn.addEventListener('click', () => {
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
        // Crear modal personalizado con diseño mejorado
        const modalHTML = `
            <div id="welcome-tutorial-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(8px);
                animation: fadeIn 0.3s ease-out;
            ">
                <div style="
                    background: linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 50%, #1a1a1a 100%);
                    border: 3px solid transparent;
                    background-clip: padding-box;
                    position: relative;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 550px;
                    width: 90%;
                    margin: 20px;
                    box-shadow: 
                        0 25px 50px rgba(0, 0, 0, 0.6),
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                    text-align: center;
                    color: white;
                    transform: scale(0.9);
                    animation: modalAppear 0.4s ease-out forwards;
                ">
                    <!-- Borde animado -->
                    <div style="
                        position: absolute;
                        top: -3px;
                        left: -3px;
                        right: -3px;
                        bottom: -3px;
                        background: linear-gradient(45deg, #17a2b8, #28a745, #ffc107, #dc3545, #6f42c1, #17a2b8);
                        background-size: 300% 300%;
                        border-radius: 20px;
                        z-index: -1;
                        animation: borderGlow 3s ease-in-out infinite;
                    "></div>
                    
                    <!-- Icono principal -->
                    <div style="
                        font-size: 64px;
                        margin-bottom: 25px;
                        background: linear-gradient(135deg, #17a2b8, #28a745, #ffc107);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
                        animation: iconBounce 2s ease-in-out infinite;
                    ">⚽</div>
                    
                    <!-- Título -->
                    <h2 style="
                        background: linear-gradient(135deg, #17a2b8, #20c997);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 20px;
                        font-weight: 700;
                        font-size: 28px;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    ">¡Bienvenido al Simulador Táctico!</h2>
                    
                    <!-- Subtítulo -->
                    <p style="
                        font-size: 18px;
                        line-height: 1.6;
                        margin-bottom: 30px;
                        color: #e8e8e8;
                        font-weight: 300;
                    ">
                        ¿Te gustaría hacer un <strong style="
                            color: #28a745;
                            font-weight: 600;
                            background: rgba(40, 167, 69, 0.1);
                            padding: 2px 6px;
                            border-radius: 4px;
                        ">tutorial interactivo</strong> 
                        para dominar todas las funciones?
                    </p>
                    
                    <!-- Panel de características -->
                    <div style="
                        background: linear-gradient(135deg, rgba(23, 162, 184, 0.15), rgba(40, 167, 69, 0.15));
                        border: 2px solid rgba(23, 162, 184, 0.3);
                        border-radius: 12px;
                        padding: 25px;
                        margin-bottom: 30px;
                        text-align: left;
                        backdrop-filter: blur(5px);
                    ">
                        <div style="
                            color: #17a2b8;
                            font-weight: 700;
                            margin-bottom: 15px;
                            font-size: 16px;
                            text-align: center;
                        ">
                            🎯 Aprenderás paso a paso:
                        </div>
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            font-size: 14px;
                            line-height: 1.8;
                            color: #b8b8b8;
                        ">
                            <div>⚽ Seleccionar jugadores</div>
                            <div>🎨 Dibujar tácticas</div>
                            <div>🎬 Crear animaciones</div>
                            <div>📤 Exportar jugadas</div>
                            <div>🔄 Cambiar modos</div>
                            <div>🏆 Tips profesionales</div>
                        </div>
                    </div>
                    
                    <!-- Botones de acción -->
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button id="start-tutorial-welcome" style="
                            background: linear-gradient(135deg, #28a745, #20c997);
                            color: white;
                            border: none;
                            padding: 16px 32px;
                            border-radius: 12px;
                            font-weight: 700;
                            cursor: pointer;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
                            position: relative;
                            overflow: hidden;
                            margin-right: 10px;
                        ">
                            <span style="position: relative; z-index: 2;">🎨 Tutorial Dibujo</span>
                        </button>
                        <button id="start-tutorial-animation-welcome" style="
                            background: linear-gradient(135deg, #007bff, #17a2b8);
                            color: white;
                            border: none;
                            padding: 16px 32px;
                            border-radius: 12px;
                            font-weight: 700;
                            cursor: pointer;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
                            position: relative;
                            overflow: hidden;
                        ">
                            <span style="position: relative; z-index: 2;">🎬 Tutorial Animación</span>
                        </button>
                        <button id="skip-tutorial-welcome" style="
                            background: linear-gradient(135deg, #6c757d, #495057);
                            color: white;
                            border: none;
                            padding: 16px 32px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
                        ">Ahora no</button>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.9); }
                }
                
                @keyframes modalAppear {
                    from { 
                        transform: scale(0.8) translateY(-20px);
                        opacity: 0;
                    }
                    to { 
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes borderGlow {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Event listeners
        document.getElementById('start-tutorial-welcome').addEventListener('click', () => {
            document.getElementById('welcome-tutorial-modal').remove();
            this.startTutorial('drawing');
        });
        
        document.getElementById('start-tutorial-animation-welcome').addEventListener('click', () => {
            document.getElementById('welcome-tutorial-modal').remove();
            this.startTutorial('animation');
        });
        
        document.getElementById('skip-tutorial-welcome').addEventListener('click', () => {
            const modal = document.getElementById('welcome-tutorial-modal');
            modal.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => modal.remove(), 300);
        });

        // Efectos hover mejorados
        const startBtn = document.getElementById('start-tutorial-welcome');
        const animationBtn = document.getElementById('start-tutorial-animation-welcome');
        const skipBtn = document.getElementById('skip-tutorial-welcome');
        
        startBtn.addEventListener('mouseenter', () => {
            startBtn.style.transform = 'translateY(-3px) scale(1.05)';
            startBtn.style.boxShadow = '0 12px 25px rgba(40, 167, 69, 0.6)';
        });
        
        startBtn.addEventListener('mouseleave', () => {
            startBtn.style.transform = 'translateY(0) scale(1)';
            startBtn.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.4)';
        });
        
        animationBtn.addEventListener('mouseenter', () => {
            animationBtn.style.transform = 'translateY(-3px) scale(1.05)';
            animationBtn.style.boxShadow = '0 12px 25px rgba(0, 123, 255, 0.6)';
        });
        
        animationBtn.addEventListener('mouseleave', () => {
            animationBtn.style.transform = 'translateY(0) scale(1)';
            animationBtn.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.4)';
        });
        
        skipBtn.addEventListener('mouseenter', () => {
            skipBtn.style.transform = 'translateY(-2px)';
            skipBtn.style.boxShadow = '0 8px 16px rgba(108, 117, 125, 0.5)';
        });
        
        skipBtn.addEventListener('mouseleave', () => {
            skipBtn.style.transform = 'translateY(0)';
            skipBtn.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
        });
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
