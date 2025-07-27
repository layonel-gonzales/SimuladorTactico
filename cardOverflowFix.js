// cardOverflowFix.js - Script para prevenir desbordamiento en cards de jugadores
console.log('🔧 Card Overflow Fix cargado');

// Función para aplicar correcciones de overflow a las cards
function fixCardOverflow() {
    console.log('🔧 Aplicando correcciones de overflow...');
    
    // Obtener todos los elementos que podrían ser cards de jugadores
    const playerTokens = document.querySelectorAll('.player-token, [style*="marco3.png"]');
    
    playerTokens.forEach((token, index) => {
        try {
            // Asegurar que el contenedor principal no tenga overflow
            token.style.overflow = 'hidden';
            token.style.boxSizing = 'border-box';
            
            // Obtener todos los elementos hijos
            const children = token.querySelectorAll('*');
            
            children.forEach(child => {
                const computedStyle = window.getComputedStyle(child);
                const position = computedStyle.position;
                
                // Solo aplicar a elementos con position absolute
                if (position === 'absolute') {
                    // Aplicar contención básica
                    child.style.boxSizing = 'border-box';
                    child.style.whiteSpace = 'nowrap';
                    child.style.overflow = 'hidden';
                    child.style.textOverflow = 'ellipsis';
                    
                    // Verificar y corregir posiciones que se salen del contenedor
                    const rect = child.getBoundingClientRect();
                    const parentRect = token.getBoundingClientRect();
                    
                    // Verificar overflow horizontal
                    if (rect.right > parentRect.right) {
                        const currentRight = parseInt(computedStyle.right) || 0;
                        child.style.right = Math.max(currentRight + 2, 6) + 'px';
                        child.style.maxWidth = 'calc(100% - 12px)';
                    }
                    
                    // Verificar overflow vertical
                    if (rect.bottom > parentRect.bottom) {
                        const currentBottom = parseInt(computedStyle.bottom) || 0;
                        child.style.bottom = Math.max(currentBottom + 2, 6) + 'px';
                    }
                    
                    // Aplicar límites específicos según la clase
                    if (child.classList.contains('minicard-position') || 
                        child.classList.contains('player-token') && child.querySelector('.minicard-position')) {
                        child.style.maxWidth = '28px';
                        child.style.right = '6px';
                    }
                    
                    if (child.classList.contains('minicard-name')) {
                        child.style.left = '6px';
                        child.style.right = '6px';
                        child.style.maxWidth = 'calc(100% - 12px)';
                    }
                    
                    if (child.classList.contains('minicard-overall')) {
                        child.style.left = '4px';
                        child.style.maxWidth = '22px';
                    }
                }
            });
            
        } catch (error) {
            console.warn(`⚠️ Error procesando card ${index}:`, error);
        }
    });
    
    console.log(`✅ Correcciones aplicadas a ${playerTokens.length} cards`);
}

// Función para observar cambios en el DOM y aplicar correcciones
function setupOverflowObserver() {
    const observer = new MutationObserver((mutations) => {
        let needsFix = false;
        
        mutations.forEach((mutation) => {
            // Verificar si se agregaron nuevos nodos
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Verificar si es una card de jugador o contiene una
                        if (node.classList?.contains('player-token') ||
                            node.querySelector && node.querySelector('.player-token, [style*="marco3.png"]') ||
                            node.style?.backgroundImage?.includes('marco3.png')) {
                            needsFix = true;
                        }
                    }
                });
            }
            
            // Verificar si se modificaron atributos de style
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList?.contains('player-token') ||
                    target.style?.backgroundImage?.includes('marco3.png')) {
                    needsFix = true;
                }
            }
        });
        
        if (needsFix) {
            // Aplicar correcciones después de un breve delay
            setTimeout(fixCardOverflow, 100);
        }
    });
    
    // Observar todo el body
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    console.log('👁️ Observer de overflow configurado');
    
    return observer;
}

// Función para aplicar CSS de emergencia
function applyEmergencyCSS() {
    const emergencyCSS = `
        <style id="emergency-overflow-fix">
            .player-token, [style*="marco3.png"] {
                overflow: hidden !important;
                box-sizing: border-box !important;
                contain: layout style !important;
            }
            
            .player-token *, [style*="marco3.png"] * {
                box-sizing: border-box !important;
                max-width: calc(100% - 8px) !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            
            .minicard-position, .player-token .minicard-position {
                max-width: 28px !important;
                right: 6px !important;
            }
            
            .minicard-name, .player-token .minicard-name {
                left: 6px !important;
                right: 6px !important;
                max-width: calc(100% - 12px) !important;
            }
            
            .minicard-overall, .player-token .minicard-overall {
                left: 4px !important;
                max-width: 22px !important;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', emergencyCSS);
    console.log('🚨 CSS de emergencia aplicado');
}

// Función de inicialización
function initCardOverflowFix() {
    console.log('🚀 Inicializando corrector de overflow...');
    
    // Aplicar CSS de emergencia inmediatamente
    applyEmergencyCSS();
    
    // Aplicar correcciones iniciales
    setTimeout(fixCardOverflow, 500);
    
    // Configurar observer para cambios futuros
    const observer = setupOverflowObserver();
    
    // Aplicar correcciones periódicas (cada 5 segundos)
    setInterval(fixCardOverflow, 5000);
    
    // Aplicar correcciones cuando cambie el tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(fixCardOverflow, 300);
    });
    
    console.log('✅ Corrector de overflow configurado');
    
    return observer;
}

// Exponer funciones globalmente para debug
window.cardOverflowFix = {
    fix: fixCardOverflow,
    init: initCardOverflowFix,
    emergencyCSS: applyEmergencyCSS
};

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initCardOverflowFix, 1000);
    });
} else {
    setTimeout(initCardOverflowFix, 1000);
}

console.log('🛠️ Card Overflow Fix disponible en window.cardOverflowFix');
