// fieldStylesGuide.js - Guía de uso del sistema de estilos
console.log('📋 Guía del sistema de estilos cargada');

// Función para mostrar una guía rápida
function showFieldStylesGuide() {
    const guideModal = document.createElement('div');
    guideModal.innerHTML = `
        <div class="modal fade" id="field-styles-guide-modal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: var(--bg-secondary, #2a2a2a); color: var(--text-primary, white);">
                    <div class="modal-header" style="background: var(--color-info, #17a2b8);">
                        <h5 class="modal-title text-white">
                            <i class="fas fa-palette me-2"></i>
                            Guía de Estilos de Cancha
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-4">
                            <div class="col-12">
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>¡Personaliza tu campo de fútbol!</strong> Ahora puedes cambiar la apariencia visual del campo entre diferentes estilos.
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h6><i class="fas fa-mouse-pointer me-2"></i>Cómo Usar</h6>
                                <ol class="list-group list-group-numbered">
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        Haz clic en el botón <span class="badge bg-info"><i class="fas fa-palette"></i> Estilos</span> en la barra superior
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        Se abrirá el modal de configuración en la pestaña "Campo"
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        Selecciona un estilo del menú desplegable
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        ¡El campo cambiará inmediatamente!
                                    </li>
                                </ol>
                            </div>
                            
                            <div class="col-md-6">
                                <h6><i class="fas fa-paint-brush me-2"></i>Estilos Disponibles</h6>
                                <ul class="list-group">
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        🏟️ <strong>Original</strong> - Estilo clásico del simulador
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        ⚽ <strong>Clásico</strong> - Diseño tradicional de estadio
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        🌟 <strong>Moderno</strong> - Efectos visuales contemporáneos
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        🌙 <strong>Nocturno</strong> - Ambientación de partido nocturno
                                    </li>
                                    <li class="list-group-item bg-transparent text-light border-secondary">
                                        🕰️ <strong>Retro</strong> - Estilo vintage años 1950s
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="col-12">
                                <div class="card bg-dark border-secondary">
                                    <div class="card-body">
                                        <h6 class="card-title"><i class="fas fa-lightbulb me-2"></i>Consejos</h6>
                                        <ul class="mb-0">
                                            <li>Tu estilo seleccionado se guarda automáticamente</li>
                                            <li>Puedes cambiar de estilo en cualquier momento</li>
                                            <li>El botón de estilos se ilumina cuando usas un estilo personalizado</li>
                                            <li>También puedes acceder desde Configuración → Pestaña Campo</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Cerrar
                        </button>
                        <button type="button" class="btn btn-info" onclick="window.fieldStylesGuide.openFieldConfig()">
                            <i class="fas fa-palette me-1"></i>Ir a Estilos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(guideModal);
    
    const modalInstance = new bootstrap.Modal(document.getElementById('field-styles-guide-modal'));
    modalInstance.show();
    
    // Limpiar cuando se cierre
    document.getElementById('field-styles-guide-modal').addEventListener('hidden.bs.modal', () => {
        guideModal.remove();
    });
}

// Función para ir directamente a la configuración de estilos
function openFieldConfig() {
    // Cerrar modal de guía si está abierto
    const guideModal = document.getElementById('field-styles-guide-modal');
    if (guideModal) {
        const modalInstance = bootstrap.Modal.getInstance(guideModal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
    
    // Abrir configuración de campo
    setTimeout(() => {
        const fieldStylesBtn = document.getElementById('field-styles-btn');
        if (fieldStylesBtn) {
            fieldStylesBtn.click();
        }
    }, 500);
}

// Función para mostrar estado del sistema
function showSystemStatus() {
    const status = {
        '🎨 Sistema de Estilos': !!window.fieldStyleManager ? '✅ Activo' : '❌ No disponible',
        '🔧 Modal de Configuración': !!document.getElementById('configuration-modal') ? '✅ Disponible' : '❌ No encontrado',
        '🎯 Select de Estilos': !!document.getElementById('field-style-select') ? '✅ Disponible' : '❌ No encontrado',
        '🖼️ Canvas de Preview': !!document.getElementById('field-preview-canvas') ? '✅ Disponible' : '❌ No encontrado',
        '🔘 Botón de Estilos': !!document.getElementById('field-styles-btn') ? '✅ Disponible' : '❌ No encontrado'
    };
    
    let statusMessage = '📊 Estado del Sistema de Estilos:\\n\\n';
    Object.entries(status).forEach(([key, value]) => {
        statusMessage += `${key}: ${value}\\n`;
    });
    
    if (window.fieldStyleManager) {
        const currentStyle = window.fieldStyleManager.getCurrentStyle();
        statusMessage += `\\n🎨 Estilo Actual: ${currentStyle}`;
        
        const availableStyles = window.fieldStyleManager.getAvailableStyles().length;
        statusMessage += `\\n📚 Estilos Disponibles: ${availableStyles}`;
    }
    
    alert(statusMessage);
}

// Crear botón flotante de ayuda
function createHelpButton() {
    const helpButton = document.createElement('button');
    helpButton.id = 'field-styles-help-btn';
    helpButton.className = 'btn btn-info btn-sm position-fixed';
    helpButton.style.cssText = `
        bottom: 20px;
        left: 20px;
        z-index: 9998;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    helpButton.innerHTML = '<i class="fas fa-question"></i>';
    helpButton.title = 'Ayuda - Estilos de Cancha';
    
    helpButton.addEventListener('click', showFieldStylesGuide);
    
    helpButton.addEventListener('mouseenter', () => {
        helpButton.style.transform = 'scale(1.1)';
    });
    
    helpButton.addEventListener('mouseleave', () => {
        helpButton.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(helpButton);
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
        helpButton.style.opacity = '0.3';
    }, 10000);
    
    // Mostrar de nuevo al pasar el mouse
    helpButton.addEventListener('mouseenter', () => {
        helpButton.style.opacity = '1';
    });
}

// Auto-mostrar guía la primera vez
function checkFirstTime() {
    const hasSeenGuide = localStorage.getItem('fieldStylesGuideShown');
    
    if (!hasSeenGuide) {
        setTimeout(() => {
            showFieldStylesGuide();
            localStorage.setItem('fieldStylesGuideShown', 'true');
        }, 5000);
    }
}

// Inicializar
function initGuide() {
    // Crear botón de ayuda
    createHelpButton();
    
    // Verificar si es la primera vez
    checkFirstTime();
    
    console.log('📋 Guía de estilos inicializada');
}

// Exponer funciones globalmente
window.fieldStylesGuide = {
    show: showFieldStylesGuide,
    openFieldConfig: openFieldConfig,
    status: showSystemStatus,
    init: initGuide
};

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initGuide, 4000);
    });
} else {
    setTimeout(initGuide, 4000);
}

console.log('📋 Guía disponible en window.fieldStylesGuide');
