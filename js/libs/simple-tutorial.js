// Simple Tutorial System - Alternativa a Shepherd.js
// Sistema de tutorial simple que no depende de librerías externas

class SimpleTutorial {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
    }

    // Crear un nuevo tour
    static Tour(options = {}) {
        return new SimpleTutorial();
    }

    // Configurar pasos del tour
    addSteps(steps) {
        this.steps = steps;
        return this;
    }

    // Agregar un paso individual (para compatibilidad con Shepherd.js)
    addStep(step) {
        this.steps.push(step);
        return this;
    }

    // Iniciar el tour
    start() {
        if (this.steps.length === 0) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
        return this;
    }

    // Mostrar un paso específico
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        
        // Adaptar formato de Shepherd.js
        let element = null;
        if (step.attachTo && step.attachTo.element) {
            element = document.querySelector(step.attachTo.element);
        } else if (step.element) {
            element = document.querySelector(step.element);
        }
        
        this.createTooltip(step, element);
        this.highlightElement(element);
    }

    // Crear overlay de fondo
    createOverlay() {
        // Calcular la altura del menú inferior para excluirlo del overlay
        const bottomMenu = document.querySelector('#unified-single-bottom-menu');
        let menuHeight = 0;
        let menuTop = window.innerHeight;
        
        if (bottomMenu) {
            const menuRect = bottomMenu.getBoundingClientRect();
            menuHeight = menuRect.height;
            menuTop = menuRect.top;
        }

        this.overlay = document.createElement('div');
        this.overlay.className = 'simple-tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: ${menuTop}px;
            background: rgba(0, 0, 0, 0.4);
            z-index: 9998;
            backdrop-filter: blur(2px);
            pointer-events: none;
        `;
        document.body.appendChild(this.overlay);
        
        // Agregar estilo para difuminar todos los elementos excepto el destacado
        this.addTutorialStyles();
        
        // Escuchar cambios de tamaño de ventana para reajustar overlay
        this.resizeHandler = () => this.updateOverlayHeight();
        window.addEventListener('resize', this.resizeHandler);
    }

    // Actualizar altura del overlay cuando cambie el tamaño
    updateOverlayHeight() {
        if (!this.overlay) return;
        
        const bottomMenu = document.querySelector('#unified-single-bottom-menu');
        if (bottomMenu) {
            const menuRect = bottomMenu.getBoundingClientRect();
            this.overlay.style.height = `${menuRect.top}px`;
        }
    }

    // Agregar estilos específicos para el modo tutorial
    addTutorialStyles() {
        if (document.getElementById('tutorial-mode-styles')) return;
        
        const tutorialStyles = document.createElement('style');
        tutorialStyles.id = 'tutorial-mode-styles';
        tutorialStyles.textContent = `
            .tutorial-dimmed {
                opacity: 0.25 !important;
                filter: grayscale(60%) !important;
                transition: all 0.3s ease !important;
                pointer-events: none !important;
            }
            
            .tutorial-highlight {
                position: relative !important;
                z-index: 10000 !important;
                opacity: 1 !important;
                filter: none !important;
                box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.6), 
                            0 0 20px rgba(0, 123, 255, 0.3),
                            0 0 40px rgba(0, 123, 255, 0.1) !important;
                border-radius: 8px !important;
                transition: all 0.3s ease !important;
                animation: tutorialPulse 2s infinite !important;
                pointer-events: auto !important;
            }
        `;
        document.head.appendChild(tutorialStyles);
    }

    // Crear tooltip
    createTooltip(step, element) {
        // Remover tooltip anterior
        if (this.tooltip) {
            this.tooltip.remove();
        }

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'simple-tutorial-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(145deg, #ffffff, #f8f9fa);
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 20px;
            max-width: 350px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: tutorialFadeIn 0.3s ease-out;
        `;

        // Contenido del tooltip
        const content = `
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">
                    ${step.title || 'Paso ' + (this.currentStep + 1)}
                </h3>
                <div style="margin: 0; color: #495057; line-height: 1.5; font-size: 14px;">
                    ${step.text || step.content || ''}
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #6c757d; font-size: 12px;">
                    ${this.currentStep + 1} de ${this.steps.length}
                </div>
                <div style="display: flex; gap: 8px;">
                    ${this.generateButtons(step)}
                </div>
            </div>
        `;

        this.tooltip.innerHTML = content;

        // Agregar al DOM primero para obtener dimensiones correctas
        document.body.appendChild(this.tooltip);

        // Posicionar tooltip después de agregarlo al DOM con delay para obtener dimensiones
        setTimeout(() => {
            this.positionTooltip(element);
        }, 50);

        // Agregar event listeners
        this.setupTooltipEvents();
    }

    // Generar botones según la configuración del paso
    generateButtons(step) {
        if (step.buttons && step.buttons.length > 0) {
            // Usar botones personalizados del paso
            return step.buttons.map((button, index) => {
                const isSecondary = button.classes && button.classes.includes('secondary');
                const isPrimary = button.classes && button.classes.includes('primary');
                
                let buttonStyle = `
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background 0.2s;
                    color: white;
                `;
                
                if (isSecondary) {
                    buttonStyle += 'background: #6c757d;';
                } else if (isPrimary) {
                    buttonStyle += 'background: linear-gradient(45deg, #007bff, #0056b3);';
                } else {
                    buttonStyle += 'background: #6c757d;';
                }
                
                return `<button class="tutorial-btn-custom-${index}" style="${buttonStyle}">${button.text}</button>`;
            }).join('');
        } else {
            // Usar botones por defecto
            let buttonsHTML = '';
            
            if (this.currentStep > 0) {
                buttonsHTML += `
                    <button class="tutorial-btn-back" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: background 0.2s;
                    ">← Anterior</button>
                `;
            }
            
            if (this.currentStep < this.steps.length - 1) {
                buttonsHTML += `
                    <button class="tutorial-btn-next" style="
                        background: linear-gradient(45deg, #007bff, #0056b3);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: background 0.2s;
                    ">Siguiente →</button>
                `;
            } else {
                buttonsHTML += `
                    <button class="tutorial-btn-complete" style="
                        background: linear-gradient(45deg, #28a745, #1e7e34);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: background 0.2s;
                    ">¡Terminar! 🎉</button>
                `;
            }
            
            buttonsHTML += `
                <button class="tutorial-btn-close" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background 0.2s;
                ">✕</button>
            `;
            
            return buttonsHTML;
        }
    }

    // Posicionar tooltip cerca del elemento
    positionTooltip(element) {
        if (!element) {
            // Centrar en la pantalla si no hay elemento
            this.tooltip.style.top = '40%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = element.getBoundingClientRect();
        const bottomMenu = document.querySelector('#unified-single-bottom-menu');
        const menuRect = bottomMenu ? bottomMenu.getBoundingClientRect() : null;
        
        // Posicionar EXACTAMENTE arriba del elemento con margen fijo
        let top = rect.top - this.tooltip.offsetHeight - 12;
        let left = rect.left + (rect.width / 2) - (this.tooltip.offsetWidth / 2);

        // Si no hay espacio arriba o se solapa con el contenido principal
        if (top < 10) {
            // Posicionar justo arriba del menú con margen
            if (menuRect) {
                top = menuRect.top - this.tooltip.offsetHeight - 12;
            } else {
                top = rect.bottom + 12;
            }
        }

        // Ajustar horizontalmente si se sale de la pantalla
        if (left < 10) left = 10;
        if (left + this.tooltip.offsetWidth > window.innerWidth - 10) {
            left = window.innerWidth - this.tooltip.offsetWidth - 10;
        }

        this.tooltip.style.top = top + 'px';
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.transform = 'none';
        this.tooltip.style.position = 'fixed';
        
    }

    // Configurar eventos del tooltip
    setupTooltipEvents() {
        const step = this.steps[this.currentStep];
        
        // Manejar botones personalizados
        if (step.buttons && step.buttons.length > 0) {
            step.buttons.forEach((button, index) => {
                const btnElement = this.tooltip.querySelector(`.tutorial-btn-custom-${index}`);
                if (btnElement && button.action) {
                    btnElement.addEventListener('click', () => {
                        button.action();
                    });
                }
            });
        }
        
        // Manejar botones por defecto
        const backBtn = this.tooltip.querySelector('.tutorial-btn-back');
        const nextBtn = this.tooltip.querySelector('.tutorial-btn-next');
        const completeBtn = this.tooltip.querySelector('.tutorial-btn-complete');
        const closeBtn = this.tooltip.querySelector('.tutorial-btn-close');

        if (backBtn) {
            backBtn.addEventListener('click', () => this.back());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.complete());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.complete());
        }
    }

    // Resaltar elemento
    highlightElement(element) {
        // Limpiar highlights anteriores
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        // Limpiar efectos de difuminado anteriores
        document.querySelectorAll('.tutorial-dimmed').forEach(el => {
            el.classList.remove('tutorial-dimmed');
        });

        if (element) {
            // Encontrar el contenedor de botones
            const buttonContainer = document.querySelector('#unified-single-bottom-menu');
            
            if (buttonContainer && buttonContainer.contains(element)) {
                // Difuminar todos los botones EXCEPTO el objetivo
                const allButtons = buttonContainer.querySelectorAll('button, input, select');
                allButtons.forEach(btn => {
                    if (btn !== element && !element.contains(btn) && !btn.contains(element)) {
                        btn.classList.add('tutorial-dimmed');
                    }
                });
                
                // Destacar solo el elemento objetivo
                element.classList.add('tutorial-highlight');
            } else {
                // Para elementos fuera del menú de botones, solo destacar
                element.classList.add('tutorial-highlight');
            }
            
            // Scroll suave al elemento
            setTimeout(() => {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            }, 100);
        }
    }

    // Ir al paso siguiente
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        }
    }

    // Ir al paso anterior
    back() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    // Completar el tour
    complete() {
        this.isActive = false;
        
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }

        // Limpiar highlights y efectos de difuminado
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        document.querySelectorAll('.tutorial-dimmed').forEach(el => {
            el.classList.remove('tutorial-dimmed');
        });
        
        // Remover estilos del modo tutorial
        const tutorialStyles = document.getElementById('tutorial-mode-styles');
        if (tutorialStyles) {
            tutorialStyles.remove();
        }
        
        // Limpiar listener de resize
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
    }
}

