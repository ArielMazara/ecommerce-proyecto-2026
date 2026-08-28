// ============================================
// CONFIGURACIÓN DE LA API
// ============================================
// Cambiar esta URL por la de tu backend en Render cuando deployes
const API_URL = 'http://localhost:3000/api';

/**
 * Función base para hacer peticiones a la API
 * @param {string} endpoint - Ruta del endpoint (ej: '/products')
 * @param {object} options - Opciones de fetch
 */
async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
}
