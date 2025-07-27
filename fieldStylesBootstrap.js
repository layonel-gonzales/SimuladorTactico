// fieldStylesBootstrap.js - Inicialización simplificada del sistema de estilos
console.log('🚀 FieldStyles Bootstrap iniciando...');

// Función para esperar a que esté disponible un objeto
function waitForGlobal(name, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            if (window[name]) {
                console.log(`✅ ${name} disponible`);
                resolve(window[name]);
            } else if (Date.now() - startTime > timeout) {
                console.warn(`⚠️ Timeout esperando ${name}`);
                reject(new Error(`Timeout waiting for ${name}`));
            } else {
                setTimeout(check, 100);
            }
        }
        
        check();
    });
}

// Función para inicializar el sistema de estilos
async function initializeFieldStyles() {
    try {
        console.log('🎨 Inicializando sistema de estilos...');
        
        // Esperar a que fieldStyleManager esté disponible
        await waitForGlobal('fieldStyleManager', 15000);
        
        // Poblar el select de estilos
        const fieldStyleSelect = document.getElementById('field-style-select');
        const previewCanvas = document.getElementById('field-preview-canvas');
        
        if (!fieldStyleSelect) {
            console.warn('⚠️ Select de estilos no encontrado');
            return;
        }
        
        console.log('📝 Poblando select de estilos...');
        
        // Limpiar opciones existentes
        fieldStyleSelect.innerHTML = '';
        
        // Obtener estilos disponibles
        const styles = window.fieldStyleManager.getAvailableStyles();
        console.log('🎨 Estilos disponibles:', styles.length);
        
        // Agregar opciones
        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = `${style.icon} ${style.name}`;
            option.title = style.description;
            fieldStyleSelect.appendChild(option);
        });
        
        // Establecer valor actual
        const currentStyle = window.fieldStyleManager.getCurrentStyle();
        fieldStyleSelect.value = currentStyle;
        
        console.log('✅ Select poblado con estilo actual:', currentStyle);
        
        // Configurar preview si existe el canvas
        if (previewCanvas) {
            console.log('🖼️ Configurando preview canvas...');
            setupPreviewCanvas(previewCanvas, currentStyle);
        }
        
        // Configurar eventos
        setupFieldStyleEvents(fieldStyleSelect, previewCanvas);
        
        console.log('🎉 Sistema de estilos inicializado correctamente');
        
        // Mostrar notificación de éxito
        showSuccessMessage();
        
    } catch (error) {
        console.error('❌ Error inicializando sistema de estilos:', error);
        showErrorMessage();
    }
}

// Configurar canvas de preview
function setupPreviewCanvas(canvas, styleId) {
    try {
        canvas.width = 200;
        canvas.height = 120;
        
        const ctx = canvas.getContext('2d');
        if (ctx && window.fieldStyleManager) {
            window.fieldStyleManager.previewStyle(styleId, canvas, ctx);
            console.log('✅ Preview configurado para estilo:', styleId);
        }
    } catch (error) {
        console.warn('⚠️ Error configurando preview:', error);
    }
}

// Configurar eventos del sistema de estilos
function setupFieldStyleEvents(selectElement, previewCanvas) {
    if (!selectElement) return;
    
    selectElement.addEventListener('change', (e) => {
        const selectedStyle = e.target.value;
        console.log('🎨 Usuario cambió estilo a:', selectedStyle);
        
        // Aplicar estilo al campo principal
        if (window.fieldStyleManager) {
            window.fieldStyleManager.setStyle(selectedStyle);
        }
        
        // Actualizar preview
        if (previewCanvas) {
            setupPreviewCanvas(previewCanvas, selectedStyle);
        }
        
        // Mostrar notificación
        showStyleChangeNotification(selectedStyle);
    });
    
    console.log('✅ Eventos configurados');
}

// Mostrar notificación de éxito
function showSuccessMessage() {
    createNotification('🎨 Sistema de estilos de cancha activado', 'success');
}

// Mostrar notificación de error
function showErrorMessage() {
    createNotification('❌ Error cargando estilos de cancha', 'error');
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
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Función para abrir modal y cambiar a pestaña Field
function openFieldConfiguration() {
    const modal = document.getElementById('configuration-modal');
    if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Cambiar a pestaña Field después de mostrar el modal
        setTimeout(() => {
            const fieldTab = document.getElementById('field-tab');
            if (fieldTab) {
                fieldTab.click();
                console.log('🎯 Cambiado a pestaña Field');
            }
        }, 500);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeFieldStyles, 2000); // Dar tiempo a que se carguen otros módulos
    });
} else {
    setTimeout(initializeFieldStyles, 2000);
}

// Exponer funciones útiles globalmente
window.fieldStylesBootstrap = {
    init: initializeFieldStyles,
    openConfig: openFieldConfiguration
};

console.log('🛠️ FieldStyles Bootstrap cargado. Usa window.fieldStylesBootstrap.init() para reinicializar');
