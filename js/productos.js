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

    // Agregar tooltips para mostrar las teclas rápidas
    const tooltips = [
        { 
            element: buscarProducto, 
            title: 'Teclas rápidas: Ctrl+B o /'
        },
        {
            element: document.querySelector('[data-bs-target="#nuevoProductoModal"]'),
            title: 'Tecla rápida: Ctrl+N'
        }
    ];

    tooltips.forEach(({element, title}) => {
        if (element) {
            element.setAttribute('title', title);
            new bootstrap.Tooltip(element);
        }
    });
});

// Funciones específicas de productos
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3001/products');
        if (!response.ok) throw new Error('Error al obtener productos');
        const products = await response.json();
        // Actualizar la tabla de productos
        const tableBody = document.querySelector('#productosTabla');
        if (tableBody) {
            tableBody.innerHTML = ''; // Limpiar tabla
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.description}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.price}</td>
                    <td><img src="http://localhost:3001/${product.image_url}" alt="${product.name}" style="width: 100px;"></td>
                    <td>
                        <button class="btn-update" data-id="${product.id}">Actualizar Cantidad</button>
                        <button class="btn-delete" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Funciones de gestión de productos
async function eliminarProducto(productId) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!confirmacion) return;
    try {
        const response = await fetch(`http://localhost:3001/products/${productId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Producto eliminado exitosamente');
            loadProducts(); // Recargar la lista de productos
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'No se pudo eliminar el producto'}`);
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
    }
}

// Función para actualizar cantidad
async function actualizarCantidad(id) {
    const modal = new bootstrap.Modal(document.getElementById('actualizarCantidadModal'));
    modal.show();
    
    // Limpiar el formulario
    document.getElementById('formActualizarCantidad').reset();
    document.getElementById('productoId').value = id;
    
    // Obtener el producto actual
    const response = await fetch(`http://localhost:3001/products/${id}`);
    const product = await response.json();
    
    // Configurar el valor inicial
    document.getElementById('cantidad').value = product.quantity;
    
    // Manejar el guardado
    document.getElementById('guardarCantidad').onclick = async () => {
        const cantidad = parseInt(document.getElementById('cantidad').value);
        if (isNaN(cantidad) || cantidad < 0) {
            alert('Por favor ingrese una cantidad válida');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3001/products/${id}/actualizar-cantidad`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar la cantidad');
            }
            
            modal.hide();
            loadProducts();
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            alert('Error al actualizar la cantidad');
        }
    };
}