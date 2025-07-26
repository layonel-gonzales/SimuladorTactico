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
        
        this.init();
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
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.startDrawing(mouseEvent);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.draw(mouseEvent);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
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
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
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
        if (!this.isEnabled() || !this.deleteLineMode) return;
        
        const pos = this.getMousePos(e);
        let lineDeleted = false;
        let deletedLineIndex = -1;
        
        // Buscar la línea más cercana al punto de click (incluyendo el balón)
        for (let i = this.lines.length - 1; i >= 0; i--) {
            const line = this.lines[i];
            
            // Verificar si se hizo click en el balón
            if (line.ballPosition) {
                const ballDistance = Math.hypot(line.ballPosition.x - pos.x, line.ballPosition.y - pos.y);
                if (ballDistance < this.ballSize) {
                    this.lines.splice(i, 1);
                    lineDeleted = true;
                    deletedLineIndex = i;
                    break;
                }
            }
            
            // Verificar si se hizo click en la línea
            if (!lineDeleted) {
                for (const point of line.points) {
                    const distance = Math.hypot(point.x - pos.x, point.y - pos.y);
                    if (distance < line.properties.width + 5) { // +5 de margen
                        this.lines.splice(i, 1);
                        lineDeleted = true;
                        deletedLineIndex = i;
                        break;
                    }
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
        }
    }
    
    // Mostrar feedback visual cuando se elimina una línea
    showDeleteFeedback(pos) {
        const originalCtx = this.ctx.globalCompositeOperation;
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Eliminar el feedback después de 200ms
        setTimeout(() => {
            this.redrawLines();
        }, 200);
    }
    
    // Redimensionar el canvas para que coincida con su contenedor
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        // MEJORA: Usar devicePixelRatio para alta resolución en el canvas de dibujo
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Escalar el contexto
        this.ctx.scale(dpr, dpr);
        
        // Establecer el tamaño CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Solo redibujar si hay líneas para redibujar
        if (this.lines && this.lines.length > 0) {
            this.redrawLines(); 
        }
        
        this.applyContextProperties();
        console.log(`DrawingManager: Canvas redimensionado con DPR: ${dpr} - líneas actuales:`, this.lines?.length || 0);
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
}