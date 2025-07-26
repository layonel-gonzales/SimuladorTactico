// modeManager.js
// Coordina entre los modos de Dibujo y Animación para evitar conflictos

export default class ModeManager {
    constructor() {
        this.currentMode = 'drawing'; // 'drawing' o 'animation'
        this.drawingManager = null;
        this.ballDrawingManager = null;
        this.animationManager = null;
        this.uiManager = null;
        
        // Referencias DOM
        this.modeToggle = null;
        this.drawingControls = null;
        this.animationControls = null;
        
        this.init();
    }
    
    init() {
        this.setupModeToggle();
        this.setupControlGroups();
        console.log('ModeManager: Inicializado en modo', this.currentMode);
    }
    
    setupModeToggle() {
        // Configurar el botón global de modo (siempre visible)
        console.log('[ModeManager] Buscando botón global de modo...');
        this.globalModeToggle = document.getElementById('global-mode-toggle');
        
        if (this.globalModeToggle) {
            this.globalModeToggle.addEventListener('click', () => {
                console.log('[ModeManager] Click detectado en botón global de modo');
                this.toggleMode();
            });
            console.log('[ModeManager] ✅ Botón GLOBAL de modo conectado correctamente');
        } else {
            console.error('[ModeManager] ❌ ERROR: No se encontró el botón global de modo #global-mode-toggle en el HTML');
            // Verificar qué elementos están disponibles
            console.log('[ModeManager] Elementos disponibles:', 
                Array.from(document.querySelectorAll('[id*="mode"]')).map(el => el.id));
        }
        
        this.updateModeToggleUI();
    }
    
    setupControlGroups() {
        // Referencias a los nuevos contenedores unificados
        this.drawingModeControls = document.getElementById('drawing-mode-controls');
        this.animationModeControls = document.getElementById('animation-mode-controls');
        
        console.log('[ModeManager] DEBUG - drawingModeControls:', this.drawingModeControls);
        console.log('[ModeManager] DEBUG - animationModeControls:', this.animationModeControls);
        
        if (!this.drawingModeControls || !this.animationModeControls) {
            console.warn('[ModeManager] ❌ No se encontraron los contenedores de controles unificados');
            console.warn('[ModeManager] - drawingModeControls existe:', !!this.drawingModeControls);
            console.warn('[ModeManager] - animationModeControls existe:', !!this.animationModeControls);
        } else {
            console.log('[ModeManager] ✅ Contenedores de controles configurados correctamente');
        }
    }
    
    setManagers(drawingManager, ballDrawingManager, animationManager, uiManager) {
        this.drawingManager = drawingManager;
        this.ballDrawingManager = ballDrawingManager;
        this.animationManager = animationManager;
        this.uiManager = uiManager;
        
        // Configurar modo inicial
        this.switchToMode(this.currentMode);
        
        // Asegurar que los botones de tutorial estén configurados correctamente
        this.updateTutorialButtonsVisibility();
    }
    
    toggleMode() {
        console.log('[ModeManager] 🔄 toggleMode() llamado - Modo actual:', this.currentMode);
        const newMode = this.currentMode === 'drawing' ? 'animation' : 'drawing';
        console.log('[ModeManager] 🔄 Cambiando a modo:', newMode);
        this.switchToMode(newMode);
    }
    
    switchToMode(mode) {
        if (mode === this.currentMode) return;
        
        console.log(`ModeManager: Cambiando de ${this.currentMode} a ${mode}`);
        
        // Desactivar modo anterior
        this.deactivateCurrentMode();
        
        // Activar nuevo modo
        this.currentMode = mode;
        this.activateCurrentMode();
        
        // Actualizar UI
        this.updateModeToggleUI();
        this.updateControlsVisibility();
        
        // Emitir evento de cambio de modo para otros componentes
        document.dispatchEvent(new CustomEvent('modeChanged', {
            detail: { 
                newMode: mode,
                oldMode: this.currentMode 
            }
        }));
        
        console.log(`ModeManager: Modo activo: ${this.currentMode}`);
    }
    
