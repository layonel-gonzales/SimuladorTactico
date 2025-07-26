/**
 * ==========================================
 * 📚 FREEMIUM TUTORIAL CONFIGURATION
 * ==========================================
 * Configuración de tutoriales específicos para el modelo freemium
 */

class FreemiumTutorial {
    constructor() {
        this.tutorialSteps = {
            freemiumIntro: [
                {
                    title: '🎉 ¡Bienvenido al Simulador Táctico!',
                    content: `
                        <div class="tutorial-welcome">
                            <h3>Versión Gratuita</h3>
                            <p>Tienes acceso a:</p>
                            <ul>
                                <li>✅ Hasta <strong>5 líneas</strong> por táctica</li>
                                <li>✅ <strong>3 colores</strong> básicos</li>
                                <li>✅ <strong>2 formaciones</strong> (4-4-2 y 4-3-3)</li>
                                <li>✅ <strong>3 tácticas</strong> guardadas</li>
                                <li>✅ Videos de <strong>10 segundos</strong></li>
                            </ul>
                            <p><small>💡 Actualiza a Premium para desbloquear todo</small></p>
                        </div>
                    `,
                    target: 'body',
                    placement: 'center'
                }
            ],
            
            drawingLimits: [
                {
                    title: '🎨 Límites de Dibujo',
                    content: `
                        <div class="tutorial-limits">
                            <p>En la versión gratuita puedes dibujar hasta <strong>5 líneas</strong> por táctica.</p>
                            <div class="progress-demo">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 60%"></div>
                                </div>
                                <span>3/5 líneas usadas</span>
                            </div>
                            <p><small>💎 Premium: líneas ilimitadas</small></p>
                        </div>
                    `,
                    target: '#canvas',
                    placement: 'top'
                }
            ],
            
            colorLimits: [
                {
                    title: '🌈 Colores Disponibles',
                    content: `
                        <div class="tutorial-colors">
                            <p>Tienes 3 colores básicos disponibles:</p>
                            <div class="color-demo">
                                <span class="color-dot" style="background: #ff0000;"></span> Rojo
                                <span class="color-dot" style="background: #0000ff;"></span> Azul  
                                <span class="color-dot" style="background: #00ff00;"></span> Verde
                            </div>
                            <p><small>💎 Premium: paleta completa de colores</small></p>
                        </div>
                    `,
                    target: '#color-controls',
                    placement: 'bottom'
                }
            ],
            
            formationLimits: [
                {
                    title: '⚽ Formaciones Básicas',
                    content: `
                        <div class="tutorial-formations">
                            <p>Versión gratuita incluye 2 formaciones:</p>
                            <ul>
                                <li>🔹 4-4-2 (Clásica)</li>
                                <li>🔹 4-3-3 (Ofensiva)</li>
                            </ul>
                            <p><small>💎 Premium: 15+ formaciones profesionales</small></p>
                        </div>
                    `,
                    target: '#formation-selector',
                    placement: 'right'
                }
            ],
            
            animationLimits: [
                {
                    title: '🎬 Animaciones Limitadas',
                    content: `
                        <div class="tutorial-animation">
                            <p>En la versión gratuita:</p>
                            <ul>
                                <li>⏱️ Máximo <strong>10 segundos</strong> de video</li>
                                <li>🎞️ Hasta <strong>5 frames</strong> de animación</li>
                                <li>🚫 Sin grabación de audio</li>
                                <li>💧 Marca de agua en exportación</li>
                            </ul>
                            <p><small>💎 Premium: videos de 2 minutos con audio</small></p>
                        </div>
                    `,
                    target: '#animation-controls',
                    placement: 'left'
                }
            ],
            
            saveLimits: [
                {
                    title: '💾 Límite de Guardado',
                    content: `
                        <div class="tutorial-save">
                            <p>Puedes guardar hasta <strong>3 tácticas</strong>.</p>
                            <div class="save-demo">
                                <div class="save-slots">
                                    <span class="slot filled">📋</span>
                                    <span class="slot filled">📋</span>
                                    <span class="slot empty">⭕</span>
                                </div>
                                <span>2/3 tácticas guardadas</span>
                            </div>
                            <p><small>💎 Premium: tácticas ilimitadas</small></p>
                        </div>
                    `,
                    target: '#save-button',
                    placement: 'top'
                }
            ],
            
            upgradePrompt: [
                {
                    title: '🚀 ¿Listo para más?',
                    content: `
                        <div class="tutorial-upgrade">
                            <h3>Desbloquea el Potencial Completo</h3>
                            <div class="upgrade-benefits">
                                <div class="benefit">
                                    <span class="icon">🎨</span>
                                    <span>Líneas ilimitadas</span>
                                </div>
                                <div class="benefit">
                                    <span class="icon">🌈</span>
                                    <span>Paleta completa</span>
                                </div>
                                <div class="benefit">
                                    <span class="icon">⚽</span>
                                    <span>15+ formaciones</span>
                                </div>
                                <div class="benefit">
                                    <span class="icon">🎬</span>
                                    <span>Videos con audio</span>
                                </div>
                            </div>
                            <button class="upgrade-btn" onclick="freemiumController.redirectToUpgrade()">
                                Actualizar a Premium - $9.99/mes
                            </button>
                        </div>
                    `,
                    target: 'body',
                    placement: 'center'
                }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.addTutorialStyles();
        console.log('[FreemiumTutorial] Configuración cargada');
    }
    
    addTutorialStyles() {
        const styles = `
            <style>
                .tutorial-welcome,
                .tutorial-limits,
                .tutorial-colors,
                .tutorial-formations,
                .tutorial-animation,
                .tutorial-save,
                .tutorial-upgrade {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.5;
                }
                
                .tutorial-welcome h3 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 1.2rem;
                }
                
                .tutorial-welcome ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .tutorial-welcome li {
                    margin: 8px 0;
                    color: #555;
                }
                
                .progress-demo,
                .save-demo {
                    margin: 15px 0;
                    text-align: center;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #45a049);
                    transition: width 0.3s ease;
                }
                
                .color-demo {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    margin: 15px 0;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .color-dot {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.9rem;
                }
                
                .color-dot::before {
                    content: '';
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: inherit;
                    border: 2px solid #fff;
                    box-shadow: 0 0 3px rgba(0,0,0,0.3);
                }
                
                .save-slots {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                
                .slot {
                    font-size: 1.5rem;
                    padding: 5px;
                }
                
                .slot.filled {
                    opacity: 1;
                }
                
                .slot.empty {
                    opacity: 0.3;
                }
                
                .upgrade-benefits {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin: 20px 0;
                }
                
                .benefit {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    color: #555;
                }
                
                .benefit .icon {
                    font-size: 1.2rem;
                }
                
                .upgrade-btn {
                    background: linear-gradient(45deg, #FF6B6B, #FF8E53);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }
                
                .upgrade-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
                }
                
                @media (max-width: 600px) {
                    .upgrade-benefits {
                        grid-template-columns: 1fr;
                    }
                    
                    .color-demo {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            </style>
        `;
        
        if (!document.getElementById('freemium-tutorial-styles')) {
            document.head.insertAdjacentHTML('beforeend', `${styles}`);
            const styleElement = document.head.lastElementChild;
            styleElement.id = 'freemium-tutorial-styles';
        }
    }
    
    // Mostrar tutorial específico según el contexto
    showTutorial(tutorialName) {
        const steps = this.tutorialSteps[tutorialName];
        if (!steps) {
            console.warn(`[FreemiumTutorial] Tutorial no encontrado: ${tutorialName}`);
            return;
        }
        
        if (window.SimpleTutorial) {
            const tutorial = new SimpleTutorial(steps);
            tutorial.start();
        } else {
            console.warn('[FreemiumTutorial] SimpleTutorial no disponible');
        }
    }
    
    // Mostrar tutorial de bienvenida para usuarios nuevos
    showWelcomeTutorial() {
        this.showTutorial('freemiumIntro');
    }
    
    // Mostrar tutorial cuando se alcanza un límite
    showLimitTutorial(limitType) {
        const tutorialMap = {
            'lines': 'drawingLimits',
            'colors': 'colorLimits',
            'formations': 'formationLimits',
            'animation': 'animationLimits',
            'save': 'saveLimits'
        };
        
        const tutorialName = tutorialMap[limitType];
        if (tutorialName) {
            this.showTutorial(tutorialName);
        }
    }
    
    // Mostrar tutorial de upgrade
    showUpgradeTutorial() {
        this.showTutorial('upgradePrompt');
    }
    
    // Verificar si es la primera visita del usuario
    isFirstVisit() {
        return !localStorage.getItem('freemium_tutorial_completed');
    }
    
    // Marcar tutorial como completado
    markTutorialCompleted() {
        localStorage.setItem('freemium_tutorial_completed', 'true');
        localStorage.setItem('freemium_tutorial_date', new Date().toISOString());
    }
    
    // Configurar tutorial automático según el plan del usuario
    setupAutoTutorial() {
        if (this.isFirstVisit() && window.freemiumController) {
            const planName = freemiumController.getPlanName();
            
            // Solo mostrar tutorial de limitaciones para usuarios gratuitos
            if (planName === 'free') {
                setTimeout(() => {
                    this.showWelcomeTutorial();
                    this.markTutorialCompleted();
                }, 2000);
            }
        }
    }
}

// Instancia global
window.freemiumTutorial = new FreemiumTutorial();

// Auto-configurar tutorial cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.freemiumTutorial) {
            freemiumTutorial.setupAutoTutorial();
        }
    }, 3000);
});

console.log('[FreemiumTutorial] Módulo cargado correctamente');
