# Script para testing en PowerShell (Windows)
# Ejecuta: .\quick-test.ps1

param(
    [string]$Command = "info"
)

$BASE_URL = "http://localhost:5000/api"

function Show-Info {
    Write-Host "🚀 ANIME THEMES INTEGRATION TESTING" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPCIÓN 1: Abrir 2 PowerShell adicionales y ejecutar:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "PowerShell 1 - Backend:" -ForegroundColor Green
    Write-Host "  cd server" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "PowerShell 2 - Frontend:" -ForegroundColor Green
    Write-Host "  cd client" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "PowerShell 3 - Tests (actual):" -ForegroundColor Green
    Write-Host "  .\quick-test.ps1 test" -ForegroundColor White
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
}

function Test-Health {
    Write-Host ""
    Write-Host "TEST 1: Health Check" -ForegroundColor Yellow
    Write-Host "-------------------" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get -TimeoutSec 5
        Write-Host "✅ Server responded:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 2) -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: Backend no responde" -ForegroundColor Red
        Write-Host "   Asegúrate de ejecutar: cd server && npm run dev" -ForegroundColor Red
    }
}

function Test-Search {
    Write-Host ""
    Write-Host "TEST 2: Buscar 'naruto'" -ForegroundColor Yellow
    Write-Host "---------------------" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/anime/search?q=naruto" -Method Get -TimeoutSec 10
        if ($response.data.Count -gt 0) {
            $anime = $response.data[0]
            Write-Host "✅ Búsqueda exitosa:" -ForegroundColor Green
            Write-Host "   Anime: $($anime.name)" -ForegroundColor Green
            Write-Host "   Slug: $($anime.slug)" -ForegroundColor Green
            Write-Host "   Openings: $($anime.openings.Count)" -ForegroundColor Green
            Write-Host "   Endings: $($anime.endingss.Count)" -ForegroundColor Green
            if ($anime.openings.Count -gt 0) {
                Write-Host "   Primer Opening: $($anime.openings[0].title)" -ForegroundColor Green
                Write-Host "   Artista: $($anime.openings[0].artist)" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ No se encontraron resultados" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error en búsqueda: $_" -ForegroundColor Red
    }
}

function Test-Detail {
    Write-Host ""
    Write-Host "TEST 3: Obtener detalle de 'naruto'" -ForegroundColor Yellow
    Write-Host "----------------------------------" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/anime/naruto" -Method Get -TimeoutSec 10
        $anime = $response.data
        Write-Host "✅ Detalle obtenido:" -ForegroundColor Green
        Write-Host "   Nombre: $($anime.name)" -ForegroundColor Green
        Write-Host "   Año: $($anime.year)" -ForegroundColor Green
        Write-Host "   Temporada: $($anime.season)" -ForegroundColor Green
        Write-Host "   Total Openings: $($anime.openings.Count)" -ForegroundColor Green
        Write-Host "   Total Endings: $($anime.endingss.Count)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al obtener detalle: $_" -ForegroundColor Red
    }
}

function Test-Popular {
    Write-Host ""
    Write-Host "TEST 4: Openings Populares" -ForegroundColor Yellow
    Write-Host "------------------------" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/anime/popular" -Method Get -TimeoutSec 10
        $count = $response.data.Count
        Write-Host "✅ Openings populares cargados: $count" -ForegroundColor Green
        
        if ($count -gt 0) {
            $opening = $response.data[0]
            Write-Host "   Primer Opening:" -ForegroundColor White
            Write-Host "   - Anime: $($opening.animeName)" -ForegroundColor Green
            Write-Host "   - Título: $($opening.title)" -ForegroundColor Green
            Write-Host "   - Artista: $($opening.artist)" -ForegroundColor Green
            if ($opening.videoUrl) {
                Write-Host "   - ✅ Con vídeo" -ForegroundColor Green
            } else {
                Write-Host "   - ❌ Sin vídeo" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "❌ Error en populares: $_" -ForegroundColor Red
    }
}

function Run-AllTests {
    Test-Health
    Test-Search
    Test-Detail
    Test-Popular
    
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "✅ Tests completados" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Cyan
}

# Ejecutar comando solicitado
switch ($Command.ToLower()) {
    "test" {
        Run-AllTests
    }
    "health" {
        Test-Health
    }
    "search" {
        Test-Search
    }
    "detail" {
        Test-Detail
    }
    "popular" {
        Test-Popular
    }
    default {
        Show-Info
    }
}
