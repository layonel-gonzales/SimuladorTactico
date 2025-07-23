// Sistema de licencias y validación seguro
class LicenseManager {
    constructor() {
        this.apiUrl = 'https://tu-api-segura.com'; // Tu servidor backend
        this.encryptionKey = this.generateClientKey(); // Clave única por sesión
        this.currentLicense = null;
        this.validationInterval = null;
        this.init();
    }

    async init() {
        console.log('[License] Inicializando sistema de licencias...');
        await this.validateLicense();
        this.startPeriodicValidation();
    }

    generateClientKey() {
        // Genera una clave basada en datos del navegador (no perfecta, pero dificulta copias)
        const fingerprint = [
            navigator.userAgent,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset(),
            navigator.language,
            window.location.hostname
        ].join('|');
        
        return this.simpleHash(fingerprint);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    async validateLicense() {
        try {
            // Obtener token/licencia del localStorage (encriptado)
            const storedLicense = this.getStoredLicense();
            
            if (!storedLicense) {
                console.log('[License] No se encontró licencia, usando versión gratuita');
                this.setFreePlan();
                return false;
            }

            // Validar con el servidor
            const validation = await this.validateWithServer(storedLicense);
            
            if (validation.valid) {
                this.currentLicense = validation.license;
                this.updateUIForPremium();
                console.log('[License] Licencia válida:', validation.license.plan);
                return true;
            } else {
                console.log('[License] Licencia inválida, revirtiendo a gratuita');
                this.setFreePlan();
                this.removeStoredLicense();
                return false;
            }

        } catch (error) {
            console.error('[License] Error validando licencia:', error);
            // En caso de error, permitir uso temporal pero con funcionalidad limitada
            this.setFreePlan();
            return false;
        }
    }

    async validateWithServer(licenseData) {
        const response = await fetch(`${this.apiUrl}/validate-license`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Key': this.encryptionKey
            },
            body: JSON.stringify({
                license: licenseData,
                timestamp: Date.now(),
                fingerprint: this.encryptionKey
            })
        });

        if (!response.ok) {
            throw new Error('Error de red al validar licencia');
        }

        return await response.json();
    }

    getStoredLicense() {
        try {
            const encrypted = localStorage.getItem('st_license');
            if (!encrypted) return null;
            
            // Desencriptar licencia (implementación básica)
            return this.decrypt(encrypted);
        } catch (error) {
            console.error('[License] Error leyendo licencia almacenada:', error);
            return null;
        }
    }

    setStoredLicense(licenseData) {
        try {
            const encrypted = this.encrypt(JSON.stringify(licenseData));
            localStorage.setItem('st_license', encrypted);
        } catch (error) {
            console.error('[License] Error guardando licencia:', error);
        }
    }

    removeStoredLicense() {
        localStorage.removeItem('st_license');
    }

    // Encriptación básica (en producción usar algo más robusto)
    encrypt(text) {
        return btoa(text + '|' + this.encryptionKey);
    }

    decrypt(encrypted) {
        try {
            const decoded = atob(encrypted);
            const [data, key] = decoded.split('|');
            
            // Verificar que la clave coincida
            if (key !== this.encryptionKey) {
                throw new Error('Clave de encriptación no válida');
            }
            
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error desencriptando licencia');
        }
    }

    setFreePlan() {
        this.currentLicense = {
            plan: 'free',
            expires: null,
            features: {
                maxTactics: 3,
                maxAnimationFrames: 3,
                formations: ['4-4-2', '4-3-3'],
                export: 'watermark',
                realPlayers: false,
                cloudSave: false
            }
        };
        this.updateUIForFree();
    }

    startPeriodicValidation() {
        // Validar licencia cada 30 minutos
        this.validationInterval = setInterval(() => {
            this.validateLicense();
        }, 30 * 60 * 1000);
    }

    stopValidation() {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
    }

    updateUIForPremium() {
        // Mostrar funcionalidades premium
        document.querySelectorAll('.premium-feature').forEach(el => {
            el.style.display = 'block';
        });
        
        document.querySelectorAll('.free-limitation').forEach(el => {
            el.style.display = 'none';
        });

        // Actualizar badge de usuario
        this.updateUserBadge('premium');
    }

    updateUIForFree() {
        // Ocultar funcionalidades premium
        document.querySelectorAll('.premium-feature').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.free-limitation').forEach(el => {
            el.style.display = 'block';
        });

        // Actualizar badge de usuario
        this.updateUserBadge('free');
    }

    updateUserBadge(plan) {
        const badge = document.getElementById('user-plan-badge');
        if (badge) {
            badge.textContent = plan === 'premium' ? 'PREMIUM' : 'GRATUITO';
            badge.className = plan === 'premium' ? 'badge bg-warning' : 'badge bg-secondary';
        }
    }

    // Métodos de validación para funcionalidades
    canUseFeature(featureName) {
        if (!this.currentLicense) return false;
        
        // Verificar si la licencia no ha expirado
        if (this.currentLicense.expires && new Date() > new Date(this.currentLicense.expires)) {
            console.log('[License] Licencia expirada');
            this.setFreePlan();
            return false;
        }
        
        return this.currentLicense.features[featureName] === true || 
               this.currentLicense.features[featureName] === -1;
    }

    getFeatureLimit(featureName) {
        if (!this.currentLicense) return 0;
        return this.currentLicense.features[featureName];
    }

    // Activar licencia después de compra
    async activateLicense(purchaseToken, email) {
        try {
            const response = await fetch(`${this.apiUrl}/activate-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Key': this.encryptionKey
                },
                body: JSON.stringify({
                    token: purchaseToken,
                    email: email,
                    fingerprint: this.encryptionKey,
                    timestamp: Date.now()
                })
            });

            const result = await response.json();

            if (result.success) {
                this.setStoredLicense(result.license);
                this.currentLicense = result.license;
                this.updateUIForPremium();
                console.log('[License] Licencia activada exitosamente');
                return true;
            } else {
                throw new Error(result.message || 'Error activando licencia');
            }

        } catch (error) {
            console.error('[License] Error activando licencia:', error);
            return false;
        }
    }
}

// Singleton para manejo global
window.licenseManager = new LicenseManager();

export default LicenseManager;
