# Script para publicar en GitHub Pages (Windows PowerShell)
# Uso: .\publish-gh-pages.ps1

Write-Host "🚀 Preparando publicación en GitHub Pages..." -ForegroundColor Green

# Verificar que estamos en un repositorio git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: No estamos en un repositorio git" -ForegroundColor Red
    exit 1
}

# Stash de cambios no commiteados
Write-Host "📦 Guardando cambios locales..." -ForegroundColor Yellow
git stash

# Crear rama gh-pages si no existe
Write-Host "🌿 Verificando rama gh-pages..." -ForegroundColor Yellow
try {
    git show-ref --quiet refs/heads/gh-pages
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Rama gh-pages ya existe" -ForegroundColor Green
        git checkout gh-pages
    } else {
        Write-Host "➕ Creando rama gh-pages..." -ForegroundColor Yellow
        git checkout -b gh-pages
    }
} catch {
    Write-Host "➕ Creando rama gh-pages..." -ForegroundColor Yellow
    git checkout -b gh-pages
}

# Asegurar que tenemos los cambios más recientes de main
Write-Host "🔄 Sincronizando con rama principal..." -ForegroundColor Yellow
git merge main --allow-unrelated-histories 2>&1 | Out-Null

# Push a github
Write-Host "📤 Subiendo a GitHub..." -ForegroundColor Yellow
git push -u origin gh-pages

# Volver a la rama principal
Write-Host "🔙 Volviendo a rama principal..." -ForegroundColor Yellow
git checkout main

# Restaurar cambios locales
Write-Host "📂 Restaurando cambios locales..." -ForegroundColor Yellow
git stash pop 2>&1 | Out-Null

Write-Host ""
Write-Host "✅ Publicación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Tu sitio estará disponible en:" -ForegroundColor Cyan
Write-Host "https://[tu-usuario].github.io/simulador-tactico" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nota: GitHub Pages puede tardar algunos minutos para actualizar" -ForegroundColor Yellow
