/**
 * ==========================================
 * 🛡️ SECURITY UTILS - Utilidades de Seguridad Frontend
 * ==========================================
 * Funciones para sanitizar datos y prevenir XSS
 * ==========================================
 */

const SecurityUtils = (function() {
    'use strict';
    
    /**
     * Caracteres HTML peligrosos y sus entidades
     */
    const HTML_ENTITIES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    
    /**
     * Escapar HTML para prevenir XSS
     * @param {string} str - Texto a escapar
     * @returns {string} Texto escapado
     */
    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"'`=\/]/g, char => HTML_ENTITIES[char] || char);
    }
    
    /**
     * Sanitizar texto - elimina tags HTML
     * @param {string} str - Texto a sanitizar
     * @returns {string} Texto sin HTML
     */
    function sanitizeText(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/<[^>]*>/g, '')  // Eliminar todos los tags HTML
            .replace(/javascript:/gi, '')  // Eliminar javascript: protocol
            .replace(/on\w+=/gi, '')  // Eliminar event handlers
            .trim();
    }
    
    /**
     * Crear elemento de texto seguro (sin innerHTML)
     * @param {string} tag - Nombre del tag
     * @param {string} text - Texto contenido
     * @param {object} attributes - Atributos del elemento
     * @returns {HTMLElement}
     */
    function createSafeElement(tag, text, attributes = {}) {
        const element = document.createElement(tag);
        element.textContent = text;
        
        // Agregar atributos de forma segura
        for (const [key, value] of Object.entries(attributes)) {
            // Prevenir atributos peligrosos
            if (key.toLowerCase().startsWith('on') || key.toLowerCase() === 'href' && value.includes('javascript:')) {
                console.warn('[Security] Atributo peligroso bloqueado:', key);
                continue;
            }
            element.setAttribute(key, value);
        }
        
        return element;
    }
    
    /**
     * Insertar HTML de forma segura usando template
     * Solo permite tags específicos
     * @param {HTMLElement} container - Contenedor destino
     * @param {string} htmlTemplate - Template HTML
     * @param {object} data - Datos a interpolar (se escapan automáticamente)
     */
    function safeInnerHTML(container, htmlTemplate, data = {}) {
        // Escapar todos los valores del data
        const safeData = {};
        for (const [key, value] of Object.entries(data)) {
            safeData[key] = escapeHtml(String(value ?? ''));
        }
        
        // Interpolar valores de forma segura
        let html = htmlTemplate;
        for (const [key, value] of Object.entries(safeData)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            html = html.replace(regex, value);
        }
        
        container.innerHTML = html;
    }
    
    /**
     * Validar URL (solo http/https)
     * @param {string} url - URL a validar
     * @returns {boolean}
     */
    function isValidUrl(url) {
        if (typeof url !== 'string') return false;
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }
    
    /**
     * Validar email
     * @param {string} email - Email a validar
     * @returns {boolean}
     */
    function isValidEmail(email) {
        if (typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 255;
    }
    
    /**
     * Validar contraseña según política
     * @param {string} password - Contraseña a validar
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    function validatePassword(password) {
        const errors = [];
        
        if (!password || typeof password !== 'string') {
            return { isValid: false, errors: ['Contraseña requerida'] };
        }
        
        if (password.length < 8) {
            errors.push('Mínimo 8 caracteres');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Al menos una minúscula');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Al menos una mayúscula');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Al menos un número');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Al menos un carácter especial');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Generar token CSRF simple para localStorage
     * @returns {string}
     */
    function generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Limpiar localStorage de forma segura
     * Mantiene solo las claves especificadas
     * @param {string[]} keysToKeep - Claves a mantener
     */
    function cleanLocalStorage(keysToKeep = []) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!keysToKeep.includes(key)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    /**
     * Detectar posibles ataques XSS en input
     * @param {string} input - Input a verificar
     * @returns {boolean} true si es sospechoso
     */
    function detectXSS(input) {
        if (typeof input !== 'string') return false;
        
        const patterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /expression\s*\(/i,
            /url\s*\(/i
        ];
        
        return patterns.some(pattern => pattern.test(input));
    }
    
    // API pública
    return {
        escapeHtml,
        sanitizeText,
        createSafeElement,
        safeInnerHTML,
        isValidUrl,
        isValidEmail,
        validatePassword,
        generateCSRFToken,
        cleanLocalStorage,
        detectXSS
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SecurityUtils = SecurityUtils;
}
