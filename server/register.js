document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const usersTableBody = document.querySelector('#usersTable tbody');
    const editFormContainer = document.createElement('div'); // Contenedor del formulario de edición
  document.body.appendChild(editFormContainer);

     
    console.log(registerForm);
    //REGISTRAR UN NUEVO USUARIO//

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir comportamiento predeterminado

        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        //const email = document.getElementById('email').value;

        try {
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password})
            });

            if (response.ok) {
                alert('Usuario registrado exitosamente');
                window.location.href = 'usuario.html'; // Redirige al inicio de sesión
            } else {
                const errorData = await response.json();
                alert(`Error al registrar: ${errorData.message}`);
            }

        } catch (error) {
            console.error('Error en la petición:', error);
        }
    });
});
// Cargar lista de usuarios
async function loadUsers() {
  try {
    const response = await fetch('http://localhost:8080/api/users');
    const users = await response.json();



    
    const usersTableBody = document.querySelector('#usersTable tbody');
    usersTableBody.innerHTML = '';
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.username}</td>
        <td>
          <button onclick="editUser(${user.id}, '${user.username}')">Editar</button>
         
          <button onclick="deleteUser(${user.id})">Eliminar</button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
}

// Ver usuario
window.viewUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`);
      const user = await response.json();
      alert(`Usuario: ${user.username}`);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
  };

  // Editar usuario
  document.getElementById('editUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const id = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;
  
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      if (response.ok) {
        alert('Usuario actualizado exitosamente');
        document.getElementById('editUserForm').style.display = 'none';
        loadUsers();
      } else {
        alert('Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  });
  //EDITAR USUARIO//
  window.editUser = (id, username) => {
    // Mostrar el formulario de edición
    const editUserForm = document.getElementById('editUserForm');
    editUserForm.style.display = 'block';
  
    // Rellenar los campos del formulario de edición
    document.getElementById('editUserId').value = id;
    document.getElementById('editUsername').value = username;
  
    // Enfocar el campo de nombre de usuario
    document.getElementById('editUsername').focus();
  };
  // ELIMINAR USUARIO//
  window.deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Usuario eliminado exitosamente');
        loadUsers();
      } else {
        alert('Error al eliminar usuario');
      }
    } catch (error) { 
      console.error('Error al eliminar usuario:', error);
  }
};

  // Cargar usuarios al cargar la página
  loadUsers();

