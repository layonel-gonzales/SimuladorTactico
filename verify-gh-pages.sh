#!/bin/bash
# Script para verificar que todo está listo para GitHub Pages

echo "🔍 Verificando preparación para GitHub Pages..."
echo ""

# Verificar archivos necesarios
echo "📋 Verificando archivos necesarios:"

files=(
    "index.html"
    "js/freemiumConfigManager.js"
    "data/gh-pages-config.json"
    "config/freemium-config.json"
    "js/animationManager.js"
    "GITHUB-PAGES-SETUP.md"
    "GH-PAGES-README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (FALTA)"
    fi
done

echo ""
echo "🔧 Verificando configuración:"

# Verificar que getStaticConfig existe
if grep -q "getStaticConfig()" js/freemiumConfigManager.js; then
    echo "✅ Método getStaticConfig() presente"
else
    echo "❌ Método getStaticConfig() NO encontrado"
fi

# Verificar que loadConfig usa getStaticConfig
if grep -q "this.getStaticConfig()" js/freemiumConfigManager.js; then
    echo "✅ loadConfig usa getStaticConfig()"
else
    echo "❌ loadConfig NO usa getStaticConfig()"
fi

# Verificar que animationManager tiene isMobileDevice
if grep -q "isMobileDevice()" js/animationManager.js; then
    echo "✅ Método isMobileDevice() presente"
else
    echo "❌ Método isMobileDevice() NO encontrado"
fi

# Verificar que animationManager tiene captureCanvasAsStream
if grep -q "captureCanvasAsStream" js/animationManager.js; then
    echo "✅ Método captureCanvasAsStream() presente"
else
    echo "❌ Método captureCanvasAsStream() NO encontrado"
fi

echo ""
echo "📊 Resumen de Repositorio Git:"
git status --short || echo "⚠️ No es un repositorio git"

echo ""
echo "✨ Verificación completada"
echo ""
echo "Próximos pasos:"
echo "1. Editar .gitignore si es necesario (agregar /server, /node_modules, .env)"
echo "2. Hacer commit de cambios: git add -A && git commit -m 'GitHub Pages ready'"
echo "3. Ejecutar script de publicación: ./publish-gh-pages.sh (o .ps1 en Windows)"
echo "4. Esperar 5-10 minutos para que GitHub Pages se actualice"
echo "5. Visitar: https://tu-usuario.github.io/simulador-tactico"
