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
        
        this.init();
    }
    
    init() {
        this.applyContextProperties();
        this.setupEventListeners();
        // IMPORTANTE: Redimensionar canvas al inicializar para desktop
        this.resizeCanvas();
        console.log('DrawingManager: Inicializado correctamente');
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
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Eventos táctiles para compatibilidad móvil
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
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
    }
    
    startDrawing(e) {
        if (!this.isEnabled() || this.deleteLineMode) return; // No dibujar si está deshabilitado o en modo borrar
        
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        
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
        
        // Opcional: simplificar la línea para optimizar
        const currentLine = this.lines[this.lines.length - 1];
        if (currentLine && currentLine.points.length > 10) {
            // Aquí se podría implementar un algoritmo de simplificación de línea
        }
        
        this.redrawLines(); // Redibujar para asegurar consistencia
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
        this.clearCanvas();
        this.lines.forEach(line => {
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
        this.applyContextProperties(); // Restaurar contexto para el próximo dibujo
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
            console.log('DrawingManager: Línea deshecha');
        }
    }
    
    // Rehace la última línea deshecha
    redoLine() {
        if (this.undoStack.length > 0) {
            const redoneLine = this.undoStack.pop();
            this.lines.push(redoneLine);
            this.redrawLines();
            console.log('DrawingManager: Línea rehecha');
        }
    }
    
    // Limpia todas las líneas y resetea las pilas
    clearAllLines() {
        this.lines = [];
        this.undoStack = [];
        this.clearCanvas();
        console.log('DrawingManager: Todas las líneas borradas');
    }
    
    // Activa/desactiva el modo de borrar línea
    setDeleteLineMode(isActive) {
        this.deleteLineMode = isActive;
        this.canvas.style.cursor = isActive ? 'crosshair' : 'default';
        console.log('DrawingManager: Modo borrar línea', isActive);
    }
    
    // Maneja el click en el canvas (para borrar líneas)
    handleCanvasClick(e) {
        if (!this.isEnabled() || !this.deleteLineMode) return;
        
        const pos = this.getMousePos(e);
        let lineDeleted = false;
        
        // Buscar la línea más cercana al punto de click
        for (let i = this.lines.length - 1; i >= 0; i--) {
            const line = this.lines[i];
            for (const point of line.points) {
                const distance = Math.hypot(point.x - pos.x, point.y - pos.y);
                if (distance < line.properties.width + 5) { // +5 de margen
                    this.lines.splice(i, 1);
                    lineDeleted = true;
                    break;
                }
            }
            if (lineDeleted) break;
        }
        
        if (lineDeleted) {
            this.redrawLines();
            console.log('DrawingManager: Línea borrada');
        }
    }
    
    // Redimensionar el canvas para que coincida con su contenedor
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.redrawLines(); // Redibujar líneas después de redimensionar
        this.applyContextProperties();
        console.log('DrawingManager: Canvas redimensionado');
    }
    
    // Método para habilitar/deshabilitar el dibujo de líneas
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            // Si se deshabilita, detener cualquier dibujo en progreso
            this.isDrawing = false;
            this.deleteLineMode = false;
        }
        
        // Actualizar cursor del canvas
        this.canvas.style.pointerEvents = enabled ? 'auto' : 'none';
        this.canvas.style.cursor = enabled ? 'default' : 'not-allowed';
        
        console.log('DrawingManager: Habilitado:', enabled);
    }
    
    // Verificar si está habilitado antes de procesar eventos
    isEnabled() {
        return this.enabled !== false; // Por defecto habilitado si no se establece
    }
}