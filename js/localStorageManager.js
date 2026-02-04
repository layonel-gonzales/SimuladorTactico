/**
 * ═══════════════════════════════════════════════════════════════════════
 * 💾 LOCAL STORAGE MANAGER
 * ═══════════════════════════════════════════════════════════════════════
 * Sistema centralizado de almacenamiento local para todos los datos
 * Proporciona: guardar, cargar, backup, export, import, estadísticas
 * 
 * VENTAJAS:
 * ✅ Sin costos de servidor
 * ✅ Datos siempre disponibles (offline-first)
 * ✅ 5-10MB de almacenamiento por dominio
 * ✅ Funciona en mobile y PC
 * 
 * CONSIDERACIONES:
 * ⚠️ Se pierden si el usuario limpia cache del navegador
 * ⚠️ No sincroniza entre dispositivos
 * ⚠️ Se borra al desinstalar app en algunos navegadores
 */

class LocalStorageManager {
    constructor() {
        this.QUOTA_MB = 5; // Estimado conservador
        this.STORAGE_KEYS = {
            customPlayers: 'soccerTactics_customPlayers',
            customTeams: 'soccerTactics_customTeams',
            settings: 'soccerTactics_settings',
            formations: 'soccerTactics_formations',
            tactics: 'soccerTactics_tactics',
            favorites: 'soccerTactics_favorites',
            backups: 'soccerTactics_backups'
        };
        
        this.init();
    }
    
    /**
     * Inicializar el gestor
     */
    init() {
        this.checkStorageAvailability();
        this.monitorStorageUsage();
    }
    
