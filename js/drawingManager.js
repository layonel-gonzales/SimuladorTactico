// drawingManager.js
// Maneja toda la lógica de dibujo de líneas en el canvas, incluyendo deshacer/rehacer.

export default class DrawingManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`DrawingManager: No se encontró el canvas con id "${canvasId}"`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        // Estado del dibujo
        this.isDrawing = false;
        this.lines = []; // Almacena todas las líneas dibujadas
        this.undoStack = []; // Pila para la función de rehacer
        
        // Propiedades de la línea
        this.lineProperties = {
            color: '#ffff00', // Amarillo por defecto
            width: 6,
        };
        
        // Modo para borrar líneas individuales
        this.deleteLineMode = false;
        
        // Imagen del balón para mostrar al final de las líneas
        this.ballImg = new Image();
        this.ballImg.src = 'img/ball.png';
        this.ballSize = 20; // Tamaño del balón en píxeles
        
        // Detección de DevTools Device Toolbar para ajustes específicos
        this.isDeviceEmulation = this.detectDeviceEmulation();
        
        this.init();
        
        // Exponer función de debug globalmente para Device Toolbar
        if (typeof window !== 'undefined') {
            window.debugDrawingManager = () => this.debugDeviceToolbar();
        }
    }
    
    /**
     * Detecta si estamos en modo de emulación de dispositivo (DevTools)
     */
    detectDeviceEmulation() {
        // Detección más conservadora para no interferir con el funcionamiento
        try {
            // Detectar Device Toolbar específicamente
            const hasDevToolsSignals = (
                // Usuario agente móvil sin capacidades táctiles reales
                (navigator.userAgent.includes('Mobile') && !('ontouchstart' in window)) ||
                // DPR alto pero sin capacidades móviles nativas
                (window.devicePixelRatio > 1.5 && navigator.userAgent.includes('Mobile')) ||
                // Dimensiones típicas de emulación móvil en desktop
                (window.innerWidth < 500 && window.devicePixelRatio > 1)
            );
                
            if (hasDevToolsSignals) {
                console.log('[DrawingManager] 🔧 Device Toolbar detectado');
            }
            return hasDevToolsSignals;
        } catch (e) {
            // Si hay error en la detección, asumir modo normal
            console.warn('[DrawingManager] Error en detección de emulación:', e);
            return false;
        }
    }
    
    init() {
        this.applyContextProperties();
        this.setupEventListeners();
        // IMPORTANTE: Redimensionar canvas al inicializar para desktop
        console.log('[DrawingManager] Estado inicial - líneas:', this.lines.length);
        this.resizeCanvas();
        console.log('[DrawingManager] Inicializado correctamente - líneas finales:', this.lines.length);
    }
    
    // Aplica las propiedades actuales de la línea al contexto del canvas
    applyContextProperties() {
        if (!this.ctx) return;
        this.ctx.strokeStyle = this.lineProperties.color;
        this.ctx.lineWidth = this.lineProperties.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    setupEventListeners() {
        console.log('[DrawingManager] Configurando event listeners en canvas:', this.canvas?.id);
        
        // Eventos de ratón
        this.canvas.addEventListener('mousedown', (e) => {
            console.log('[DrawingManager] mousedown event triggered:', e.type, e.clientX, e.clientY);
            this.startDrawing(e);
        });
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Eventos táctiles para compatibilidad móvil
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('[DrawingManager] touchstart event triggered');
            const touch = e.touches[0];
            
            // CRÍTICO: Si estamos en modo eliminar, manejar como click para eliminar
            if (this.deleteLineMode) {
                console.log('[DrawingManager] touchstart en modo eliminar - convirtiendo a click');
                const clickEvent = new MouseEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    bubbles: true,
                    cancelable: true
                });
                this.handleCanvasClick(clickEvent);
                return;
            }
            
            // MEJORA: Crear evento con bubbles y cancelable para mayor compatibilidad
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
                cancelable: true
            });
            this.startDrawing(mouseEvent);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            // MEJORA: Crear evento con bubbles y cancelable para mayor compatibilidad
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
                cancelable: true
            });
            this.draw(mouseEvent);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        }, { passive: false });
        
        console.log('[DrawingManager] Event listeners configurados exitosamente');
    }
    
    startDrawing(e) {
        console.log('[DrawingManager] startDrawing llamado:', {
            enabled: this.isEnabled(),
            deleteMode: this.deleteLineMode,
            eventType: e.type,
            timestamp: Date.now()
        });
        
        if (!this.isEnabled() || this.deleteLineMode) {
            console.log('[DrawingManager] startDrawing cancelado - no habilitado o en modo borrar');
            return;
        }
        
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        
        // Aplicar propiedades actuales ANTES de iniciar la línea
        this.applyContextProperties();
        
        // Iniciar una nueva línea
        const newLine = {
            properties: { ...this.lineProperties },
            points: [pos]
        };
        this.lines.push(newLine);
        
        // Limpiar la pila de rehacer
        this.undoStack = [];
        
        // Empezar a dibujar
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        
        console.log('[DrawingManager] Línea iniciada - Total líneas:', this.lines.length, 'Posición:', pos);
    }
    
    draw(e) {
        if (!this.isEnabled() || !this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        const currentLine = this.lines[this.lines.length - 1];
        
        // Añadir punto a la línea actual
        currentLine.points.push(pos);
        
        // Dibujar el segmento
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }
    
    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.ctx.closePath();
        
        // Agregar el balón al final de la línea recién dibujada
        const currentLine = this.lines[this.lines.length - 1];
        if (currentLine && currentLine.points.length > 1) {
            const lastPoint = currentLine.points[currentLine.points.length - 1];
            currentLine.ballPosition = { x: lastPoint.x, y: lastPoint.y };
        }
        
        // Opcional: simplificar la línea para optimizar
        if (currentLine && currentLine.points.length > 10) {
            // Aquí se podría implementar un algoritmo de simplificación de línea
        }
        
        // Solo dibujar el balón al final de la línea, sin redibujar todo
        this.drawBalls();
    }
    
    // Obtiene las coordenadas del ratón relativas al canvas
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // El canvas tiene dimensiones internas (width/height attributes) diferentes de las CSS
        // El contexto está escalado por DPR, así que necesitamos coordenadas en "espacio CSS"
        // que luego el contexto escalará automáticamente
        
        // Coordenadas simples: posición del mouse relativa al bounding rect del canvas
        const pos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        // DEBUG: Siempre mostrar en consola para diagnóstico
        console.log('[DrawingManager] getMousePos:', {
            clientX: e.clientX,
            clientY: e.clientY,
            rectLeft: rect.left,
            rectTop: rect.top,
            rectWidth: rect.width,
            rectHeight: rect.height,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            cssWidth: this.canvas.style.width,
            cssHeight: this.canvas.style.height,
            posX: pos.x,
            posY: pos.y,
            dpr: window.devicePixelRatio
        });
        
        return pos;
    }
    
    // Calcula la distancia de un punto a un segmento de línea
    distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            // El segmento es un punto
            return Math.hypot(A, B);
        }
        
        let param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.hypot(dx, dy);
    }
    
    // Redibuja todas las líneas almacenadas
    redrawLines() {
        if (!this.lines || this.lines.length === 0) {
            this.clearCanvas(); // Solo limpiar el canvas si no hay líneas
            console.log('[DrawingManager] No hay líneas para redibujar');
            return;
        }
        
        this.clearCanvas();
        this.drawStoredLines();
        console.log('[DrawingManager] Redibujando', this.lines.length, 'líneas');
    }
    
    // Dibuja solo las líneas sin limpiar el canvas (para uso externo)
    drawStoredLines() {
        if (!this.lines || this.lines.length === 0) {
            console.log('[DrawingManager] No hay líneas almacenadas para dibujar');
            return;
        }
        
        // Dibujar todas las líneas
        this.lines.forEach((line, index) => {
            if (line.points.length < 2) return;
            
            this.ctx.save();
            this.ctx.strokeStyle = line.properties.color;
            this.ctx.lineWidth = line.properties.width;
            this.ctx.beginPath();
            this.ctx.moveTo(line.points[0].x, line.points[0].y);
            
            for (let i = 1; i < line.points.length; i++) {
                this.ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.restore();
        });
        
        // Dibujar todos los balones al final de las líneas
        this.drawBalls();
        
        this.applyContextProperties(); // Restaurar contexto para el próximo dibujo
    }
    
    // Dibuja los balones al final de cada línea con opacidad según su edad
    drawBalls() {
        if (!this.ballImg.complete) {
            // Si la imagen no está cargada, intentar de nuevo en un momento
            setTimeout(() => this.drawBalls(), 50);
            return;
        }
        
        this.lines.forEach((line, index) => {
            if (!line.ballPosition) return;
            
            this.ctx.save();
            
            // Hacer que los balones anteriores sean más opacos
            const isLastLine = index === this.lines.length - 1;
            const opacity = isLastLine ? 1.0 : 0.4; // Último balón opaco, anteriores semi-transparentes
            this.ctx.globalAlpha = opacity;
            
            // Dibujar el balón centrado en la posición
            const x = line.ballPosition.x - this.ballSize / 2;
            const y = line.ballPosition.y - this.ballSize / 2;
            
            this.ctx.drawImage(this.ballImg, x, y, this.ballSize, this.ballSize);
            
            this.ctx.restore();
        });
    }
    
    // Limpia completamente el canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Deshace la última línea dibujada
    undoLine() {
        if (this.lines.length > 0) {
            const undoneLine = this.lines.pop();
            this.undoStack.push(undoneLine);
            this.redrawLines();
            console.log('DrawingManager: Línea deshecha (con balón)');
        }
    }
    
    // Rehace la última línea deshecha
    redoLine() {
        if (this.undoStack.length > 0) {
            const redoneLine = this.undoStack.pop();
            this.lines.push(redoneLine);
            this.redrawLines();
            console.log('DrawingManager: Línea rehecha (con balón)');
        }
    }
    
    // Limpia todas las líneas y resetea las pilas
    clearAllLines() {
        this.lines = [];
        this.undoStack = [];
        
        // CRÍTICO: También limpiar estelas del balón
        if (this.ballDrawingManager) {
            this.ballDrawingManager.clearTrail();
        } else {
            // Fallback: limpiar canvas directamente
            this.clearCanvas();
        }
        
        console.log('DrawingManager: Todas las líneas y balones borrados (incluyendo estelas)');
    }
    
    // Activa/desactiva el modo de borrar línea
    setDeleteLineMode(isActive) {
        this.deleteLineMode = isActive;
        // Ya no cambiar el cursor aquí, se maneja en main.js con CSS
        console.log('[DrawingManager] Modo eliminar línea:', isActive ? 'ACTIVADO' : 'DESACTIVADO');
    }
    
    // Maneja el click en el canvas (para borrar líneas)
    handleCanvasClick(e) {
        console.log('[DrawingManager] 🎯 handleCanvasClick disparado:', {
            enabled: this.isEnabled(),
            deleteMode: this.deleteLineMode,
            eventType: e.type,
            target: e.target?.id,
            emulation: this.isDeviceEmulation,
            canvasPointerEvents: this.canvas.style.pointerEvents,
            timestamp: Date.now()
        });
        
        if (!this.isEnabled() || !this.deleteLineMode) {
            console.log('[DrawingManager] ❌ Click ignorado - no habilitado o no en modo borrar');
            return;
        }
        
        const pos = this.getMousePos(e);
        let lineDeleted = false;
        let deletedLineIndex = -1;
        
        console.log('[DrawingManager] Buscando línea para eliminar en posición:', pos);
        console.log('[DrawingManager] Estado del canvas:', {
            rect: this.canvas.getBoundingClientRect(),
            computedStyle: getComputedStyle(this.canvas),
            classList: Array.from(this.canvas.classList)
        });
        
        // Buscar la línea más cercana al punto de click (incluyendo el balón)
        for (let i = this.lines.length - 1; i >= 0; i--) {
            const line = this.lines[i];
            
            // Ajustar tolerancia según el contexto - MÁS GENEROSA para Device Toolbar y puntero circular
            const ballTolerance = this.isDeviceEmulation ? this.ballSize * 2.5 : this.ballSize * 1.5;
            const lineTolerance = this.isDeviceEmulation ? line.properties.width + 25 : line.properties.width + 12;
            
            console.log(`[DrawingManager] Verificando línea ${i}, tolerancias AMPLIADAS: balón=${ballTolerance}, línea=${lineTolerance}`);
            
            // Verificar si se hizo click en el balón con tolerancia ampliada
            if (line.ballPosition) {
                const ballDistance = Math.hypot(line.ballPosition.x - pos.x, line.ballPosition.y - pos.y);
                console.log(`[DrawingManager] Distancia al balón: ${ballDistance} (tolerancia ampliada: ${ballTolerance})`);
                if (ballDistance < ballTolerance) {
                    this.lines.splice(i, 1);
                    lineDeleted = true;
                    deletedLineIndex = i;
                    console.log(`[DrawingManager] ✅ Línea eliminada por click en balón (tolerancia ampliada)`);
                    break;
                }
            }
            
            // Verificar si se hizo click cerca de cualquier punto de la línea
            if (!lineDeleted && line.points && line.points.length > 0) {
                // Método mejorado: verificar distancia a cada segmento de línea, no solo puntos
                let foundNearSegment = false;
                
                for (let j = 0; j < line.points.length - 1; j++) {
                    const p1 = line.points[j];
                    const p2 = line.points[j + 1];
                    
                    // Calcular distancia del punto click al segmento de línea
                    const segmentDistance = this.distanceToLineSegment(pos, p1, p2);
                    console.log(`[DrawingManager] Distancia al segmento ${j}: ${segmentDistance} (tolerancia: ${lineTolerance})`);
                    
                    if (segmentDistance < lineTolerance) {
                        foundNearSegment = true;
                        break;
                    }
                }
                
                if (foundNearSegment) {
                    this.lines.splice(i, 1);
                    lineDeleted = true;
                    deletedLineIndex = i;
                    console.log(`[DrawingManager] ✅ Línea eliminada por click cerca de segmento`);
                    break;
                }
            }
            
            if (lineDeleted) break;
        }
        
        if (lineDeleted) {
            // CRÍTICO: Limpiar la pila de rehacer para prevenir que las líneas borradas reaparezcan
            this.undoStack = [];
            this.redrawLines();
            console.log(`[DrawingManager] ✂️ Línea #${deletedLineIndex} eliminada (pila de rehacer limpiada)`);
            
            // Mostrar feedback visual temporal
            this.showDeleteFeedback(pos);
        } else {
            console.log('[DrawingManager] ❌ No se encontró línea para eliminar en esa posición');
            console.log(`[DrawingManager] Total líneas disponibles: ${this.lines.length}`);
            // Mostrar feedback de que no se encontró nada
            this.showNoDeleteFeedback(pos);
        }
    }
    
    // Mostrar feedback visual cuando se elimina una línea
    showDeleteFeedback(pos) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        // Hacer círculo más visible en Device Toolbar
        const radius = this.isDeviceEmulation ? 20 : 15;
        this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Eliminar el feedback después de 300ms (más tiempo para ver en emulación)
        setTimeout(() => {
            this.redrawLines();
        }, this.isDeviceEmulation ? 400 : 200);
    }
    
    // Mostrar feedback cuando no se encuentra línea para eliminar
    showNoDeleteFeedback(pos) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = '#ffa500'; // Naranja para indicar "no encontrado"
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        const radius = this.isDeviceEmulation ? 25 : 20;
        this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        this.ctx.setLineDash([5, 5]); // Línea punteada
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Restaurar línea sólida
        this.ctx.restore();
        
        // Eliminar el feedback después de un tiempo menor
        setTimeout(() => {
            this.redrawLines();
        }, 150);
    }
    
    // Redimensionar el canvas para que coincida con el canvas del campo
    resizeCanvas() {
        // Obtener referencia al canvas del campo para sincronizar dimensiones
        const fieldCanvas = document.getElementById('football-field');
        
        if (!fieldCanvas) {
            console.warn('[DrawingManager] No se encontró football-field canvas');
            return;
        }
        
        // Re-detectar emulación en cada resize (puede cambiar dinámicamente)
        this.isDeviceEmulation = this.detectDeviceEmulation();
        
        // Obtener las dimensiones CSS del campo (lo que se ve en pantalla)
        const fieldRect = fieldCanvas.getBoundingClientRect();
        const cssWidth = fieldRect.width;
        const cssHeight = fieldRect.height;
        
        // Usar devicePixelRatio para alta resolución
        const dpr = window.devicePixelRatio || 1;
        
        // Establecer dimensiones internas del canvas (píxeles reales del dispositivo)
        this.canvas.width = Math.round(cssWidth * dpr);
        this.canvas.height = Math.round(cssHeight * dpr);
        
        // Establecer dimensiones CSS (debe coincidir exactamente con fieldRect)
        this.canvas.style.setProperty('width', cssWidth + 'px', 'important');
        this.canvas.style.setProperty('height', cssHeight + 'px', 'important');
        
        // CRÍTICO: Resetear transformación y escalar el contexto por DPR
        // Esto permite dibujar en coordenadas CSS y que se escalen automáticamente
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        
        // Redibujar líneas existentes si las hay
        if (this.lines && this.lines.length > 0) {
            this.redrawLines(); 
        }
        
        this.applyContextProperties();
        
        console.log(`[DrawingManager] resizeCanvas - CSS: ${Math.round(cssWidth)}x${Math.round(cssHeight)}, Canvas interno: ${this.canvas.width}x${this.canvas.height}, DPR: ${dpr}`);
    }

    // Método para habilitar/deshabilitar el dibujo de líneas
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            // Si se deshabilita, detener cualquier dibujo en progreso
            this.isDrawing = false;
            // NO resetear deleteLineMode aquí - preservar el estado
            // this.deleteLineMode = false; // ELIMINADO: Esto causaba que se perdiera el estado
        } else {
            // Cuando se reactiva, restaurar el cursor apropiado
            if (this.deleteLineMode) {
                // Si el modo eliminar está activo, asegurar que el canvas tenga el cursor correcto
                this.canvas.classList.add('scissors-cursor-simple');
            }
        }
        
        // Actualizar pointer events del canvas
        this.canvas.style.pointerEvents = enabled ? 'auto' : 'none';
        
        // Solo establecer cursor por defecto si no está en modo eliminar
        if (enabled && !this.deleteLineMode) {
            this.canvas.style.cursor = 'default';
        } else if (!enabled) {
            this.canvas.style.cursor = 'not-allowed';
        }
        
        console.log('DrawingManager: Habilitado:', enabled, '- Delete mode preservado:', this.deleteLineMode);
    }
    
    // Verificar si está habilitado antes de procesar eventos
    isEnabled() {
        return this.enabled !== false; // Por defecto habilitado si no se establece
    }
    
    // Función de debug para Device Toolbar
    debugDeviceToolbar() {
        console.group('🔧 DEBUG DEVICE TOOLBAR');
        console.log('Estado actual:', {
            isDeviceEmulation: this.isDeviceEmulation,
            deleteLineMode: this.deleteLineMode,
            enabled: this.isEnabled(),
            canvasId: this.canvas?.id,
            linesCount: this.lines?.length || 0
        });
        console.log('Propiedades del navegador:', {
            userAgent: navigator.userAgent,
            touchStart: 'ontouchstart' in window,
            devicePixelRatio: window.devicePixelRatio,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        });
        console.log('Canvas estado:', {
            pointerEvents: this.canvas.style.pointerEvents,
            cursor: this.canvas.style.cursor,
            classList: Array.from(this.canvas.classList),
            rect: this.canvas.getBoundingClientRect()
        });
        console.log('Re-detectando emulación...');
        this.isDeviceEmulation = this.detectDeviceEmulation();
        console.log('Nueva detección:', this.isDeviceEmulation);
        console.groupEnd();
        
        return {
            isDeviceEmulation: this.isDeviceEmulation,
            deleteLineMode: this.deleteLineMode,
            enabled: this.isEnabled(),
            linesCount: this.lines?.length || 0
        };
    }
}