    deactivateCurrentMode() {
        if (this.currentMode === 'drawing') {
            // Desactivar dibujo de líneas
            if (this.drawingManager) {
                this.drawingManager.setEnabled(false);
            }
            
            // Desactivar dibujo de estelas de balón
            if (this.ballDrawingManager) {
                this.ballDrawingManager.setEnabled(false);
            }
            
        } else if (this.currentMode === 'animation') {
            // Parar cualquier animación en curso
            if (this.animationManager && this.animationManager.getIsPlaying()) {
                this.animationManager.stopAnimation();
            }
            
            // Desactivar modo grabación si está activo
            if (this.animationManager && this.animationManager.getIsRecordMode()) {
                this.animationManager.toggleRecordMode();
            }
        }
    }
    
    activateCurrentMode() {
        if (this.currentMode === 'drawing') {
            // LIMPIAR CANCHA al pasar a modo dibujo
            this.clearPitch();
            
            // Activar dibujo de líneas
            if (this.drawingManager) {
                this.drawingManager.setEnabled(true);
                
                // Restaurar estado visual del modo eliminar si estaba activo
                this.restoreDeleteLineMode();
            }
            
            // Activar dibujo de estelas de balón
            if (this.ballDrawingManager) {
                this.ballDrawingManager.setEnabled(true);
            }
            
            // Re-renderizar para ocultar el balón en modo dibujo
            if (this.uiManager) {
                // Forzar limpieza adicional antes del re-renderizado
                const pitch = document.getElementById('pitch-container');
                if (pitch) {
                    pitch.querySelectorAll('.ball-token').forEach(el => el.remove());
                }
                this.uiManager.renderPlayersOnPitch();
            }
            
            console.log('[ModeManager] ✅ Modo DIBUJO activado - Cancha limpia, balón oculto');
            
        } else if (this.currentMode === 'animation') {
            // LIMPIAR CANCHA al pasar a modo animación
            this.clearPitch();
            
            // Desactivar dibujo para evitar conflictos
            if (this.drawingManager) {
                this.drawingManager.setEnabled(false);
            }

            if (this.ballDrawingManager) {
                this.ballDrawingManager.setEnabled(false);
            }
            
            // Asegurar que el balón esté en el centro para modo animación
            this.ensureBallAtCenter();
            
            // Re-renderizar para mostrar el balón en modo animación
            if (this.uiManager) {
                this.uiManager.renderPlayersOnPitch();
            }
            
            console.log('[ModeManager] ✅ Modo ANIMACIÓN activado - Cancha limpia, balón visible en centro');
        }
    }
    
    updateModeToggleUI() {
        // Actualizar el botón global de modo
        if (this.globalModeToggle) {
            const iconElement = this.globalModeToggle.querySelector('i');
            
            // Cambiar el icono, tooltip y color del botón según el modo
            if (this.currentMode === 'drawing') {
                // En modo dibujo, mostrar icono de película para cambiar a animación
                this.globalModeToggle.title = 'Cambiar a Modo Animación';
                this.globalModeToggle.className = 'btn btn-info btn-sm mode-toggle-always-visible';
                if (iconElement) {
                    iconElement.className = 'fas fa-palette'; // Icono de paleta para cambiar a dibujo
                }
            } else {
                // En modo animación, mostrar icono de paleta para cambiar a dibujo
                this.globalModeToggle.title = 'Cambiar a Modo Dibujo';
                this.globalModeToggle.className = 'btn btn-warning btn-sm mode-toggle-always-visible';
                if (iconElement) {
                    iconElement.className = 'fas fa-film'; // Icono de película para cambiar a animación
                }
            }
        }
        
        console.log(`[ModeManager] UI del botón global actualizada para modo: ${this.currentMode}`);
    }
    
