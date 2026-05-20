#!/bin/bash
# Script rápido para testing - Ejecuta en 3 terminales diferentes

echo "🚀 ANIME THEMES INTEGRATION TESTING"
echo "=================================="
echo ""
echo "OPCIÓN 1: Ejecutar TODO en una terminal (requiere background)"
echo "bash quick-test.sh"
echo ""
echo "OPCIÓN 2: Ejecutar en 3 terminales SEPARADAS:"
echo ""
echo "TERMINAL 1 - Backend:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "TERMINAL 2 - Frontend:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "TERMINAL 3 - Tests:"
echo "  bash quick-test.sh test"
echo ""
echo "=================================="
echo ""

if [ "$1" = "test" ]; then
  echo "🧪 EJECUTANDO TESTS..."
  sleep 2

  echo ""
  echo "TEST 1: Health Check"
  echo "-------------------"
  curl -s http://localhost:5000/api/health | jq . 2>/dev/null || echo "Error: Backend no responde"

  echo ""
  echo "TEST 2: Buscar 'naruto'"
  echo "---------------------"
  curl -s "http://localhost:5000/api/anime/search?q=naruto" | jq '.data[0] | {name, slug, openings_count: (.openings | length)}' 2>/dev/null || echo "Error en búsqueda"

  echo ""
  echo "TEST 3: Obtener detalle de 'naruto'"
  echo "----------------------------------"
  curl -s "http://localhost:5000/api/anime/naruto" | jq '.data | {name, year, openings_count: (.openings | length)}' 2>/dev/null || echo "Error en detalle"

  echo ""
  echo "TEST 4: Openings populares"
  echo "------------------------"
  curl -s "http://localhost:5000/api/anime/popular" | jq '.count' 2>/dev/null || echo "Error en populares"

  echo ""
  echo "✅ Tests completados"

else
  echo "⏳ Para ejecutar tests, usa: bash quick-test.sh test"
fi
