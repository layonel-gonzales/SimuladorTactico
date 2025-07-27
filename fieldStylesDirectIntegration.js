// fieldStylesDirectIntegration.js - Integración directa con el modal existente
console.log('🎯 Integración directa de estilos iniciando...');

// Función para cargar estilos de cancha dinámicamente
async function loadFieldStylesImports() {
    console.log('📦 Cargando módulos de estilos...');
    
    try {
        // Cargar FieldStyleManager
        const { default: FieldStyleManager } = await import('./js/fieldStyleManager.js');
        window.fieldStyleManager = new FieldStyleManager();
        console.log('✅ FieldStyleManager cargado');
        
        return true;
    } catch (error) {
        console.error('❌ Error cargando módulos de estilos:', error);
        return false;
    }
}

// Función para inicializar directamente con el modal existente
async function initializeDirectIntegration() {
    console.log('🔧 Inicializando integración directa...');
    
    // Cargar módulos si no están disponibles
    if (!window.fieldStyleManager) {
        const loaded = await loadFieldStylesImports();
        if (!loaded) {
            console.error('❌ No se pudieron cargar los módulos');
            return;
        }
    }
    
    // Esperar un poco más para asegurar que el manager esté listo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar elementos del DOM
    const modal = document.getElementById('configuration-modal');
    const fieldStyleSelect = document.getElementById('field-style-select');
    const previewCanvas = document.getElementById('field-preview-canvas');
    const configBtn = document.getElementById('configuration-btn');
    const fieldStylesBtn = document.getElementById('field-styles-btn');
    
    console.log('🔍 Verificando elementos del DOM:', {
        modal: !!modal,
        fieldStyleSelect: !!fieldStyleSelect,
        previewCanvas: !!previewCanvas,
        configBtn: !!configBtn,
        fieldStylesBtn: !!fieldStylesBtn,
        fieldStyleManager: !!window.fieldStyleManager
    });
    
    if (!fieldStyleSelect || !window.fieldStyleManager) {
        console.error('❌ Elementos críticos no encontrados');
        return;
    }
    
    // Poblar el select
    populateFieldStyleSelect(fieldStyleSelect);
    
    // Configurar preview
    if (previewCanvas) {
        setupPreviewCanvas(previewCanvas);
    }
    
    // Configurar eventos
    setupFieldStyleEvents(fieldStyleSelect, previewCanvas);
    
    // Asegurar que el botón de configuración funcione
    if (configBtn && modal) {
        setupConfigurationButton(configBtn, modal);
    }
    
    // Configurar botón específico de estilos de cancha
    if (fieldStylesBtn && modal) {
        setupFieldStylesButton(fieldStylesBtn, modal);
    }
    
    console.log('🎉 Integración directa completada');
    
    // Mostrar notificación simple de activación
    setTimeout(() => {
        createNotification('🎨 Sistema de estilos de cancha activado', 'success');
    }, 1000);
}

// Poblar el select de estilos
function populateFieldStyleSelect(selectElement) {
    try {
        console.log('📝 Poblando select de estilos...');
        
        // Limpiar opciones existentes
        selectElement.innerHTML = '';
        
        // Obtener estilos disponibles
        const styles = window.fieldStyleManager.getAvailableStyles();
        console.log('🎨 Estilos disponibles:', styles);
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccionar estilo...';
        defaultOption.disabled = true;
        selectElement.appendChild(defaultOption);
        
        // Agregar opciones de estilos
        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = `${style.icon} ${style.name}`;
            option.title = style.description;
            selectElement.appendChild(option);
            console.log(`  ✅ Agregado: ${style.id} - ${style.name}`);
        });
        
        // Establecer valor actual
        const currentStyle = window.fieldStyleManager.getCurrentStyle();
        selectElement.value = currentStyle;
        
        console.log('✅ Select poblado. Estilo actual:', currentStyle);
        
    } catch (error) {
        console.error('❌ Error poblando select:', error);
    }
}

// Configurar canvas de preview
function setupPreviewCanvas(canvas) {
    try {
        console.log('🖼️ Configurando canvas de preview...');
        
        // Configurar dimensiones
        canvas.width = 200;
        canvas.height = 120;
        
        // Actualizar preview con estilo actual
        updatePreview(canvas);
        
        console.log('✅ Canvas de preview configurado');
        
    } catch (error) {
        console.error('❌ Error configurando canvas:', error);
    }
}

// Actualizar preview del canvas
function updatePreview(canvas, styleId = null) {
    try {
        if (!window.fieldStyleManager) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const currentStyleId = styleId || window.fieldStyleManager.getCurrentStyle();
        window.fieldStyleManager.previewStyle(currentStyleId, canvas, ctx);
        
        console.log('🎨 Preview actualizado para estilo:', currentStyleId);
        
    } catch (error) {
        console.warn('⚠️ Error actualizando preview:', error);
        
        // Fallback: mostrar mensaje de error en el canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Preview no disponible', canvas.width / 2, canvas.height / 2);
        }
    }
}