    updateControlsVisibility() {
        console.log(`[ModeManager] 🔄 Actualizando controles para modo: ${this.currentMode}`);
        
        // DEBUG: Verificar que los elementos existan
        console.log('[ModeManager] DEBUG - drawingModeControls:', this.drawingModeControls);
        console.log('[ModeManager] DEBUG - animationModeControls:', this.animationModeControls);
        
        // Controlar visibilidad de botones de tutorial
        this.updateTutorialButtonsVisibility();
        
        // Usar JavaScript directo para forzar el cambio visual
        if (this.drawingModeControls && this.animationModeControls) {
            if (this.currentMode === 'drawing') {
                console.log('[ModeManager] 🎨 Activando modo DIBUJO');
                
                // FORZAR cambio con JavaScript directo - DOBLE SEGURIDAD
                this.drawingModeControls.style.display = 'flex';
                this.drawingModeControls.style.visibility = 'visible';
                this.animationModeControls.style.display = 'none';
                this.animationModeControls.style.visibility = 'hidden';
                
                // También cambiar las clases por compatibilidad
                this.drawingModeControls.classList.remove('hidden');
                this.drawingModeControls.classList.add('visible');
                this.animationModeControls.classList.remove('visible');
                this.animationModeControls.classList.add('hidden');
                
            } else {
                console.log('[ModeManager] 🎬 Activando modo ANIMACIÓN');
                
                // FORZAR cambio con JavaScript directo - DOBLE SEGURIDAD
                this.animationModeControls.style.display = 'flex';
                this.animationModeControls.style.visibility = 'visible';
                this.drawingModeControls.style.display = 'none';
                this.drawingModeControls.style.visibility = 'hidden';
                
                // También cambiar las clases por compatibilidad
                this.animationModeControls.classList.remove('hidden');
                this.animationModeControls.classList.add('visible');
                this.drawingModeControls.classList.remove('visible');
                this.drawingModeControls.classList.add('hidden');
            }
            
            // DEBUG: Verificar los estilos aplicados
            console.log('[ModeManager] DEBUG - Estilos después del cambio:');
            console.log('- drawingModeControls display:', this.drawingModeControls.style.display);
            console.log('- drawingModeControls visibility:', this.drawingModeControls.style.visibility);
            console.log('- animationModeControls display:', this.animationModeControls.style.display);
            console.log('- animationModeControls visibility:', this.animationModeControls.style.visibility);
            console.log('- drawingModeControls classes:', this.drawingModeControls.className);
            console.log('- animationModeControls classes:', this.animationModeControls.className);
            
        } else {
            console.error('[ModeManager] ❌ ERROR: No se pudieron encontrar los contenedores de controles');
            console.error('[ModeManager] - drawingModeControls:', this.drawingModeControls);
            console.error('[ModeManager] - animationModeControls:', this.animationModeControls);
        }
        
        // Ya no necesitamos actualizar label del modo (no hay label visible)
        console.log(`[ModeManager] ✅ Controles actualizados para modo: ${this.currentMode}`);
    }
    
    updateTutorialButtonsVisibility() {
        const drawingTutorialBtn = document.getElementById('start-tutorial-drawing-btn');
        const animationTutorialBtn = document.getElementById('start-tutorial-animation-btn');
        
        if (drawingTutorialBtn && animationTutorialBtn) {
            // Notificar al sistema de configuración sobre el cambio de modo
            if (window.safeConfigurationUpdater) {
                window.safeConfigurationUpdater.handleModeChange(this.currentMode);
            }
            
            // Solo aplicar la lógica de modo si no hay configuración específica del usuario
            const drawingUserConfig = drawingTutorialBtn.getAttribute('data-config-visible');
            const animationUserConfig = animationTutorialBtn.getAttribute('data-config-visible');
            
            if (this.currentMode === 'drawing') {
                // Mostrar tutorial de dibujo solo si el usuario no lo ha configurado como oculto
                if (drawingUserConfig !== 'false') {
                    drawingTutorialBtn.classList.remove('hidden');
                    if (!drawingTutorialBtn.classList.contains('config-hidden')) {
                        drawingTutorialBtn.style.display = 'flex';
                    }
                }
                
                // Ocultar tutorial de animación (independiente de configuración usuario)
                animationTutorialBtn.classList.add('hidden');
                if (!animationTutorialBtn.classList.contains('config-visible')) {
                    animationTutorialBtn.style.display = 'none';
                }
                
                console.log('[ModeManager] 📚 Modo DIBUJO activo');
            } else {
                // Mostrar tutorial de animación solo si el usuario no lo ha configurado como oculto
                if (animationUserConfig !== 'false') {
                    animationTutorialBtn.classList.remove('hidden');
                    if (!animationTutorialBtn.classList.contains('config-hidden')) {
                        animationTutorialBtn.style.display = 'flex';
                    }
                }
                
                // Ocultar tutorial de dibujo (independiente de configuración usuario)
                drawingTutorialBtn.classList.add('hidden');
                if (!drawingTutorialBtn.classList.contains('config-visible')) {
                    drawingTutorialBtn.style.display = 'none';
                }
                
                console.log('[ModeManager] 📚 Modo ANIMACIÓN activo');
            }
        } else {
            console.warn('[ModeManager] ❌ No se encontraron los botones de tutorial');
        }
    }
    
