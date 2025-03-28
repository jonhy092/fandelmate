document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3001/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    alert('Inicio de sesión exitoso');
                    window.location.href = 'admin.html'; // Redirige al panel de control o página principal
                } else {
                    alert('Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error en la petición:', error);
            }
        });
    }
});
// Manipulacion del boton Crear Cuenta//
document.getElementById('createAccount').addEventListener('click', () => {
    window.location.href = 'register.html'; // Redirige a la página de registro
  });