// Agregar estilos CSS
const tutorialStyles = `
    @keyframes tutorialFadeIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes tutorialPulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.6), 0 0 20px rgba(0, 123, 255, 0.3); }
        50% { box-shadow: 0 0 0 8px rgba(0, 123, 255, 0.4), 0 0 30px rgba(0, 123, 255, 0.5); }
    }

    .tutorial-highlight {
        position: relative !important;
        z-index: 9999 !important;
        opacity: 1 !important;
        filter: none !important;
        animation: tutorialPulse 2s infinite !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;
    }

    .tutorial-dimmed {
        position: relative !important;
    }

    .tutorial-dimmed > * {
        opacity: 0.2 !important;
        filter: grayscale(70%) blur(1px) !important;
        transition: all 0.3s ease !important;
    }
    
    .tutorial-highlight,
    .tutorial-highlight * {
        opacity: 1 !important;
        filter: none !important;
    }

    .simple-tutorial-tooltip {
        pointer-events: auto !important;
    }

    .tutorial-btn-back:hover { background: #5a6268 !important; }
    .tutorial-btn-next:hover { background: linear-gradient(45deg, #0056b3, #004085) !important; }
    .tutorial-btn-complete:hover { background: linear-gradient(45deg, #1e7e34, #155724) !important; }
    .tutorial-btn-close:hover { background: #c82333 !important; }
`;

// Agregar estilos al documento
if (!document.getElementById('simple-tutorial-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'simple-tutorial-styles';
    styleSheet.textContent = tutorialStyles;
    document.head.appendChild(styleSheet);
}

// Hacer disponible globalmente como reemplazo de Shepherd
function ShepherdTour(options = {}) {
    // Crear una nueva instancia y configurarla
    const tour = new SimpleTutorial();
    
    // Aplicar opciones por defecto si existen
    if (options.defaultStepOptions) {
        tour.defaultStepOptions = options.defaultStepOptions;
    }
    
    // Copiar métodos de SimpleTutorial al objeto retornado
    Object.setPrototypeOf(tour, SimpleTutorial.prototype);
    
    return tour;
}

window.Shepherd = {
    Tour: ShepherdTour
};

