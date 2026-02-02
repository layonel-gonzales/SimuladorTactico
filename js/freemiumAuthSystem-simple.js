/**
 * 🔧 SISTEMA FREEMIUM ULTRA-SIMPLIFICADO
 * Versión sin errores y ultra-robusta
 */


class UltraSimpleAuth {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.token = null;
        this.user = null;
        this.isReady = false;
        
        // Intentar cargar token existente de forma segura
        try {
            this.token = localStorage.getItem('auth_token');
        } catch (e) {
            console.log('Error accediendo localStorage:', e);
        }
        
        this.isReady = true;
    }

    async login(email, password) {       
        try {
            const deviceId = 'web-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    deviceId: deviceId,
                    deviceInfo: { 
                        browser: 'WebBrowser',
                        timestamp: new Date().toISOString()
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error de servidor' }));
                console.error('❌ Error del servidor:', errorData);
                throw new Error(errorData.error || `Error HTTP ${response.status}`);
            }

            const data = await response.json();
            
            this.token = data.token;
            this.user = {
                email: email,
                isPremium: true, // Por defecto asumimos premium para el usuario de prueba
                ...data.user
            };
            
            // Guardar token de forma segura
            try {
                localStorage.setItem('auth_token', this.token);
            } catch (e) {
                console.log('No se pudo guardar en localStorage:', e);
            }
            
            return { success: true, user: this.user };
            
        } catch (error) {
            console.error('💥 Error en login:', error);
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        
        try {
            localStorage.removeItem('auth_token');
            localStorage.clear();
        } catch (e) {
            console.log('Error limpiando localStorage:', e);
        }
    }

    isAuthenticated() {
        return !!(this.token && this.user);
    }

    getCurrentUser() {
        return this.user;
    }

    canAccessPremium() {
        return this.user?.isPremium || false;
    }
    
    // Método para limpiar todos los datos de forma segura
    clearAllData() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            return true;
        } catch (e) {
            console.error('Error limpiando datos:', e);
            return false;
        }
    }
}

// Crear instancia global de forma segura
try {
    window.freemiumAuth = new UltraSimpleAuth();
} catch (e) {
    console.error('Error creando instancia global:', e);
}