// Configurar eventos del sistema
function setupFieldStyleEvents(selectElement, previewCanvas) {
    try {
        console.log('⚡ Configurando eventos...');
        
        // Evento de cambio de estilo
        selectElement.addEventListener('change', (e) => {
            const selectedStyle = e.target.value;
            console.log('🎨 Usuario seleccionó estilo:', selectedStyle);
            
            if (!selectedStyle) return;
            
            // Aplicar estilo al campo principal
            if (window.fieldStyleManager) {
                window.fieldStyleManager.setStyle(selectedStyle);
                console.log('✅ Estilo aplicado al campo principal');
            }
            
            // Actualizar preview
            if (previewCanvas) {
                updatePreview(previewCanvas, selectedStyle);
            }
            
            // Actualizar indicador del botón de estilos
            const fieldStylesBtn = document.getElementById('field-styles-btn');
            if (fieldStylesBtn) {
                updateButtonIndicator(fieldStylesBtn);
            }
            
            // Mostrar notificación
            showStyleChangeNotification(selectedStyle);
        });
        
        console.log('✅ Eventos configurados');
        
    } catch (error) {
        console.error('❌ Error configurando eventos:', error);
    }
}

// Configurar botón específico de estilos de cancha
function setupFieldStylesButton(button, modal) {
    try {
        console.log('🎨 Configurando botón específico de estilos...');
        
        // Remover eventos previos
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Agregar nuevo evento
        newButton.addEventListener('click', () => {
            console.log('🎨 Abriendo configuración de estilos de cancha...');
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            // Cambiar directamente a pestaña Field
            setTimeout(() => {
                const fieldTab = document.getElementById('field-tab');
                if (fieldTab) {
                    fieldTab.click();
                    console.log('🎯 Pestaña Field activada');
                    
                    // Hacer scroll al select de estilos si es necesario
                    setTimeout(() => {
                        const fieldStyleSelect = document.getElementById('field-style-select');
                        if (fieldStyleSelect) {
                            fieldStyleSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            fieldStyleSelect.focus();
                        }
                    }, 300);
                }
            }, 300);
        });
        
        // Agregar indicador visual si hay un estilo personalizado activo
        updateButtonIndicator(newButton);
        
        console.log('✅ Botón específico de estilos configurado');
        
    } catch (error) {
        console.error('❌ Error configurando botón de estilos:', error);
    }
}

// Actualizar indicador visual del botón
function updateButtonIndicator(button) {
    if (!window.fieldStyleManager) return;
    
    try {
        const currentStyle = window.fieldStyleManager.getCurrentStyle();
        
        // Agregar clase especial si no es el estilo original
        if (currentStyle && currentStyle !== 'original') {
            button.classList.add('active-style');
            button.title = `Estilos de cancha - Actual: ${currentStyle}`;
        } else {
            button.classList.remove('active-style');
            button.title = 'Estilos de cancha';
        }
    } catch (error) {
        console.warn('⚠️ Error actualizando indicador del botón:', error);
    }
}

// Configurar botón de configuración
function setupConfigurationButton(button, modal) {
    try {
        console.log('🔘 Configurando botón de configuración...');
        
        // Remover eventos previos
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Agregar nuevo evento
        newButton.addEventListener('click', () => {
            console.log('🔧 Abriendo modal de configuración...');
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            // Cambiar a pestaña Field después de abrir
            setTimeout(() => {
                const fieldTab = document.getElementById('field-tab');
                if (fieldTab) {
                    fieldTab.click();
                    console.log('🎯 Cambiado a pestaña Field');
                }
            }, 300);
        });
        
        console.log('✅ Botón de configuración configurado');
        
    } catch (error) {
        console.error('❌ Error configurando botón:', error);
    }
}

// Mostrar notificación de cambio de estilo
function showStyleChangeNotification(styleName) {
    createNotification(`✅ Estilo "${styleName}" aplicado`, 'info');
}

// Crear notificación temporal
function createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
    notification.style.cssText = `
        top: 20px; 
        right: 20px; 
        z-index: 9999; 
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Función de prueba para verificar integración
function testIntegration() {
    console.log('🧪 Ejecutando test de integración...');
    
    const tests = {
        'Modal existe': !!document.getElementById('configuration-modal'),
        'Select existe': !!document.getElementById('field-style-select'),
        'Canvas existe': !!document.getElementById('field-preview-canvas'),
        'Botón config existe': !!document.getElementById('configuration-btn'),
        'Botón estilos existe': !!document.getElementById('field-styles-btn'),
        'FieldStyleManager cargado': !!window.fieldStyleManager,
        'Select tiene opciones': document.getElementById('field-style-select')?.options.length > 1
    };
    
    console.table(tests);
    
    const allPassed = Object.values(tests).every(test => test);
    
    if (allPassed) {
        console.log('🎉 Todos los tests pasaron');
        createNotification('🧪 Test de integración exitoso', 'success');
    } else {
        console.log('⚠️ Algunos tests fallaron');
        createNotification('⚠️ Test de integración con errores', 'warning');
    }
    
    return tests;
}

// Inicializar automáticamente
function autoInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeDirectIntegration, 3000);
        });
    } else {
        setTimeout(initializeDirectIntegration, 3000);
    }
}

// Exponer funciones globalmente para debug
window.fieldStylesDirectIntegration = {
    init: initializeDirectIntegration,
    test: testIntegration,
    populate: () => populateFieldStyleSelect(document.getElementById('field-style-select')),
    updatePreview: () => updatePreview(document.getElementById('field-preview-canvas'))
};

// Inicializar automáticamente
autoInit();

console.log('🛠️ Integración directa lista. Funciones en window.fieldStylesDirectIntegration');
console.log('  - init(): Reinicializar integración');
console.log('  - test(): Ejecutar tests');
console.log('  - populate(): Repoblar select');
console.log('  - updatePreview(): Actualizar preview');
