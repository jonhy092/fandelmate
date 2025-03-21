document.addEventListener('DOMContentLoaded', function () {
    // Variables globales
    const fechaEmision = new Date().toLocaleDateString();
    const productosLista = document.getElementById('productos-lista');
    const totalFacturaElement = document.getElementById('total-factura');
    const generarFacturaBtn = document.getElementById('generar-factura');
    const cargarProductosBtn = document.getElementById('cargar-productos');
    const formaPagoSelect = document.getElementById('forma-pago');
    
    let productosSeleccionados = [];
    let totalFactura = 0;
  
    // Establecer fecha de emisión
    document.getElementById('fecha-emision').textContent = fechaEmision;
  
    // Función para cargar productos desde el backend
    cargarProductosBtn.addEventListener('click', function () {
      fetch('http://localhost:3001/productos')
        .then(response => response.json())
        .then(data => {
          mostrarProductos(data.productos);
        })
        .catch(error => {
          console.error('Error al cargar productos:', error);
        });
    });
  
    // Mostrar productos en la tabla
    function mostrarProductos(productos) {
      productos.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${producto.id}</td>
          <td>${producto.nombre}</td>
          <td>$${producto.precio}</td>
          <td><input type="number" value="1" min="1" data-id="${producto.id}" class="cantidad-producto"></td>
          <td>$<span class="subtotal-producto">0</span></td>
        `;
        productosLista.appendChild(tr);
  
        // Agregar event listener para cantidad
        const cantidadInput = tr.querySelector('.cantidad-producto');
        cantidadInput.addEventListener('input', function () {
          const cantidad = parseInt(cantidadInput.value) || 1;
          const subtotal = producto.precio * cantidad;
          tr.querySelector('.subtotal-producto').textContent = subtotal;
          actualizarTotal();
        });
      });
    }
  
    // Actualizar el total de la factura
    function actualizarTotal() {
      totalFactura = 0;
      const subtotales = document.querySelectorAll('.subtotal-producto');
      subtotales.forEach(subtotal => {
        totalFactura += parseFloat(subtotal.textContent);
      });
      totalFacturaElement.textContent = `$${totalFactura}`;
    }
  
    // Generar la factura y enviar al backend
    generarFacturaBtn.addEventListener('click', function () {
      const razonSocial = document.getElementById('razon-social').value;
      const cuit = document.getElementById('cuit').value;
      const dni = document.getElementById('dni').value;
      const condicion = document.getElementById('condicion').value;
      const formaPago = formaPagoSelect.value;
  
      const productosFactura = [];
      document.querySelectorAll('.cantidad-producto').forEach(input => {
        const cantidad = parseInt(input.value) || 1;
        const idProducto = input.getAttribute('data-id');
        productosFactura.push({ idProducto, cantidad });
      });
  
      const facturaData = {
        razonSocial,
        cuit,
        dni,
        condicion,
        formaPago,
        productos: productosFactura,
        total: totalFactura
      };
  
      // Enviar al backend para guardar la factura
      fetch('http://localhost:3001/factura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(facturaData)
      })
        .then(response => response.json())
        .then(data => {
          alert('Factura generada exitosamente');
        })
        .catch(error => {
          console.error('Error al generar factura:', error);
        });
    });
  });
  
  