    // Método para verificar si un evento debe ser procesado
    shouldProcessEvent(eventType, target) {
        // En modo dibujo, permitir eventos de dibujo
        if (this.currentMode === 'drawing') {
            return eventType === 'drawing' || eventType === 'ballDrawing';
        }
        
        // En modo animación, permitir eventos de animación y movimiento de jugadores
        if (this.currentMode === 'animation') {
            return eventType === 'animation' || eventType === 'playerMove';
        }
        
        return false;
    }
    
    // Getters para otros módulos
    getCurrentMode() {
        return this.currentMode;
    }
    
    isDrawingMode() {
        return this.currentMode === 'drawing';
    }
    
    isAnimationMode() {
        return this.currentMode === 'animation';
    }
    
    // Método para forzar un modo (útil al importar animaciones)
    forceMode(mode) {
        if (mode === 'drawing' || mode === 'animation') {
            this.switchToMode(mode);
        }
    }
    
    // NUEVA: Función para limpiar completamente la cancha
    clearPitch() {
        console.log('[ModeManager] 🧹 Limpiando cancha...');
        
        // Limpiar todas las líneas dibujadas
        if (this.drawingManager && typeof this.drawingManager.clearAllLines === 'function') {
            this.drawingManager.clearAllLines();
        }
        
        // Limpiar estelas del balón
        if (this.ballDrawingManager && typeof this.ballDrawingManager.clearTrail === 'function') {
            this.ballDrawingManager.clearTrail();
        }
        
        // Limpiar canvas de dibujo directamente si existe
        const drawingCanvas = document.getElementById('drawing-canvas');
        if (drawingCanvas) {
            const ctx = drawingCanvas.getContext('2d');
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
        
        // NUEVO: Eliminar todos los tokens de jugadores y balones del DOM
        const pitch = document.getElementById('pitch-container');
        if (pitch) {
            pitch.querySelectorAll('.player-token, .ball-token').forEach(el => el.remove());
            console.log('[ModeManager] 🧹 Tokens de jugadores y balones eliminados del DOM');
        }
        
        console.log('[ModeManager] ✅ Cancha limpiada completamente');
    }
    
    // NUEVA: Función para asegurar que el balón esté en el centro
    ensureBallAtCenter() {
        console.log('[ModeManager] ⚽ Posicionando balón en el centro...');
        
        // Acceder al estado global de jugadores activos desde main.js
        if (window.main && window.main.state && window.main.state.activePlayers) {
            const ballPlayer = window.main.state.activePlayers.find(p => 
                p.isBall || p.type === 'ball' || p.role === 'ball' || p.id === 'ball'
            );
            
            if (ballPlayer) {
                ballPlayer.x = 50; // centro horizontal (50%)
                ballPlayer.y = 50; // centro vertical (50%)
                console.log('[ModeManager] ✅ Balón posicionado en el centro (50%, 50%)');
            } else {
                console.log('[ModeManager] ⚠️ No se encontró el balón en activePlayers');
            }
        } else {
            console.log('[ModeManager] ⚠️ No se pudo acceder al estado global para posicionar el balón');
        }
    }
    
    // NUEVA: Función para restaurar el estado visual del modo eliminar líneas
    restoreDeleteLineMode() {
        if (!this.drawingManager || !this.drawingManager.deleteLineMode) return;
        
        console.log('[ModeManager] 🔧 Restaurando estado visual del modo eliminar líneas...');
        
        // Buscar el botón de eliminar líneas
        const deleteLineBtn = document.getElementById('delete-line-mode');
        const drawingCanvas = document.getElementById('drawing-canvas');
        
        if (deleteLineBtn) {
            // Restaurar clase activa
            deleteLineBtn.classList.add('active');
            
            // Restaurar animación del ícono
            const icon = deleteLineBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-beat');
            }
            
            // Restaurar título del botón
            deleteLineBtn.title = 'Salir del modo borrar líneas';
            
            console.log('[ModeManager] ✅ Botón de eliminar líneas restaurado');
        }
        
        if (drawingCanvas) {
            // Restaurar cursor de tijeras
            drawingCanvas.classList.add('scissors-cursor-simple');
            console.log('[ModeManager] ✅ Cursor de tijeras restaurado');
        }
    }
}
