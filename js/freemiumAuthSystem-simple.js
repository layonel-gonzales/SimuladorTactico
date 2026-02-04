/**
 * UltraSimpleAuth - Sistema de autenticación simple para Simulador Táctico
 * Compatible con GitHub Pages y desarrollo local
 */

class UltraSimpleAuth {
    constructor() {
        this.tokenKey = 'auth_token';
        this.emailKey = 'user_email';
        this.roleKey = 'user_role';
        this.planKey = 'user_plan';
        this.permissionsKey = 'user_permissions';
        
        // Usuarios válidos para testing
        this.validUsers = {
            'test@example.com': {
                password: 'Test123!',
                email: 'test@example.com',
                role: 'admin',
                plan: 'pro',
                permissions: 'all'
            }
        };
    }
    
    /**
     * Realizar login con email y password
     */
    async login(email, password) {
        try {
            // Validar entrada
            if (!email || !password) {
                return {
                    success: false,
                    error: 'Email y password son requeridos'
                };
            }
            
            // Verificar credenciales locales
            const user = this.validUsers[email];
            if (!user || user.password !== password) {
                return {
                    success: false,
                    error: 'Email o contraseña incorrectos'
                };
            }
            
            // En GitHub Pages o desarrollo, generar token automáticamente
            if (this.isGitHubPagesDev()) {
                this.setToken(user);
                return {
                    success: true,
                    user: user
                };
            }
            
            // Intenta autenticarse con servidor (si existe)
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.setToken(data.user);
                    return {
                        success: true,
                        user: data.user
                    };
                } else {
                    // Si el servidor falla, usar fallback local
                    this.setToken(user);
                    return {
                        success: true,
                        user: user
                    };
                }
            } catch (serverError) {
                // Sin servidor disponible, usar fallback local
                this.setToken(user);
                return {
                    success: true,
                    user: user
                };
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Error en autenticación'
            };
        }
    }
    
    /**
     * Guardar token y datos de usuario en localStorage
     */
    setToken(user) {
        const token = this.generateToken();
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.emailKey, user.email);
        localStorage.setItem(this.roleKey, user.role || 'user');
        localStorage.setItem(this.planKey, user.plan || 'free');
        localStorage.setItem(this.permissionsKey, user.permissions || 'limited');
    }
    
    /**
     * Verificar si está autenticado
     */
    isAuthenticated() {
        return !!localStorage.getItem(this.tokenKey);
    }
    
    /**
     * Obtener token actual
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
    
    /**
     * Obtener datos del usuario autenticado
     */
    getUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        return {
            email: localStorage.getItem(this.emailKey),
            role: localStorage.getItem(this.roleKey),
            plan: localStorage.getItem(this.planKey),
            permissions: localStorage.getItem(this.permissionsKey)
        };
    }
    
    /**
     * Logout - limpiar localStorage
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.emailKey);
        localStorage.removeItem(this.roleKey);
        localStorage.removeItem(this.planKey);
        localStorage.removeItem(this.permissionsKey);
    }
    
    /**
     * Verificar si está en GitHub Pages o desarrollo
     */
    isGitHubPagesDev() {
        return window.location.hostname === 'kmeza.github.io' || 
               window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               localStorage.getItem('DEVELOPMENT_MODE') === 'true';
    }
    
    /**
     * Generar token simple (para desarrollo)
     */
    generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UltraSimpleAuth;
}
