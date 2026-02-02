// ballDrawingManager.js
// Maneja el modo dibujo de trazos usando el balón como cursor

export default class BallDrawingManager {
    constructor(canvasId, getActivePlayers) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.getActivePlayers = getActivePlayers; // Función para obtener jugadores activos
        
        // Referencia al DrawingManager para coordinar limpieza
        this.drawingManager = null; // Se asignará desde main.js
        
        // Estado del dibujo de estela
        this.isDrawingBallPath = false;
        this.ballPath = [];
        this.ballDragStarted = false;
        this.mouseDownPos = null;
        this.mouseDownTime = 0;
        this.clickedOnBall = false; // Track si el click inicial fue sobre el balón
        
        // Imagen del balón para la estela
        this.ballImg = new window.Image();
        this.ballImg.src = 'img/ball.png';
        
        // Configuraciones
        this.DRAG_THRESHOLD = 10; // píxeles para considerar drag vs click
        this.DRAW_DELAY = 150; // ms antes de iniciar estela si no hay drag
        this.BALL_DETECTION_RADIUS = 30; // píxeles para detectar click en balón
        this.TRAIL_CLEAR_DELAY = 400; // ms antes de limpiar estela
        
        this.init();
    }
    
    init() {
        if (!this.canvas || !this.ctx) {
            console.error('BallDrawingManager: Canvas no encontrado');
            return;
        }
        
        this.setupEventListeners();
        // IMPORTANTE: Redimensionar canvas al inicializar para desktop
        this.resizeCanvas();
    }
    
    setupEventListeners() {     
        // Eventos para dibujar estela con el balón
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Soporte táctil
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseDown(mouseEvent);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(mouseEvent);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.handleMouseUp(mouseEvent);
        });
    }
    
    handleMouseDown(e) {
        if (!this.isEnabled()) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.mouseDownPos = { x, y };
        this.mouseDownTime = Date.now();
        this.ballDragStarted = false;
        
        // CRÍTICO: Solo proceder si el click fue sobre el balón
        const ballPlayer = this.getBallPlayer();
        this.clickedOnBall = ballPlayer && this.isClickOnBall(x, y, ballPlayer, rect);
    }
    
    handleMouseMove(e) {
        if (!this.isEnabled() || !this.mouseDownPos || !this.clickedOnBall) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const distance = Math.hypot(x - this.mouseDownPos.x, y - this.mouseDownPos.y);
        
        // Determinar si es drag o dibujo de estela
        if (distance > this.DRAG_THRESHOLD && !this.ballDragStarted && !this.isDrawingBallPath) {
            // Si se movió más del umbral, es probable que sea drag
            this.ballDragStarted = true;
        } else if (!this.ballDragStarted && !this.isDrawingBallPath && 
                  Date.now() - this.mouseDownTime > this.DRAW_DELAY) {
            // Si no hay drag y pasó el tiempo de espera, iniciar estela
            this.startBallTrail();
        }
        
        // Continuar dibujando estela si está activa
        if (this.isDrawingBallPath) {
            this.addPointToTrail(x, y);
            this.drawTrail();
        }
    }
    
    handleMouseUp(e) {
        if (!this.isEnabled()) return;
        
        this.mouseDownPos = null;
        this.clickedOnBall = false; // Limpiar el estado del click
        
        if (!this.isDrawingBallPath) return;
        
        // Finalizar estela
        this.isDrawingBallPath = false;
        this.drawFinalTrail();
    }
    
    getBallPlayer() {
        const activePlayers = this.getActivePlayers();
        return activePlayers.find(p => 
            p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'
        );
    }
    
    isClickOnBall(x, y, ballPlayer, canvasRect) {
        if (!ballPlayer || typeof ballPlayer.x !== 'number' || typeof ballPlayer.y !== 'number') {
            return false;
        }
        
        // Convertir coordenadas del balón de porcentaje a píxeles
        const ballPixelX = (ballPlayer.x / 100) * canvasRect.width;
        const ballPixelY = (ballPlayer.y / 100) * canvasRect.height;
        
        return Math.hypot(ballPixelX - x, ballPixelY - y) < this.BALL_DETECTION_RADIUS;
    }
    
    startBallTrail() {
        const ballPlayer = this.getBallPlayer();
        if (!ballPlayer) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const ballPixelX = (ballPlayer.x / 100) * rect.width;
        const ballPixelY = (ballPlayer.y / 100) * rect.height;
        
        if (this.isClickOnBall(this.mouseDownPos.x, this.mouseDownPos.y, ballPlayer, rect)) {
            this.isDrawingBallPath = true;
            this.ballPath = [{ x: ballPixelX, y: ballPixelY }];
            this.clearCanvas();
        }
    }
    
    addPointToTrail(x, y) {
        this.ballPath.push({ x, y });
    }
    
    drawTrail() {
        this.clearCanvas();
        
        // Dibujar estela de balones
        for (let i = 0; i < this.ballPath.length; i++) {
            this.ctx.save();
            // El último balón es completamente opaco, los anteriores son transparentes
            this.ctx.globalAlpha = i === this.ballPath.length - 1 ? 1 : 0.4;
            this.ctx.drawImage(
                this.ballImg, 
                this.ballPath[i].x - 12, 
                this.ballPath[i].y - 12, 
                24, 
                24
            );
            this.ctx.restore();
        }
        
    }
    
    drawFinalTrail() {
        this.clearCanvas();
        
        // Dibujar estela final
        for (let i = 0; i < this.ballPath.length; i++) {
            this.ctx.save();
            this.ctx.globalAlpha = i === this.ballPath.length - 1 ? 1 : 0.4;
            this.ctx.drawImage(
                this.ballImg, 
                this.ballPath[i].x - 12, 
                this.ballPath[i].y - 12, 
                24, 
                24
            );
            this.ctx.restore();
        }
    }
    
    clearTrail() {
        // Limpiar estela y preservar líneas permanentes automáticamente
        this.clearCanvas();
        this.ballPath = [];
    }
    
    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // CRÍTICO: Redibujar líneas permanentes del DrawingManager si existen
            if (this.drawingManager && this.drawingManager.lines && this.drawingManager.lines.length > 0) {
                this.drawingManager.drawStoredLines();
            }
        }
    }
    
    // Método para notificar que el balón está siendo arrastrado (desde UIManager)
    setBallDragStarted(isDragging) {
        this.ballDragStarted = isDragging;
        if (isDragging) {
            // Si se inicia drag, cancelar cualquier estela en progreso
            this.isDrawingBallPath = false;
            this.clearTrail();
        }
    }
    
    // Método para verificar si está dibujando (para evitar conflictos)
    isDrawing() {
        return this.isDrawingBallPath;
    }
    
    // Método para habilitar/deshabilitar el modo dibujo
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.isDrawingBallPath = false;
            this.clearTrail();
        }
    }
    
    // Verificar si está habilitado
    isEnabled() {
        return this.enabled !== false; // Por defecto habilitado si no se establece
    }
    
    // Redimensionar canvas para sincronizar con el canvas del campo
    resizeCanvas() {
        if (!this.canvas) return;
        
        // Obtener referencia al canvas del campo para sincronizar dimensiones
        const fieldCanvas = document.getElementById('football-field');
        
        // MEJORA: Usar devicePixelRatio para alta resolución
        const dpr = window.devicePixelRatio || 1;
        
        let cssWidth, cssHeight;
        
        if (fieldCanvas) {
            // Sincronizar con las dimensiones del canvas del campo
            cssWidth = parseFloat(fieldCanvas.style.width) || fieldCanvas.width / dpr;
            cssHeight = parseFloat(fieldCanvas.style.height) || fieldCanvas.height / dpr;
        } else {
            // Fallback: calcular basado en el contenedor
            const parent = this.canvas.parentElement;
            const rect = parent.getBoundingClientRect();
            const FIELD_RATIO = 105 / 68;
            const margin = Math.min(rect.width, rect.height) * 0.01;
            const availableWidth = rect.width - (margin * 2);
            const availableHeight = rect.height - (margin * 2);
            
            if (availableWidth / availableHeight > FIELD_RATIO) {
                cssHeight = availableHeight;
                cssWidth = cssHeight * FIELD_RATIO;
            } else {
                cssWidth = availableWidth;
                cssHeight = cssWidth / FIELD_RATIO;
            }
        }
        
        // Asegurar dimensiones mínimas
        cssWidth = Math.max(cssWidth, 200);
        cssHeight = Math.max(cssHeight, 130);
        
        this.canvas.width = Math.round(cssWidth * dpr);
        this.canvas.height = Math.round(cssHeight * dpr);
        
        // Escalar el contexto
        if (this.ctx) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);
        }
        
        // Establecer el tamaño CSS
        this.canvas.style.width = cssWidth + 'px';
        this.canvas.style.height = cssHeight + 'px';
        
        // NUEVO: Restaurar pointer events después del redimensionado
        this.canvas.style.pointerEvents = this.enabled !== false ? 'auto' : 'none';
        
        // Redibujar estela si existe
        if (this.ballPath.length > 0) {
            this.drawTrail();
        }
    }
}
