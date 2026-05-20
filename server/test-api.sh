#!/bin/bash
# Script de pruebas para las rutas de torneos
# Ejecuta: bash test-api.sh

BASE_URL="http://localhost:5000/api"

echo "======================================="
echo "  API ROUTES TEST - TORNEOS"
echo "======================================="

# Health Check
echo -e "\n\n[1] Health Check"
echo "GET /api/health"
curl -s -X GET "$BASE_URL/health" | jq .

# GET all tournaments
echo -e "\n\n[2] Listar todos los torneos"
echo "GET /api/torneos"
curl -s -X GET "$BASE_URL/torneos" | jq .

# CREATE a tournament (requiere que exista un usuario con ID 1)
echo -e "\n\n[3] Crear un nuevo torneo"
echo "POST /api/torneos"
curl -s -X POST "$BASE_URL/torneos" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anime Openings 2024",
    "description": "Torneo de apertura de anime más popular",
    "created_by": 1,
    "start_date": "2024-06-01T10:00:00Z",
    "end_date": "2024-06-30T23:59:59Z"
  }' | jq .

# GET tournament by ID
echo -e "\n\n[4] Obtener detalle de un torneo"
echo "GET /api/torneos/1"
curl -s -X GET "$BASE_URL/torneos/1" | jq .

echo -e "\n\n======================================="
echo "  Pruebas completadas"
echo "======================================="
