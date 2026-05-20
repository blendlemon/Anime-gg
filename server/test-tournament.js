/**
 * Script de prueba para la lógica del torneo
 * 
 * Pasos:
 * 1. Genera un JWT válido
 * 2. Crea un torneo con 16 participantes
 * 3. Obtiene el torneo creado
 * 4. Obtiene el ranking
 * 5. Simula votos e intenta avanzar matches
 */

import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'

const API_URL = 'http://localhost:5000'
const JWT_SECRET = 'secret'

// Usar un ObjectId válido de MongoDB (cualquiera funcionará para este test)
const testUserId = '507f1f77bcf86cd799439011'
const token = jwt.sign({ id: testUserId }, JWT_SECRET, { expiresIn: '1h' })

console.log('\n📋 TEST DE TORNEO\n')
console.log(`🔑 Token JWT: ${token.substring(0, 30)}...\n`)

// Test 1: Crear torneo
async function testCreateTournament() {
  console.log('1️⃣  Creando torneo...')

  try {
    const response = await fetch(`${API_URL}/api/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Tournament ' + new Date().getTime(),
        description: 'Torneo de prueba',
        size: 16,
        filterType: 'OP'
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log(`✅ Torneo creado: ${data.data.name}`)
      console.log(`   ID: ${data.data._id}`)
      console.log(`   Invite Code: ${data.data.invite_code}`)
      console.log(`   Participantes: ${data.data.participants_count}`)
      console.log(`   Rondas: ${data.data.rounds}\n`)
      return data.data._id
    } else {
      console.error(`❌ Error: ${data.message}\n`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error en request: ${error.message}\n`)
    return null
  }
}

// Test 2: Obtener torneo
async function testGetTournament(tournamentId) {
  console.log('2️⃣  Obteniendo torneo...')

  try {
    const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}`, {
      method: 'GET'
    })

    const data = await response.json()

    if (data.success) {
      console.log(`✅ Torneo obtenido: ${data.data.tournament.name}`)
      console.log(`   Participantes: ${data.data.participants.length}`)
      console.log(`   Matches totales: ${Object.values(data.data.matches).flat().length}`)
      console.log(`   Room connected users: ${data.data.room.connected_users_count}\n`)
      return data.data
    } else {
      console.error(`❌ Error: ${data.message}\n`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error en request: ${error.message}\n`)
    return null
  }
}

// Test 3: Obtener ranking (debería estar vacío)
async function testGetRanking(tournamentId) {
  console.log('3️⃣  Obteniendo ranking...')

  try {
    const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/ranking`, {
      method: 'GET'
    })

    const data = await response.json()

    if (data.success) {
      console.log(`✅ Ranking obtenido: ${data.data.length} participantes`)
      if (data.data.length > 0) {
        console.log(`   1er lugar: ${data.data[0].opening.title} (${data.data[0].votes} votos)`)
      } else {
        console.log(`   (Sin votos aún)`)
      }
      console.log('')
      return data.data
    } else {
      console.error(`❌ Error: ${data.message}\n`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error en request: ${error.message}\n`)
    return null
  }
}

// Test 4: Intentar avanzar un match sin votos (debería funcionar con desempate por seed)
async function testAdvanceWinner(matchId) {
  console.log(`4️⃣  Avanzando match ${matchId.substring(0, 8)}...`)

  try {
    const response = await fetch(`${API_URL}/api/matches/${matchId}/advance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (data.success) {
      console.log(`✅ Match avanzado`)
      console.log(`   Status: ${data.data.match_status}`)
      if (data.data.next_round) {
        console.log(`   Siguiente ronda: ${data.data.next_round}`)
        console.log(`   Nuevos matches: ${data.data.new_matches_created}`)
      } else {
        console.log(`   Mensaje: ${data.data.message}`)
      }
      console.log('')
      return true
    } else {
      console.error(`❌ Error: ${data.message}\n`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error en request: ${error.message}\n`)
    return false
  }
}

// Ejecutar tests
async function runTests() {
  const tournamentId = await testCreateTournament()
  if (!tournamentId) return

  const tournament = await testGetTournament(tournamentId)
  if (!tournament) return

  const ranking = await testGetRanking(tournamentId)

  // Obtener el primer match de la ronda 1
  const firstMatch = tournament.matches[1]?.[0]
  if (firstMatch) {
    await testAdvanceWinner(firstMatch._id)
  }

  console.log('✅ Todos los tests completados\n')
}

runTests()
