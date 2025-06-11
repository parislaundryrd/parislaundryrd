// auth-check.js - Script genérico para verificación de autenticación y roles

// Configuración de redirección
const AUTH_CONFIG = {
  loginPage: 'login.html',
  defaultEmployeePage: 'facturacion.html',
  adminPages: ['inventario.html', 'admin.html'], // Lista de páginas solo para admin
  publicPages: ['login.html', 'recuperar-contrasena.html'] // Páginas accesibles sin login
};

// Función principal para verificar autenticación
async function verifyAuth() {
  // Obtener el nombre de la página actual
  const currentPage = window.location.pathname.split('/').pop();
  
  // Si es una página pública, no hacer verificación
  if (AUTH_CONFIG.publicPages.includes(currentPage)) {
    hideAuthLoader();
    return;
  }

  showAuthLoader();
  
  try {
    // Verificar estado de autenticación
    const user = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Dejar de escuchar después del primer evento
        resolve(user);
      });
    });

    if (!user) {
      // Usuario no autenticado - redirigir a login
      redirectToLogin();
      return;
    }

    // Verificar rol del usuario
    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userDoc.exists || !userData.rol) {
      // No tiene rol asignado - redirigir a login
      redirectToLogin();
      return;
    }

    // Verificar acceso a página admin
    if (AUTH_CONFIG.adminPages.includes(currentPage) {
      if (userData.rol !== 'admin') {
        // Usuario no es admin pero está en página admin - redirigir
        window.location.href = AUTH_CONFIG.defaultEmployeePage;
        return;
      }
    }

    // Verificar si es empleado en página admin (redirección inversa)
    if (userData.rol === 'empleado' && AUTH_CONFIG.adminPages.includes(currentPage)) {
      window.location.href = AUTH_CONFIG.defaultEmployeePage;
      return;
    }

    // Todo verificado - mostrar contenido
    hideAuthLoader();
    
  } catch (error) {
    console.error('Error en verificación de auth:', error);
    redirectToLogin();
  }
}

// Helper functions
function showAuthLoader() {
  const loader = document.createElement('div');
  loader.id = 'auth-loader';
  loader.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 24px;
  `;
  loader.textContent = 'Verificando credenciales...';
  document.body.prepend(loader);
}

function hideAuthLoader() {
  const loader = document.getElementById('auth-loader');
  if (loader) loader.remove();
}

function redirectToLogin() {
  // Evitar bucles de redirección
  if (window.location.pathname.split('/').pop() !== AUTH_CONFIG.loginPage) {
    window.location.href = AUTH_CONFIG.loginPage;
  }
}

// Iniciar verificación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', verifyAuth);

// También verificar cuando cambia el estado de autenticación
auth.onAuthStateChanged(() => {
  // Pequeño retraso para evitar bucles
  setTimeout(verifyAuth, 100);
});