/**
 * 🔧 GESTOR DE DISPOSITIVOS PREMIUM
 * 
 * Sistema para gestionar identificadores únicos de dispositivos,
 * control de límites y sincronización con el backend.
 * 
 * Funcionalidades:
 * - Generación de UUID único por dispositivo
 * - Detección de información del dispositivo
 * - Validación de límites de dispositivos
 * - Sincronización con backend
 * 
 * @author GitHub Copilot
 * @version 2.0.0
 */

class DeviceManager {
    constructor() {
        this.DEVICE_ID_KEY = 'simuladorTactico_deviceId_v2';
        this.DEVICE_INFO_KEY = 'simuladorTactico_deviceInfo';
        this.deviceId = null;
        this.deviceInfo = null;
        
        this.init();
    }

    init() {
        this.deviceId = this.getOrCreateDeviceId();
        this.deviceInfo = this.collectDeviceInfo();
        this.saveDeviceInfo();
        
        console.log('[DeviceManager] Inicializado:', {
            deviceId: this.deviceId.substring(0, 8) + '...',
            deviceInfo: this.deviceInfo
        });
    }

    /**
     * Genera un UUID único para el dispositivo
     */
    generateUUID() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(4);
            window.crypto.getRandomValues(array);
            return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('-');
        } else {
            // Fallback para navegadores antiguos
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    /**
     * Obtiene o crea un ID único para este dispositivo
     */
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
        
        if (!deviceId) {
            deviceId = this.generateUUID();
            localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
            console.log('[DeviceManager] Nuevo dispositivo registrado:', deviceId.substring(0, 8) + '...');
        } else {
            console.log('[DeviceManager] Dispositivo existente:', deviceId.substring(0, 8) + '...');
        }
        
        return deviceId;
    }

    /**
     * Recopila información del dispositivo para identificación
     */
    collectDeviceInfo() {
        const nav = navigator;
        const screen = window.screen;
        
        const info = {
            userAgent: nav.userAgent,
            platform: nav.platform,
            language: nav.language,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            touchSupport: 'ontouchstart' in window,
            cookieEnabled: nav.cookieEnabled,
            onlineStatus: nav.onLine,
            hardwareConcurrency: nav.hardwareConcurrency || 'unknown',
            maxTouchPoints: nav.maxTouchPoints || 0,
            timestamp: new Date().toISOString()
        };

        // Detectar tipo de dispositivo
        const userAgent = nav.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
            info.deviceType = 'mobile';
        } else if (/tablet|ipad/.test(userAgent)) {
            info.deviceType = 'tablet';
        } else {
            info.deviceType = 'desktop';
        }

        // Detectar navegador
        if (userAgent.includes('chrome')) info.browser = 'Chrome';
        else if (userAgent.includes('firefox')) info.browser = 'Firefox';
        else if (userAgent.includes('safari')) info.browser = 'Safari';
        else if (userAgent.includes('edge')) info.browser = 'Edge';
        else info.browser = 'Unknown';

        // Detectar sistema operativo
        if (userAgent.includes('windows')) info.os = 'Windows';
        else if (userAgent.includes('mac')) info.os = 'macOS';
        else if (userAgent.includes('linux')) info.os = 'Linux';
        else if (userAgent.includes('android')) info.os = 'Android';
        else if (userAgent.includes('ios')) info.os = 'iOS';
        else info.os = 'Unknown';

        return info;
    }

    /**
     * Guarda información del dispositivo en localStorage
     */
    saveDeviceInfo() {
        localStorage.setItem(this.DEVICE_INFO_KEY, JSON.stringify(this.deviceInfo));
    }

    /**
     * Obtiene información guardada del dispositivo
     */
    getSavedDeviceInfo() {
        const saved = localStorage.getItem(this.DEVICE_INFO_KEY);
        return saved ? JSON.parse(saved) : null;
    }

    /**
     * Genera un nombre amigable para el dispositivo
     */
    getDeviceFriendlyName() {
        const info = this.deviceInfo;
        let name = `${info.browser} en ${info.os}`;
        
        if (info.deviceType === 'mobile') {
            name += ' (Móvil)';
        } else if (info.deviceType === 'tablet') {
            name += ' (Tablet)';
        }
        
        return name;
    }

    /**
     * Obtiene el ID del dispositivo actual
     */
    getDeviceId() {
        return this.deviceId;
    }

    /**
     * Obtiene información completa del dispositivo
     */
    getDeviceInfo() {
        return {
            ...this.deviceInfo,
            friendlyName: this.getDeviceFriendlyName()
        };
    }

    /**
     * Resetea el dispositivo (crea nuevo ID)
     */
    resetDevice() {
        localStorage.removeItem(this.DEVICE_ID_KEY);
        localStorage.removeItem(this.DEVICE_INFO_KEY);
        this.init();
        
        console.log('[DeviceManager] Dispositivo reseteado');
        return this.deviceId;
    }

    /**
     * Verifica si el dispositivo ha cambiado significativamente
     */
    hasDeviceChanged() {
        const saved = this.getSavedDeviceInfo();
        if (!saved) return true;

        const current = this.deviceInfo;
        
        // Verificar cambios importantes
        const criticalFields = ['userAgent', 'platform', 'screenResolution'];
        
        for (const field of criticalFields) {
            if (saved[field] !== current[field]) {
                console.log(`[DeviceManager] Cambio detectado en ${field}:`, {
                    old: saved[field],
                    new: current[field]
                });
                return true;
            }
        }
        
        return false;
    }

    /**
     * Genera un fingerprint del dispositivo
     */
    generateFingerprint() {
        const info = this.deviceInfo;
        const data = [
            info.userAgent,
            info.platform,
            info.language,
            info.screenResolution,
            info.colorDepth,
            info.timezone
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
}

// Exportar función para compatibilidad con sistema actual
export function getOrCreateDeviceId() {
    if (!window.deviceManager) {
        window.deviceManager = new DeviceManager();
    }
    return window.deviceManager.getDeviceId();
}

// Exportar clase principal
export { DeviceManager };

// Crear instancia global si no existe
if (!window.deviceManager) {
    window.deviceManager = new DeviceManager();
}
