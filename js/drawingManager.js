import ballImg from './ballImage.js';
export default class DrawingManager {
    /**
     * @param {string} canvasId
     * @param {function} isRecordModeFn - función que retorna true si está en modo grabación
     */
    constructor(canvasId, isRecordModeFn) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lines = []; // Array para almacenar los puntos de las líneas
        this.currentLine = []; // Puntos de la línea actual
        this.initialWidth = 0; // Ancho inicial del canvas cuando se dibuja una línea
        this.initialHeight = 0; // Alto inicial del canvas cuando se dibuja una línea

        // Historial para deshacer/rehacer
        this.undoStack = [];
        this.redoStack = [];

        // Propiedades de la línea que deben persistir
        this.lineProperties = {
            width: 5,
            color: 'yellow'
        };

        this.isRecordModeFn = isRecordModeFn || (() => false);

        this.setupCanvas();
        this.setupEventListeners();
    }
    // --- NUEVO: Borrar línea individual ---
    setDeleteLineMode(isActive) {
        if (isActive) {
            this.canvas.style.cursor = 'crosshair';
            this._deleteLineHandler = this.handleDeleteLine.bind(this);
            this.canvas.addEventListener('click', this._deleteLineHandler);
        } else {
            this.canvas.style.cursor = '';
            if (this._deleteLineHandler) {
                this.canvas.removeEventListener('click', this._deleteLineHandler);
                this._deleteLineHandler = null;
            }
        }
    }

    handleDeleteLine(e) {
        // Obtener coordenadas relativas al canvas
        const coords = this.getCanvasCoordinates(e);
        const x = coords.x;
        const y = coords.y;
        // Buscar la línea más cercana al punto clickeado
        let minDist = Infinity;
        let closestIdx = -1;
        this.lines.forEach(function(lineData, idx) {
            for (let i = 0; i < lineData.points.length; i++) {
                const pt = lineData.points[i];
                // Escalar punto a tamaño actual del canvas
                const px = (pt.x / lineData.initialWidth) * this.canvas.width;
                const py = (pt.y / lineData.initialHeight) * this.canvas.height;
                const dist = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = idx;
                }
            }
        }, this);
        // Si está suficientemente cerca (10px), borrar esa línea
        if (closestIdx !== -1 && minDist < 15) {
            this.undoStack.push(this.lines.slice());
            this.redoStack = [];
            this.lines.splice(closestIdx, 1);
            this.redrawLines();
        }
    }
    // (Eliminado: constructor duplicado)

    setupCanvas() {
        const pitchContainer = this.canvas.parentElement;
        this.canvas.width = pitchContainer.clientWidth;
        this.canvas.height = pitchContainer.clientHeight;
        this.initialWidth = this.canvas.width;
        this.initialHeight = this.canvas.height;

        // Asegurarse de que el contexto siempre tenga las propiedades correctas
        this.applyContextProperties();

        console.log('DrawingManager: Canvas de dibujo configurado.');
    }

    applyContextProperties() {
        this.ctx.lineWidth = this.lineProperties.width;
        this.ctx.strokeStyle = this.lineProperties.color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    resizeCanvas() {
        const pitchContainer = this.canvas.parentElement;
        const newWidth = pitchContainer.clientWidth;
        const newHeight = pitchContainer.clientHeight;

        if (newWidth === this.canvas.width && newHeight === this.canvas.height) {
            return; // No redimensionar si el tamaño no ha cambiado
        }

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        // Vuelve a aplicar las propiedades del contexto después del redimensionamiento
        this.applyContextProperties();

        this.redrawLines();
        console.log('DrawingManager: Canvas de dibujo redimensionado y redibujado.');
    }

    redrawLines() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyContextProperties();

        // Si está en modo grabación y se está reproduciendo animación, NO dibujar líneas
        if (this._hideLinesForAnimation) {
            // Solo dibujar el balón de la última línea (si existe)
            if (this.lines.length > 0) {
                const lineData = this.lines[this.lines.length - 1];
                const line = lineData.points;
                const originalWidth = lineData.initialWidth;
                const originalHeight = lineData.initialHeight;
                if (line.length > 0) {
                    const lastPoint = line[line.length - 1];
                    const scaledLastX = (lastPoint.x / originalWidth) * this.canvas.width;
                    const scaledLastY = (lastPoint.y / originalHeight) * this.canvas.height;
                    this.ctx.save();
                    this.ctx.globalAlpha = 1.0;
                    const ballSize = 32;
                    this.ctx.drawImage(ballImg, scaledLastX - ballSize/2, scaledLastY - ballSize/2, ballSize, ballSize);
                    this.ctx.restore();
                }
            }
            return;
        }

        // Dibuja todas las líneas
        this.lines.forEach((lineData, idx) => {
            const line = lineData.points;
            const originalWidth = lineData.initialWidth;
            const originalHeight = lineData.initialHeight;

            if (line.length > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(
                    (line[0].x / originalWidth) * this.canvas.width,
                    (line[0].y / originalHeight) * this.canvas.height
                );
                for (let i = 1; i < line.length; i++) {
                    this.ctx.lineTo(
                        (line[i].x / originalWidth) * this.canvas.width,
                        (line[i].y / originalHeight) * this.canvas.height
                    );
                }
                this.ctx.stroke();
            }
        });

        // Dibuja los balones al final de cada línea
        this.lines.forEach((lineData, idx) => {
            const line = lineData.points;
            const originalWidth = lineData.initialWidth;
            const originalHeight = lineData.initialHeight;
            if (line.length > 0) {
                const lastPoint = line[line.length - 1];
                const scaledLastX = (lastPoint.x / originalWidth) * this.canvas.width;
                const scaledLastY = (lastPoint.y / originalHeight) * this.canvas.height;
                // El último balón (línea más reciente) es el "activo"
                let alpha = (idx === this.lines.length - 1) ? 1.0 : 0.4;
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                // Centrar el balón en la punta
                const ballSize = 32;
                this.ctx.drawImage(ballImg, scaledLastX - ballSize/2, scaledLastY - ballSize/2, ballSize, ballSize);
                this.ctx.restore();
            }
        });
    }

    startDrawing(e) {
        if (!this.canvas || !this.ctx) return;
        this.isDrawing = true;
        this.currentLine = [];

        this.initialWidth = this.canvas.width;
        this.initialHeight = this.canvas.height;

        const { x, y } = this.getCanvasCoordinates(e);
        this.currentLine.push({ x, y });
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing || !this.canvas || !this.ctx) return;
        const { x, y } = this.getCanvasCoordinates(e);
        this.currentLine.push({ x, y });
        // Redraw current line to ensure persistence
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    endDrawing() {
        if (!this.canvas || !this.ctx) return;
        this.isDrawing = false;
        this.ctx.closePath();

        let lineAdded = false;
        if (this.currentLine.length > 1) {
            const simplifiedLine = this.simplifyLine(this.currentLine, 0.75);
            // --- MODO GRABACIÓN: solo una línea ---
            if (this.isRecordModeFn && this.isRecordModeFn()) {
                // Elimina la línea anterior si existe
                if (this.lines.length > 0) {
                    this.lines = [];
                }
            }
            // Guardar la línea (normal o grabación)
            if (simplifiedLine.length < 2) {
                if (this.currentLine.length >= 2) {
                    this.lines.push({
                        points: this.currentLine,
                        initialWidth: this.initialWidth,
                        initialHeight: this.initialHeight
                    });
                    lineAdded = true;
                }
            } else {
                this.lines.push({
                    points: simplifiedLine,
                    initialWidth: this.initialWidth,
                    initialHeight: this.initialHeight
                });
                lineAdded = true;
            }
        }
        if (lineAdded) {
            this.undoStack.push(this.lines.slice(0, -1));
            this.redoStack = [];
        }
        this.redrawLines();
    }

    undoLine() {
        if (this.lines.length === 0) return;
        this.redoStack.push([...this.lines]);
        this.lines = this.undoStack.pop() || [];
        this.redrawLines();
    }

    redoLine() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push([...this.lines]);
        this.lines = this.redoStack.pop() || [];
        this.redrawLines();
    }

    // Método para dibujar una punta de flecha al final de una línea
    drawArrowhead(fromX, fromY, toX, toY) {
        const headlen = 15; // longitud de la punta de flecha
        const angle = Math.atan2(toY - fromY, toX - fromX);

        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        this.ctx.closePath();
    }

    // Método: Simplificar línea (Douglas-Peucker muy básico para suavizar)
    // Reduce puntos para hacer la línea más "recta" si el pulso es irregular
    simplifyLine(points, tolerance) {
        if (points.length <= 2) return points;

        let maxDist = 0;
        let index = 0;
        const end = points.length - 1;
        const lineStart = points[0];
        const lineEnd = points[end];

        for (let i = 1; i < end; i++) {
            const d = this.perpendicularDistance(points[i], lineStart, lineEnd);
            if (d > maxDist) {
                maxDist = d;
                index = i;
            }
        }

        if (maxDist > tolerance) {
            const recResults1 = this.simplifyLine(points.slice(0, index + 1), tolerance);
            const recResults2 = this.simplifyLine(points.slice(index), tolerance);

            return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
        } else {
            return [lineStart, lineEnd];
        }
    }

    // Función auxiliar para calcular la distancia perpendicular de un punto a una línea
    perpendicularDistance(point, lineStart, lineEnd) {
        const x0 = point.x;
        const y0 = point.y;
        const x1 = lineStart.x;
        const y1 = lineStart.y;
        const x2 = lineEnd.x;
        const y2 = lineEnd.y;

        const numerator = Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1));
        const denominator = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        if (denominator === 0) return this.distance(point, lineStart); // Si la línea es un punto
        return numerator / denominator;
    }

    // Función auxiliar para calcular la distancia euclidiana entre dos puntos
    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    clearCanvas() {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.lines.length > 0) {
            this.undoStack.push([...this.lines]);
            this.redoStack = [];
        }
        this.lines = []; // Borra todas las líneas almacenadas
        this.redrawLines();
        console.log('DrawingManager: Canvas borrado.');
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    setupEventListeners() {
        if (!this.canvas) {
            console.error('DrawingManager: Canvas no encontrado para configurar event listeners.');
            return;
        }
        // Eventos de ratón
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.endDrawing());
        this.canvas.addEventListener('mouseout', () => {
            if (this.isDrawing) this.endDrawing();
        });

        // Eventos táctiles
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startDrawing(e); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e); }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.endDrawing());
        this.canvas.addEventListener('touchcancel', () => {
            if (this.isDrawing) this.endDrawing();
        });
    }
}