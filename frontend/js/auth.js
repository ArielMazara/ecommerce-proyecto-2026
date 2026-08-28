// ============================================
// AUTENTICACIÓN
// ============================================

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function updateNav() {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  if (isLoggedIn()) {
    const user = getUser();
    navAuth.innerHTML = `
      <span style="color:var(--color-gold);font-size:14px;">Hola, ${user?.name || 'Usuario'}</span>
      <a href="ordenes.html" class="nav-link">Mis pedidos</a>
      <button onclick="logout()" class="btn btn-outline" style="padding:6px 16px;font-size:13px;">Cerrar sesión</button>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="nav-link">Iniciar sesión</a>
      <a href="login.html?mode=register" class="btn btn-primary" style="padding:6px 16px;font-size:13px;">Registrarse</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
