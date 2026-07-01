const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw { status: 0, message: 'Error de conexión. Verifica que el servidor esté funcionando.' };
  }

  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { message: text || 'Respuesta inesperada del servidor' };
  }

  if (!res.ok) {
    if (res.status === 401 && token && !endpoint.startsWith('/auth/')) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      throw { status: 401, message: 'Sesión expirada. Inicia sesión nuevamente.' };
    }
    const error = new Error(data.message || data.error || 'Error en la solicitud');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  perfil: () => request('/auth/perfil'),
};

export const canchas = {
  listar: (query) => request(`/canchas${query ? `?${query}` : ''}`),
  obtener: (id) => request(`/canchas/${id}`),
  crear: (body) => request('/canchas', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/canchas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/canchas/${id}`, { method: 'DELETE' }),
};

export const disponibilidad = {
  listar: (canchaId) => request(`/disponibilidad/cancha/${canchaId}`),
  configurar: (horarios) => request('/disponibilidad', { method: 'POST', body: JSON.stringify({ horarios }) }),
  eliminar: (id) => request(`/disponibilidad/${id}`, { method: 'DELETE' }),
};

export const reservas = {
  crear: (body) => request('/reservas', { method: 'POST', body: JSON.stringify(body) }),
  listar: (fecha) => request(`/reservas${fecha ? `?fecha=${fecha}` : ''}`),
  cancelar: (id) => request(`/reservas/${id}/cancelar`, { method: 'PUT' }),
  actualizarConfirmacionProfesional: (id, estado) => request(`/reservas/${id}/confirmar-profesional`, { method: 'PUT', body: JSON.stringify({ estado }) }),
  slots: (canchaId, fecha) => request(`/reservas/slots?canchaId=${canchaId}&fecha=${fecha}`),
  resumenMes: (ano, mes) => request(`/reservas/resumen-mes?ano=${ano}&mes=${mes}`),
  resumenMesUsuario: (ano, mes) => request(`/reservas/resumen-mes-usuario?ano=${ano}&mes=${mes}`),
};

export const servicios = {
  listar: (profesionalId) => request(`/servicios/profesional/${profesionalId}`),
  obtener: (id) => request(`/servicios/${id}`),
  crear: (profesionalId, body) => request(`/servicios/profesional/${profesionalId}`, { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/servicios/${id}`, { method: 'DELETE' }),
};

export const notificacionesUsuario = {
  misNotificaciones: () => request('/notificaciones-usuario'),
  contarNoLeidas: () => request('/notificaciones-usuario/contar'),
  marcarLeida: (id) => request(`/notificaciones-usuario/${id}/leer`, { method: 'PUT' }),
};

export const profesionales = {
  listar: (query) => request(`/profesionales${query ? `?${query}` : ''}`),
  obtener: (id) => request(`/profesionales/${id}`),
  crear: (body) => request('/profesionales', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/profesionales/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/profesionales/${id}`, { method: 'DELETE' }),
  eliminarPermanente: (id) => request(`/profesionales/${id}/permanente`, { method: 'DELETE' }),
  asignarCanchas: (id, canchaIds) => request(`/profesionales/${id}/canchas`, { method: 'PUT', body: JSON.stringify({ canchaIds }) }),
};
