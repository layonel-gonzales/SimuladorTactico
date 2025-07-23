// Script de protección avanzada para código fuente
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CodeProtection {
    constructor() {
        this.protectionKey = this.generateProtectionKey();
        this.checksums = new Map();
    }

    generateProtectionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Añadir verificaciones de integridad al código
    addIntegrityChecks(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const checksum = crypto.createHash('sha256').update(content).digest('hex');
        
        // Inyectar verificación de integridad
        const protectedContent = `
// === VERIFICACIÓN DE INTEGRIDAD ===
(function() {
    const expectedChecksum = '${checksum}';
    const currentContent = document.querySelector('script[src*="${path.basename(filePath)}"]');
    
    if (!currentContent) {
        console.error('[Protection] Script no encontrado');
        return;
    }
    
    // Verificación adicional de dominio
    if (window.location.hostname !== '${this.getAllowedDomain()}') {
        console.error('[Protection] Dominio no autorizado');
        document.body.innerHTML = '<h1>Acceso no autorizado</h1>';
        return;
    }
    
    // Verificación de licencia cada cierto tiempo
    setInterval(() => {
        if (typeof licenseManager !== 'undefined') {
            licenseManager.validateLicense();
        }
    }, 5 * 60 * 1000); // cada 5 minutos
})();

${content}

// === ANTI-DEBUGGING ===
setInterval(() => {
    const start = Date.now();
    debugger; // Se ejecuta solo si las dev tools están abiertas
    const end = Date.now();
    
    if (end - start > 100) {
        console.warn('[Protection] Developer tools detectadas');
        // En producción, podrías desactivar funcionalidades o mostrar advertencia
    }
}, 1000);
        `;

        return protectedContent;
    }

    getAllowedDomain() {
        // En producción, retornar tu dominio real
        return process.env.ALLOWED_DOMAIN || 'localhost';
    }

    // Ofuscar nombres de variables críticas
    obfuscateVariables(content) {
        const variableMap = {
            'licenseManager': this.randomName(),
            'paymentManager': this.randomName(),
            'premiumFeatures': this.randomName(),
            'validateLicense': this.randomName()
        };

        let obfuscated = content;
        for (const [original, replacement] of Object.entries(variableMap)) {
            const regex = new RegExp(`\\b${original}\\b`, 'g');
            obfuscated = obfuscated.replace(regex, replacement);
        }

        return obfuscated;
    }

    randomName() {
        return '_' + crypto.randomBytes(8).toString('hex');
    }

    // Añadir trampas anti-tampering
    addAntiTampering(content) {
        return `
// === ANTI-TAMPERING ===
(function() {
    const originalConsole = console.log;
    let tamperAttempts = 0;
    
    // Detectar modificaciones del objeto window
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
        if (prop.includes('license') || prop.includes('premium')) {
            tamperAttempts++;
            if (tamperAttempts > 3) {
                document.body.innerHTML = '<h1>Manipulación detectada</h1>';
                return;
            }
        }
        return originalDefineProperty.call(this, obj, prop, descriptor);
    };
    
    // Detectar uso de developer tools
    const devtools = {
        open: false,
        orientation: null
    };
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('[Protection] DevTools detectadas');
            }
        }
    }, 500);
})();

${content}
        `;
    }

    // Procesar archivo completo
    processFile(inputPath, outputPath) {
        console.log(`Protegiendo: ${inputPath}`);
        
        let content = fs.readFileSync(inputPath, 'utf8');
        
        // Aplicar protecciones
        content = this.addIntegrityChecks(inputPath);
        content = this.obfuscateVariables(content);
        content = this.addAntiTampering(content);
        
        // Minificar (básico)
        content = this.basicMinify(content);
        
        fs.writeFileSync(outputPath, content);
        console.log(`Archivo protegido guardado en: ${outputPath}`);
    }

    basicMinify(content) {
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios de bloque
            .replace(/\/\/.*$/gm, '') // Remover comentarios de línea
            .replace(/\s+/g, ' ') // Reducir espacios en blanco
            .trim();
    }

    // Procesar todos los archivos JS
    protectAllFiles() {
        const jsDir = path.join(__dirname, '../js');
        const outputDir = path.join(__dirname, '../protected');
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        const files = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
        
        files.forEach(file => {
            const inputPath = path.join(jsDir, file);
            const outputPath = path.join(outputDir, file);
            this.processFile(inputPath, outputPath);
        });

        console.log(`✅ ${files.length} archivos protegidos exitosamente`);
    }
}

// Ejecutar protección
const protection = new CodeProtection();
protection.protectAllFiles();
