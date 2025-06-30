// drawingManager.js

export default class DrawingManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lines = []; // Array para almacenar los puntos de las líneas
        this.currentLine = []; // Puntos de la línea actual
        this.initialWidth = 0; // Ancho inicial del canvas cuando se dibuja una línea
        this.initialHeight = 0; // Alto inicial del canvas cuando se dibuja una línea

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Al configurar el canvas inicialmente, asegúrate de que ocupe todo el contenedor
        const pitchContainer = this.canvas.parentElement;
        this.canvas.width = pitchContainer.clientWidth;
        this.canvas.height = pitchContainer.clientHeight;
        // Estas dimensiones iniciales se usarán como referencia para la escala de los dibujos.
        // Se actualizarán cada vez que se empiece a dibujar una nueva línea para reflejar el tamaño actual.
        this.initialWidth = this.canvas.width;
        this.initialHeight = this.canvas.height;

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        console.log('DrawingManager: Canvas de dibujo configurado.');
    }

    // --- MÉTODO CLAVE PARA REDIMENSIONAMIENTO ---
    resizeCanvas() {
        const pitchContainer = this.canvas.parentElement;
        const newWidth = pitchContainer.clientWidth;
        const newHeight = pitchContainer.clientHeight;

        // Si el tamaño no ha cambiado, no hagas nada
        if (newWidth === this.canvas.width && newHeight === this.canvas.height) {
            return;
        }

        // Actualiza el tamaño del canvas
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        // Redibuja todas las líneas escalando sus puntos al nuevo tamaño del canvas
        this.redrawLines();
        console.log('DrawingManager: Canvas de dibujo redimensionado y redibujado.');
    }

    redrawLines() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath(); // Siempre iniciar una nueva ruta para redibujar

        this.lines.forEach(lineData => {
            // lineData ahora incluye initialWidth y initialHeight cuando se dibujó
            const line = lineData.points;
            const originalWidth = lineData.initialWidth;
            const originalHeight = lineData.initialHeight;

            if (line.length > 0) {
                // Mueve el punto inicial de cada línea al nuevo tamaño escalado
                this.ctx.moveTo(
                    (line[0].x / originalWidth) * this.canvas.width,
                    (line[0].y / originalHeight) * this.canvas.height
                );
                for (let i = 1; i < line.length; i++) {
                    // Dibuja el resto de los puntos escalados
                    this.ctx.lineTo(
                        (line[i].x / originalWidth) * this.canvas.width,
                        (line[i].y / originalHeight) * this.canvas.height
                    );
                }
            }
        });
        this.ctx.stroke(); // Dibuja todas las líneas
        this.ctx.closePath(); // Cierra la ruta
    }

    startDrawing(e) {
        if (!this.canvas || !this.ctx) return;
        this.isDrawing = true;
        this.currentLine = [];

        // Captura el tamaño actual del canvas cuando se empieza a dibujar una nueva línea
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
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    endDrawing() {
        if (!this.canvas || !this.ctx) return;
        this.isDrawing = false;
        if (this.currentLine.length > 0) {
            // Almacenar la línea junto con el tamaño del canvas en el momento del dibujo
            this.lines.push({
                points: this.currentLine,
                initialWidth: this.initialWidth,
                initialHeight: this.initialHeight
            });
        }
        this.ctx.closePath(); // Cierra la ruta actual para el siguiente dibujo
    }

    clearCanvas() {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.lines = []; // Borra todas las líneas almacenadas
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

        // Devolver las coordenadas relativas al canvas en su tamaño actual
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
        this.canvas.addEventListener('mouseout', () => { // Detener dibujo si el ratón sale del canvas
            if (this.isDrawing) this.endDrawing();
        });

        // Eventos táctiles
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startDrawing(e); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e); }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.endDrawing());
        this.canvas.addEventListener('touchcancel', () => { // Detener dibujo si el toque se cancela
            if (this.isDrawing) this.endDrawing();
        });
    }
}