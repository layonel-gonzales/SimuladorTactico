// tutorialManager.js
// Gestor del tutorial interactivo usando Shepherd.js (Mucho mejor que Intro.js)

export default class TutorialManager {
    constructor() {
        this.isFirstVisit = this.checkFirstVisit();
        this.currentTour = null;
        
        // Esperar a que todo esté cargado antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.init(), 1000); // Delay adicional para asegurar carga de CDN
            });
        } else {
            setTimeout(() => this.init(), 1000);
        }
    }
    
    init() {
        // El sistema simple siempre está disponible
        console.log('[TutorialManager] ✅ Sistema de tutorial simple cargado');
        this.setupTutorialButton();
        
        // NO auto-iniciar tutorial - remover modal de bienvenida
        // El tutorial solo se iniciará cuando el usuario haga clic en los botones
    }

    // Método para esperar a que Shepherd esté disponible
    waitForShepherd(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkShepherd = () => {
                if (typeof window.Shepherd !== 'undefined') {
                    resolve();
                    return;
                }
                
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Shepherd.js no se cargó en el tiempo esperado'));
                    return;
                }
                
                setTimeout(checkShepherd, 100);
            };
            
            checkShepherd();
        });
    }

    // Cargar Shepherd.js manualmente si no está disponible
    loadShepherdManually() {
        console.log('[TutorialManager] 🔄 Intentando cargar Shepherd.js manualmente...');
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/shepherd.js@12.0.6/dist/js/shepherd.min.js';
        script.onload = () => {
            console.log('[TutorialManager] ✅ Shepherd.js cargado manualmente');
            this.setupTutorialButton();
            if (this.isFirstVisit) {
                setTimeout(() => this.showWelcomeDialog(), 1000);
            }
        };
        script.onerror = () => {
            console.error('[TutorialManager] ❌ Error al cargar Shepherd.js manualmente');
        };
        
        document.head.appendChild(script);
    }
    
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('fifa-tactics-visited');
        if (!hasVisited) {
            localStorage.setItem('fifa-tactics-visited', 'true');
            return true;
        }
        // Para pruebas, forzar primera visita
        return true; // Cambiar a false cuando funcione
    }
    
    setupTutorialButton() {
        const tutorialDrawingBtn = document.getElementById('start-tutorial-drawing-btn');
        const tutorialAnimationBtn = document.getElementById('start-tutorial-animation-btn');
        
        console.log('[TutorialManager] Configurando botones de tutorial...');
        
        if (tutorialDrawingBtn) {
            tutorialDrawingBtn.addEventListener('click', (e) => {
                console.log('[TutorialManager] Iniciando tutorial de dibujo');
                e.preventDefault();
                e.stopPropagation();
                this.startTutorial('drawing');
            });
        }
        
        if (tutorialAnimationBtn) {
            tutorialAnimationBtn.addEventListener('click', (e) => {
                console.log('[TutorialManager] Iniciando tutorial de animación');
                e.preventDefault();
                e.stopPropagation();
                this.startTutorial('animation');
            });
        }
        
        // Escuchar cambios de modo para mostrar/ocultar botones
        document.addEventListener('modeChanged', () => {
            this.updateTutorialButtons();
        });
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
        
        // Default: modo claro
        return 'light';
    }
    
    startTutorial(mode = 'drawing') {
        // El sistema simple siempre está disponible
        console.log(`[TutorialManager] 🚀 Iniciando tutorial para modo: ${mode}`);
        
        // Limpiar tutorial anterior si existe
        if (this.currentTour) {
            this.currentTour.complete();
        }
        
        // Crear nuevo tour con configuración personalizada
        this.currentTour = new window.Shepherd.Tour({
            defaultStepOptions: {
                classes: 'shepherd-theme-custom',
                scrollTo: true,
                cancelIcon: {
                    enabled: true
                }
            }
        });
        
        console.log(`[TutorialManager] Iniciando tutorial de ${mode}`);
        
        if (mode === 'drawing') {
            this.setupDrawingTutorial();
        } else if (mode === 'animation') {
            this.setupAnimationTutorial();
        }
        
        // Iniciar el tour
        this.currentTour.start();
    }
    
    setupDrawingTutorial() {
        const steps = this.getDrawingSteps();
        steps.forEach(step => {
            this.currentTour.addStep(step);
        });
    }
    
    setupAnimationTutorial() {
        const steps = this.getAnimationSteps();
        steps.forEach(step => {
            this.currentTour.addStep(step);
        });
    }
    
    getDrawingSteps() {
        return [
            {
                title: '↩️ Deshacer Línea',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Deshace la última línea dibujada</p>
                        <p><em>Útil para:</em> Corregir errores al dibujar</p>
                        <p>🎯 <strong>Tip:</strong> También puedes usar <kbd>Ctrl+Z</kbd></p>
                    </div>
                `,
                attachTo: {
                    element: '#undo-line',
                    on: 'top'
                },
                buttons: [
                    {
                        text: 'Saltar Tutorial',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.complete()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '↪️ Rehacer Línea',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Rehace una línea que hayas deshecho</p>
                        <p><em>Útil para:</em> Recuperar líneas que deshiciste por error</p>
                        <p>🎯 <strong>Tip:</strong> También puedes usar <kbd>Ctrl+Y</kbd></p>
                    </div>
                `,
                attachTo: {
                    element: '#redo-line',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🗑️ Limpiar Todo',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Borra todas las líneas del campo</p>
                        <p><em>Útil para:</em> Empezar de nuevo con un campo limpio</p>
                        <p>⚠️ <strong>Cuidado:</strong> Esta acción no se puede deshacer</p>
                    </div>
                `,
                attachTo: {
                    element: '#clear-canvas',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🎨 Selector de Color',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Cambia el color de las líneas que dibujes</p>
                        <p><em>Colores disponibles:</em> Rojo, azul, verde, amarillo, etc.</p>
                        <p>🌈 <strong>Tip:</strong> Usa diferentes colores para distinguir tipos de jugadas</p>
                    </div>
                `,
                attachTo: {
                    element: '#line-color-picker',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '📏 Grosor de Línea',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Ajusta el grosor de las líneas</p>
                        <p><em>Opciones:</em> Fino, normal, grueso</p>
                        <p>📝 <strong>Tip:</strong> Líneas gruesas para jugadas principales, finas para detalles</p>
                    </div>
                `,
                attachTo: {
                    element: '#line-width-picker',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '✂️ Cortar Líneas',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Elimina líneas específicas haciendo clic en ellas</p>
                        <p><em>Útil para:</em> Borrar solo una línea sin afectar las demás</p>
                        <p>🎯 <strong>Tip:</strong> Más preciso que limpiar todo el campo</p>
                    </div>
                `,
                attachTo: {
                    element: '#delete-line-mode',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '📸 Compartir Imagen',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Exporta y comparte tu táctica como imagen</p>
                        <p><em>Útil para:</em> Enviar tu táctica al equipo o entrenador</p>
                        <p>📱 <strong>Tip:</strong> Perfecto para WhatsApp, email o redes sociales</p>
                    </div>
                `,
                attachTo: {
                    element: '#share-pitch-btn',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: '¡Terminar! 🎉',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.complete()
                    }
                ]
            }
        ];
    }
    
    getAnimationSteps() {
        return [
            {
                title: '🔴 Grabar Movimientos',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Activa el modo grabación para capturar movimientos</p>
                        <p><em>Útil para:</em> Registrar automáticamente las posiciones de los jugadores</p>
                        <p>🎯 <strong>Tip:</strong> Una vez activado, mueve jugadores y se grabarán automáticamente</p>
                    </div>
                `,
                attachTo: {
                    element: '#record-mode-toggle',
                    on: 'top'
                },
                buttons: [
                    {
                        text: 'Saltar Tutorial',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.complete()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '➕ Nuevo Frame',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Crea un nuevo frame capturando las posiciones actuales</p>
                        <p><em>Útil para:</em> Construir secuencias de animación paso a paso</p>
                        <p>📹 <strong>Tip:</strong> Cada frame es como una foto de tu táctica en un momento específico</p>
                    </div>
                `,
                attachTo: {
                    element: '#frame-add',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '⏮️ Frame Anterior',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Navega al frame anterior en tu secuencia</p>
                        <p><em>Útil para:</em> Revisar y editar frames previos de la animación</p>
                        <p>🎬 <strong>Tip:</strong> Perfecto para revisar el flujo de tu táctica paso a paso</p>
                    </div>
                `,
                attachTo: {
                    element: '#frame-prev',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '📊 Indicador de Frame',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Muestra tu posición actual en la secuencia de animación</p>
                        <p><em>Formato:</em> "Frame actual / Total de frames" (ej: 3/7)</p>
                        <p>📍 <strong>Tip:</strong> Te ayuda a orientarte en animaciones largas y complejas</p>
                    </div>
                `,
                attachTo: {
                    element: '#frame-indicator',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '⏭️ Frame Siguiente',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Navega al siguiente frame en tu secuencia</p>
                        <p><em>Útil para:</em> Avanzar manualmente frame por frame</p>
                        <p>🎯 <strong>Tip:</strong> Ideal para verificar que la secuencia fluye correctamente</p>
                    </div>
                `,
                attachTo: {
                    element: '#frame-next',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🗑️ Eliminar Frame',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Elimina el frame actual de la animación</p>
                        <p><em>Útil para:</em> Remover frames erróneos o innecesarios</p>
                        <p>⚠️ <strong>Cuidado:</strong> Esta acción no se puede deshacer</p>
                    </div>
                `,
                attachTo: {
                    element: '#frame-delete',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '▶️ Reproducir Animación',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Reproduce toda la secuencia de animación</p>
                        <p><em>Útil para:</em> Ver el resultado final de tu táctica en movimiento</p>
                        <p>🎬 <strong>Tip:</strong> ¡Aquí es donde cobran vida tus movimientos tácticos!</p>
                    </div>
                `,
                attachTo: {
                    element: '#frame-play',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🎤 Grabar Audio',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Graba una narración de audio para tu animación</p>
                        <p><em>Útil para:</em> Explicar la táctica mientras se reproduce</p>
                        <p>🎙️ <strong>Tip:</strong> Perfecto para crear tutoriales tácticos completos</p>
                    </div>
                `,
                attachTo: {
                    element: '#audio-record-btn',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🔊 Reproducir Audio',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Reproduce el audio grabado para tu animación</p>
                        <p><em>Útil para:</em> Escuchar tu narración antes de exportar</p>
                        <p>🎧 <strong>Tip:</strong> Verifica que el audio sincroniza bien con la animación</p>
                    </div>
                `,
                attachTo: {
                    element: '#audio-play-btn',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '💾 Exportar JSON',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Exporta tu animación como archivo JSON</p>
                        <p><em>Útil para:</em> Guardar y compartir animaciones completas (incluye audio)</p>
                        <p>📁 <strong>Tip:</strong> Formato perfecto para importar en otras sesiones</p>
                    </div>
                `,
                attachTo: {
                    element: '#export-animation-json',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🎬 Exportar Video',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Exporta tu animación como video MP4</p>
                        <p><em>Útil para:</em> Compartir en redes sociales, WhatsApp, etc.</p>
                        <p>📱 <strong>Tip:</strong> Ideal para mostrar tácticas a jugadores y colegas</p>
                    </div>
                `,
                attachTo: {
                    element: '#export-animation-video',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: 'Siguiente →',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.next()
                    }
                ]
            },
            {
                title: '🔄 Reset Animación',
                text: `
                    <div class="tutorial-content">
                        <p><strong>Función:</strong> Borra toda la animación y vuelve al frame inicial</p>
                        <p><em>Útil para:</em> Empezar de nuevo con una animación limpia</p>
                        <p>⚠️ <strong>Cuidado:</strong> Se perderán todos los frames y el audio grabado</p>
                    </div>
                `,
                attachTo: {
                    element: '#reset-animation',
                    on: 'top'
                },
                buttons: [
                    {
                        text: '← Anterior',
                        classes: 'shepherd-button-secondary',
                        action: () => this.currentTour.back()
                    },
                    {
                        text: '¡Terminar! 🎉',
                        classes: 'shepherd-button-primary',
                        action: () => this.currentTour.complete()
                    }
                ]
            }
        ];
    }
    
    updateTutorialButtons() {
        const currentMode = this.getCurrentMode();
        const tutorialDrawingBtn = document.getElementById('start-tutorial-drawing-btn');
        const tutorialAnimationBtn = document.getElementById('start-tutorial-animation-btn');
        
        if (tutorialDrawingBtn && tutorialAnimationBtn) {
            if (currentMode === 'drawing') {
                tutorialDrawingBtn.classList.remove('hidden');
                tutorialAnimationBtn.classList.add('hidden');
            } else if (currentMode === 'animation') {
                tutorialDrawingBtn.classList.add('hidden');
                tutorialAnimationBtn.classList.remove('hidden');
            }
        }
    }
    
    getCurrentMode() {
        // Detectar el modo actual basado en los controles visibles
        const drawingControls = document.getElementById('drawing-mode-controls');
        const animationControls = document.getElementById('animation-mode-controls');
        
        if (drawingControls && !drawingControls.classList.contains('hidden')) {
            return 'drawing';
        } else if (animationControls && !animationControls.classList.contains('hidden')) {
            return 'animation';
        }
        
        return 'drawing'; // default
    }
    
    showWelcomeDialog() {
        console.log('[TutorialManager] 🎉 Mostrando modal de bienvenida');

        // Modal de bienvenida (mantenemos el diseño anterior)
        const modalHTML = `
            <div id="modern-tutorial-modal" class="tutorial-modal-overlay">
                <div class="tutorial-modal-container">
                    <div class="tutorial-modal-header">
                        <div class="tutorial-modal-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h2 class="tutorial-modal-title">¡Bienvenido!</h2>
                        <button class="tutorial-modal-close" onclick="document.getElementById('modern-tutorial-modal').remove()">&times;</button>
                    </div>
                    <div class="tutorial-modal-body">
                        <p><strong>🎉 ¡Primera vez aquí!</strong></p>
                        <p>¿Te gustaría hacer un tutorial para conocer todas las funciones?</p>
                        <div class="tutorial-modal-options">
                            <button class="tutorial-modal-btn tutorial-modal-btn-primary" onclick="window.tutorialManager.startTutorial('drawing'); document.getElementById('modern-tutorial-modal').remove();">
                                🎨 Tutorial de Dibujo
                            </button>
                            <button class="tutorial-modal-btn tutorial-modal-btn-secondary" onclick="window.tutorialManager.startTutorial('animation'); document.getElementById('modern-tutorial-modal').remove();">
                                🎬 Tutorial de Animación
                            </button>
                            <button class="tutorial-modal-btn tutorial-modal-btn-ghost" onclick="document.getElementById('modern-tutorial-modal').remove();">
                                Saltar por ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Método para testing - permite forzar el modal
    testModal() {
        this.showWelcomeDialog();
    }

    // Método para testing - limpiar localStorage
    resetFirstVisit() {
        localStorage.removeItem('fifa-tactics-visited');
    }
}
