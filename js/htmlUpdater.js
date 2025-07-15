// htmlUpdater.js
// Funciones para actualizar los atributos de tutorial según el modo

// Pasos del tutorial de DIBUJO
const drawingTutorialSteps = {
    '#game-container': {
        'data-intro': '¡Bienvenido al Simulador Táctico de Fútbol! Este es el campo donde puedes dibujar jugadas tácticas.',
        'data-step': '1'
    },
    '#global-select-squad-btn': {
        'data-intro': '🎯 ¡HAZ CLIC AQUÍ! Selecciona los jugadores que aparecerán en el campo. Debes elegir al menos un jugador para continuar.',
        'data-step': '2'
    },
    '#fullscreen-toggle-btn': {
        'data-intro': '🖥️ Activa o desactiva el modo pantalla completa para una mejor experiencia de juego.',
        'data-step': '3'
    },
    '#drawing-mode-controls': {
        'data-intro': 'Esta es la barra de herramientas del MODO DIBUJO. Aquí puedes seleccionar formaciones, dibujar líneas, cambiar colores y más.',
        'data-step': '4'
    },
    '#tactic-selector': {
        'data-intro': '🎯 ¡ELIGE UNA FORMACIÓN! Selecciona una táctica como 4-3-3 o 4-4-2. Esto posicionará automáticamente a los jugadores en el campo.',
        'data-step': '5'
    },
    '#undo-line': {
        'data-intro': 'Deshace la última línea dibujada. Útil para corregir errores.',
        'data-step': '6'
    },
    '#redo-line': {
        'data-intro': 'Rehace una línea que hayas deshecho anteriormente.',
        'data-step': '7'
    },
    '#clear-canvas': {
        'data-intro': 'Borra TODAS las líneas del campo. ¡Cuidado! Esta acción no se puede deshacer.',
        'data-step': '8'
    },
    '#line-color-picker': {
        'data-intro': 'Cambia el color de las líneas que dibujes. El amarillo es ideal para jugadas ofensivas.',
        'data-step': '9'
    },
    '#line-width-picker': {
        'data-intro': 'Ajusta el grosor de las líneas. Líneas más gruesas son más visibles para jugadas importantes.',
        'data-step': '10'
    },
    '#delete-line-mode': {
        'data-intro': 'Activa el modo borrador. Después haz clic en cualquier línea para eliminarla específicamente.',
        'data-step': '11'
    },
    '#share-pitch-btn': {
        'data-intro': 'Exporta y comparte tu táctica como imagen. Perfecto para enviar a tu equipo o entrenador.',
        'data-step': '12'
    },
    '#canvas-drawing': {
        'data-intro': '🎯 ¡DIBUJA AHORA! Haz CLIC y ARRASTRA sobre el campo para crear tu primera línea táctica. Puedes dibujar flechas, líneas de pase, movimientos de jugadores, etc.',
        'data-step': '13'
    }
};

// Pasos del tutorial de ANIMACIÓN
const animationTutorialSteps = {
    '#game-container': {
        'data-intro': '¡Bienvenido al Modo Animación! Aquí puedes crear secuencias de movimiento y animar tus tácticas.',
        'data-step': '1'
    },
    '#global-select-squad-btn': {
        'data-intro': '🎯 ¡HAZ CLIC AQUÍ! Selecciona los jugadores para tu animación. Debes elegir al menos un jugador para continuar.',
        'data-step': '2'
    },
    '#fullscreen-toggle-btn': {
        'data-intro': '🖥️ Activa el modo pantalla completa para una mejor experiencia de animación.',
        'data-step': '3'
    },
    '#animation-mode-controls': {
        'data-intro': 'Esta es la barra del MODO ANIMACIÓN. Aquí puedes crear secuencias de movimiento y reproducir animaciones tácticas.',
        'data-step': '4'
    },
    '#tactic-selector-anim': {
        'data-intro': '🎯 ¡ELIGE UNA FORMACIÓN! Selecciona la táctica inicial para posicionar a los jugadores antes de animar.',
        'data-step': '5'
    },
    '#frame-prev': {
        'data-intro': 'Navega al frame anterior de tu animación. Útil para revisar secuencias.',
        'data-step': '6'
    },
    '#frame-indicator': {
        'data-intro': 'Muestra el frame actual y el total de frames en tu animación (ej: 3/5).',
        'data-step': '7'
    },
    '#frame-next': {
        'data-intro': 'Navega al siguiente frame de tu animación.',
        'data-step': '8'
    },
    '#frame-add': {
        'data-intro': '🎯 ¡CREA UN FRAME! Haz clic aquí para capturar las posiciones actuales de los jugadores como un nuevo frame.',
        'data-step': '9'
    },
    '#frame-play': {
        'data-intro': '🎯 ¡REPRODUCE! Haz clic para ver toda la secuencia de animación que has creado. ¡Verás tu táctica en movimiento!',
        'data-step': '10'
    },
    '#record-mode-toggle': {
        'data-intro': '🎯 ¡ACTIVA GRABACIÓN! Haz clic aquí y mueve los jugadores. Se registrarán automáticamente sus posiciones.',
        'data-step': '11'
    },
    '#export-animation-json': {
        'data-intro': '🎯 ¡EXPORTA! Haz clic para guardar tu animación como archivo JSON y compartirla.',
        'data-step': '12'
    },
    '#reset-animation': {
        'data-intro': 'Borra toda la animación y vuelve al frame inicial. ¡Cuidado! Se perderán todos los frames.',
        'data-step': '13'
    }
};

// Función para aplicar pasos de tutorial según el modo
function applyTutorialSteps(mode) {
    // Limpiar todos los atributos de tutorial existentes
    document.querySelectorAll('[data-intro]').forEach(element => {
        element.removeAttribute('data-intro');
        element.removeAttribute('data-step');
    });
    
    let steps;
    if (mode === 'drawing') {
        steps = drawingTutorialSteps;
    } else if (mode === 'animation') {
        steps = animationTutorialSteps;
    } else {
        return;
    }
    
    // Aplicar los nuevos pasos
    Object.entries(steps).forEach(([selector, attributes]) => {
        const element = document.querySelector(selector);
        if (element) {
            Object.entries(attributes).forEach(([attr, value]) => {
                element.setAttribute(attr, value);
            });
        }
    });
    
    console.log(`[HTMLUpdater] Pasos de tutorial aplicados para modo: ${mode}`);
}

// Exportar la función
window.applyTutorialSteps = applyTutorialSteps;
