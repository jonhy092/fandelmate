// script.js
// Declaraciones al inicio del archivo
const modal = new bootstrap.Modal(document.getElementById('nuevoProductoModal'));
const formProducto = document.getElementById('formProducto');
const buscarProducto = document.getElementById('buscarProducto');
let timeoutId;

// Funciones principales
document.addEventListener('DOMContentLoaded', function() {
    // Configuración inicial
    configurarEventos();
    configurarBusqueda();
    configurarFormulario();
});

// Funciones de configuración
function configurarEventos() {
    document.querySelector('.table').addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.action;
        if (action === 'editar') {
            editarProducto(id);
        } else if (action === 'eliminar') {
            if (confirm('¿Está seguro de eliminar este producto?')) {
                eliminarProducto(id);
            }
        }
    });
}

function configurarBusqueda() {
    buscarProducto.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        clearTimeout(timeoutId);
        if (!searchTerm) {
            document.querySelectorAll('#productosTabla tr').forEach(row => {
                row.style.display = '';
            });
            return;
        }
        timeoutId = setTimeout(() => {
            document.querySelectorAll('#productosTabla tr').forEach(row => {
                const codigo = row.cells[0].textContent.toLowerCase();
                const nombre = row.cells[1].textContent.toLowerCase();
                row.style.display = 
                    codigo.includes(searchTerm) || nombre.includes(searchTerm)
                        ? ''
                        : 'none';
            });
        }, 300);
    });
}

function configurarFormulario() {
    document.getElementById('guardarProducto').addEventListener('click', async function() {
        if (!formProducto.checkValidity()) {
            formProducto.reportValidity();
            return;
        }
        const productoData = {
            codigo: document.getElementById('codigo').value,
            nombre: document.getElementById('nombre').value,
            precio_kg: parseFloat(document.getElementById('precioKg').value) || 0,
            precio_unidad: parseFloat(document.getElementById('precioUnidad').value) || 0,
            precio_libra: parseFloat(document.getElementById('precioLibra').value) || 0
        };
        const productoId = document.getElementById('productoId').value;
        const url = productoId ? `/productos/${productoId}` : '/productos';
        const method = productoId ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productoData)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar el producto');
            }
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    });
}



document.addEventListener('DOMContentLoaded', function() {
  const modal = new bootstrap.Modal(document.getElementById('nuevoProductoModal'));
  const formProducto = document.getElementById('formProducto');
  const buscarProducto = document.getElementById('buscarProducto');
  let timeoutId;
  
  // Manejar búsqueda de productos con debounce
  buscarProducto.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      // Limpiar el timeout anterior
      clearTimeout(timeoutId);
      // Si el término de búsqueda está vacío, mostrar todos los productos
      if (!searchTerm) {
          document.querySelectorAll('#productosTabla tr').forEach(row => {
              row.style.display = '';
          });
          return;
      }
      // Esperar 300ms antes de realizar la búsqueda
      timeoutId = setTimeout(() => {
          document.querySelectorAll('#productosTabla tr').forEach(row => {
              const codigo = row.cells[0].textContent.toLowerCase();
              const nombre = row.cells[1].textContent.toLowerCase();
              row.style.display = 
                  codigo.includes(searchTerm) || nombre.includes(searchTerm)
                      ? ''
                      : 'none';
          });
      }, 300);
  });
  
  // Teclas rápidas
  document.addEventListener('keydown', function(e) {
      // Evitar que las teclas rápidas se activen cuando se está escribiendo en un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
      }
      if (e.ctrlKey || e.metaKey) { // Ctrl en Windows/Linux o Cmd en Mac
          switch(e.key.toLowerCase()) {
              case 'b': // Ctrl/Cmd + B para buscar producto
                  e.preventDefault();
                  buscarProducto.focus();
                  break;
              case 'n': // Ctrl/Cmd + N para nuevo producto
                  e.preventDefault();
                  modal.show();
                  document.getElementById('codigo').focus();
                  break;
          }
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          // Tecla '/' para buscar (sin modificadores)
          if (e.key === '/') {
              e.preventDefault();
              buscarProducto.focus();
          }
      }
  });
  
  // Manejar guardado de producto
  document.getElementById('guardarProducto').addEventListener('click', async function() {
      if (!formProducto.checkValidity()) {
          formProducto.reportValidity();
          return;
      }
      const productoData = {
          codigo: document.getElementById('codigo').value,
          nombre: document.getElementById('nombre').value,
          precio_kg: parseFloat(document.getElementById('precioKg').value) || 0,
          precio_unidad: parseFloat(document.getElementById('precioUnidad').value) || 0,
          precio_libra: parseFloat(document.getElementById('precioLibra').value) || 0
      };
      const productoId = document.getElementById('productoId').value;
      const url = productoId ? `/productos/${productoId}` : '/productos';
      const method = productoId ? 'PUT' : 'POST';
      try {
          const response = await fetch(url, {
              method: method,
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(productoData)
          });
          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Error al guardar el producto');
          }
          location.reload();
      } catch (error) {
          alert(error.message);
      }
  });
  
  // Limpiar formulario al abrir modal para nuevo producto
  document.getElementById('nuevoProductoModal').addEventListener('show.bs.modal', function(event) {
      if (!event.relatedTarget) return; // Si se abre para editar, no limpiar
      document.getElementById('productoId').value = '';
      document.getElementById('formProducto').reset();
      document.getElementById('modalTitle').textContent = 'Nuevo Producto';
      // Enfocar el campo de código después de que el modal se muestre completamente
      setTimeout(() => {
          document.getElementById('codigo').focus();
      }, 500);
  });
  
  // Función para editar producto
  function editarProducto(id) {
      fetch(`/productos/${id}`)
          .then(response => response.json())
          .then(producto => {
              document.getElementById('productoId').value = producto.id;
              document.getElementById('codigo').value = producto.codigo;
              document.getElementById('nombre').value = producto.nombre;
              document.getElementById('precioKg').value = producto.precio_kg;
              document.getElementById('precioUnidad').value = producto.precio_unidad;
              document.getElementById('precioLibra').value = producto.precio_libra;
              document.getElementById('modalTitle').textContent = 'Editar Producto';
              const modal = new bootstrap.Modal(document.getElementById('nuevoProductoModal'));
              modal.show();
          })
          .catch(error => alert('Error al cargar el producto'));
  }
  
  // Función para eliminar producto
  function eliminarProducto(id) {
      if (!confirm('¿Está seguro de eliminar este producto?')) {
          return;
      }
      fetch(`/productos/${id}`, {
          method: 'DELETE'
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Error al eliminar el producto');
              }
              location.reload();
          })
          .catch(error => alert(error.message));
  }
  
  // Delegación de eventos para los botones de acción
  document.querySelector('.table').addEventListener('click', function(e) {
      const button = e.target.closest('button');
      if (!button) return;
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'editar') {
          editarProducto(id);
      } else if (action === 'eliminar') {
          if (confirm('¿Está seguro de que desea eliminar este producto?')) {
              eliminarProducto(id);
          }
      }
  });
});

// Agregar event listener para los botones de navegación
const navButtons = document.querySelectorAll('.btn-outline-light');
navButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href) {
            window.location.href = href;
        }
    });
});