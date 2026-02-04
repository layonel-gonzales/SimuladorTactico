#!/bin/bash

# Script para publicar en GitHub Pages
# Uso: ./publish-gh-pages.sh

echo "🚀 Preparando publicación en GitHub Pages..."

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    echo "❌ Error: No estamos en un repositorio git"
    exit 1
fi

# Stash de cambios no commiteados
echo "📦 Guardando cambios locales..."
git stash

# Crear rama gh-pages si no existe
echo "🌿 Verificando rama gh-pages..."
if git show-ref --quiet refs/heads/gh-pages; then
    echo "✅ Rama gh-pages ya existe"
    git checkout gh-pages
else
    echo "➕ Creando rama gh-pages..."
    git checkout -b gh-pages
fi

# Asegurar que tenemos los cambios más recientes de main
echo "🔄 Sincronizando con rama principal..."
git merge main --allow-unrelated-histories || true

# Push a github
echo "📤 Subiendo a GitHub..."
git push -u origin gh-pages

# Volver a la rama principal
echo "🔙 Volviendo a rama principal..."
git checkout main

# Restaurar cambios locales
echo "📂 Restaurando cambios locales..."
git stash pop || true

echo ""
echo "✅ Publicación completada!"
echo ""
echo "Tu sitio estará disponible en:"
echo "https://[tu-usuario].github.io/simulador-tactico"
echo ""
echo "Nota: GitHub Pages puede tardar algunos minutos para actualizar"
