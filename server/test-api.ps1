# Script de pruebas para las rutas de torneos
# Ejecuta con PowerShell

$BASE_URL = "http://localhost:5000/api"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  API ROUTES TEST - TORNEOS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Health Check
Write-Host "`n[1] Health Check" -ForegroundColor Green
Write-Host "GET /api/health" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
$response | ConvertTo-Json | Write-Host

# GET all tournaments
Write-Host "`n[2] Listar todos los torneos" -ForegroundColor Green
Write-Host "GET /api/torneos" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$BASE_URL/torneos" -Method Get
$response | ConvertTo-Json | Write-Host

# CREATE a tournament
Write-Host "`n[3] Crear un nuevo torneo" -ForegroundColor Green
Write-Host "POST /api/torneos" -ForegroundColor Yellow
$body = @{
    name = "Anime Openings 2024"
    description = "Torneo de apertura de anime más popular"
    created_by = 1
    start_date = "2024-06-01T10:00:00Z"
    end_date = "2024-06-30T23:59:59Z"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/torneos" -Method Post -ContentType "application/json" -Body $body
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# GET tournament by ID
Write-Host "`n[4] Obtener detalle de un torneo" -ForegroundColor Green
Write-Host "GET /api/torneos/1" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/torneos/1" -Method Get
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  Pruebas completadas" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
