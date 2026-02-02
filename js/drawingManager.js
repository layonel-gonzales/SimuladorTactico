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
        this.resizeCanvas();
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
        // Eventos de ratón
        this.canvas.addEventListener('mousedown', (e) => {
            this.startDrawing(e);
        });
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Eventos táctiles para compatibilidad móvil
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            
            // CRÍTICO: Si estamos en modo eliminar, manejar como click para eliminar
            if (this.deleteLineMode) {
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
    }
    
    startDrawing(e) {      
        if (!this.isEnabled() || this.deleteLineMode) {
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
        const pos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
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
            return;
        }
        
        this.clearCanvas();
        this.drawStoredLines();
    }
    
    // Dibuja solo las líneas sin limpiar el canvas (para uso externo)
    drawStoredLines() {
        if (!this.lines || this.lines.length === 0) {
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
        }
    }
    
    // Rehace la última línea deshecha
    redoLine() {
        if (this.undoStack.length > 0) {
            const redoneLine = this.undoStack.pop();
            this.lines.push(redoneLine);
            this.redrawLines();
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
    }
    
    // Activa/desactiva el modo de borrar línea
    setDeleteLineMode(isActive) {
        this.deleteLineMode = isActive;
    }
    
    // Maneja el click en el canvas (para borrar líneas)
    handleCanvasClick(e) {     
        if (!this.isEnabled() || !this.deleteLineMode) {
            return;
        }
        
        const pos = this.getMousePos(e);
        let lineDeleted = false;
        let deletedLineIndex = -1;

        // Buscar la línea más cercana al punto de click (incluyendo el balón)
        for (let i = this.lines.length - 1; i >= 0; i--) {
            const line = this.lines[i];
            
            // Ajustar tolerancia según el contexto - MÁS GENEROSA para Device Toolbar y puntero circular
            const ballTolerance = this.isDeviceEmulation ? this.ballSize * 2.5 : this.ballSize * 1.5;
            const lineTolerance = this.isDeviceEmulation ? line.properties.width + 25 : line.properties.width + 12;
            
            // Verificar si se hizo click en el balón con tolerancia ampliada
            if (line.ballPosition) {
                const ballDistance = Math.hypot(line.ballPosition.x - pos.x, line.ballPosition.y - pos.y);

                if (ballDistance < ballTolerance) {
                    this.lines.splice(i, 1);
                    lineDeleted = true;
                    deletedLineIndex = i;
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
                    
                    if (segmentDistance < lineTolerance) {
                        foundNearSegment = true;
                        break;
                    }
                }
                
                if (foundNearSegment) {
                    this.lines.splice(i, 1);
                    lineDeleted = true;
                    deletedLineIndex = i;
                    break;
                }
            }
            
            if (lineDeleted) break;
        }
        
        if (lineDeleted) {
            this.undoStack = [];
            this.redrawLines();
            this.showDeleteFeedback(pos);
        } else {
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
    }

    // Método para habilitar/deshabilitar el dibujo de líneas
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            this.isDrawing = false;
        } else {
            if (this.deleteLineMode) {
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
    }
    
    // Verificar si está habilitado antes de procesar eventos
    isEnabled() {
        return this.enabled !== false; // Por defecto habilitado si no se establece
    }
    
    // Función de debug para Device Toolbar
    debugDeviceToolbar() {
        this.isDeviceEmulation = this.detectDeviceEmulation();
        
        return {
            isDeviceEmulation: this.isDeviceEmulation,
            deleteLineMode: this.deleteLineMode,
            enabled: this.isEnabled(),
            linesCount: this.lines?.length || 0
        };
    }
}