// Utilidades para hacer llamadas a la API del backend

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '')

// Obtener token del localStorage
const getToken = () => localStorage.getItem('authToken')

// Función para hacer requests autenticadas
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud')
  }

  return data
}

// AUTENTICACIÓN
export const authAPI = {
  // Registro de nuevo usuario
  register: async (username, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    })
  },

  // Login de usuario
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }
}

// OPENINGS
export const animeAPI = {
  // Buscar openings
  search: async (query) => {
    return apiRequest(`/anime/search?q=${encodeURIComponent(query)}`)
  },

  // Obtener todos los openings
  getAll: async () => {
    return apiRequest('/anime')
  },

  // Obtener openings de un anime
  getBySlug: async (slug) => {
    return apiRequest(`/anime?slug=${slug}`)
  }
}

// TORNEOS
export const tournamentAPI = {
  // Crear nuevo torneo
  create: async (name, description, size, filterType) => {
    return apiRequest('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        size,
        filterType
      })
    })
  },

  // Obtener detalles de un torneo
  getById: async (id) => {
    return apiRequest(`/tournaments/${id}`)
  },

  // Obtener ranking del torneo
  getRanking: async (id) => {
    return apiRequest(`/tournaments/${id}/ranking`)
  }
}

// SALAS
export const roomAPI = {
  getOpen: async () => {
    return apiRequest('/rooms/open/list')
  }
}

// SALUD DEL SERVIDOR
export const healthAPI = {
  check: async () => {
    return apiRequest('/health')
  }
}