    /**
     * Verificar si localStorage está disponible
     */
    checkStorageAvailability() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ localStorage no disponible:', e);
            return false;
        }
    }
    
    /**
     * Guardar datos de forma segura
     * @param {string} key - Clave de almacenamiento
     * @param {*} data - Datos a guardar
     */
    save(key, data) {
        try {
            const jsonString = JSON.stringify(data);
            
            // Verificar tamaño
            const sizeInBytes = new Blob([jsonString]).size;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            if (sizeInMB > this.QUOTA_MB) {
                console.warn(`⚠️ Datos exceden ${this.QUOTA_MB}MB: ${sizeInMB.toFixed(2)}MB`);
                this.dispatchWarning(`Los datos son muy grandes (${sizeInMB.toFixed(2)}MB)`);
                return false;
            }
            
            localStorage.setItem(key, jsonString);
            console.log(`✅ Datos guardados: ${key} (${sizeInMB.toFixed(3)}MB)`);
            return true;
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ Almacenamiento lleno');
                this.dispatchWarning('Almacenamiento local lleno. Elimina algunos datos.');
            } else {
                console.error('❌ Error guardando datos:', error);
            }
            return false;
        }
    }
    
    /**
     * Cargar datos
     * @param {string} key - Clave de almacenamiento
     * @returns {*} Datos cargados o null
     */
    load(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ Error cargando ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Eliminar datos
     * @param {string} key - Clave de almacenamiento
     */
    delete(key) {
        try {
            localStorage.removeItem(key);
            console.log(`✅ Datos eliminados: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando datos:', error);
            return false;
        }
    }
    
    /**
     * Obtener estadísticas de uso
     */
    getUsageStats() {
        let totalSize = 0;
        const stats = {};
        
        for (const [name, key] of Object.entries(this.STORAGE_KEYS)) {
            const data = localStorage.getItem(key);
            const size = data ? new Blob([data]).size / 1024 : 0; // KB
            stats[name] = {
                key,
                sizeKB: size.toFixed(2),
                itemCount: data ? JSON.parse(data).length || 1 : 0
            };
            totalSize += size;
        }
        
        return {
            stats,
            totalKB: totalSize.toFixed(2),
            totalMB: (totalSize / 1024).toFixed(3),
            usagePercent: ((totalSize / (this.QUOTA_MB * 1024)) * 100).toFixed(1),
            availableMB: (this.QUOTA_MB - (totalSize / 1024)).toFixed(2)
        };
    }
    
    /**
     * Crear backup completo
     */
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            data: {}
        };
        
        for (const key of Object.values(this.STORAGE_KEYS)) {
            const data = this.load(key);
            if (data) {
                backup.data[key] = data;
            }
        }
        
        return backup;
    }
    
    /**
     * Exportar datos como JSON (para descargar)
     */
    exportDataAsJSON() {
        const backup = this.createBackup();
        const json = JSON.stringify(backup, null, 2);
        return {
            content: json,
            filename: `simulador-tactico-backup-${new Date().toISOString().split('T')[0]}.json`
        };
    }
    
    /**
     * Exportar datos como CSV (jugadores personalizados)
     */
    exportPlayersAsCSV() {
        const customPlayers = this.load(this.STORAGE_KEYS.customPlayers) || [];
        
        if (customPlayers.length === 0) {
            return null;
        }
        
        // Encabezados
        const headers = ['ID', 'Nombre', 'Posición', 'Dorsal', 'Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'];
        
        // Datos
        const rows = customPlayers.map(p => [
            p.id,
            p.name,
            p.position,
            p.jersey_number,
            p.pace,
            p.shooting,
            p.passing,
            p.dribbling,
            p.defending,
            p.physical
        ]);
        
        // CSV
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return {
            content: csv,
            filename: `simulador-tactico-jugadores-${new Date().toISOString().split('T')[0]}.csv`
        };
    }
    
    /**
     * Importar datos desde JSON
     */
    importDataFromJSON(jsonString) {
        try {
            const backup = JSON.parse(jsonString);
            
            // Validar estructura
            if (!backup.data || typeof backup.data !== 'object') {
                throw new Error('Formato de backup inválido');
            }
            
            // Importar cada clave
            let imported = 0;
            for (const [key, data] of Object.entries(backup.data)) {
                if (Object.values(this.STORAGE_KEYS).includes(key)) {
                    this.save(key, data);
                    imported++;
                }
            }
            
            console.log(`✅ ${imported} secciones importadas`);
            return {
                success: true,
                message: `${imported} secciones importadas correctamente`,
                imported
            };
            
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            return {
                success: false,
                message: `Error al importar: ${error.message}`,
                error
            };
        }
    }
    
    /**
     * Limpiar todo el almacenamiento
     */
    clearAllStorage() {
        if (!confirm('⚠️ Esto eliminará TODOS los datos locales (jugadores, configuraciones, etc). ¿Continuar?')) {
            return false;
        }
        
        for (const key of Object.values(this.STORAGE_KEYS)) {
            localStorage.removeItem(key);
        }
        
        console.log('✅ Almacenamiento local limpiado completamente');
        return true;
    }
    
    /**
     * Monitorizar uso de almacenamiento
     */
    monitorStorageUsage() {
        // Verificar cada 5 minutos
        setInterval(() => {
            const stats = this.getUsageStats();
            const percentUsed = parseFloat(stats.usagePercent);
            
            if (percentUsed > 90) {
                console.warn(`⚠️ Almacenamiento casi lleno: ${percentUsed.toFixed(1)}%`);
                this.dispatchWarning(`Almacenamiento local casi lleno (${percentUsed.toFixed(1)}%)`);
            } else if (percentUsed > 80) {
                console.warn(`⚠️ Almacenamiento alto: ${percentUsed.toFixed(1)}%`);
            }
        }, 5 * 60 * 1000); // 5 minutos
    }
    
    /**
     * Emitir evento de advertencia
     */
    dispatchWarning(message) {
        window.dispatchEvent(new CustomEvent('storageWarning', {
            detail: { message, timestamp: new Date() }
        }));
    }
    
    /**
     * Obtener resumen de almacenamiento
     */
    getStorageSummary() {
        const stats = this.getUsageStats();
        return `
📊 ALMACENAMIENTO LOCAL:
├─ Usado: ${stats.totalMB}MB (${stats.usagePercent}%)
├─ Disponible: ${stats.availableMB}MB
├─ Total: ${this.QUOTA_MB}MB
└─ Ítems:
  ├─ Jugadores: ${stats.stats.customPlayers.itemCount}
  ├─ Equipos: ${stats.stats.customTeams.itemCount}
  ├─ Configuraciones: ${stats.stats.settings.itemCount}
  └─ Formaciones: ${stats.stats.formations.itemCount}
        `;
    }
    
    /**
     * Crear punto de restauración automático
     */
    createAutoSavePoint() {
        const savePoint = {
            customPlayers: this.load(this.STORAGE_KEYS.customPlayers),
            settings: this.load(this.STORAGE_KEYS.settings),
            timestamp: Date.now()
        };
        
        // Guardar en backups (mantener últimos 5)
        let backups = this.load(this.STORAGE_KEYS.backups) || [];
        backups.push(savePoint);
        backups = backups.slice(-5); // Mantener solo últimos 5
        
        this.save(this.STORAGE_KEYS.backups, backups);
        console.log('✅ Punto de restauración automático creado');
    }
}

// Exportar como singleton global
window.localStorageManager = new LocalStorageManager();
